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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppStore } from '@/store/useAppStore';
import { Colors } from '@/constants/Colors';
import { Fonts } from '@/constants/Typography';

type PayMode = 'pay-anyone' | 'bpay' | 'transfer';

const QUICK_AMOUNTS = ['$50', '$100', '$200', '$500'];

export default function PayScreen() {
  const insets = useSafeAreaInsets();
  const accounts = useAppStore((s) => s.accounts);
  const payees = useAppStore((s) => s.payees);

  const [mode, setMode] = useState<PayMode>('pay-anyone');
  const [selectedFromAccount, setSelectedFromAccount] = useState(accounts[0]?.id ?? '');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [selectedPayee, setSelectedPayee] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const fromAccount = accounts.find((a) => a.id === selectedFromAccount);
  const toPayee = payees.find((p) => p.id === selectedPayee);

  const handlePay = () => {
    if (!amount || !selectedPayee) return;
    setShowConfirm(true);
  };

  const handleConfirm = () => {
    setShowConfirm(false);
    setAmount('');
    setDescription('');
    setSelectedPayee(null);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Pay & Transfer</Text>
        </View>

        {/* Mode Selector */}
        <View style={styles.modeBar}>
          {([
            { key: 'pay-anyone' as PayMode, label: 'Pay Anyone' },
            { key: 'transfer' as PayMode, label: 'Transfer' },
            { key: 'bpay' as PayMode, label: 'BPAY' },
          ] as const).map((m) => (
            <Pressable
              key={m.key}
              style={[styles.modeTab, mode === m.key && styles.modeTabActive]}
              onPress={() => setMode(m.key)}
            >
              <Text style={[styles.modeTabText, mode === m.key && styles.modeTabTextActive]}>
                {m.label}
              </Text>
            </Pressable>
          ))}
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.content}
        >
          {showConfirm ? (
            /* Confirmation screen */
            <View style={styles.confirmCard}>
              <View style={styles.confirmIcon}>
                <Ionicons name="checkmark-circle" size={56} color={Colors.success} />
              </View>
              <Text style={styles.confirmTitle}>Payment Sent!</Text>
              <Text style={styles.confirmSub}>
                ${parseFloat(amount || '0').toFixed(2)} to {toPayee?.name}
              </Text>
              <View style={styles.confirmDetails}>
                <View style={styles.confirmRow}>
                  <Text style={styles.confirmLabel}>From</Text>
                  <Text style={styles.confirmValue}>{fromAccount?.name}</Text>
                </View>
                <View style={styles.confirmRow}>
                  <Text style={styles.confirmLabel}>To</Text>
                  <Text style={styles.confirmValue}>{toPayee?.name}</Text>
                </View>
                <View style={styles.confirmRow}>
                  <Text style={styles.confirmLabel}>Amount</Text>
                  <Text style={styles.confirmValue}>${parseFloat(amount || '0').toFixed(2)}</Text>
                </View>
                {description ? (
                  <View style={styles.confirmRow}>
                    <Text style={styles.confirmLabel}>Description</Text>
                    <Text style={styles.confirmValue}>{description}</Text>
                  </View>
                ) : null}
              </View>
              <Pressable style={styles.doneBtn} onPress={handleConfirm}>
                <Text style={styles.doneBtnText}>Done</Text>
              </Pressable>
            </View>
          ) : (
            <>
              {/* From Account */}
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>From Account</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={{ flexGrow: 0 }}
                  contentContainerStyle={styles.accountChips}
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

              {/* To / Payees */}
              {mode === 'pay-anyone' && (
                <View style={styles.field}>
                  <Text style={styles.fieldLabel}>To</Text>
                  <View style={styles.payeeList}>
                    {payees.map((payee) => (
                      <Pressable
                        key={payee.id}
                        style={[styles.payeeRow, selectedPayee === payee.id && styles.payeeRowActive]}
                        onPress={() => setSelectedPayee(payee.id === selectedPayee ? null : payee.id)}
                      >
                        <View style={[styles.avatar, { backgroundColor: payee.avatarColour }]}>
                          <Text style={styles.avatarText}>{payee.name.charAt(0)}</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.payeeName}>{payee.name}</Text>
                          <Text style={styles.payeeDetails}>{payee.bsb} · {payee.accountNumber}</Text>
                        </View>
                        {selectedPayee === payee.id && (
                          <Ionicons name="checkmark-circle" size={20} color={Colors.primary} />
                        )}
                      </Pressable>
                    ))}
                    <Pressable style={styles.addPayeeBtn}>
                      <Ionicons name="add-circle-outline" size={20} color={Colors.primary} />
                      <Text style={styles.addPayeeText}>Add new payee</Text>
                    </Pressable>
                  </View>
                </View>
              )}

              {mode === 'transfer' && (
                <View style={styles.field}>
                  <Text style={styles.fieldLabel}>To Account</Text>
                  <View style={styles.payeeList}>
                    {accounts.filter((a) => a.id !== selectedFromAccount).map((account) => (
                      <Pressable
                        key={account.id}
                        style={[styles.payeeRow, selectedPayee === account.id && styles.payeeRowActive]}
                        onPress={() => setSelectedPayee(account.id === selectedPayee ? null : account.id)}
                      >
                        <View style={[styles.accountIconSmall, { backgroundColor: account.type === 'savings' ? '#E8F5E9' : '#E3F2FD' }]}>
                          <Ionicons name={account.type === 'savings' ? 'leaf-outline' : 'card-outline'} size={16} color={Colors.primary} />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.payeeName}>{account.name}</Text>
                          <Text style={styles.payeeDetails}>{account.bsb} · {account.accountNumber}</Text>
                        </View>
                        {selectedPayee === account.id && (
                          <Ionicons name="checkmark-circle" size={20} color={Colors.primary} />
                        )}
                      </Pressable>
                    ))}
                  </View>
                </View>
              )}

              {mode === 'bpay' && (
                <View style={styles.field}>
                  <Text style={styles.fieldLabel}>Biller Details</Text>
                  <View style={styles.bpayCard}>
                    <TextInput
                      style={styles.bpayInput}
                      placeholder="Biller Code"
                      placeholderTextColor={Colors.textSecondary}
                      keyboardType="numeric"
                    />
                    <View style={styles.bpayDivider} />
                    <TextInput
                      style={styles.bpayInput}
                      placeholder="Reference Number"
                      placeholderTextColor={Colors.textSecondary}
                      keyboardType="numeric"
                    />
                  </View>
                </View>
              )}

              {/* Amount */}
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
                </View>
                <View style={styles.quickAmounts}>
                  {QUICK_AMOUNTS.map((qa) => (
                    <Pressable
                      key={qa}
                      style={({ pressed }) => [styles.quickAmountBtn, pressed && { opacity: 0.7 }]}
                      onPress={() => setAmount(qa.replace('$', ''))}
                    >
                      <Text style={styles.quickAmountText}>{qa}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              {/* Description */}
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

              {/* Pay Button */}
              <Pressable
                style={({ pressed }) => [
                  styles.payBtn,
                  (!amount || (mode !== 'bpay' && !selectedPayee)) && styles.payBtnDisabled,
                  pressed && { opacity: 0.85 },
                ]}
                onPress={handlePay}
                disabled={!amount || (mode !== 'bpay' && !selectedPayee)}
              >
                <Ionicons name="send" size={18} color={Colors.primary} />
                <Text style={styles.payBtnText}>
                  {mode === 'transfer' ? 'Transfer' : mode === 'bpay' ? 'Pay BPAY' : 'Pay Now'}
                  {amount ? ` $${parseFloat(amount).toFixed(2)}` : ''}
                </Text>
              </Pressable>
            </>
          )}
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
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
  modeBar: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    paddingHorizontal: 16,
    paddingBottom: 0,
  },
  modeTab: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    marginBottom: -1,
  },
  modeTabActive: {
    borderBottomColor: Colors.primary,
  },
  modeTabText: {
    fontSize: 14,
    fontFamily: Fonts.medium,
    color: Colors.textSecondary,
  },
  modeTabTextActive: {
    color: Colors.primary,
    fontFamily: Fonts.semiBold,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
    gap: 20,
  },
  field: {
    gap: 10,
  },
  fieldLabel: {
    fontSize: 13,
    fontFamily: Fonts.semiBold,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  accountChips: {
    gap: 10,
    paddingRight: 20,
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
  accountChipNameActive: {
    color: Colors.primary,
  },
  accountChipBalance: {
    fontSize: 16,
    fontFamily: Fonts.bold,
    color: Colors.textPrimary,
    fontVariant: ['tabular-nums'],
  },
  accountChipBalanceActive: {
    color: Colors.primary,
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
  payeeRowActive: {
    backgroundColor: '#F0F8FA',
  },
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
  bpayCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    overflow: 'hidden',
    borderCurve: 'continuous',
    boxShadow: '0 2px 10px rgba(0, 75, 90, 0.06)',
  },
  bpayInput: {
    padding: 16,
    fontSize: 15,
    fontFamily: Fonts.regular,
    color: Colors.textPrimary,
  },
  bpayDivider: {
    height: 1,
    backgroundColor: Colors.borderLight,
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
  payBtnDisabled: {
    opacity: 0.5,
  },
  payBtnText: {
    fontSize: 16,
    fontFamily: Fonts.bold,
    color: Colors.primary,
  },
  // Confirmation
  confirmCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    gap: 12,
    borderCurve: 'continuous',
    boxShadow: '0 4px 20px rgba(0, 75, 90, 0.1)',
  },
  confirmIcon: {
    marginBottom: 8,
  },
  confirmTitle: {
    fontSize: 24,
    fontFamily: Fonts.bold,
    color: Colors.textPrimary,
  },
  confirmSub: {
    fontSize: 15,
    fontFamily: Fonts.regular,
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  confirmDetails: {
    width: '100%',
    gap: 0,
    backgroundColor: Colors.background,
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 8,
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
  },
  doneBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 40,
    marginTop: 8,
  },
  doneBtnText: {
    fontSize: 15,
    fontFamily: Fonts.semiBold,
    color: Colors.white,
  },
});
