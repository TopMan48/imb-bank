import React, { useState } from 'react';
import { View, Text, ScrollView, Switch, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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

function LinkRow({ label, subtitle, isLast }: { label: string; subtitle?: string; isLast?: boolean }) {
  return (
    <Pressable
      style={({ pressed }) => [{
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 14,
        gap: 12,
        borderBottomWidth: isLast ? 0 : 1,
        borderBottomColor: Colors.borderLight,
        backgroundColor: pressed ? Colors.background : 'transparent',
        minHeight: 56,
      }]}
    >
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={{ fontSize: 15, fontFamily: Fonts.medium, color: Colors.textPrimary }}>{label}</Text>
        {subtitle && <Text style={{ fontSize: 12, fontFamily: Fonts.regular, color: Colors.textSecondary }}>{subtitle}</Text>}
      </View>
      <Ionicons name="chevron-forward" size={16} color={Colors.textSecondary} />
    </Pressable>
  );
}

export default function PrivacyScreen() {
  const [analyticsEnabled, setAnalyticsEnabled] = useState(false);
  const [personalizedOffers, setPersonalizedOffers] = useState(true);
  const [dataSharing, setDataSharing] = useState(false);
  const [openBanking, setOpenBanking] = useState(false);

  return (
    <ScrollView contentContainerStyle={{ padding: 20, gap: 24, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>

      <View style={{ gap: 10 }}>
        <Text style={{ fontSize: 12, fontFamily: Fonts.semiBold, color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, paddingHorizontal: 4 }}>Data Usage</Text>
        <View style={{ backgroundColor: Colors.white, borderRadius: 16, overflow: 'hidden', borderCurve: 'continuous', boxShadow: '0 2px 10px rgba(0,75,90,0.06)' }}>
          <ToggleRow
            label="Analytics & Improvements"
            subtitle="Help us improve the app with anonymous usage data"
            value={analyticsEnabled}
            onValueChange={setAnalyticsEnabled}
          />
          <ToggleRow
            label="Personalised Offers"
            subtitle="Tailored product recommendations based on your usage"
            value={personalizedOffers}
            onValueChange={setPersonalizedOffers}
          />
          <ToggleRow
            label="Third-Party Data Sharing"
            subtitle="Share data with trusted partners for better services"
            value={dataSharing}
            onValueChange={setDataSharing}
            isLast
          />
        </View>
      </View>

      <View style={{ gap: 10 }}>
        <Text style={{ fontSize: 12, fontFamily: Fonts.semiBold, color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, paddingHorizontal: 4 }}>Open Banking (CDR)</Text>
        <View style={{ backgroundColor: Colors.white, borderRadius: 16, overflow: 'hidden', borderCurve: 'continuous', boxShadow: '0 2px 10px rgba(0,75,90,0.06)' }}>
          <ToggleRow
            label="Consumer Data Right (CDR)"
            subtitle="Allow accredited third parties to access your data"
            value={openBanking}
            onValueChange={setOpenBanking}
          />
          <LinkRow label="Manage Data Sharing Consents" subtitle="View and revoke active consents" isLast />
        </View>
      </View>

      <View style={{ gap: 10 }}>
        <Text style={{ fontSize: 12, fontFamily: Fonts.semiBold, color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, paddingHorizontal: 4 }}>Your Rights</Text>
        <View style={{ backgroundColor: Colors.white, borderRadius: 16, overflow: 'hidden', borderCurve: 'continuous', boxShadow: '0 2px 10px rgba(0,75,90,0.06)' }}>
          <LinkRow label="Download My Data" subtitle="Request a copy of all your personal data" />
          <LinkRow label="Privacy Policy" subtitle="How IMB Bank handles your information" />
          <LinkRow label="Delete My Account" subtitle="Close your IMB membership" isLast />
        </View>
      </View>

      <View style={{ backgroundColor: Colors.infoBg, borderRadius: 12, padding: 14, flexDirection: 'row', gap: 10, borderCurve: 'continuous' }}>
        <Ionicons name="shield-checkmark" size={20} color={Colors.info} />
        <Text style={{ flex: 1, fontSize: 13, fontFamily: Fonts.regular, color: Colors.textPrimary, lineHeight: 18 }}>
          IMB Bank is an Authorised Deposit-taking Institution (ADI) regulated by APRA. Your data is protected under the Australian Privacy Act 1988.
        </Text>
      </View>
    </ScrollView>
  );
}
