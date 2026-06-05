import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, Alert, Modal, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAppStore } from '@/store/useAppStore';
import { Colors } from '@/constants/Colors';
import { Fonts } from '@/constants/Typography';
import type { ScheduledPayment } from '@/store/types';

const FREQ_LABELS: Record<ScheduledPayment['frequency'], string> = {
  once: 'One-off',
  weekly: 'Weekly',
  fortnightly: 'Fortnightly',
  monthly: 'Monthly',
};

const FREQUENCIES: ScheduledPayment['frequency'][] = ['once', 'weekly', 'fortnightly', 'monthly'];

function AddScheduledPaymentModal({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const { payees, accounts, addScheduledPayment } = useAppStore();
  const [selectedPayeeId, setSelectedPayeeId] = useState('');
  const [selectedAccountId, setSelectedAccountId] = useState(accounts[0]?.id ?? '');
  const [amount, setAmount] = useState('');
  const [frequency, setFrequency] = useState<ScheduledPayment['frequency']>('monthly');
  const [nextDate, setNextDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().slice(0, 10);
  });
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSave = () => {
    const errs: Record<string, string> = {};
    if (!selectedPayeeId) errs.payee = 'Please select a payee';
    const amt = parseFloat(amount);
    if (!amount || isNaN(amt) || amt <= 0) errs.amount = 'Enter a valid amount';
    if (!nextDate) errs.date = 'Enter the first payment date';
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    const payee = payees.find((p) => p.id === selectedPayeeId)!;
    addScheduledPayment({
      payeeId: selectedPayeeId,
      payeeName: payee.name,
      amount: amt,
      frequency,
      nextDate,
      accountId: selectedAccountId,
      description: description.trim() || undefined,
      status: 'active',
    });
    Alert.alert(
      'Scheduled Payment Created',
      `${FREQ_LABELS[frequency]} payment of $${amt.toFixed(2)} to ${payee.name} has been set up. First payment: ${nextDate}.`,
      [{ text: 'Done', onPress: onClose }]
    );
  };

  const reset = () => {
    setSelectedPayeeId('');
    setSelectedAccountId(accounts[0]?.id ?? '');
    setAmount('');
    setFrequency('monthly');
    setNextDate(() => {
      const d = new Date();
      d.setDate(d.getDate() + 7);
      return d.toISOString().slice(0, 10);
    });
    setDescription('');
    setErrors({});
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="formSheet" onRequestClose={handleClose}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={{ flex: 1, backgroundColor: Colors.background }}>
          {/* Header */}
          <View style={{ flexDirection: 'row', alignItems: 'center', padding: 20, paddingTop: 24, backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.borderLight }}>
            <Text style={{ flex: 1, fontSize: 18, fontFamily: Fonts.bold, color: Colors.textPrimary }}>New Scheduled Payment</Text>
            <Pressable onPress={handleClose} style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name="close" size={20} color={Colors.textSecondary} />
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={{ padding: 20, gap: 20, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
            {/* Payee */}
            <View style={{ gap: 8 }}>
              <Text style={{ fontSize: 12, fontFamily: Fonts.semiBold, color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 }}>Payee *</Text>
              {payees.length === 0 ? (
                <View style={{ backgroundColor: Colors.white, borderRadius: 14, padding: 20, alignItems: 'center', gap: 10, borderCurve: 'continuous' }}>
                  <Ionicons name="people-outline" size={32} color={Colors.textSecondary} />
                  <Text style={{ fontSize: 14, fontFamily: Fonts.regular, color: Colors.textSecondary }}>No saved payees</Text>
                  <Pressable
                    style={{ backgroundColor: Colors.primary, borderRadius: 10, paddingHorizontal: 18, paddingVertical: 10 }}
                    onPress={() => { handleClose(); router.push('/settings/add-payee'); }}
                  >
                    <Text style={{ fontSize: 13, fontFamily: Fonts.semiBold, color: Colors.white }}>Add a Payee</Text>
                  </Pressable>
                </View>
              ) : (
                <View style={{ backgroundColor: Colors.white, borderRadius: 14, overflow: 'hidden', borderCurve: 'continuous', boxShadow: '0 2px 10px rgba(0,75,90,0.06)' }}>
                  {payees.map((payee, index) => (
                    <Pressable
                      key={payee.id}
                      style={({ pressed }) => [{
                        flexDirection: 'row',
                        alignItems: 'center',
                        padding: 14,
                        gap: 12,
                        borderBottomWidth: index < payees.length - 1 ? 1 : 0,
                        borderBottomColor: Colors.borderLight,
                        backgroundColor: selectedPayeeId === payee.id ? '#F0F8FA' : pressed ? Colors.background : 'transparent',
                        minHeight: 56,
                      }]}
                      onPress={() => { setSelectedPayeeId(payee.id); setErrors((e) => ({ ...e, payee: '' })); }}
                    >
                      <View style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: payee.avatarColour, alignItems: 'center', justifyContent: 'center' }}>
                        <Text style={{ fontSize: 15, fontFamily: Fonts.bold, color: Colors.white }}>{payee.name.charAt(0)}</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 14, fontFamily: Fonts.semiBold, color: Colors.textPrimary }}>{payee.name}</Text>
                        <Text style={{ fontSize: 12, fontFamily: Fonts.regular, color: Colors.textSecondary }}>{payee.bsb} · {payee.accountNumber}</Text>
                      </View>
                      {selectedPayeeId === payee.id && <Ionicons name="checkmark-circle" size={20} color={Colors.primary} />}
                    </Pressable>
                  ))}
                </View>
              )}
              {errors.payee ? <Text style={{ fontSize: 12, fontFamily: Fonts.regular, color: Colors.error }}>{errors.payee}</Text> : null}
            </View>

            {/* From Account */}
            <View style={{ gap: 8 }}>
              <Text style={{ fontSize: 12, fontFamily: Fonts.semiBold, color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 }}>From Account</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0 }} contentContainerStyle={{ gap: 10 }}>
                {accounts.filter((a) => a.type !== 'loan').map((acct) => (
                  <Pressable
                    key={acct.id}
                    style={[{
                      backgroundColor: selectedAccountId === acct.id ? Colors.primary : Colors.white,
                      borderRadius: 12,
                      paddingHorizontal: 14,
                      paddingVertical: 10,
                      borderWidth: 1.5,
                      borderColor: selectedAccountId === acct.id ? Colors.primary : Colors.border,
                      borderCurve: 'continuous',
                      minWidth: 130,
                    }]}
                    onPress={() => setSelectedAccountId(acct.id)}
                  >
                    <Text style={{ fontSize: 12, fontFamily: Fonts.semiBold, color: selectedAccountId === acct.id ? Colors.white : Colors.textSecondary }}>{acct.name}</Text>
                    <Text style={{ fontSize: 13, fontFamily: Fonts.bold, color: selectedAccountId === acct.id ? Colors.accent : Colors.textPrimary, marginTop: 2 }}>
                      ${acct.availableBalance.toLocaleString('en-AU', { minimumFractionDigits: 2 })}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>

            {/* Amount */}
            <View style={{ gap: 8 }}>
              <Text style={{ fontSize: 12, fontFamily: Fonts.semiBold, color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 }}>Amount *</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.white, borderRadius: 14, padding: 16, gap: 4, borderCurve: 'continuous', borderWidth: 1.5, borderColor: errors.amount ? Colors.error : Colors.border }}>
                <Text style={{ fontSize: 24, fontFamily: Fonts.bold, color: Colors.textSecondary }}>$</Text>
                <TextInput
                  value={amount}
                  onChangeText={(v) => { setAmount(v.replace(/[^0-9.]/g, '')); setErrors((e) => ({ ...e, amount: '' })); }}
                  placeholder="0.00"
                  placeholderTextColor={Colors.textSecondary}
                  keyboardType="decimal-pad"
                  style={{ flex: 1, fontSize: 26, fontFamily: Fonts.bold, color: Colors.textPrimary }}
                />
              </View>
              {errors.amount ? <Text style={{ fontSize: 12, fontFamily: Fonts.regular, color: Colors.error }}>{errors.amount}</Text> : null}
            </View>

            {/* Frequency */}
            <View style={{ gap: 8 }}>
              <Text style={{ fontSize: 12, fontFamily: Fonts.semiBold, color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 }}>Frequency</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {FREQUENCIES.map((f) => (
                  <Pressable
                    key={f}
                    style={[{
                      paddingHorizontal: 16,
                      paddingVertical: 10,
                      borderRadius: 20,
                      backgroundColor: frequency === f ? Colors.primary : Colors.white,
                      borderWidth: 1.5,
                      borderColor: frequency === f ? Colors.primary : Colors.border,
                      minHeight: 44,
                      justifyContent: 'center',
                    }]}
                    onPress={() => setFrequency(f)}
                  >
                    <Text style={{ fontSize: 13, fontFamily: Fonts.medium, color: frequency === f ? Colors.white : Colors.textSecondary }}>
                      {FREQ_LABELS[f]}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* First Payment Date */}
            <View style={{ gap: 8 }}>
              <Text style={{ fontSize: 12, fontFamily: Fonts.semiBold, color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                {frequency === 'once' ? 'Payment Date *' : 'First Payment Date *'}
              </Text>
              <View style={{ backgroundColor: Colors.white, borderRadius: 14, padding: 14, borderCurve: 'continuous', borderWidth: 1.5, borderColor: errors.date ? Colors.error : Colors.border }}>
                <TextInput
                  value={nextDate}
                  onChangeText={(v) => { setNextDate(v); setErrors((e) => ({ ...e, date: '' })); }}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={Colors.textSecondary}
                  style={{ fontSize: 15, fontFamily: Fonts.regular, color: Colors.textPrimary }}
                />
              </View>
              {errors.date ? <Text style={{ fontSize: 12, fontFamily: Fonts.regular, color: Colors.error }}>{errors.date}</Text> : null}
              <Text style={{ fontSize: 11, fontFamily: Fonts.regular, color: Colors.textSecondary }}>Format: YYYY-MM-DD (e.g. 2026-07-01)</Text>
            </View>

            {/* Description */}
            <View style={{ gap: 8 }}>
              <Text style={{ fontSize: 12, fontFamily: Fonts.semiBold, color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 }}>Description (optional)</Text>
              <View style={{ backgroundColor: Colors.white, borderRadius: 14, padding: 14, borderCurve: 'continuous', borderWidth: 1.5, borderColor: Colors.border }}>
                <TextInput
                  value={description}
                  onChangeText={setDescription}
                  placeholder="e.g. Monthly rent, Body corp levy"
                  placeholderTextColor={Colors.textSecondary}
                  style={{ fontSize: 15, fontFamily: Fonts.regular, color: Colors.textPrimary }}
                  maxLength={50}
                />
              </View>
            </View>

            {/* Save */}
            <Pressable
              style={({ pressed }) => [{
                backgroundColor: Colors.accent,
                borderRadius: 14,
                paddingVertical: 16,
                alignItems: 'center',
                flexDirection: 'row',
                justifyContent: 'center',
                gap: 8,
                borderCurve: 'continuous',
                opacity: pressed ? 0.85 : 1,
              }]}
              onPress={handleSave}
            >
              <Ionicons name="checkmark-circle" size={20} color={Colors.primary} />
              <Text style={{ fontSize: 16, fontFamily: Fonts.bold, color: Colors.primary }}>Schedule Payment</Text>
            </Pressable>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

export default function ScheduledPaymentsScreen() {
  const { scheduledPayments, accounts, updateScheduledPayment, deleteScheduledPayment } = useAppStore();
  const [showAdd, setShowAdd] = useState(false);

  const handleToggle = (payment: ScheduledPayment) => {
    const newStatus = payment.status === 'active' ? 'paused' : 'active';
    updateScheduledPayment(payment.id, { status: newStatus });
  };

  const handleDelete = (payment: ScheduledPayment) => {
    Alert.alert(
      'Cancel Payment',
      `Cancel the scheduled payment to ${payment.payeeName}?`,
      [
        { text: 'Keep', style: 'cancel' },
        { text: 'Cancel Payment', style: 'destructive', onPress: () => deleteScheduledPayment(payment.id) },
      ]
    );
  };

  const accountName = (id: string) => accounts.find((a) => a.id === id)?.name ?? id;

  const active = scheduledPayments.filter((p) => p.status !== 'cancelled');

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ padding: 20, gap: 20, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>

        {active.length === 0 ? (
          <View style={{ backgroundColor: Colors.white, borderRadius: 16, padding: 32, alignItems: 'center', gap: 12, borderCurve: 'continuous' }}>
            <Ionicons name="calendar-outline" size={40} color={Colors.textSecondary} />
            <Text style={{ fontSize: 16, fontFamily: Fonts.semiBold, color: Colors.textPrimary }}>No Scheduled Payments</Text>
            <Text style={{ fontSize: 14, fontFamily: Fonts.regular, color: Colors.textSecondary, textAlign: 'center' }}>
              Set up recurring or one-off payments to your saved payees.
            </Text>
          </View>
        ) : active.map((payment) => (
          <View key={payment.id} style={{ backgroundColor: Colors.white, borderRadius: 16, overflow: 'hidden', borderCurve: 'continuous', boxShadow: '0 2px 10px rgba(0,75,90,0.06)' }}>
            <View style={{ padding: 16, gap: 10 }}>
              <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
                <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center' }}>
                  <Ionicons name="repeat-outline" size={22} color={Colors.primary} />
                </View>
                <View style={{ flex: 1, gap: 3 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Text style={{ fontSize: 16, fontFamily: Fonts.semiBold, color: Colors.textPrimary }}>{payment.payeeName}</Text>
                    <View style={{
                      backgroundColor: payment.status === 'active' ? '#E8F5E9' : '#FFF3E0',
                      borderRadius: 8,
                      paddingHorizontal: 8,
                      paddingVertical: 2,
                    }}>
                      <Text style={{ fontSize: 11, fontFamily: Fonts.semiBold, color: payment.status === 'active' ? Colors.success : Colors.warning }}>
                        {payment.status === 'active' ? 'Active' : 'Paused'}
                      </Text>
                    </View>
                  </View>
                  {payment.description && (
                    <Text style={{ fontSize: 12, fontFamily: Fonts.regular, color: Colors.textSecondary }}>{payment.description}</Text>
                  )}
                </View>
                <Text style={{ fontSize: 18, fontFamily: Fonts.bold, color: Colors.textPrimary, fontVariant: ['tabular-nums'] }}>
                  ${payment.amount.toFixed(2)}
                </Text>
              </View>

              <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
                {[
                  { icon: 'calendar-outline' as const, label: FREQ_LABELS[payment.frequency] },
                  { icon: 'arrow-forward-outline' as const, label: `Next: ${payment.nextDate}` },
                  { icon: 'wallet-outline' as const, label: accountName(payment.accountId) },
                ].map((item) => (
                  <View key={item.label} style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Colors.background, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 }}>
                    <Ionicons name={item.icon} size={12} color={Colors.textSecondary} />
                    <Text style={{ fontSize: 11, fontFamily: Fonts.medium, color: Colors.textSecondary }}>{item.label}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={{ flexDirection: 'row', borderTopWidth: 1, borderTopColor: Colors.borderLight }}>
              <Pressable
                style={({ pressed }) => [{ flex: 1, paddingVertical: 12, alignItems: 'center', opacity: pressed ? 0.7 : 1 }]}
                onPress={() => handleToggle(payment)}
              >
                <Text style={{ fontSize: 13, fontFamily: Fonts.semiBold, color: payment.status === 'active' ? Colors.warning : Colors.success }}>
                  {payment.status === 'active' ? 'Pause' : 'Resume'}
                </Text>
              </Pressable>
              <View style={{ width: 1, backgroundColor: Colors.borderLight }} />
              <Pressable
                style={({ pressed }) => [{ flex: 1, paddingVertical: 12, alignItems: 'center', opacity: pressed ? 0.7 : 1 }]}
                onPress={() => handleDelete(payment)}
              >
                <Text style={{ fontSize: 13, fontFamily: Fonts.semiBold, color: Colors.error }}>Cancel</Text>
              </Pressable>
            </View>
          </View>
        ))}

        <View style={{ backgroundColor: Colors.infoBg, borderRadius: 12, padding: 14, flexDirection: 'row', gap: 10, borderCurve: 'continuous' }}>
          <Ionicons name="information-circle-outline" size={18} color={Colors.info} />
          <Text style={{ flex: 1, fontSize: 13, fontFamily: Fonts.regular, color: Colors.textPrimary, lineHeight: 18 }}>
            Payments process at 9:00 AM AEST on the scheduled date. Ensure sufficient funds are available.
          </Text>
        </View>
      </ScrollView>

      {/* Add FAB */}
      <View style={{ position: 'absolute', bottom: 24, right: 20 }}>
        <Pressable
          style={({ pressed }) => [{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            backgroundColor: Colors.accent,
            borderRadius: 28,
            paddingHorizontal: 20,
            paddingVertical: 14,
            boxShadow: '0 4px 16px rgba(0,75,90,0.2)',
            opacity: pressed ? 0.85 : 1,
          }]}
          onPress={() => setShowAdd(true)}
        >
          <Ionicons name="add" size={20} color={Colors.primary} />
          <Text style={{ fontSize: 15, fontFamily: Fonts.bold, color: Colors.primary }}>New Payment</Text>
        </Pressable>
      </View>

      <AddScheduledPaymentModal visible={showAdd} onClose={() => setShowAdd(false)} />
    </View>
  );
}
