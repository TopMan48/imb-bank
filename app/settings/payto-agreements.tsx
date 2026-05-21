import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, Alert, TextInput, Modal, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '@/store/useAppStore';
import { Colors } from '@/constants/Colors';
import { Fonts } from '@/constants/Typography';
import type { PayToAgreement, PayToFrequency } from '@/store/types';

const FREQ_LABELS: Record<PayToFrequency, string> = {
  'one-off': 'One-off',
  weekly: 'Weekly',
  fortnightly: 'Fortnightly',
  monthly: 'Monthly',
  quarterly: 'Quarterly',
  annually: 'Annually',
};

const STATUS_COLORS: Record<PayToAgreement['status'], string> = {
  active: Colors.success,
  paused: Colors.warning,
  cancelled: Colors.error,
};

export default function PayToAgreementsScreen() {
  const { payToAgreements, accounts, updatePayToAgreement, addPayToAgreement } = useAppStore();
  const [showNew, setShowNew] = useState(false);
  const [newMerchant, setNewMerchant] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [newFreq, setNewFreq] = useState<PayToFrequency>('monthly');
  const [newPayId, setNewPayId] = useState('');
  const [newReference, setNewReference] = useState('');
  const [newAccountId, setNewAccountId] = useState(accounts[0]?.id ?? '');

  const handlePause = (agreement: PayToAgreement) => {
    const newStatus = agreement.status === 'active' ? 'paused' : 'active';
    updatePayToAgreement(agreement.id, { status: newStatus });
  };

  const handleCancel = (agreement: PayToAgreement) => {
    Alert.alert(
      'Cancel Agreement',
      `Cancel PayTo agreement with ${agreement.merchantName}?\n\nThis cannot be undone.`,
      [
        { text: 'Keep', style: 'cancel' },
        { text: 'Cancel Agreement', style: 'destructive', onPress: () => updatePayToAgreement(agreement.id, { status: 'cancelled' }) },
      ]
    );
  };

  const handleAddNew = () => {
    if (!newMerchant.trim() || !newAmount || parseFloat(newAmount) <= 0) {
      Alert.alert('Error', 'Please fill in merchant name and amount.');
      return;
    }
    addPayToAgreement({
      merchantName: newMerchant.trim(),
      description: `${newMerchant} ${FREQ_LABELS[newFreq]} payment`,
      amount: parseFloat(newAmount),
      frequency: newFreq,
      status: 'active',
      startDate: new Date().toISOString().slice(0, 10),
      nextPaymentDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      accountId: newAccountId,
      reference: newReference || `${newMerchant.toUpperCase().replace(/\s+/g, '-').slice(0, 12)}-001`,
      payId: newPayId || undefined,
    });
    setShowNew(false);
    setNewMerchant(''); setNewAmount(''); setNewPayId(''); setNewReference('');
    Alert.alert('PayTo Agreement Created', `A new PayTo agreement with ${newMerchant} has been set up.`);
  };

  const activeAgreements = payToAgreements.filter((a) => a.status !== 'cancelled');
  const cancelledAgreements = payToAgreements.filter((a) => a.status === 'cancelled');

  const accountName = (id: string) => accounts.find((a) => a.id === id)?.name ?? id;

  return (
    <>
      <ScrollView contentContainerStyle={{ padding: 20, gap: 20, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>

        {activeAgreements.length === 0 ? (
          <View style={{ backgroundColor: Colors.white, borderRadius: 16, padding: 32, alignItems: 'center', gap: 12, borderCurve: 'continuous' }}>
            <Ionicons name="link-outline" size={40} color={Colors.textSecondary} />
            <Text style={{ fontSize: 16, fontFamily: Fonts.semiBold, color: Colors.textPrimary }}>No PayTo Agreements</Text>
            <Text style={{ fontSize: 14, fontFamily: Fonts.regular, color: Colors.textSecondary, textAlign: 'center' }}>
              Set up PayTo agreements to allow merchants to initiate payments from your account.
            </Text>
          </View>
        ) : (
          <View style={{ gap: 12 }}>
            <Text style={{ fontSize: 12, fontFamily: Fonts.semiBold, color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, paddingHorizontal: 4 }}>
              Active Agreements
            </Text>
            {activeAgreements.map((agreement) => (
              <View key={agreement.id} style={{ backgroundColor: Colors.white, borderRadius: 16, overflow: 'hidden', borderCurve: 'continuous', boxShadow: '0 2px 10px rgba(0,75,90,0.06)' }}>
                <View style={{ padding: 16, gap: 10 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
                    <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center' }}>
                      <Ionicons name="link" size={22} color={Colors.primary} />
                    </View>
                    <View style={{ flex: 1, gap: 3 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <Text style={{ fontSize: 16, fontFamily: Fonts.semiBold, color: Colors.textPrimary }}>{agreement.merchantName}</Text>
                        <View style={{ backgroundColor: STATUS_COLORS[agreement.status] + '22', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2 }}>
                          <Text style={{ fontSize: 11, fontFamily: Fonts.semiBold, color: STATUS_COLORS[agreement.status] }}>
                            {agreement.status.charAt(0).toUpperCase() + agreement.status.slice(1)}
                          </Text>
                        </View>
                      </View>
                      <Text style={{ fontSize: 12, fontFamily: Fonts.regular, color: Colors.textSecondary }}>{agreement.description}</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={{ fontSize: 18, fontFamily: Fonts.bold, color: Colors.textPrimary, fontVariant: ['tabular-nums'] }}>
                        ${agreement.amount.toFixed(2)}
                      </Text>
                      <Text style={{ fontSize: 11, fontFamily: Fonts.regular, color: Colors.textSecondary }}>{FREQ_LABELS[agreement.frequency]}</Text>
                    </View>
                  </View>

                  <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
                    {agreement.nextPaymentDate && agreement.status === 'active' && (
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Colors.background, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 }}>
                        <Ionicons name="calendar-outline" size={11} color={Colors.textSecondary} />
                        <Text style={{ fontSize: 11, fontFamily: Fonts.medium, color: Colors.textSecondary }}>Next: {agreement.nextPaymentDate}</Text>
                      </View>
                    )}
                    {agreement.payId && (
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Colors.background, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 }}>
                        <Ionicons name="at-outline" size={11} color={Colors.textSecondary} />
                        <Text style={{ fontSize: 11, fontFamily: Fonts.medium, color: Colors.textSecondary }}>{agreement.payId}</Text>
                      </View>
                    )}
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Colors.background, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 }}>
                      <Ionicons name="wallet-outline" size={11} color={Colors.textSecondary} />
                      <Text style={{ fontSize: 11, fontFamily: Fonts.medium, color: Colors.textSecondary }}>{accountName(agreement.accountId)}</Text>
                    </View>
                  </View>
                </View>

                <View style={{ flexDirection: 'row', borderTopWidth: 1, borderTopColor: Colors.borderLight }}>
                  <Pressable
                    style={({ pressed }) => [{ flex: 1, paddingVertical: 12, alignItems: 'center', opacity: pressed ? 0.7 : 1 }]}
                    onPress={() => handlePause(agreement)}
                  >
                    <Text style={{ fontSize: 13, fontFamily: Fonts.semiBold, color: agreement.status === 'active' ? Colors.warning : Colors.success }}>
                      {agreement.status === 'active' ? 'Pause' : 'Resume'}
                    </Text>
                  </Pressable>
                  <View style={{ width: 1, backgroundColor: Colors.borderLight }} />
                  <Pressable
                    style={({ pressed }) => [{ flex: 1, paddingVertical: 12, alignItems: 'center', opacity: pressed ? 0.7 : 1 }]}
                    onPress={() => handleCancel(agreement)}
                  >
                    <Text style={{ fontSize: 13, fontFamily: Fonts.semiBold, color: Colors.error }}>Cancel</Text>
                  </Pressable>
                </View>
              </View>
            ))}
          </View>
        )}

        {cancelledAgreements.length > 0 && (
          <View style={{ gap: 10 }}>
            <Text style={{ fontSize: 12, fontFamily: Fonts.semiBold, color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, paddingHorizontal: 4 }}>Past Agreements</Text>
            {cancelledAgreements.map((agreement) => (
              <View key={agreement.id} style={{ backgroundColor: Colors.white, borderRadius: 14, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12, opacity: 0.6, borderCurve: 'continuous' }}>
                <Ionicons name="ban-outline" size={20} color={Colors.textSecondary} />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontFamily: Fonts.semiBold, color: Colors.textPrimary }}>{agreement.merchantName}</Text>
                  <Text style={{ fontSize: 12, fontFamily: Fonts.regular, color: Colors.textSecondary }}>Cancelled</Text>
                </View>
                <Text style={{ fontSize: 14, fontFamily: Fonts.bold, color: Colors.textSecondary }}>${agreement.amount.toFixed(2)}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Add FAB */}
      <View style={{ position: 'absolute', bottom: 24, right: 20 }}>
        <Pressable
          style={({ pressed }) => [{ flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: Colors.accent, borderRadius: 28, paddingHorizontal: 20, paddingVertical: 14, boxShadow: '0 4px 16px rgba(0,75,90,0.2)', opacity: pressed ? 0.85 : 1 }]}
          onPress={() => setShowNew(true)}
        >
          <Ionicons name="add" size={20} color={Colors.primary} />
          <Text style={{ fontSize: 15, fontFamily: Fonts.bold, color: Colors.primary }}>New Agreement</Text>
        </Pressable>
      </View>

      {/* New PayTo Modal */}
      <Modal visible={showNew} animationType="slide" presentationStyle="formSheet" onRequestClose={() => setShowNew(false)}>
        <KeyboardAvoidingView style={{ flex: 1, backgroundColor: Colors.background }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={{ flexDirection: 'row', alignItems: 'center', padding: 20, backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.borderLight }}>
            <Text style={{ flex: 1, fontSize: 18, fontFamily: Fonts.bold, color: Colors.textPrimary }}>New PayTo Agreement</Text>
            <Pressable onPress={() => setShowNew(false)}>
              <Ionicons name="close" size={24} color={Colors.textSecondary} />
            </Pressable>
          </View>
          <ScrollView contentContainerStyle={{ padding: 20, gap: 16, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
            {[
              { label: 'Merchant Name *', value: newMerchant, onChange: setNewMerchant, placeholder: 'e.g. Spotify' },
              { label: 'Amount ($) *', value: newAmount, onChange: setNewAmount, placeholder: '0.00', keyboardType: 'decimal-pad' as const },
              { label: 'PayID / Reference', value: newPayId, onChange: setNewPayId, placeholder: 'e.g. billing@merchant.com' },
              { label: 'Your Reference', value: newReference, onChange: setNewReference, placeholder: 'e.g. SPOTIFY-001' },
            ].map((field) => (
              <View key={field.label} style={{ gap: 6 }}>
                <Text style={{ fontSize: 12, fontFamily: Fonts.semiBold, color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 }}>{field.label}</Text>
                <View style={{ backgroundColor: Colors.white, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 13, borderCurve: 'continuous', borderWidth: 1, borderColor: Colors.border }}>
                  <TextInput value={field.value} onChangeText={field.onChange} placeholder={field.placeholder} placeholderTextColor={Colors.textSecondary} keyboardType={field.keyboardType} style={{ fontSize: 15, fontFamily: Fonts.regular, color: Colors.textPrimary }} />
                </View>
              </View>
            ))}

            <View style={{ gap: 6 }}>
              <Text style={{ fontSize: 12, fontFamily: Fonts.semiBold, color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 }}>Frequency</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {(Object.keys(FREQ_LABELS) as PayToFrequency[]).map((freq) => (
                  <Pressable
                    key={freq}
                    style={{ backgroundColor: newFreq === freq ? Colors.primary : Colors.white, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1.5, borderColor: newFreq === freq ? Colors.primary : Colors.border }}
                    onPress={() => setNewFreq(freq)}
                  >
                    <Text style={{ fontSize: 13, fontFamily: Fonts.medium, color: newFreq === freq ? Colors.white : Colors.textSecondary }}>{FREQ_LABELS[freq]}</Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <View style={{ gap: 6 }}>
              <Text style={{ fontSize: 12, fontFamily: Fonts.semiBold, color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 }}>From Account</Text>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {accounts.filter((a) => a.type !== 'loan').map((acct) => (
                  <Pressable
                    key={acct.id}
                    style={{ flex: 1, backgroundColor: newAccountId === acct.id ? Colors.primary : Colors.white, borderRadius: 10, padding: 12, borderWidth: 1.5, borderColor: newAccountId === acct.id ? Colors.primary : Colors.border, borderCurve: 'continuous' }}
                    onPress={() => setNewAccountId(acct.id)}
                  >
                    <Text style={{ fontSize: 12, fontFamily: Fonts.semiBold, color: newAccountId === acct.id ? Colors.white : Colors.textSecondary }} numberOfLines={1}>{acct.name}</Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <Pressable
              style={({ pressed }) => [{ backgroundColor: Colors.accent, borderRadius: 14, paddingVertical: 16, alignItems: 'center', borderCurve: 'continuous', opacity: pressed ? 0.85 : 1, marginTop: 8 }]}
              onPress={handleAddNew}
            >
              <Text style={{ fontSize: 16, fontFamily: Fonts.bold, color: Colors.primary }}>Create Agreement</Text>
            </Pressable>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}
