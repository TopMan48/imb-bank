import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, Alert, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAppStore } from '@/store/useAppStore';
import { Colors } from '@/constants/Colors';
import { Fonts } from '@/constants/Typography';

function SettingRow({
  icon,
  label,
  subtitle,
  onPress,
  isLast,
  value,
  onValueChange,
  destructive,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  subtitle?: string;
  onPress?: () => void;
  isLast?: boolean;
  value?: boolean;
  onValueChange?: (v: boolean) => void;
  destructive?: boolean;
}) {
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
        minHeight: 56,
        backgroundColor: pressed && onPress ? Colors.background : 'transparent',
      }]}
      onPress={onPress}
    >
      <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: destructive ? '#FFEBEE' : Colors.background, alignItems: 'center', justifyContent: 'center', borderCurve: 'continuous' }}>
        <Ionicons name={icon} size={18} color={destructive ? Colors.error : Colors.primary} />
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={{ fontSize: 15, fontFamily: Fonts.medium, color: destructive ? Colors.error : Colors.textPrimary }}>{label}</Text>
        {subtitle && <Text style={{ fontSize: 12, fontFamily: Fonts.regular, color: Colors.textSecondary }}>{subtitle}</Text>}
      </View>
      {onValueChange !== undefined ? (
        <Switch value={value} onValueChange={onValueChange} trackColor={{ false: Colors.border, true: Colors.primary }} thumbColor={Colors.white} />
      ) : (
        <Ionicons name="chevron-forward" size={16} color={Colors.textSecondary} />
      )}
    </Pressable>
  );
}

export default function SecurityScreen() {
  const [biometricsEnabled, setBiometricsEnabled] = useState(false);
  const [twoFAEnabled, setTwoFAEnabled] = useState(true);
  const [loginAlertsEnabled, setLoginAlertsEnabled] = useState(true);
  const setAuthenticated = useAppStore((s) => s.setAuthenticated);
  const setPasscode = useAppStore((s) => s.setPasscode);

  const handleChangePasscode = () => {
    Alert.alert(
      'Change Passcode',
      'You will be signed out to set a new passcode.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Continue',
          onPress: () => {
            setPasscode('');
            setAuthenticated(false);
            router.replace('/(auth)/passcode-setup');
          },
        },
      ]
    );
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 20, gap: 24, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>

      {/* Security score */}
      <View style={{ backgroundColor: Colors.primary, borderRadius: 16, padding: 20, gap: 8, borderCurve: 'continuous' }}>
        <Text style={{ fontSize: 13, fontFamily: Fonts.medium, color: 'rgba(255,255,255,0.7)' }}>SECURITY SCORE</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Text style={{ fontSize: 40, fontFamily: Fonts.bold, color: Colors.accent }}>82</Text>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 15, fontFamily: Fonts.semiBold, color: Colors.white }}>Good</Text>
            <Text style={{ fontSize: 12, fontFamily: Fonts.regular, color: 'rgba(255,255,255,0.7)' }}>Enable biometrics to reach 100</Text>
          </View>
        </View>
        <View style={{ height: 6, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 3 }}>
          <View style={{ width: '82%', height: 6, backgroundColor: Colors.accent, borderRadius: 3 }} />
        </View>
      </View>

      <View style={{ gap: 10 }}>
        <Text style={{ fontSize: 12, fontFamily: Fonts.semiBold, color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, paddingHorizontal: 4 }}>Authentication</Text>
        <View style={{ backgroundColor: Colors.white, borderRadius: 16, overflow: 'hidden', borderCurve: 'continuous', boxShadow: '0 2px 10px rgba(0,75,90,0.06)' }}>
          <SettingRow
            icon="keypad-outline"
            label="Change Passcode"
            subtitle="Update your 4-digit PIN"
            onPress={handleChangePasscode}
          />
          <SettingRow
            icon="finger-print-outline"
            label="Biometric Login"
            subtitle="Face ID / Touch ID"
            value={biometricsEnabled}
            onValueChange={setBiometricsEnabled}
          />
          <SettingRow
            icon="shield-checkmark-outline"
            label="Two-Factor Authentication"
            subtitle="SMS code on new device logins"
            value={twoFAEnabled}
            onValueChange={setTwoFAEnabled}
            isLast
          />
        </View>
      </View>

      <View style={{ gap: 10 }}>
        <Text style={{ fontSize: 12, fontFamily: Fonts.semiBold, color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, paddingHorizontal: 4 }}>Monitoring</Text>
        <View style={{ backgroundColor: Colors.white, borderRadius: 16, overflow: 'hidden', borderCurve: 'continuous', boxShadow: '0 2px 10px rgba(0,75,90,0.06)' }}>
          <SettingRow
            icon="notifications-outline"
            label="Login Alerts"
            subtitle="Alert when logged in on new device"
            value={loginAlertsEnabled}
            onValueChange={setLoginAlertsEnabled}
          />
          <SettingRow
            icon="time-outline"
            label="Login Activity"
            subtitle="View full login history"
            onPress={() => router.push('/settings/login-activity')}
            isLast
          />
        </View>
      </View>

      <View style={{ gap: 10 }}>
        <Text style={{ fontSize: 12, fontFamily: Fonts.semiBold, color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, paddingHorizontal: 4 }}>Danger Zone</Text>
        <View style={{ backgroundColor: Colors.white, borderRadius: 16, overflow: 'hidden', borderCurve: 'continuous', boxShadow: '0 2px 10px rgba(0,75,90,0.06)' }}>
          <SettingRow
            icon="lock-closed-outline"
            label="Freeze All Accounts"
            subtitle="Temporarily suspend all activity"
            onPress={() => Alert.alert('Freeze Accounts', 'This will block all transactions and card payments. Contact 133 462 to unfreeze.\n\nAre you sure?', [{ text: 'Cancel' }, { text: 'Freeze', style: 'destructive' }])}
            destructive
            isLast
          />
        </View>
      </View>
    </ScrollView>
  );
}
