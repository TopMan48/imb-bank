import React from 'react';
import { View, Text, ScrollView, Pressable, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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

export default function ScheduledPaymentsScreen() {
  const { scheduledPayments, accounts, updateScheduledPayment, deleteScheduledPayment } = useAppStore();

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
    <ScrollView contentContainerStyle={{ padding: 20, gap: 20, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>

      {active.length === 0 ? (
        <View style={{ backgroundColor: Colors.white, borderRadius: 16, padding: 32, alignItems: 'center', gap: 12, borderCurve: 'continuous' }}>
          <Ionicons name="calendar-outline" size={40} color={Colors.textSecondary} />
          <Text style={{ fontSize: 16, fontFamily: Fonts.semiBold, color: Colors.textPrimary }}>No Scheduled Payments</Text>
          <Text style={{ fontSize: 14, fontFamily: Fonts.regular, color: Colors.textSecondary, textAlign: 'center' }}>
            Set up recurring payments to payees from the Pay screen.
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
          Set up new scheduled payments when making a payment in the Pay tab. Payments process at 9:00 AM AEST on the scheduled date.
        </Text>
      </View>
    </ScrollView>
  );
}
