import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppStore } from '@/store/useAppStore';
import { Colors } from '@/constants/Colors';
import { Fonts } from '@/constants/Typography';
import {
  lookupPayId,
  type PayIdType,
  type PayIdRecord,
  isValidEmail,
  isValidMobile,
  isValidABN,
} from '@/utils/payid-registry';
import { lookupBsb, formatBsb, isValidBsbFormat } from '@/utils/bsb-lookup';
import type { Transaction } from '@/store/types';
import { paymentGateway, isDemoMode, webhookHandler } from '@/services';
import type { NppPaymentStatus, WebhookEvent } from '@/services';

type PayMode = 'pay-anyone' | 'payid' | 'bpay' | 'internal' | 'international' | 'payto';

const MODES: { key: PayMode; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: 'pay-anyone', label: 'Pay Anyone', icon: 'person-outline' },
  { key: 'payid', label: 'PayID', icon: 'at-outline' },
  { key: 'bpay', label: 'BPAY', icon: 'qr-code-outline' },
  { key: 'internal', label: 'Transfer', icon: 'swap-horizontal-outline' },
  { key: 'international', label: 'International', icon: 'globe-outline' },
  { key: 'payto', label: 'PayTo', icon: 'link-outline' },
];

const QUICK_AMOUNTS = ['50', '100', '200', '500'];

const PAYID_TYPES: {
  key: PayIdType;
  label: string;
  placeholder: string;
  keyboardType: 'default' | 'email-address' | 'phone-pad' | 'numeric';
  hint: string;
}[] = [
  { key: 'email', label: 'Email', placeholder: 'user@example.com', keyboardType: 'email-address', hint: 'e.g. sarah.johnson@gmail.com' },
  { key: 'mobile', label: 'Mobile', placeholder: '04XX XXX XXX', keyboardType: 'phone-pad', hint: 'e.g. 0412 345 678' },
  { key: 'abn', label: 'ABN', placeholder: 'XX XXX XXX XXX', keyboardType: 'numeric', hint: 'e.g. 51 824 753 556' },
  { key: 'organisation-id', label: 'Org ID', placeholder: 'ORG001234', keyboardType: 'default', hint: 'e.g. ORG001234' },
];

const COUNTRIES = ['United States', 'United Kingdom', 'New Zealand', 'Singapore', 'Canada', 'Germany', 'France', 'Japan', 'China', 'India'];
const CURRENCIES = ['USD', 'GBP', 'EUR', 'NZD', 'SGD', 'CAD', 'JPY', 'CNY', 'HKD', 'INR'];

interface ConfirmData {
  mode: PayMode;
  fromAccountName: string;
  toName: string;
  amount: number;
  description?: string;
  reference: string;
  paymentMethod: Transaction['paymentMethod'];
  payId?: string;
  billerCode?: string;
  crn?: string;
  currency?: string;
  country?: string;
  bsb?: string;
  accountNumber?: string;
}

// ─── BSB Field with live lookup ──────────────────────────────────────────────

function BsbField({
  value,
  onChange,
  onBlur,
  error,
}: {
  value: string;
  onChange: (v: string) => void;
  onBlur?: () => void;
  error?: string | null;
}) {
  const bankInfo = value.replace(/\D/g, '').length >= 3 ? lookupBsb(value) : null;
  const isValid = isValidBsbFormat(value);

  return (
    <View style={{ gap: 6 }}>
      <View style={{ padding: 14, gap: 4 }}>
        <Text style={fieldStyles.label}>BSB *</Text>
        <TextInput
          style={fieldStyles.input}
          value={value}
          onChangeText={(v) => onChange(formatBsb(v))}
          onBlur={onBlur}
          placeholder="XXX-XXX"
          placeholderTextColor={Colors.textSecondary}
          keyboardType="numeric"
          maxLength={7}
        />
      </View>
      {/* Live bank info */}
      {bankInfo && (
        <View style={fieldStyles.bankInfoRow}>
          <View style={[fieldStyles.bankDot, { backgroundColor: bankInfo.color }]} />
          <Text style={fieldStyles.bankName}>{bankInfo.name}</Text>
          {isValid && <Ionicons name="checkmark-circle" size={14} color={Colors.success} />}
        </View>
      )}
      {!bankInfo && value.replace(/\D/g, '').length >= 3 && (
        <View style={fieldStyles.bankInfoRow}>
          <Ionicons name="help-circle-outline" size={14} color={Colors.textSecondary} />
          <Text style={[fieldStyles.bankName, { color: Colors.textSecondary }]}>Unknown bank</Text>
        </View>
      )}
      {error && <Text style={fieldStyles.error}>{error}</Text>}
    </View>
  );
}

const fieldStyles = StyleSheet.create({
  label: {
    fontSize: 11,
    fontFamily: Fonts.semiBold,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    fontSize: 15,
    fontFamily: Fonts.regular,
    color: Colors.textPrimary,
  },
  bankInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingBottom: 10,
  },
  bankDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  bankName: {
    fontSize: 12,
    fontFamily: Fonts.medium,
    color: Colors.textPrimary,
    flex: 1,
  },
  error: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    color: Colors.error,
    paddingHorizontal: 14,
    paddingBottom: 8,
  },
});

