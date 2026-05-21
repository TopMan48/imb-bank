import React from 'react';
import { View, Text, ScrollView, Switch, TextInput } from 'react-native';
import { useAppStore } from '@/store/useAppStore';
import { Colors } from '@/constants/Colors';
import { Fonts } from '@/constants/Typography';

function ToggleRow({
  label,
  subtitle,
  value,
  onValueChange,
  isLast,
}: {
  label: string;
  subtitle?: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
  isLast?: boolean;
}) {
  return (
    <View style={{
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 14,
      gap: 12,
      borderBottomWidth: isLast ? 0 : 1,
      borderBottomColor: Colors.borderLight,
      minHeight: 56,
    }}>
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={{ fontSize: 15, fontFamily: Fonts.medium, color: Colors.textPrimary }}>{label}</Text>
        {subtitle && <Text style={{ fontSize: 12, fontFamily: Fonts.regular, color: Colors.textSecondary }}>{subtitle}</Text>}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: Colors.border, true: Colors.primary }}
        thumbColor={Colors.white}
      />
    </View>
  );
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={{ gap: 10 }}>
      <Text style={{ fontSize: 12, fontFamily: Fonts.semiBold, color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, paddingHorizontal: 4 }}>
        {title}
      </Text>
      <View style={{ backgroundColor: Colors.white, borderRadius: 16, overflow: 'hidden', borderCurve: 'continuous', boxShadow: '0 2px 10px rgba(0,75,90,0.06)' }}>
        {children}
      </View>
    </View>
  );
}

export default function NotificationsScreen() {
  const notifications = useAppStore((s) => s.notifications);
  const updateNotifications = useAppStore((s) => s.updateNotifications);

  const update = (key: keyof typeof notifications) => (value: boolean) =>
    updateNotifications({ [key]: value });

  return (
    <ScrollView contentContainerStyle={{ padding: 20, gap: 24, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>

      <SectionCard title="Delivery Channels">
        <ToggleRow
          label="Push Notifications"
          subtitle="Alerts on your device"
          value={notifications.pushEnabled}
          onValueChange={update('pushEnabled')}
        />
        <ToggleRow
          label="SMS Alerts"
          subtitle="Text messages to your mobile"
          value={notifications.smsEnabled}
          onValueChange={update('smsEnabled')}
        />
        <ToggleRow
          label="Email Notifications"
          subtitle="Updates to your inbox"
          value={notifications.emailEnabled}
          onValueChange={update('emailEnabled')}
          isLast
        />
      </SectionCard>

      <SectionCard title="Transaction Alerts">
        <ToggleRow
          label="Transaction Alerts"
          subtitle="Notified for every transaction"
          value={notifications.transactionAlerts}
          onValueChange={update('transactionAlerts')}
        />
        <ToggleRow
          label="Low Balance Alerts"
          subtitle={`Alert when balance drops below $${notifications.lowBalanceThreshold}`}
          value={notifications.lowBalanceAlerts}
          onValueChange={update('lowBalanceAlerts')}
        />
        {notifications.lowBalanceAlerts && (
          <View style={{ paddingHorizontal: 16, paddingBottom: 14, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Text style={{ fontSize: 14, fontFamily: Fonts.medium, color: Colors.textSecondary }}>Alert threshold: $</Text>
            <View style={{ borderWidth: 1, borderColor: Colors.border, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8 }}>
              <TextInput
                value={String(notifications.lowBalanceThreshold)}
                onChangeText={(v) => {
                  const n = parseInt(v, 10);
                  if (!isNaN(n)) updateNotifications({ lowBalanceThreshold: n });
                }}
                keyboardType="numeric"
                style={{ fontSize: 14, fontFamily: Fonts.semiBold, color: Colors.textPrimary, minWidth: 60 }}
              />
            </View>
          </View>
        )}
        <ToggleRow
          label="Payment Reminders"
          subtitle="Upcoming scheduled payments"
          value={notifications.paymentReminders}
          onValueChange={update('paymentReminders')}
          isLast
        />
      </SectionCard>

      <SectionCard title="Other">
        <ToggleRow
          label="Security Alerts"
          subtitle="Suspicious activity, login attempts"
          value={notifications.securityAlerts}
          onValueChange={update('securityAlerts')}
        />
        <ToggleRow
          label="Statement Ready"
          subtitle="When monthly statement is available"
          value={notifications.statementReady}
          onValueChange={update('statementReady')}
        />
        <ToggleRow
          label="Promotions & Offers"
          subtitle="Special rates and member offers"
          value={notifications.promotionalOffers}
          onValueChange={update('promotionalOffers')}
          isLast
        />
      </SectionCard>

      <View style={{ backgroundColor: Colors.infoBg, borderRadius: 12, padding: 14, flexDirection: 'row', gap: 10, borderCurve: 'continuous' }}>
        <Text style={{ fontSize: 20 }}>ℹ️</Text>
        <Text style={{ flex: 1, fontSize: 13, fontFamily: Fonts.regular, color: Colors.textPrimary, lineHeight: 18 }}>
          Security alerts cannot be disabled for your protection. Changes take effect immediately.
        </Text>
      </View>
    </ScrollView>
  );
}
