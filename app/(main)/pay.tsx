import React, { useState } from 'react';
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
import { lookupPayId, type PayIdType, type PayIdRecord } from '@/utils/payid-registry';
import type { Transaction } from '@/store/types';

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

const PAYID_TYPES: { key: PayIdType; label: string; placeholder: string; keyboardType: 'default' | 'email-address' | 'phone-pad' | 'numeric' }[] = [
  { key: 'email', label: 'Email', placeholder: 'email@example.com', keyboardType: 'email-address' },
  { key: 'mobile', label: 'Mobile', placeholder: '0412 345 678', keyboardType: 'phone-pad' },
  { key: 'abn', label: 'ABN', placeholder: '12 345 678 901', keyboardType: 'numeric' },
  { key: 'organisation-id', label: 'Org ID', placeholder: 'ORG001234', keyboardType: 'default' },
];

const COUNTRIES = ['Australia', 'United States', 'United Kingdom', 'New Zealand', 'Singapore', 'Canada', 'Germany', 'France', 'Japan', 'China'];
const CURRENCIES = ['USD', 'GBP', 'EUR', 'NZD', 'SGD', 'CAD', 'JPY', 'CNY', 'HKD'];

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
}

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

  // PayID fields
  const [payIdType, setPayIdType] = useState<PayIdType>('email');
  const [payIdValue, setPayIdValue] = useState('');
  const [payIdLookupResult, setPayIdLookupResult] = useState<{ name: string; institution: string } | null>(null);
  const [payIdLookupError, setPayIdLookupError] = useState<string | null>(null);
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
  const [description, setDescription] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmData, setConfirmData] = useState<ConfirmData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const fromAccount = accounts.find((a) => a.id === selectedFromAccount);
  const activePayToAgreements = payToAgreements.filter((a) => a.status !== 'cancelled');

  // ─── PayID Lookup ─────────────────────────────────────────────────────────

  /**
   * Build dynamic registry entries from the current user's profile so that
   * looking up their own registered email/phone always resolves correctly,
   * regardless of whether the static registry has been updated.
   */
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
      // Strip formatting so "0412 345 678" → "0412345678"
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
    if (!payIdValue.trim()) return;
    setIsLookingUp(true);
    setPayIdLookupResult(null);
    setPayIdLookupError(null);
    try {
      // Pass the current user's own PayIDs so their own registered details resolve correctly
      const result = await lookupPayId(payIdValue.trim(), buildUserPayIdEntries());
      if (result) {
        setPayIdLookupResult({ name: result.registeredName, institution: result.financialInstitution });
      } else {
        setPayIdLookupError('PayID not found. Please check and try again.');
      }
    } finally {
      setIsLookingUp(false);
    }
  };

  // ─── Validation ──────────────────────────────────────────────────────────

  const validatePayment = (): string | null => {
    const amt = parseFloat(amount);
    if (!amount || isNaN(amt) || amt <= 0) return 'Please enter a valid amount.';
    if (fromAccount && amt > fromAccount.availableBalance) return 'Insufficient funds.';

    switch (mode) {
      case 'pay-anyone':
        if (!showManualEntry && !selectedPayeeId) return 'Please select a payee or enter details manually.';
        if (showManualEntry) {
          if (!manualBSB || !/^\d{3}-?\d{3}$/.test(manualBSB.replace(/\s/g, ''))) return 'Enter a valid BSB (e.g. 641-800).';
          if (!manualAccountNumber.trim()) return 'Enter the account number.';
          if (!manualAccountName.trim()) return 'Enter the account name.';
        }
        break;
      case 'payid':
        if (!payIdValue.trim()) return 'Enter a PayID.';
        if (!payIdLookupResult) return 'Please look up the PayID first.';
        break;
      case 'bpay':
        if (!billerCode.trim()) return 'Enter the biller code.';
        if (!crn.trim()) return 'Enter the customer reference number.';
        break;
      case 'internal':
        if (!selectedToAccountId) return 'Select a destination account.';
        break;
      case 'international':
        if (!intlRecipientName.trim()) return 'Enter the recipient name.';
        if (!intlSwift.trim()) return 'Enter the SWIFT/BIC code.';
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
          return { ...base, toName: payee.name, paymentMethod: 'bsb' };
        }
        return { ...base, toName: manualAccountName, paymentMethod: 'bsb' };
      }
      case 'payid':
        return { ...base, toName: payIdLookupResult!.name, paymentMethod: 'payid', payId: payIdValue };
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
    if (error) { Alert.alert('Cannot Process', error); return; }
    setConfirmData(buildConfirmData());
    setShowConfirm(true);
  };

  const handleConfirm = async () => {
    if (!confirmData) return;
    setIsProcessing(true);
    await new Promise((r) => setTimeout(r, 1200));

    // Deduct from source account
    const debitDelta = -confirmData.amount;
    updateAccountBalance(selectedFromAccount, debitDelta);

    // Credit destination for internal transfer
    if (mode === 'internal' && selectedToAccountId) {
      updateAccountBalance(selectedToAccountId, confirmData.amount);
    }

    // Add debit transaction
    addTransaction({
      accountId: selectedFromAccount,
      description: confirmData.description || confirmData.toName,
      amount: debitDelta,
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
  };

  const handleReset = () => {
    setPaymentSuccess(false);
    setAmount('');
    setDescription('');
    setSelectedPayeeId(null);
    setManualBSB('');
    setManualAccountNumber('');
    setManualAccountName('');
    setShowManualEntry(false);
    setPayIdValue('');
    setPayIdLookupResult(null);
    setPayIdLookupError(null);
    setBillerCode('');
    setCrn('');
    setSelectedToAccountId(null);
    setIntlRecipientName('');
    setIntlSwift('');
    setIntlIban('');
    setSelectedPayToId(null);
    setConfirmData(null);
  };

  // ─── Success screen ───────────────────────────────────────────────────────

  if (paymentSuccess && confirmData) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <ScrollView contentContainerStyle={{ flex: 1, justifyContent: 'center', padding: 28, gap: 16 }}>
          <View style={{ alignItems: 'center', gap: 16 }}>
            <View style={{ width: 84, height: 84, borderRadius: 42, backgroundColor: '#E8F5E9', alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name="checkmark-circle" size={52} color={Colors.success} />
            </View>
            <Text style={{ fontSize: 26, fontFamily: Fonts.bold, color: Colors.textPrimary }}>
              {mode === 'internal' ? 'Transfer Complete' : 'Payment Sent!'}
            </Text>
            <Text style={{ fontSize: 15, fontFamily: Fonts.regular, color: Colors.textSecondary }}>
              ${confirmData.amount.toFixed(2)} to {confirmData.toName}
            </Text>
          </View>

          <View style={{ backgroundColor: Colors.white, borderRadius: 16, overflow: 'hidden', borderCurve: 'continuous', boxShadow: '0 4px 20px rgba(0,75,90,0.1)' }}>
            {[
              { label: 'From', value: confirmData.fromAccountName },
              { label: 'To', value: confirmData.toName },
              { label: 'Amount', value: `$${confirmData.amount.toFixed(2)}${confirmData.currency ? ` → ${confirmData.currency}` : ''}` },
              confirmData.payId ? { label: 'PayID', value: confirmData.payId } : null,
              confirmData.billerCode ? { label: 'Biller Code', value: confirmData.billerCode } : null,
              confirmData.crn ? { label: 'Reference', value: confirmData.crn } : null,
              confirmData.description ? { label: 'Description', value: confirmData.description } : null,
              { label: 'Date', value: new Date().toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' }) },
              { label: 'Receipt', value: confirmData.reference },
            ].filter(Boolean).map((row, idx, arr) => (
              <View key={row!.label} style={[styles.confirmRow, idx === arr.length - 1 && { borderBottomWidth: 0 }]}>
                <Text style={styles.confirmLabel}>{row!.label}</Text>
                <Text style={[styles.confirmValue, row!.label === 'Receipt' && { fontFamily: Fonts.regular, fontSize: 12, color: Colors.textSecondary }]} selectable>{row!.value}</Text>
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

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Pay & Transfer</Text>
        </View>

        {/* Mode selector */}
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
              onPress={() => { setMode(m.key); handleReset(); }}
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
          {/* From Account */}
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
                    ${account.balance.toLocaleString('en-AU', { minimumFractionDigits: 2 })}
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
                <View style={styles.payeeList}>
                  {payees.map((payee) => (
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
                      {selectedPayeeId === payee.id && <Ionicons name="checkmark-circle" size={20} color={Colors.primary} />}
                    </Pressable>
                  ))}
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
                  <InputRow label="BSB *" value={manualBSB} onChangeText={(v) => setManualBSB(formatBSB(v))} placeholder="641-800" keyboardType="numeric" maxLength={7} />
                  <View style={styles.cardDivider} />
                  <InputRow label="Account Number *" value={manualAccountNumber} onChangeText={setManualAccountNumber} placeholder="1234 5678" keyboardType="numeric" />
                  <View style={styles.cardDivider} />
                  <InputRow label="Account Name *" value={manualAccountName} onChangeText={setManualAccountName} placeholder="e.g. John Smith" />
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
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <View style={[styles.manualCard, { flex: 1 }]}>
                    <TextInput
                      style={styles.inputFull}
                      value={payIdValue}
                      onChangeText={(v) => {
                        setPayIdValue(v);
                        setPayIdLookupResult(null);
                        setPayIdLookupError(null);
                      }}
                      placeholder={PAYID_TYPES.find((p) => p.key === payIdType)?.placeholder ?? ''}
                      placeholderTextColor={Colors.textSecondary}
                      keyboardType={PAYID_TYPES.find((p) => p.key === payIdType)?.keyboardType}
                      autoCapitalize="none"
                    />
                  </View>
                  <Pressable
                    style={[styles.lookupBtn, isLookingUp && { opacity: 0.6 }]}
                    onPress={handlePayIdLookup}
                    disabled={isLookingUp || !payIdValue.trim()}
                  >
                    {isLookingUp
                      ? <ActivityIndicator size="small" color={Colors.white} />
                      : <Text style={styles.lookupBtnText}>Look Up</Text>
                    }
                  </Pressable>
                </View>

                {/* Lookup result */}
                {payIdLookupResult && (
                  <View style={styles.payIdResult}>
                    <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 13, fontFamily: Fonts.semiBold, color: Colors.success }}>PayID Found</Text>
                      <Text style={{ fontSize: 15, fontFamily: Fonts.bold, color: Colors.textPrimary }}>{payIdLookupResult.name}</Text>
                      <Text style={{ fontSize: 12, fontFamily: Fonts.regular, color: Colors.textSecondary }}>{payIdLookupResult.institution}</Text>
                    </View>
                  </View>
                )}
                {payIdLookupError && (
                  <View style={[styles.payIdResult, { backgroundColor: '#FFEBEE' }]}>
                    <Ionicons name="close-circle" size={20} color={Colors.error} />
                    <Text style={{ flex: 1, fontSize: 14, fontFamily: Fonts.medium, color: Colors.error }}>{payIdLookupError}</Text>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* ── BPAY ─────────────────────────────────────────────────────── */}
          {mode === 'bpay' && (
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Biller Details</Text>
              <View style={{ backgroundColor: Colors.infoBg, borderRadius: 10, padding: 12, flexDirection: 'row', gap: 8 }}>
                <Text style={{ fontSize: 12, fontFamily: Fonts.regular, color: Colors.info }}>Find the biller code and reference number on your bill</Text>
              </View>
              <View style={styles.manualCard}>
                <InputRow label="Biller Code" value={billerCode} onChangeText={setBillerCode} placeholder="e.g. 12345" keyboardType="numeric" />
                <View style={styles.cardDivider} />
                <InputRow label="Customer Reference Number" value={crn} onChangeText={setCrn} placeholder="e.g. 9876543210" keyboardType="numeric" />
              </View>
            </View>
          )}

          {/* ── INTERNAL TRANSFER ────────────────────────────────────────── */}
          {mode === 'internal' && (
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>To Account</Text>
              <View style={styles.payeeList}>
                {accounts.filter((a) => a.id !== selectedFromAccount).map((account) => (
                  <Pressable
                    key={account.id}
                    style={[styles.payeeRow, selectedToAccountId === account.id && styles.payeeRowActive]}
                    onPress={() => setSelectedToAccountId(account.id === selectedToAccountId ? null : account.id)}
                  >
                    <View style={[styles.accountIconSmall, { backgroundColor: account.type === 'savings' ? '#E8F5E9' : '#E3F2FD' }]}>
                      <Ionicons name={account.type === 'savings' ? 'leaf-outline' : account.type === 'loan' ? 'home-outline' : 'card-outline'} size={16} color={Colors.primary} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.payeeName}>{account.name}</Text>
                      <Text style={styles.payeeDetails}>{account.bsb} · {account.accountNumber}</Text>
                    </View>
                    {selectedToAccountId === account.id && <Ionicons name="checkmark-circle" size={20} color={Colors.primary} />}
                  </Pressable>
                ))}
              </View>
            </View>
          )}

          {/* ── INTERNATIONAL ────────────────────────────────────────────── */}
          {mode === 'international' && (
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Recipient Details</Text>
              <View style={{ backgroundColor: '#FFF3E0', borderRadius: 10, padding: 12, flexDirection: 'row', gap: 8 }}>
                <Ionicons name="information-circle-outline" size={16} color={Colors.warning} />
                <Text style={{ flex: 1, fontSize: 12, fontFamily: Fonts.regular, color: Colors.textPrimary }}>
                  International transfers may take 1–3 business days. Exchange rates apply.
                </Text>
              </View>
              <View style={styles.manualCard}>
                <InputRow label="Recipient Name" value={intlRecipientName} onChangeText={setIntlRecipientName} placeholder="Full legal name" />
                <View style={styles.cardDivider} />
                <InputRow label="Bank Name" value={intlBankName} onChangeText={setIntlBankName} placeholder="e.g. Chase Bank" />
                <View style={styles.cardDivider} />
                <InputRow label="SWIFT / BIC Code" value={intlSwift} onChangeText={setIntlSwift} placeholder="e.g. CHASUS33" autoCapitalize="characters" />
                <View style={styles.cardDivider} />
                <InputRow label="IBAN / Account Number" value={intlIban} onChangeText={setIntlIban} placeholder="e.g. GB29 NWBK 6016..." />
              </View>

              <View style={{ flexDirection: 'row', gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.fieldLabel, { marginBottom: 8 }]}>Country</Text>
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
                </View>
              </View>

              <View>
                <Text style={[styles.fieldLabel, { marginBottom: 8 }]}>Currency</Text>
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
            </View>
          )}

          {/* ── PAYTO ────────────────────────────────────────────────────── */}
          {mode === 'payto' && (
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>PayTo Agreement</Text>
              {activePayToAgreements.length === 0 ? (
                <View style={[styles.payeeList, { padding: 20, alignItems: 'center', gap: 10 }]}>
                  <Ionicons name="link-outline" size={32} color={Colors.textSecondary} />
                  <Text style={{ fontSize: 14, fontFamily: Fonts.medium, color: Colors.textSecondary, textAlign: 'center' }}>
                    No active PayTo agreements.
                  </Text>
                  <Pressable
                    style={{ backgroundColor: Colors.primary, borderRadius: 10, paddingHorizontal: 16, paddingVertical: 10 }}
                    onPress={() => router.push('/settings/payto-agreements')}
                  >
                    <Text style={{ fontSize: 13, fontFamily: Fonts.semiBold, color: Colors.white }}>Manage Agreements</Text>
                  </Pressable>
                </View>
              ) : (
                <View style={styles.payeeList}>
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
            <View style={styles.amountInput}>
              <Text style={styles.dollarSign}>$</Text>
              <TextInput
                style={styles.amountText}
                placeholder="0.00"
                placeholderTextColor={Colors.textSecondary}
                keyboardType="decimal-pad"
                value={amount}
                onChangeText={setAmount}
              />
              {mode === 'international' && (
                <View style={{ backgroundColor: Colors.background, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, marginLeft: 4 }}>
                  <Text style={{ fontSize: 13, fontFamily: Fonts.semiBold, color: Colors.textSecondary }}>AUD → {intlCurrency}</Text>
                </View>
              )}
            </View>
            <View style={styles.quickAmounts}>
              {QUICK_AMOUNTS.map((qa) => (
                <Pressable
                  key={qa}
                  style={({ pressed }) => [styles.quickAmountBtn, pressed && { opacity: 0.7 }]}
                  onPress={() => setAmount(qa)}
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
                placeholder="e.g. Rent, Dinner, etc."
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
              {mode === 'internal' ? 'Transfer' : mode === 'bpay' ? 'Pay BPAY' : mode === 'international' ? 'Send Internationally' : mode === 'payto' ? 'Pay via PayTo' : mode === 'payid' ? 'Send via PayID' : 'Pay Now'}
              {amount ? ` $${parseFloat(amount || '0').toFixed(2)}` : ''}
            </Text>
          </Pressable>
        </ScrollView>

        {/* ── Confirm Modal ──────────────────────────────────────────────── */}
        <Modal visible={showConfirm} animationType="slide" presentationStyle="formSheet" transparent={false} onRequestClose={() => setShowConfirm(false)}>
          <View style={{ flex: 1, backgroundColor: Colors.background }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', padding: 20, backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.borderLight }}>
              <Text style={{ flex: 1, fontSize: 18, fontFamily: Fonts.bold, color: Colors.textPrimary }}>Confirm Payment</Text>
              <Pressable onPress={() => setShowConfirm(false)}>
                <Ionicons name="close" size={24} color={Colors.textSecondary} />
              </Pressable>
            </View>
            <ScrollView contentContainerStyle={{ padding: 20, gap: 16 }}>
              {confirmData && (
                <>
                  <View style={{ backgroundColor: Colors.white, borderRadius: 16, overflow: 'hidden', borderCurve: 'continuous', boxShadow: '0 4px 20px rgba(0,75,90,0.1)' }}>
                    {[
                      { label: 'From', value: confirmData.fromAccountName },
                      { label: 'To', value: confirmData.toName },
                      confirmData.payId ? { label: 'PayID', value: confirmData.payId } : null,
                      confirmData.billerCode ? { label: 'Biller Code', value: confirmData.billerCode } : null,
                      confirmData.crn ? { label: 'CRN', value: confirmData.crn } : null,
                      confirmData.currency ? { label: 'Currency', value: `AUD → ${confirmData.currency}` } : null,
                      { label: 'Amount', value: `$${confirmData.amount.toFixed(2)} AUD` },
                      confirmData.description ? { label: 'Description', value: confirmData.description } : null,
                    ].filter(Boolean).map((row, idx, arr) => (
                      <View key={row!.label} style={[styles.confirmRow, idx === arr.length - 1 && { borderBottomWidth: 0 }]}>
                        <Text style={styles.confirmLabel}>{row!.label}</Text>
                        <Text style={styles.confirmValue}>{row!.value}</Text>
                      </View>
                    ))}
                  </View>

                  <View style={{ backgroundColor: '#FFF3E0', borderRadius: 12, padding: 14, flexDirection: 'row', gap: 10 }}>
                    <Ionicons name="warning-outline" size={18} color={Colors.warning} />
                    <Text style={{ flex: 1, fontSize: 13, fontFamily: Fonts.regular, color: Colors.textPrimary, lineHeight: 18 }}>
                      Please verify recipient details carefully. Payments to wrong accounts cannot always be recovered.
                    </Text>
                  </View>

                  <Pressable
                    style={({ pressed }) => [{
                      backgroundColor: Colors.primary,
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
                      : <>
                          <Ionicons name="lock-closed" size={18} color={Colors.white} />
                          <Text style={{ fontSize: 16, fontFamily: Fonts.bold, color: Colors.white }}>Confirm & Send</Text>
                        </>
                    }
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

function InputRow({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  maxLength,
  autoCapitalize,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  keyboardType?: 'default' | 'numeric' | 'email-address' | 'phone-pad' | 'decimal-pad';
  maxLength?: number;
  autoCapitalize?: 'none' | 'characters' | 'words';
}) {
  return (
    <View style={{ padding: 14, gap: 4 }}>
      <Text style={{ fontSize: 11, fontFamily: Fonts.semiBold, color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
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

function formatBSB(bsb: string) {
  const digits = bsb.replace(/\D/g, '').slice(0, 6);
  if (digits.length > 3) return digits.slice(0, 3) + '-' + digits.slice(3);
  return digits;
}

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
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.border,
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
  payeeList: {
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
    minWidth: 80,
  },
  lookupBtnText: {
    fontSize: 13,
    fontFamily: Fonts.semiBold,
    color: Colors.white,
  },
  payIdResult: {
    backgroundColor: '#E8F5E9',
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    borderCurve: 'continuous',
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
  },
  confirmLabel: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: Colors.textSecondary,
  },
  confirmValue: {
    fontSize: 14,
    fontFamily: Fonts.semiBold,
    color: Colors.textPrimary,
    maxWidth: '60%',
    textAlign: 'right',
  },
});