export default function PayScreen() {
  const insets = useSafeAreaInsets();
  const { accounts, payees, payToAgreements, addTransaction, updateAccountBalance, profile } = useAppStore();

  const [mode, setMode] = useState<PayMode>('pay-anyone');
  const [selectedFromAccount, setSelectedFromAccount] = useState(accounts[0]?.id ?? '');

  // Pay Anyone fields
  const [selectedPayeeId, setSelectedPayeeId] = useState<string | null>(null);
  const [manualBSB, setManualBSB] = useState('');
  const [manualAccountNumber, setManualAccountNumber] = useState('');
  const [manualAccountName, setManualAccountName] = useState('');
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [bsbError, setBsbError] = useState<string | null>(null);
  const [accountNumberError, setAccountNumberError] = useState<string | null>(null);

  // PayID fields
  const [payIdType, setPayIdType] = useState<PayIdType>('email');
  const [payIdValue, setPayIdValue] = useState('');
  const [payIdLookupResult, setPayIdLookupResult] = useState<{ name: string; institution: string } | null>(null);
  const [payIdLookupError, setPayIdLookupError] = useState<string | null>(null);
  const [payIdValidationError, setPayIdValidationError] = useState<string | null>(null);
  const [isLookingUp, setIsLookingUp] = useState(false);

  // BPAY fields
  const [billerCode, setBillerCode] = useState('');
  const [crn, setCrn] = useState('');

  // Internal transfer
  const [selectedToAccountId, setSelectedToAccountId] = useState<string | null>(null);

  // International
  const [intlRecipientName, setIntlRecipientName] = useState('');
  const [intlCountry, setIntlCountry] = useState('United States');
  const [intlCurrency, setIntlCurrency] = useState('USD');
  const [intlSwift, setIntlSwift] = useState('');
  const [intlIban, setIntlIban] = useState('');
  const [intlBankName, setIntlBankName] = useState('');

  // PayTo
  const [selectedPayToId, setSelectedPayToId] = useState<string | null>(null);

  // Shared
  const [amount, setAmount] = useState('');
  const [amountError, setAmountError] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmData, setConfirmData] = useState<ConfirmData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<NppPaymentStatus | null>(null);
  const [paymentTransactionId, setPaymentTransactionId] = useState<string | null>(null);
  const demoMode = isDemoMode();

  const fromAccount = accounts.find((a) => a.id === selectedFromAccount);
  const activePayToAgreements = payToAgreements.filter((a) => a.status !== 'cancelled');

  // Subscribe to webhook events for real-time payment status updates
  useEffect(() => {
    const unsubscribe = webhookHandler.subscribe(
      ['payment.completed', 'payment.failed'],
      (event: WebhookEvent) => {
        if (paymentTransactionId && event.data.paymentId === paymentTransactionId) {
          setPaymentStatus(event.type === 'payment.completed' ? 'completed' : 'failed');
        }
      }
    );
    return unsubscribe;
  }, [paymentTransactionId]);

  // ─── PayID Validation per type ────────────────────────────────────────────

  const validatePayIdValue = useCallback((value: string, type: PayIdType): string | null => {
    if (!value.trim()) return null;
    switch (type) {
      case 'email':
        return isValidEmail(value) ? null : 'Enter a valid email address (e.g. user@example.com)';
      case 'mobile':
        return isValidMobile(value.replace(/\s/g, '')) ? null : 'Enter a valid Australian mobile (04XX XXX XXX)';
      case 'abn':
        return isValidABN(value.replace(/\s/g, '')) ? null : 'Enter a valid 11-digit ABN';
      case 'organisation-id':
        return /^ORG\w+$/i.test(value.trim()) ? null : 'Enter a valid Organisation ID (e.g. ORG001234)';
      default:
        return null;
    }
  }, []);

  // ─── PayID Lookup ─────────────────────────────────────────────────────────

  const buildUserPayIdEntries = (): PayIdRecord[] => {
    const entries: PayIdRecord[] = [];
    const fullName = `${profile.firstName} ${profile.lastName}`.trim();
    if (profile.email) {
      entries.push({
        payId: profile.email.toLowerCase(),
        type: 'email',
        registeredName: fullName,
        financialInstitution: 'IMB Bank',
      });
    }
    if (profile.phone) {
      const cleanPhone = profile.phone.replace(/\s+/g, '').replace(/-/g, '');
      entries.push({
        payId: cleanPhone,
        type: 'mobile',
        registeredName: fullName,
        financialInstitution: 'IMB Bank',
      });
    }
    return entries;
  };

  const handlePayIdLookup = async () => {
    const trimmed = payIdValue.trim();
    if (!trimmed) {
      setPayIdValidationError('Please enter a PayID value.');
      return;
    }
    // Validate format first
    const formatError = validatePayIdValue(trimmed, payIdType);
    if (formatError) {
      setPayIdValidationError(formatError);
      return;
    }
    setPayIdValidationError(null);
    setIsLookingUp(true);
    setPayIdLookupResult(null);
    setPayIdLookupError(null);
    try {
      // Try payment gateway first (routes through Monoova or demo)
      const gatewayResult = await paymentGateway.resolvePayId(trimmed);
      if (gatewayResult) {
        setPayIdLookupResult({ name: gatewayResult.registeredName, institution: gatewayResult.financialInstitution });
        return;
      }
      // Fall back to local registry
      const localResult = await lookupPayId(trimmed, buildUserPayIdEntries());
      if (localResult) {
        setPayIdLookupResult({ name: localResult.registeredName, institution: localResult.financialInstitution });
      } else {
        setPayIdLookupError('PayID not found — please check and try again.');
      }
    } catch {
      // On API error, fall back to local registry
      const localResult = await lookupPayId(trimmed, buildUserPayIdEntries());
      if (localResult) {
        setPayIdLookupResult({ name: localResult.registeredName, institution: localResult.financialInstitution });
      } else {
        setPayIdLookupError('PayID not found — please check and try again.');
      }
    } finally {
      setIsLookingUp(false);
    }
  };

  // ─── BSB inline validation ────────────────────────────────────────────────

  const handleBsbChange = (v: string) => {
    const formatted = formatBsb(v);
    setManualBSB(formatted);
    const digits = formatted.replace(/\D/g, '');
    if (digits.length === 6) {
      setBsbError(null);
    } else if (digits.length > 0) {
      setBsbError(null); // don't show error while typing
    }
  };

  const handleBsbBlur = () => {
    const digits = manualBSB.replace(/\D/g, '');
    if (digits.length > 0 && digits.length < 6) {
      setBsbError('BSB must be exactly 6 digits (e.g. 641-800)');
    } else {
      setBsbError(null);
    }
  };

  const handleAccountNumberBlur = () => {
    const digits = manualAccountNumber.replace(/\D/g, '');
    if (digits.length > 0 && (digits.length < 6 || digits.length > 10)) {
      setAccountNumberError('Account number must be 6–10 digits');
    } else {
      setAccountNumberError(null);
    }
  };

  // ─── Amount validation ────────────────────────────────────────────────────

  const handleAmountChange = (v: string) => {
    // Only allow valid decimal input
    const clean = v.replace(/[^0-9.]/g, '');
    const parts = clean.split('.');
    const formatted = parts.length > 2 ? parts[0] + '.' + parts.slice(1).join('') : clean;
    // Limit to 2 decimal places
    const dotIdx = formatted.indexOf('.');
    if (dotIdx !== -1 && formatted.length - dotIdx - 1 > 2) return;
    setAmount(formatted);
    setAmountError(null);
  };

  // ─── Validation ──────────────────────────────────────────────────────────

  const validatePayment = (): string | null => {
    const amt = parseFloat(amount);
    if (!amount || isNaN(amt) || amt <= 0) return 'Please enter a valid amount.';
    if (!/^\d+(\.\d{1,2})?$/.test(amount)) return 'Amount can have at most 2 decimal places.';
    if (fromAccount && amt > fromAccount.availableBalance) return `Insufficient funds. Available: $${fromAccount.availableBalance.toFixed(2)}`;

    switch (mode) {
      case 'pay-anyone':
        if (!showManualEntry && !selectedPayeeId) return 'Please select a payee or tap "New Payee" to enter details.';
        if (showManualEntry) {
          const bsbDigits = manualBSB.replace(/\D/g, '');
          if (!bsbDigits || bsbDigits.length !== 6) return 'Enter a valid 6-digit BSB (e.g. 641-800).';
          const acctDigits = manualAccountNumber.replace(/\D/g, '');
          if (!acctDigits || acctDigits.length < 6 || acctDigits.length > 10) return 'Enter a valid account number (6–10 digits).';
          if (!manualAccountName.trim()) return 'Enter the account holder name.';
        }
        break;
      case 'payid':
        if (!payIdValue.trim()) return 'Enter a PayID value.';
        {
          const formatErr = validatePayIdValue(payIdValue.trim(), payIdType);
          if (formatErr) return formatErr;
        }
        if (!payIdLookupResult) return 'Please look up the PayID before proceeding.';
        break;
      case 'bpay':
        if (!billerCode.trim()) return 'Enter the biller code.';
        if (!/^\d+$/.test(billerCode)) return 'Biller code must be numbers only.';
        if (!crn.trim()) return 'Enter the customer reference number.';
        break;
      case 'internal':
        if (!selectedToAccountId) return 'Select a destination account.';
        if (selectedToAccountId === selectedFromAccount) return 'Source and destination accounts must be different.';
        break;
      case 'international':
        if (!intlRecipientName.trim()) return 'Enter the recipient name.';
        if (!intlSwift.trim()) return 'Enter the SWIFT/BIC code.';
        if (!/^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/i.test(intlSwift)) return 'Enter a valid SWIFT/BIC code (6–11 characters).';
        if (!intlIban.trim()) return 'Enter the IBAN or account number.';
        break;
      case 'payto':
        if (!selectedPayToId) return 'Select a PayTo agreement.';
        break;
    }
    return null;
  };

  // ─── Build confirm data ───────────────────────────────────────────────────

  const buildConfirmData = (): ConfirmData => {
    const ref = `IMB${Date.now().toString().slice(-8).toUpperCase()}`;
    const base = {
      mode,
      fromAccountName: fromAccount?.name ?? '',
      amount: parseFloat(amount),
      description: description || undefined,
      reference: ref,
    };

    switch (mode) {
      case 'pay-anyone': {
        if (selectedPayeeId && !showManualEntry) {
          const payee = payees.find((p) => p.id === selectedPayeeId)!;
          return { ...base, toName: payee.name, paymentMethod: 'bsb', bsb: payee.bsb, accountNumber: payee.accountNumber };
        }
        return { ...base, toName: manualAccountName, paymentMethod: 'bsb', bsb: manualBSB, accountNumber: manualAccountNumber };
      }
      case 'payid':
        return { ...base, toName: payIdLookupResult!.name, paymentMethod: 'payid', payId: payIdValue.trim() };
      case 'bpay':
        return { ...base, toName: `Biller ${billerCode}`, paymentMethod: 'bpay', billerCode, crn };
      case 'internal': {
        const toAcct = accounts.find((a) => a.id === selectedToAccountId)!;
        return { ...base, toName: toAcct.name, paymentMethod: 'internal' };
      }
      case 'international':
        return { ...base, toName: intlRecipientName, paymentMethod: 'swift', currency: intlCurrency, country: intlCountry };
      case 'payto': {
        const agreement = payToAgreements.find((a) => a.id === selectedPayToId)!;
        return { ...base, toName: agreement.merchantName, paymentMethod: 'payto' };
      }
    }
  };

  const handlePay = () => {
    const error = validatePayment();
    if (error) {
      Alert.alert('Cannot Process', error);
      return;
    }
    setConfirmData(buildConfirmData());
    setShowConfirm(true);
  };

  const handleConfirm = async () => {
    if (!confirmData) return;
    setIsProcessing(true);
    setPaymentStatus('processing');

    try {
      let gatewayResult;
      if (mode === 'payid' && confirmData.payId) {
        gatewayResult = await paymentGateway.sendPayment({
          method: 'payid',
          amount: confirmData.amount,
          fromAccountBsb: fromAccount?.bsb ?? '',
          fromAccountNumber: fromAccount?.accountNumber ?? '',
          fromAccountName: fromAccount?.name ?? '',
          toPayId: confirmData.payId,
          recipientName: confirmData.toName,
          description: confirmData.description,
        });
      } else if (mode === 'pay-anyone') {
        const payee = selectedPayeeId && !showManualEntry ? payees.find((p) => p.id === selectedPayeeId) : null;
        gatewayResult = await paymentGateway.sendPayment({
          method: 'bsb',
          amount: confirmData.amount,
          fromAccountBsb: fromAccount?.bsb ?? '',
          fromAccountNumber: fromAccount?.accountNumber ?? '',
          fromAccountName: fromAccount?.name ?? '',
          toBsb: payee?.bsb ?? manualBSB,
          toAccountNumber: payee?.accountNumber ?? manualAccountNumber,
          toAccountName: confirmData.toName,
          recipientName: confirmData.toName,
          description: confirmData.description,
        });
      } else if (mode === 'international') {
        gatewayResult = await paymentGateway.sendPayment({
          method: 'international',
          amount: confirmData.amount,
          fromAccountBsb: fromAccount?.bsb ?? '',
          fromAccountNumber: fromAccount?.accountNumber ?? '',
          fromAccountName: fromAccount?.name ?? '',
          recipientName: confirmData.toName,
          description: confirmData.description,
        });
      }

      if (gatewayResult) {
        setPaymentTransactionId(gatewayResult.transactionId);
        setPaymentStatus(gatewayResult.status);
        confirmData.reference = gatewayResult.reference || confirmData.reference;
      }

      // Deduct from source account
      updateAccountBalance(selectedFromAccount, -confirmData.amount);

      // Credit destination for internal transfer
      if (mode === 'internal' && selectedToAccountId) {
        updateAccountBalance(selectedToAccountId, confirmData.amount);
      }

      // Add debit transaction
      addTransaction({
        accountId: selectedFromAccount,
        description: confirmData.description || confirmData.toName,
        amount: -confirmData.amount,
        date: new Date().toISOString().slice(0, 10),
        type: 'debit',
        category: mode === 'internal' ? 'transfer' : mode === 'bpay' ? 'utilities' : 'other',
        paymentMethod: confirmData.paymentMethod,
        reference: confirmData.reference,
        recipientName: confirmData.toName,
      });

      // Add credit transaction for internal transfers
      if (mode === 'internal' && selectedToAccountId) {
        addTransaction({
          accountId: selectedToAccountId,
          description: `Transfer from ${fromAccount?.name ?? 'account'}`,
          amount: confirmData.amount,
          date: new Date().toISOString().slice(0, 10),
          type: 'credit',
          category: 'transfer',
          paymentMethod: 'internal',
          reference: confirmData.reference,
        });
      }

      setIsProcessing(false);
      setShowConfirm(false);
      setPaymentSuccess(true);
    } catch (error) {
      setIsProcessing(false);
      setPaymentStatus('failed');
      const message = error instanceof Error ? error.message : 'Payment failed. Please try again.';
      Alert.alert('Payment Failed', message);
    }
  };

  const handleReset = () => {
    setPaymentSuccess(false);
    setAmount('');
    setAmountError(null);
    setDescription('');
    setSelectedPayeeId(null);
    setManualBSB('');
    setManualAccountNumber('');
    setManualAccountName('');
    setShowManualEntry(false);
    setBsbError(null);
    setAccountNumberError(null);
    setPayIdValue('');
    setPayIdLookupResult(null);
    setPayIdLookupError(null);
    setPayIdValidationError(null);
    setBillerCode('');
    setCrn('');
    setSelectedToAccountId(null);
    setIntlRecipientName('');
    setIntlSwift('');
    setIntlIban('');
    setSelectedPayToId(null);
    setConfirmData(null);
    setPaymentStatus(null);
    setPaymentTransactionId(null);
  };

  const handleModeChange = (newMode: PayMode) => {
    setMode(newMode);
    handleReset();
  };

  // ─── Success screen ───────────────────────────────────────────────────────

  if (paymentSuccess && confirmData) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 28, gap: 20 }}>
          <View style={{ alignItems: 'center', gap: 16 }}>
            <View style={{ width: 84, height: 84, borderRadius: 42, backgroundColor: '#E8F5E9', alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name="checkmark-circle" size={52} color={Colors.success} />
            </View>
            <Text style={{ fontSize: 26, fontFamily: Fonts.bold, color: Colors.textPrimary }}>
              {mode === 'internal' ? 'Transfer Complete!' : 'Payment Sent!'}
            </Text>
            <Text style={{ fontSize: 15, fontFamily: Fonts.regular, color: Colors.textSecondary, textAlign: 'center' }}>
              ${confirmData.amount.toFixed(2)} sent to {confirmData.toName}
            </Text>

            {/* Real-time payment status */}
            {paymentStatus && paymentStatus !== 'completed' && (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#FFF8E1', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8, borderCurve: 'continuous' }}>
                <ActivityIndicator size="small" color="#FF9800" />
                <Text style={{ fontSize: 12, fontFamily: Fonts.medium, color: '#F57C00' }}>
                  {paymentStatus === 'processing' ? 'Processing via NPP...' : `Status: ${paymentStatus}`}
                </Text>
              </View>
            )}
            {paymentStatus === 'completed' && (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#E8F5E9', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8, borderCurve: 'continuous' }}>
                <Ionicons name="flash" size={14} color={Colors.success} />
                <Text style={{ fontSize: 12, fontFamily: Fonts.medium, color: Colors.success }}>Delivered instantly via Osko®</Text>
              </View>
            )}
            {demoMode && (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <View style={{ width: 5, height: 5, borderRadius: 2.5, backgroundColor: '#FF9800' }} />
                <Text style={{ fontSize: 10, fontFamily: Fonts.regular, color: Colors.textSecondary }}>Demo Mode — no real payment sent</Text>
              </View>
            )}
          </View>

          {/* Receipt card */}
          <View style={{ backgroundColor: Colors.white, borderRadius: 16, overflow: 'hidden', borderCurve: 'continuous', boxShadow: '0 4px 20px rgba(0,75,90,0.1)' }}>
            {([
              { label: 'From', value: confirmData.fromAccountName },
              { label: 'To', value: confirmData.toName },
              { label: 'Amount', value: `$${confirmData.amount.toFixed(2)}${confirmData.currency ? ` → ${confirmData.currency}` : ' AUD'}` },
              confirmData.payId ? { label: 'PayID', value: confirmData.payId } : null,
              confirmData.bsb ? { label: 'BSB', value: confirmData.bsb } : null,
              confirmData.accountNumber ? { label: 'Account', value: confirmData.accountNumber } : null,
              confirmData.billerCode ? { label: 'Biller Code', value: confirmData.billerCode } : null,
              confirmData.crn ? { label: 'Reference', value: confirmData.crn } : null,
              confirmData.description ? { label: 'Description', value: confirmData.description } : null,
              { label: 'Date', value: new Date().toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' }) },
              { label: 'Receipt No.', value: confirmData.reference },
            ] as ({ label: string; value: string } | null)[])
              .filter(Boolean)
              .map((row, idx, arr) => (
                <View key={row!.label} style={[styles.confirmRow, idx === arr.length - 1 && { borderBottomWidth: 0 }]}>
                  <Text style={styles.confirmLabel}>{row!.label}</Text>
                  <Text
                    style={[styles.confirmValue, row!.label === 'Receipt No.' && { fontFamily: Fonts.regular, fontSize: 12, color: Colors.textSecondary }]}
                    selectable
                  >
                    {row!.value}
                  </Text>
                </View>
              ))}
          </View>

          <Pressable
            style={({ pressed }) => [{ backgroundColor: Colors.accent, borderRadius: 14, paddingVertical: 16, alignItems: 'center', borderCurve: 'continuous', opacity: pressed ? 0.85 : 1 }]}
            onPress={handleReset}
          >
            <Text style={{ fontSize: 16, fontFamily: Fonts.bold, color: Colors.primary }}>Make Another Payment</Text>
          </Pressable>
        </ScrollView>
      </View>
    );
  }

  // ─── Main form ────────────────────────────────────────────────────────────

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Pay & Transfer</Text>
          {demoMode && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}>
              <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#FF9800' }} />
              <Text style={{ fontSize: 11, fontFamily: Fonts.medium, color: '#F57C00' }}>Demo Mode</Text>
            </View>
          )}
        </View>

        {/* Mode selector chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ flexGrow: 0 }}
          contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 12, gap: 8 }}
        >
          {MODES.map((m) => (
            <Pressable
              key={m.key}
              style={[styles.modeChip, mode === m.key && styles.modeChipActive]}
              onPress={() => handleModeChange(m.key)}
              hitSlop={4}
            >
              <Ionicons name={m.icon} size={14} color={mode === m.key ? Colors.white : Colors.textSecondary} />
              <Text style={[styles.modeChipText, mode === m.key && styles.modeChipTextActive]}>{m.label}</Text>
            </Pressable>
          ))}
        </ScrollView>

        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.content}
        >
          {/* ── From Account ──────────────────────────────────────────────── */}
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>From Account</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ flexGrow: 0 }}
              contentContainerStyle={{ gap: 10, paddingRight: 4 }}
            >
              {accounts.filter((a) => a.type !== 'loan').map((account) => (
                <Pressable
                  key={account.id}
                  style={[styles.accountChip, selectedFromAccount === account.id && styles.accountChipActive]}
                  onPress={() => setSelectedFromAccount(account.id)}
                >
                  <Text style={[styles.accountChipName, selectedFromAccount === account.id && styles.accountChipNameActive]}>
                    {account.name}
                  </Text>
                  <Text style={[styles.accountChipBalance, selectedFromAccount === account.id && styles.accountChipBalanceActive]}>
                    ${account.availableBalance.toLocaleString('en-AU', { minimumFractionDigits: 2 })}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>

          {/* ── PAY ANYONE ────────────────────────────────────────────────── */}
          {mode === 'pay-anyone' && (
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>To</Text>

              {/* Mode toggle */}
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <Pressable
                  style={[styles.toggleBtn, !showManualEntry && styles.toggleBtnActive]}
                  onPress={() => setShowManualEntry(false)}
                >
                  <Text style={[styles.toggleBtnText, !showManualEntry && styles.toggleBtnTextActive]}>Saved Payees</Text>
                </Pressable>
                <Pressable
                  style={[styles.toggleBtn, showManualEntry && styles.toggleBtnActive]}
                  onPress={() => setShowManualEntry(true)}
                >
                  <Text style={[styles.toggleBtnText, showManualEntry && styles.toggleBtnTextActive]}>New Payee</Text>
                </Pressable>
              </View>

              {!showManualEntry ? (
                <View style={styles.listCard}>
                  {payees.length === 0 ? (
                    <View style={{ padding: 24, alignItems: 'center', gap: 8 }}>
                      <Ionicons name="people-outline" size={32} color={Colors.textSecondary} />
                      <Text style={{ fontSize: 14, fontFamily: Fonts.medium, color: Colors.textSecondary }}>No saved payees yet</Text>
                    </View>
                  ) : (
                    payees.map((payee) => (
                      <Pressable
                        key={payee.id}
                        style={[styles.payeeRow, selectedPayeeId === payee.id && styles.payeeRowActive]}
                        onPress={() => setSelectedPayeeId(payee.id === selectedPayeeId ? null : payee.id)}
                      >
                        <View style={[styles.avatar, { backgroundColor: payee.avatarColour }]}>
                          <Text style={styles.avatarText}>{payee.name.charAt(0)}</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.payeeName}>{payee.name}</Text>
                          <Text style={styles.payeeDetails}>{payee.bsb} · {payee.accountNumber}</Text>
                        </View>
                        {selectedPayeeId === payee.id
                          ? <Ionicons name="checkmark-circle" size={20} color={Colors.primary} />
                          : <Ionicons name="chevron-forward" size={16} color={Colors.textSecondary} />
                        }
                      </Pressable>
                    ))
                  )}
                  <Pressable
                    style={styles.addPayeeBtn}
                    onPress={() => router.push('/settings/add-payee')}
                  >
                    <Ionicons name="add-circle-outline" size={20} color={Colors.primary} />
                    <Text style={styles.addPayeeText}>Add New Payee</Text>
                  </Pressable>
                </View>
              ) : (
                <View style={styles.manualCard}>
                  <BsbField value={manualBSB} onChange={handleBsbChange} onBlur={handleBsbBlur} error={bsbError} />
                  <View style={styles.cardDivider} />
                  <View>
                    <InputRow
                      label="Account Number *"
                      value={manualAccountNumber}
                      onChangeText={(v) => { setManualAccountNumber(v.replace(/\D/g, '')); setAccountNumberError(null); }}
                      onBlur={handleAccountNumberBlur}
                      placeholder="6–10 digit account number"
                      keyboardType="numeric"
                      maxLength={10}
                    />
                    {accountNumberError && <Text style={fieldStyles.error}>{accountNumberError}</Text>}
                  </View>
                  <View style={styles.cardDivider} />
                  <InputRow
                    label="Account Name *"
                    value={manualAccountName}
                    onChangeText={setManualAccountName}
                    placeholder="e.g. John Smith"
                  />
                </View>
              )}
            </View>
          )}

          {/* ── PAYID ────────────────────────────────────────────────────── */}
          {mode === 'payid' && (
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>PayID Type</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {PAYID_TYPES.map((pt) => (
                  <Pressable
                    key={pt.key}
                    style={[styles.toggleBtn, payIdType === pt.key && styles.toggleBtnActive]}
                    onPress={() => {
                      setPayIdType(pt.key);
                      setPayIdValue('');
                      setPayIdLookupResult(null);
                      setPayIdLookupError(null);
                      setPayIdValidationError(null);
                    }}
                  >
                    <Text style={[styles.toggleBtnText, payIdType === pt.key && styles.toggleBtnTextActive]}>{pt.label}</Text>
                  </Pressable>
                ))}
              </View>

              <View style={styles.field}>
                <Text style={styles.fieldLabel}>
                  {PAYID_TYPES.find((p) => p.key === payIdType)?.label ?? 'PayID'}
                </Text>
                <Text style={{ fontSize: 12, fontFamily: Fonts.regular, color: Colors.textSecondary, marginBottom: 4 }}>
                  {PAYID_TYPES.find((p) => p.key === payIdType)?.hint}
                </Text>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <View style={[styles.manualCard, { flex: 1 }]}>
                    <TextInput
                      style={styles.inputFull}
                      value={payIdValue}
                      onChangeText={(v) => {
                        setPayIdValue(v);
                        setPayIdLookupResult(null);
                        setPayIdLookupError(null);
                        setPayIdValidationError(null);
                      }}
                      placeholder={PAYID_TYPES.find((p) => p.key === payIdType)?.placeholder ?? ''}
                      placeholderTextColor={Colors.textSecondary}
                      keyboardType={PAYID_TYPES.find((p) => p.key === payIdType)?.keyboardType}
                      autoCapitalize="none"
                      autoCorrect={false}
                      returnKeyType="search"
                      onSubmitEditing={handlePayIdLookup}
                    />
                  </View>
                  <Pressable
                    style={[styles.lookupBtn, (isLookingUp || !payIdValue.trim()) && { opacity: 0.55 }]}
                    onPress={handlePayIdLookup}
                    disabled={isLookingUp || !payIdValue.trim()}
                  >
                    {isLookingUp
                      ? <ActivityIndicator size="small" color={Colors.white} />
                      : <Text style={styles.lookupBtnText}>Look Up</Text>
                    }
                  </Pressable>
                </View>

                {/* Inline validation error */}
                {payIdValidationError && (
                  <Text style={{ fontSize: 12, fontFamily: Fonts.regular, color: Colors.error, marginTop: 4 }}>{payIdValidationError}</Text>
                )}

                {/* Lookup result */}
                {payIdLookupResult && (
                  <View style={styles.payIdResultSuccess}>
                    <Ionicons name="checkmark-circle" size={22} color={Colors.success} />
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 13, fontFamily: Fonts.semiBold, color: Colors.success }}>PayID Found ✓</Text>
                      <Text style={{ fontSize: 16, fontFamily: Fonts.bold, color: Colors.textPrimary, marginTop: 2 }}>{payIdLookupResult.name}</Text>
                      <Text style={{ fontSize: 12, fontFamily: Fonts.regular, color: Colors.textSecondary, marginTop: 1 }}>{payIdLookupResult.institution}</Text>
                    </View>
                  </View>
                )}
                {payIdLookupError && (
                  <View style={styles.payIdResultError}>
                    <Ionicons name="close-circle" size={22} color={Colors.error} />
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 14, fontFamily: Fonts.semiBold, color: Colors.error }}>PayID Not Found</Text>
                      <Text style={{ fontSize: 12, fontFamily: Fonts.regular, color: Colors.error, marginTop: 2 }}>{payIdLookupError}</Text>
                    </View>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* ── BPAY ─────────────────────────────────────────────────────── */}
          {mode === 'bpay' && (
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Biller Details</Text>
              <View style={{ backgroundColor: '#E3F2FD', borderRadius: 10, padding: 12, flexDirection: 'row', gap: 8, alignItems: 'flex-start' }}>
                <Ionicons name="information-circle-outline" size={16} color={Colors.info} />
                <Text style={{ flex: 1, fontSize: 12, fontFamily: Fonts.regular, color: Colors.info }}>
                  Find the biller code and reference number on your bill or invoice.
                </Text>
              </View>
              <View style={styles.manualCard}>
                <InputRow label="Biller Code" value={billerCode} onChangeText={(v) => setBillerCode(v.replace(/\D/g, ''))} placeholder="e.g. 12345" keyboardType="numeric" />
                <View style={styles.cardDivider} />
                <InputRow label="Customer Reference Number" value={crn} onChangeText={setCrn} placeholder="e.g. 9876543210" keyboardType="numeric" />
              </View>
            </View>
          )}

          {/* ── INTERNAL TRANSFER ────────────────────────────────────────── */}
          {mode === 'internal' && (
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>To Account</Text>
              <View style={styles.listCard}>
                {accounts.filter((a) => a.id !== selectedFromAccount).map((account) => (
                  <Pressable
                    key={account.id}
                    style={[styles.payeeRow, selectedToAccountId === account.id && styles.payeeRowActive]}
                    onPress={() => setSelectedToAccountId(account.id === selectedToAccountId ? null : account.id)}
                  >
                    <View style={[styles.accountIconSmall, { backgroundColor: account.type === 'savings' ? '#E8F5E9' : account.type === 'loan' ? '#FFF3E0' : '#E3F2FD' }]}>
                      <Ionicons name={account.type === 'savings' ? 'leaf-outline' : account.type === 'loan' ? 'home-outline' : 'card-outline'} size={16} color={Colors.primary} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.payeeName}>{account.name}</Text>
                      <Text style={styles.payeeDetails}>{account.bsb} · {account.accountNumber}</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end', gap: 2 }}>
                      <Text style={{ fontSize: 13, fontFamily: Fonts.semiBold, color: Colors.textPrimary, fontVariant: ['tabular-nums'] }}>
                        ${account.balance.toLocaleString('en-AU', { minimumFractionDigits: 2 })}
                      </Text>
                      {selectedToAccountId === account.id && <Ionicons name="checkmark-circle" size={18} color={Colors.primary} />}
                    </View>
                  </Pressable>
                ))}
              </View>
            </View>
          )}

          {/* ── INTERNATIONAL ────────────────────────────────────────────── */}
          {mode === 'international' && (
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Recipient Details</Text>
              <View style={{ backgroundColor: '#FFF3E0', borderRadius: 10, padding: 12, flexDirection: 'row', gap: 8, alignItems: 'flex-start' }}>
                <Ionicons name="warning-outline" size={16} color={Colors.warning} />
                <Text style={{ flex: 1, fontSize: 12, fontFamily: Fonts.regular, color: Colors.textPrimary, lineHeight: 17 }}>
                  International transfers may take 1–3 business days. Exchange rates and fees apply.
                </Text>
              </View>
              <View style={styles.manualCard}>
                <InputRow label="Recipient Name *" value={intlRecipientName} onChangeText={setIntlRecipientName} placeholder="Full legal name" />
                <View style={styles.cardDivider} />
                <InputRow label="Bank Name" value={intlBankName} onChangeText={setIntlBankName} placeholder="e.g. Chase Bank" />
                <View style={styles.cardDivider} />
                <InputRow label="SWIFT / BIC Code *" value={intlSwift} onChangeText={(v) => setIntlSwift(v.toUpperCase())} placeholder="e.g. CHASUS33" autoCapitalize="characters" />
                <View style={styles.cardDivider} />
                <InputRow label="IBAN / Account Number *" value={intlIban} onChangeText={setIntlIban} placeholder="e.g. GB29 NWBK 6016..." />
              </View>

              <Text style={[styles.fieldLabel, { marginTop: 4 }]}>Country</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0 }} contentContainerStyle={{ gap: 6 }}>
                {COUNTRIES.map((c) => (
                  <Pressable
                    key={c}
                    style={[styles.toggleBtn, intlCountry === c && styles.toggleBtnActive]}
                    onPress={() => setIntlCountry(c)}
                  >
                    <Text style={[styles.toggleBtnText, intlCountry === c && styles.toggleBtnTextActive]}>{c}</Text>
                  </Pressable>
                ))}
              </ScrollView>

              <Text style={[styles.fieldLabel, { marginTop: 4 }]}>Currency</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0 }} contentContainerStyle={{ gap: 6 }}>
                {CURRENCIES.map((c) => (
                  <Pressable
                    key={c}
                    style={[styles.toggleBtn, intlCurrency === c && styles.toggleBtnActive]}
                    onPress={() => setIntlCurrency(c)}
                  >
                    <Text style={[styles.toggleBtnText, intlCurrency === c && styles.toggleBtnTextActive]}>{c}</Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          )}

          {/* ── PAYTO ────────────────────────────────────────────────────── */}
          {mode === 'payto' && (
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>PayTo Agreement</Text>
              {activePayToAgreements.length === 0 ? (
                <View style={[styles.listCard, { padding: 24, alignItems: 'center', gap: 12 }]}>
                  <Ionicons name="link-outline" size={36} color={Colors.textSecondary} />
                  <Text style={{ fontSize: 14, fontFamily: Fonts.medium, color: Colors.textSecondary, textAlign: 'center' }}>
                    No active PayTo agreements.{'\n'}Set up recurring payments below.
                  </Text>
                  <Pressable
                    style={{ backgroundColor: Colors.primary, borderRadius: 10, paddingHorizontal: 20, paddingVertical: 10 }}
                    onPress={() => router.push('/settings/payto-agreements')}
                  >
                    <Text style={{ fontSize: 13, fontFamily: Fonts.semiBold, color: Colors.white }}>Manage Agreements</Text>
                  </Pressable>
                </View>
              ) : (
                <View style={styles.listCard}>
                  {activePayToAgreements.map((agreement) => (
                    <Pressable
                      key={agreement.id}
                      style={[styles.payeeRow, selectedPayToId === agreement.id && styles.payeeRowActive]}
                      onPress={() => {
                        setSelectedPayToId(agreement.id === selectedPayToId ? null : agreement.id);
                        if (agreement.id !== selectedPayToId) {
                          setAmount(agreement.amount.toFixed(2));
                        }
                      }}
                    >
                      <View style={[styles.accountIconSmall, { backgroundColor: '#E8F0FE' }]}>
                        <Ionicons name="link" size={16} color={Colors.primary} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.payeeName}>{agreement.merchantName}</Text>
                        <Text style={styles.payeeDetails}>
                          ${agreement.amount.toFixed(2)} · {agreement.frequency} · {agreement.status}
                        </Text>
                      </View>
                      {selectedPayToId === agreement.id && <Ionicons name="checkmark-circle" size={20} color={Colors.primary} />}
                    </Pressable>
                  ))}
                </View>
              )}
            </View>
          )}

          {/* ── Amount ───────────────────────────────────────────────────── */}
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Amount</Text>
            <View style={[styles.amountInput, amountError ? { borderWidth: 1.5, borderColor: Colors.error } : {}]}>
              <Text style={styles.dollarSign}>$</Text>
              <TextInput
                style={styles.amountText}
                placeholder="0.00"
                placeholderTextColor={Colors.textSecondary}
                keyboardType="decimal-pad"
                value={amount}
                onChangeText={handleAmountChange}
              />
              {mode === 'international' && (
                <View style={{ backgroundColor: Colors.background, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, marginLeft: 4 }}>
                  <Text style={{ fontSize: 13, fontFamily: Fonts.semiBold, color: Colors.textSecondary }}>AUD → {intlCurrency}</Text>
                </View>
              )}
            </View>
            {amountError && <Text style={{ fontSize: 12, fontFamily: Fonts.regular, color: Colors.error }}>{amountError}</Text>}
            {fromAccount && (
              <Text style={{ fontSize: 11, fontFamily: Fonts.regular, color: Colors.textSecondary }}>
                Available: ${fromAccount.availableBalance.toLocaleString('en-AU', { minimumFractionDigits: 2 })}
              </Text>
            )}
            <View style={styles.quickAmounts}>
              {QUICK_AMOUNTS.map((qa) => (
                <Pressable
                  key={qa}
                  style={({ pressed }) => [styles.quickAmountBtn, pressed && { opacity: 0.7 }]}
                  onPress={() => { setAmount(qa); setAmountError(null); }}
                >
                  <Text style={styles.quickAmountText}>${qa}</Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* ── Description ──────────────────────────────────────────────── */}
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Description (optional)</Text>
            <View style={styles.descInput}>
              <TextInput
                style={styles.descText}
                placeholder="e.g. Rent payment, Dinner, etc."
                placeholderTextColor={Colors.textSecondary}
                value={description}
                onChangeText={setDescription}
                maxLength={18}
              />
            </View>
          </View>

          {/* ── Pay Button ───────────────────────────────────────────────── */}
          <Pressable
            style={({ pressed }) => [styles.payBtn, pressed && { opacity: 0.85 }]}
            onPress={handlePay}
          >
            <Ionicons name="send" size={18} color={Colors.primary} />
            <Text style={styles.payBtnText}>
              {mode === 'internal'
                ? 'Transfer'
                : mode === 'bpay'
                ? 'Pay via BPAY'
                : mode === 'international'
                ? 'Send Internationally'
                : mode === 'payto'
                ? 'Pay via PayTo'
                : mode === 'payid'
                ? 'Send via PayID'
                : 'Pay Now'}
              {amount && parseFloat(amount) > 0 ? ` • $${parseFloat(amount).toFixed(2)}` : ''}
            </Text>
          </Pressable>
        </ScrollView>

        {/* ── Confirm Modal ──────────────────────────────────────────────── */}
        <Modal
          visible={showConfirm}
          animationType="slide"
          presentationStyle="formSheet"
          transparent={false}
          onRequestClose={() => !isProcessing && setShowConfirm(false)}
        >
          <View style={{ flex: 1, backgroundColor: Colors.background }}>
            {/* Modal header */}
            <View style={{ flexDirection: 'row', alignItems: 'center', padding: 20, paddingTop: 24, backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.borderLight }}>
              <Text style={{ flex: 1, fontSize: 18, fontFamily: Fonts.bold, color: Colors.textPrimary }}>Confirm Payment</Text>
              <Pressable
                onPress={() => !isProcessing && setShowConfirm(false)}
                style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center' }}
                disabled={isProcessing}
              >
                <Ionicons name="close" size={20} color={Colors.textSecondary} />
              </Pressable>
            </View>

            <ScrollView contentContainerStyle={{ padding: 20, gap: 16, paddingBottom: 40 }}>
              {confirmData && (
                <>
                  {/* Payment summary */}
                  <View style={{ backgroundColor: Colors.white, borderRadius: 16, overflow: 'hidden', borderCurve: 'continuous', boxShadow: '0 4px 20px rgba(0,75,90,0.1)' }}>
                    {([
                      { label: 'From', value: confirmData.fromAccountName },
                      { label: 'To', value: confirmData.toName },
                      confirmData.payId ? { label: 'PayID', value: confirmData.payId } : null,
                      confirmData.bsb ? { label: 'BSB', value: confirmData.bsb } : null,
                      confirmData.accountNumber ? { label: 'Account', value: confirmData.accountNumber } : null,
                      confirmData.billerCode ? { label: 'Biller Code', value: confirmData.billerCode } : null,
                      confirmData.crn ? { label: 'CRN', value: confirmData.crn } : null,
                      confirmData.currency ? { label: 'Currency', value: `AUD → ${confirmData.currency}` } : null,
                      { label: 'Amount', value: `$${confirmData.amount.toFixed(2)} AUD` },
                      confirmData.description ? { label: 'Description', value: confirmData.description } : null,
                    ] as ({ label: string; value: string } | null)[])
                      .filter(Boolean)
                      .map((row, idx, arr) => (
                        <View key={row!.label} style={[styles.confirmRow, idx === arr.length - 1 && { borderBottomWidth: 0 }]}>
                          <Text style={styles.confirmLabel}>{row!.label}</Text>
                          <Text style={styles.confirmValue}>{row!.value}</Text>
                        </View>
                      ))}
                  </View>

                  {/* Warning */}
                  <View style={{ backgroundColor: '#FFF3E0', borderRadius: 12, padding: 14, flexDirection: 'row', gap: 10, alignItems: 'flex-start' }}>
                    <Ionicons name="warning-outline" size={18} color={Colors.warning} />
                    <Text style={{ flex: 1, fontSize: 13, fontFamily: Fonts.regular, color: Colors.textPrimary, lineHeight: 18 }}>
                      Please verify recipient details carefully. Payments to wrong accounts cannot always be recovered.
                    </Text>
                  </View>

                  {/* Confirm button */}
                  <Pressable
                    style={({ pressed }) => [{
                      backgroundColor: isProcessing ? Colors.primary : Colors.primary,
                      borderRadius: 14,
                      paddingVertical: 16,
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexDirection: 'row',
                      gap: 10,
                      borderCurve: 'continuous',
                      opacity: pressed ? 0.85 : 1,
                    }]}
                    onPress={handleConfirm}
                    disabled={isProcessing}
                  >
                    {isProcessing
                      ? <ActivityIndicator color={Colors.white} />
                      : (
                        <>
                          <Ionicons name="lock-closed" size={18} color={Colors.white} />
                          <Text style={{ fontSize: 16, fontFamily: Fonts.bold, color: Colors.white }}>Confirm & Send</Text>
                        </>
                      )
                    }
                  </Pressable>

                  {/* Cancel */}
                  <Pressable
                    style={({ pressed }) => [{ paddingVertical: 14, alignItems: 'center', opacity: pressed ? 0.6 : 1 }]}
                    onPress={() => setShowConfirm(false)}
                    disabled={isProcessing}
                  >
                    <Text style={{ fontSize: 14, fontFamily: Fonts.medium, color: Colors.textSecondary }}>Cancel</Text>
                  </Pressable>
                </>
              )}
            </ScrollView>
          </View>
        </Modal>
      </View>
    </KeyboardAvoidingView>
  );
}

