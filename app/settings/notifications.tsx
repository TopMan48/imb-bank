import React, { useState } from 'react';
import { View, Text, ScrollView, Switch, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '@/store/useAppStore';
import { Colors } from '@/constants/Colors';
import { Fonts } from '@/constants/Typography';

function ToggleRow({
  label,
  subtitle,
  value,
  onValueChange,
  isLast,
  icon,
}: {
  label: string;
  subtitle?: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
  isLast?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
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
      {icon && (
        <View style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name={icon} size={17} color={Colors.primary} />
        </View>
      )}
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={{ fontSize: 15, fontFamily: Fonts.medium, color: Colors.textPrimary }}>{label}</Text>
        {subtitle && <Text style={{ fontSize: 12, fontFamily: Fonts.regular, color: Colors.textSecondary, lineHeight: 17 }}>{subtitle}</Text>}
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

function ThresholdInput({
  label,
  value,
  prefix,
  suffix,
  onChangeText,
  keyboardType = 'numeric',
}: {
  label: string;
  value: string;
  prefix?: string;
  suffix?: string;
  onChangeText: (v: string) => void;
  keyboardType?: 'numeric' | 'decimal-pad';
}) {
  return (
    <View style={{
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingBottom: 14,
      paddingTop: 4,
      gap: 10,
    }}>
      <Text style={{ fontSize: 13, fontFamily: Fonts.medium, color: Colors.textSecondary, flex: 1 }}>{label}</Text>
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: Colors.border,
        borderRadius: 10,
        paddingHorizontal: 10,
        paddingVertical: 7,
        gap: 2,
        backgroundColor: Colors.white,
      }}>
        {prefix && <Text style={{ fontSize: 14, fontFamily: Fonts.medium, color: Colors.textSecondary }}>{prefix}</Text>}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          style={{ fontSize: 14, fontFamily: Fonts.semiBold, color: Colors.textPrimary, minWidth: 60, textAlign: 'center' }}
        />
        {suffix && <Text style={{ fontSize: 14, fontFamily: Fonts.medium, color: Colors.textSecondary }}>{suffix}</Text>}
      </View>
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
  const [saved, setSaved] = useState(false);

  const update = (key: keyof typeof notifications) => (value: boolean) => {
    updateNotifications({ [key]: value });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const updateThreshold = (key: 'lowBalanceThreshold' | 'largeTransactionThreshold', v: string) => {
    const n = parseInt(v, 10);
    if (!isNaN(n) && n >= 0) updateNotifications({ [key]: n });
  };

  return (
    <ScrollView
      contentContainerStyle={{ padding: 20, gap: 24, paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
    >
      {saved && (
        <View style={{ backgroundColor: '#E8F5E9', borderRadius: 12, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 10, borderCurve: 'continuous' }}>
          <Ionicons name="checkmark-circle" size={18} color={Colors.success} />
          <Text style={{ fontSize: 13, fontFamily: Fonts.medium, color: Colors.success }}>Preferences saved</Text>
        </View>
      )}

      <SectionCard title="Delivery Channels">
        <ToggleRow
          icon="phone-portrait-outline"
          label="Push Notifications"
          subtitle="Alerts on your device"
          value={notifications.pushEnabled}
          onValueChange={update('pushEnabled')}
        />
        <ToggleRow
          icon="chatbubble-outline"
          label="SMS Alerts"
          subtitle="Text messages to your mobile"
          value={notifications.smsEnabled}
          onValueChange={update('smsEnabled')}
        />
        <ToggleRow
          icon="mail-outline"
          label="Email Notifications"
          subtitle="Updates to your inbox"
          value={notifications.emailEnabled}
          onValueChange={update('emailEnabled')}
          isLast
        />
      </SectionCard>

      <SectionCard title="Balance & Transaction Alerts">
        <ToggleRow
          icon="swap-horizontal-outline"
          label="Transaction Alerts"
          subtitle="Notified for every transaction"
          value={notifications.transactionAlerts}
          onValueChange={update('transactionAlerts')}
        />
        <ToggleRow
          icon="trending-down-outline"
          label="Low Balance Alert"
          subtitle={`Alert when balance drops below $${notifications.lowBalanceThreshold}`}
          value={notifications.lowBalanceAlerts}
          onValueChange={update('lowBalanceAlerts')}
        />
        {notifications.lowBalanceAlerts && (
          <ThresholdInput
            label="Balance threshold"
            value={String(notifications.lowBalanceThreshold)}
            prefix="$"
            onChangeText={(v) => updateThreshold('lowBalanceThreshold', v)}
          />
        )}
        <ToggleRow
          icon="flash-outline"
          label="Large Transaction Alert"
          subtitle={`Alert for transactions over $${notifications.largeTransactionThreshold}`}
          value={notifications.largeTransactionAlerts}
          onValueChange={update('largeTransactionAlerts')}
        />
        {notifications.largeTransactionAlerts && (
          <ThresholdInput
            label="Amount threshold"
            value={String(notifications.largeTransactionThreshold)}
            prefix="$"
            onChangeText={(v) => updateThreshold('largeTransactionThreshold', v)}
          />
        )}
        <ToggleRow
          icon="warning-outline"
          label="Unusual Activity Alert"
          subtitle="Flag transactions that seem unusual"
          value={notifications.unusualActivityAlerts}
          onValueChange={update('unusualActivityAlerts')}
          isLast
        />
      </SectionCard>

      <SectionCard title="Payment Reminders">
        <ToggleRow
          icon="calendar-outline"
          label="Payment Due Reminder"
          subtitle="Remind me before scheduled payments are due"
          value={notifications.paymentDueReminder}
          onValueChange={update('paymentDueReminder')}
        />
        <ToggleRow
          icon="repeat-outline"
          label="Scheduled Payment Alerts"
          subtitle="Upcoming recurring & future payments"
          value={notifications.paymentReminders}
          onValueChange={update('paymentReminders')}
          isLast
        />
      </SectionCard>

      <SectionCard title="Account Updates">
        <ToggleRow
          icon="trending-up-outline"
          label="Interest Rate Changes"
          subtitle="Alert when your account rates change"
          value={notifications.interestRateAlerts}
          onValueChange={update('interestRateAlerts')}
        />
        <ToggleRow
          icon="document-text-outline"
          label="Statement Ready"
          subtitle="When your monthly statement is available"
          value={notifications.statementReady}
          onValueChange={update('statementReady')}
        />
        <ToggleRow
          icon="pricetag-outline"
          label="Promotions & Offers"
          subtitle="Special rates and member offers"
          value={notifications.promotionalOffers}
          onValueChange={update('promotionalOffers')}
          isLast
        />
      </SectionCard>

      <SectionCard title="Security">
        <ToggleRow
          icon="shield-checkmark-outline"
          label="Security Alerts"
          subtitle="Suspicious activity and login attempts"
          value={notifications.securityAlerts}
          onValueChange={update('securityAlerts')}
          isLast
        />
      </SectionCard>

      <View style={{ backgroundColor: Colors.infoBg, borderRadius: 12, padding: 14, flexDirection: 'row', gap: 10, borderCurve: 'continuous' }}>
        <Ionicons name="information-circle-outline" size={20} color={Colors.info} />
        <Text style={{ flex: 1, fontSize: 13, fontFamily: Fonts.regular, color: Colors.textPrimary, lineHeight: 18 }}>
          Security alerts cannot be fully disabled for your protection. All changes save automatically.
        </Text>
      </View>
    </ScrollView>
  );
}