// ─── InputRow helper ─────────────────────────────────────────────────────────

function InputRow({
  label,
  value,
  onChangeText,
  onBlur,
  placeholder,
  keyboardType,
  maxLength,
  autoCapitalize,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  keyboardType?: 'default' | 'numeric' | 'email-address' | 'phone-pad' | 'decimal-pad';
  maxLength?: number;
  autoCapitalize?: 'none' | 'characters' | 'words' | 'sentences';
}) {
  return (
    <View style={{ padding: 14, gap: 4 }}>
      <Text style={{ fontSize: 11, fontFamily: Fonts.semiBold, color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        onBlur={onBlur}
        placeholder={placeholder}
        placeholderTextColor={Colors.textSecondary}
        keyboardType={keyboardType}
        maxLength={maxLength}
        autoCapitalize={autoCapitalize}
        style={{ fontSize: 15, fontFamily: Fonts.regular, color: Colors.textPrimary }}
      />
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  headerTitle: {
    fontSize: 22,
    fontFamily: Fonts.bold,
    color: Colors.textPrimary,
  },
  modeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 20,
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.border,
    minHeight: 44,
  },
  modeChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  modeChipText: {
    fontSize: 13,
    fontFamily: Fonts.medium,
    color: Colors.textSecondary,
  },
  modeChipTextActive: {
    color: Colors.white,
  },
  content: {
    padding: 20,
    paddingBottom: 60,
    gap: 20,
  },
  field: {
    gap: 10,
  },
  fieldLabel: {
    fontSize: 12,
    fontFamily: Fonts.semiBold,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  accountChip: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 14,
    borderWidth: 2,
    borderColor: Colors.border,
    borderCurve: 'continuous',
    minWidth: 150,
  },
  accountChipActive: {
    borderColor: Colors.primary,
    backgroundColor: '#F0F8FA',
  },
  accountChipName: {
    fontSize: 13,
    fontFamily: Fonts.semiBold,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  accountChipNameActive: { color: Colors.primary },
  accountChipBalance: {
    fontSize: 16,
    fontFamily: Fonts.bold,
    color: Colors.textPrimary,
    fontVariant: ['tabular-nums'],
  },
  accountChipBalanceActive: { color: Colors.primary },
  toggleBtn: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 20,
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.border,
    minHeight: 44,
    justifyContent: 'center',
  },
  toggleBtnActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  toggleBtnText: {
    fontSize: 13,
    fontFamily: Fonts.medium,
    color: Colors.textSecondary,
  },
  toggleBtnTextActive: {
    color: Colors.white,
    fontFamily: Fonts.semiBold,
  },
  listCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    overflow: 'hidden',
    borderCurve: 'continuous',
    boxShadow: '0 2px 10px rgba(0, 75, 90, 0.06)',
  },
  payeeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    minHeight: 64,
  },
  payeeRowActive: { backgroundColor: '#F0F8FA' },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontFamily: Fonts.semiBold,
    color: Colors.white,
  },
  payeeName: {
    fontSize: 14,
    fontFamily: Fonts.semiBold,
    color: Colors.textPrimary,
  },
  payeeDetails: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  addPayeeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
    minHeight: 52,
  },
  addPayeeText: {
    fontSize: 14,
    fontFamily: Fonts.medium,
    color: Colors.primary,
  },
  accountIconSmall: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderCurve: 'continuous',
  },
  manualCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    borderCurve: 'continuous',
    boxShadow: '0 2px 10px rgba(0, 75, 90, 0.06)',
    overflow: 'hidden',
  },
  inputFull: {
    padding: 15,
    fontSize: 15,
    fontFamily: Fonts.regular,
    color: Colors.textPrimary,
    minHeight: 50,
  },
  cardDivider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginHorizontal: 14,
  },
  lookupBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderCurve: 'continuous',
    minWidth: 90,
    minHeight: 50,
  },
  lookupBtnText: {
    fontSize: 13,
    fontFamily: Fonts.semiBold,
    color: Colors.white,
  },
  payIdResultSuccess: {
    backgroundColor: '#E8F5E9',
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    borderCurve: 'continuous',
    borderWidth: 1,
    borderColor: '#A5D6A7',
  },
  payIdResultError: {
    backgroundColor: '#FFEBEE',
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    borderCurve: 'continuous',
    borderWidth: 1,
    borderColor: '#FFCDD2',
  },
  amountInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 18,
    borderCurve: 'continuous',
    boxShadow: '0 2px 10px rgba(0, 75, 90, 0.06)',
    gap: 4,
  },
  dollarSign: {
    fontSize: 28,
    fontFamily: Fonts.bold,
    color: Colors.textSecondary,
  },
  amountText: {
    flex: 1,
    fontSize: 32,
    fontFamily: Fonts.bold,
    color: Colors.textPrimary,
    fontVariant: ['tabular-nums'],
  },
  quickAmounts: {
    flexDirection: 'row',
    gap: 10,
  },
  quickAmountBtn: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    borderCurve: 'continuous',
    boxShadow: '0 2px 6px rgba(0, 75, 90, 0.06)',
    minHeight: 44,
    justifyContent: 'center',
  },
  quickAmountText: {
    fontSize: 14,
    fontFamily: Fonts.semiBold,
    color: Colors.primary,
  },
  descInput: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 16,
    borderCurve: 'continuous',
    boxShadow: '0 2px 10px rgba(0, 75, 90, 0.06)',
  },
  descText: {
    fontSize: 15,
    fontFamily: Fonts.regular,
    color: Colors.textPrimary,
  },
  payBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: Colors.accent,
    borderRadius: 16,
    paddingVertical: 18,
    borderCurve: 'continuous',
    marginTop: 4,
    minHeight: 56,
  },
  payBtnText: {
    fontSize: 16,
    fontFamily: Fonts.bold,
    color: Colors.primary,
  },
  confirmRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    gap: 12,
    alignItems: 'flex-start',
  },
  confirmLabel: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: Colors.textSecondary,
    flexShrink: 0,
  },
  confirmValue: {
    fontSize: 14,
    fontFamily: Fonts.semiBold,
    color: Colors.textPrimary,
    flex: 1,
    textAlign: 'right',
  },
});
