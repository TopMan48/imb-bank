import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Alert,
  Switch,
  Modal,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAppStore } from '@/store/useAppStore';
import { Colors } from '@/constants/Colors';
import { Fonts } from '@/constants/Typography';
import type { TrustedDevice } from '@/store/types';

const SESSION_TIMEOUT_OPTIONS = [
  { value: 1, label: '1 minute' },
  { value: 5, label: '5 minutes' },
  { value: 15, label: '15 minutes' },
  { value: 30, label: '30 minutes' },
  { value: 60, label: '1 hour' },
];

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
        {subtitle && <Text style={{ fontSize: 12, fontFamily: Fonts.regular, color: Colors.textSecondary, lineHeight: 17 }}>{subtitle}</Text>}
      </View>
      {onValueChange !== undefined ? (
        <Switch value={value} onValueChange={onValueChange} trackColor={{ false: Colors.border, true: Colors.primary }} thumbColor={Colors.white} />
      ) : (
        <Ionicons name="chevron-forward" size={16} color={Colors.textSecondary} />
      )}
    </Pressable>
  );
}

function TwoFASetupModal({ visible, onClose }: { visible: boolean; onClose: (confirmed: boolean) => void }) {
  const [step, setStep] = useState(1);
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const MOCK_CODE = '847291';

  const handleVerify = () => {
    if (code === MOCK_CODE) {
      setError('');
      setStep(3);
    } else {
      setError('Incorrect code. Try: 847291 (demo)');
    }
  };

  const handleClose = (success = false) => {
    setStep(1);
    setCode('');
    setError('');
    onClose(success);
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="formSheet" onRequestClose={() => handleClose(false)}>
      <View style={{ flex: 1, backgroundColor: Colors.background }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', padding: 20, paddingTop: 24, backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.borderLight }}>
          <Text style={{ flex: 1, fontSize: 18, fontFamily: Fonts.bold, color: Colors.textPrimary }}>
            {step === 3 ? '2FA Enabled' : 'Set Up Two-Factor Authentication'}
          </Text>
          <Pressable onPress={() => handleClose(false)} style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name="close" size={20} color={Colors.textSecondary} />
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={{ padding: 24, gap: 20 }}>
          {step === 1 && (
            <>
              <View style={{ alignItems: 'center', gap: 12, paddingVertical: 12 }}>
                <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: '#E8F5E9', alignItems: 'center', justifyContent: 'center' }}>
                  <Ionicons name="shield-checkmark" size={36} color={Colors.success} />
                </View>
                <Text style={{ fontSize: 20, fontFamily: Fonts.bold, color: Colors.textPrimary, textAlign: 'center' }}>
                  Add an Extra Layer of Security
                </Text>
                <Text style={{ fontSize: 14, fontFamily: Fonts.regular, color: Colors.textSecondary, textAlign: 'center', lineHeight: 21 }}>
                  Two-factor authentication adds an SMS verification code when you sign in from a new device.
                </Text>
              </View>
              <View style={{ backgroundColor: Colors.white, borderRadius: 16, borderCurve: 'continuous', overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,75,90,0.06)' }}>
                {[
                  { icon: 'lock-closed-outline' as const, label: 'Protects against password theft' },
                  { icon: 'phone-portrait-outline' as const, label: 'Verification code sent via SMS' },
                  { icon: 'timer-outline' as const, label: 'Codes expire after 10 minutes' },
                ].map((item, idx, arr) => (
                  <View key={item.label} style={{ flexDirection: 'row', alignItems: 'center', gap: 14, padding: 14, borderBottomWidth: idx < arr.length - 1 ? 1 : 0, borderBottomColor: Colors.borderLight }}>
                    <Ionicons name={item.icon} size={20} color={Colors.success} />
                    <Text style={{ fontSize: 14, fontFamily: Fonts.regular, color: Colors.textPrimary }}>{item.label}</Text>
                  </View>
                ))}
              </View>
              <Pressable
                style={({ pressed }) => [{ backgroundColor: Colors.primary, borderRadius: 14, paddingVertical: 16, alignItems: 'center', borderCurve: 'continuous', opacity: pressed ? 0.85 : 1 }]}
                onPress={() => setStep(2)}
              >
                <Text style={{ fontSize: 16, fontFamily: Fonts.bold, color: Colors.white }}>Continue</Text>
              </Pressable>
            </>
          )}

          {step === 2 && (
            <>
              <View style={{ alignItems: 'center', gap: 12, paddingVertical: 8 }}>
                <View style={{ width: 60, height: 60, borderRadius: 30, backgroundColor: '#E3F2FD', alignItems: 'center', justifyContent: 'center' }}>
                  <Ionicons name="chatbubble-outline" size={28} color={Colors.info} />
                </View>
                <Text style={{ fontSize: 18, fontFamily: Fonts.bold, color: Colors.textPrimary }}>Enter Verification Code</Text>
                <Text style={{ fontSize: 13, fontFamily: Fonts.regular, color: Colors.textSecondary, textAlign: 'center', lineHeight: 20 }}>
                  {'A 6-digit code has been sent to your mobile ending in •••• 678\n\n(Demo: use code 847291)'}
                </Text>
              </View>
              <View style={{ backgroundColor: Colors.white, borderRadius: 16, padding: 16, borderCurve: 'continuous', boxShadow: '0 2px 10px rgba(0,75,90,0.06)', gap: 10 }}>
                <Text style={{ fontSize: 11, fontFamily: Fonts.semiBold, color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  6-Digit Code
                </Text>
                <TextInput
                  value={code}
                  onChangeText={(v) => { setCode(v.replace(/\D/g, '').slice(0, 6)); setError(''); }}
                  keyboardType="numeric"
                  maxLength={6}
                  style={{ fontSize: 28, fontFamily: Fonts.bold, color: Colors.textPrimary, letterSpacing: 8, textAlign: 'center', paddingVertical: 8 }}
                  placeholder="------"
                  placeholderTextColor={Colors.border}
                />
                {error && <Text style={{ fontSize: 12, fontFamily: Fonts.regular, color: Colors.error, textAlign: 'center' }}>{error}</Text>}
              </View>
              <Pressable
                style={({ pressed }) => [{ backgroundColor: code.length === 6 ? Colors.primary : Colors.border, borderRadius: 14, paddingVertical: 16, alignItems: 'center', borderCurve: 'continuous', opacity: pressed ? 0.85 : 1 }]}
                onPress={handleVerify}
                disabled={code.length < 6}
              >
                <Text style={{ fontSize: 16, fontFamily: Fonts.bold, color: code.length === 6 ? Colors.white : Colors.textSecondary }}>Verify Code</Text>
              </Pressable>
              <Pressable style={{ alignItems: 'center', paddingVertical: 8 }} onPress={() => { setCode(''); setError(''); }}>
                <Text style={{ fontSize: 13, fontFamily: Fonts.medium, color: Colors.primary }}>Resend Code</Text>
              </Pressable>
            </>
          )}

          {step === 3 && (
            <View style={{ alignItems: 'center', gap: 16, paddingVertical: 20 }}>
              <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: '#E8F5E9', alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name="checkmark-circle" size={48} color={Colors.success} />
              </View>
              <Text style={{ fontSize: 22, fontFamily: Fonts.bold, color: Colors.textPrimary }}>2FA Enabled!</Text>
              <Text style={{ fontSize: 14, fontFamily: Fonts.regular, color: Colors.textSecondary, textAlign: 'center', lineHeight: 22 }}>
                Two-factor authentication is now active on your account. Your account is now more secure.
              </Text>
              <Pressable
                style={({ pressed }) => [{ backgroundColor: Colors.accent, borderRadius: 14, paddingHorizontal: 40, paddingVertical: 14, borderCurve: 'continuous', opacity: pressed ? 0.85 : 1 }]}
                onPress={() => handleClose(true)}
              >
                <Text style={{ fontSize: 16, fontFamily: Fonts.bold, color: Colors.primary }}>Done</Text>
              </Pressable>
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}

function TrustedDevicesModal({
  devices,
  visible,
  onClose,
}: {
  devices: TrustedDevice[];
  visible: boolean;
  onClose: () => void;
}) {
  const removeTrustedDevice = useAppStore((s) => s.removeTrustedDevice);

  const deviceIcon = (type: TrustedDevice['type']): keyof typeof Ionicons.glyphMap => {
    if (type === 'mobile') return 'phone-portrait-outline';
    if (type === 'tablet') return 'tablet-portrait-outline';
    return 'laptop-outline';
  };

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - d.getTime()) / (24 * 60 * 60 * 1000));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 30) return `${diffDays} days ago`;
    return d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="formSheet" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: Colors.background }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', padding: 20, paddingTop: 24, backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.borderLight }}>
          <Text style={{ flex: 1, fontSize: 18, fontFamily: Fonts.bold, color: Colors.textPrimary }}>Trusted Devices</Text>
          <Pressable onPress={onClose} style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name="close" size={20} color={Colors.textSecondary} />
          </Pressable>
        </View>
        <ScrollView contentContainerStyle={{ padding: 20, gap: 16 }}>
          <View style={{ backgroundColor: '#FFF3E0', borderRadius: 12, padding: 12, flexDirection: 'row', gap: 10, borderCurve: 'continuous' }}>
            <Ionicons name="information-circle-outline" size={18} color={Colors.warning} />
            <Text style={{ flex: 1, fontSize: 12, fontFamily: Fonts.regular, color: Colors.textPrimary, lineHeight: 18 }}>
              Trusted devices can log in without 2FA. Remove any device you do not recognise.
            </Text>
          </View>

          {devices.length === 0 ? (
            <View style={{ backgroundColor: Colors.white, borderRadius: 16, padding: 30, alignItems: 'center', gap: 12, borderCurve: 'continuous' }}>
              <Ionicons name="phone-portrait-outline" size={40} color={Colors.textSecondary} />
              <Text style={{ fontSize: 15, fontFamily: Fonts.medium, color: Colors.textSecondary }}>No trusted devices</Text>
            </View>
          ) : (
            <View style={{ backgroundColor: Colors.white, borderRadius: 16, overflow: 'hidden', borderCurve: 'continuous', boxShadow: '0 2px 10px rgba(0,75,90,0.06)' }}>
              {devices.map((device, idx) => (
                <View
                  key={device.id}
                  style={{ flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12, borderBottomWidth: idx < devices.length - 1 ? 1 : 0, borderBottomColor: Colors.borderLight }}
                >
                  <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center', borderCurve: 'continuous' }}>
                    <Ionicons name={deviceIcon(device.type)} size={22} color={Colors.primary} />
                  </View>
                  <View style={{ flex: 1, gap: 3 }}>
                    <Text style={{ fontSize: 14, fontFamily: Fonts.semiBold, color: Colors.textPrimary }}>{device.name}</Text>
                    <Text style={{ fontSize: 12, fontFamily: Fonts.regular, color: Colors.textSecondary }}>
                      Added {formatTime(device.addedAt)} · Last used {formatTime(device.lastUsed)}
                    </Text>
                  </View>
                  <Pressable
                    style={({ pressed }) => [{ padding: 8, borderRadius: 8, backgroundColor: pressed ? '#FFEBEE' : 'transparent' }]}
                    onPress={() =>
                      Alert.alert(
                        'Remove Device',
                        `Remove "${device.name}" as a trusted device? You'll need to verify via 2FA next time.`,
                        [
                          { text: 'Cancel', style: 'cancel' },
                          {
                            text: 'Remove',
                            style: 'destructive',
                            onPress: () => removeTrustedDevice(device.id),
                          },
                        ]
                      )
                    }
                  >
                    <Ionicons name="trash-outline" size={18} color={Colors.error} />
                  </Pressable>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}

function FraudReportModal({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const { transactions, addFraudReport } = useAppStore();
  const [step, setStep] = useState(1);
  const [selectedTxId, setSelectedTxId] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [reference, setReference] = useState('');

  const recentTx = transactions.slice(0, 8);

  const handleSubmit = () => {
    const selectedTx = selectedTxId ? transactions.find((t) => t.id === selectedTxId) : null;
    const ref = `FRD-${Date.now().toString().slice(-8).toUpperCase()}`;
    setReference(ref);
    addFraudReport({
      transactionId: selectedTxId ?? undefined,
      description: description || (selectedTx ? `Disputed: ${selectedTx.description}` : 'Fraud report'),
      amount: selectedTx ? Math.abs(selectedTx.amount) : undefined,
      reportedAt: new Date().toISOString(),
      status: 'pending',
      reference: ref,
    });
    setStep(3);
  };

  const handleClose = () => {
    setStep(1);
    setSelectedTxId(null);
    setDescription('');
    setReference('');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="formSheet" onRequestClose={handleClose}>
      <View style={{ flex: 1, backgroundColor: Colors.background }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', padding: 20, paddingTop: 24, backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.borderLight }}>
          <Text style={{ flex: 1, fontSize: 18, fontFamily: Fonts.bold, color: Colors.textPrimary }}>
            {step === 3 ? 'Report Submitted' : 'Report Fraudulent Transaction'}
          </Text>
          <Pressable onPress={handleClose} style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name="close" size={20} color={Colors.textSecondary} />
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={{ padding: 20, gap: 16 }}>
          {step === 1 && (
            <>
              <View style={{ backgroundColor: '#FFEBEE', borderRadius: 12, padding: 14, flexDirection: 'row', gap: 10, borderCurve: 'continuous' }}>
                <Ionicons name="warning-outline" size={18} color={Colors.error} />
                <Text style={{ flex: 1, fontSize: 13, fontFamily: Fonts.regular, color: Colors.textPrimary, lineHeight: 18 }}>
                  Select the fraudulent transaction below, or skip to describe the fraud.
                </Text>
              </View>

              <Text style={{ fontSize: 12, fontFamily: Fonts.semiBold, color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Select Transaction (Optional)
              </Text>
              <View style={{ backgroundColor: Colors.white, borderRadius: 16, overflow: 'hidden', borderCurve: 'continuous', boxShadow: '0 2px 10px rgba(0,75,90,0.06)' }}>
                <Pressable
                  style={[{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
                    !selectedTxId && { backgroundColor: '#F0F8FA' }]}
                  onPress={() => setSelectedTxId(null)}
                >
                  <View style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center' }}>
                    <Ionicons name="add-outline" size={20} color={Colors.textSecondary} />
                  </View>
                  <Text style={{ flex: 1, fontSize: 14, fontFamily: Fonts.medium, color: Colors.textSecondary }}>Not in list / General fraud</Text>
                  {!selectedTxId && <Ionicons name="checkmark-circle" size={18} color={Colors.primary} />}
                </Pressable>
                {recentTx.map((tx, idx) => (
                  <Pressable
                    key={tx.id}
                    style={[{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderBottomWidth: idx < recentTx.length - 1 ? 1 : 0, borderBottomColor: Colors.borderLight },
                      selectedTxId === tx.id && { backgroundColor: '#F0F8FA' }]}
                    onPress={() => setSelectedTxId(tx.id)}
                  >
                    <View style={{ flex: 1, gap: 2 }}>
                      <Text style={{ fontSize: 13, fontFamily: Fonts.semiBold, color: Colors.textPrimary }} numberOfLines={1}>{tx.description}</Text>
                      <Text style={{ fontSize: 11, fontFamily: Fonts.regular, color: Colors.textSecondary }}>{tx.date} · ${Math.abs(tx.amount).toFixed(2)}</Text>
                    </View>
                    {selectedTxId === tx.id && <Ionicons name="checkmark-circle" size={18} color={Colors.primary} />}
                  </Pressable>
                ))}
              </View>

              <Pressable
                style={({ pressed }) => [{ backgroundColor: Colors.primary, borderRadius: 14, paddingVertical: 16, alignItems: 'center', borderCurve: 'continuous', opacity: pressed ? 0.85 : 1 }]}
                onPress={() => setStep(2)}
              >
                <Text style={{ fontSize: 16, fontFamily: Fonts.bold, color: Colors.white }}>Continue</Text>
              </Pressable>
            </>
          )}

          {step === 2 && (
            <>
              <Text style={{ fontSize: 12, fontFamily: Fonts.semiBold, color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Describe the Fraud
              </Text>
              <View style={{ backgroundColor: Colors.white, borderRadius: 16, padding: 16, borderCurve: 'continuous', boxShadow: '0 2px 10px rgba(0,75,90,0.06)', gap: 8 }}>
                <Text style={{ fontSize: 11, fontFamily: Fonts.semiBold, color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Description (optional)
                </Text>
                <TextInput
                  value={description}
                  onChangeText={setDescription}
                  placeholder="Describe what happened..."
                  placeholderTextColor={Colors.textSecondary}
                  multiline
                  numberOfLines={4}
                  style={{ fontSize: 14, fontFamily: Fonts.regular, color: Colors.textPrimary, minHeight: 80, textAlignVertical: 'top' }}
                />
              </View>

              <View style={{ backgroundColor: '#FFF3E0', borderRadius: 12, padding: 14, flexDirection: 'row', gap: 10, borderCurve: 'continuous' }}>
                <Ionicons name="time-outline" size={18} color={Colors.warning} />
                <Text style={{ flex: 1, fontSize: 13, fontFamily: Fonts.regular, color: Colors.textPrimary, lineHeight: 18 }}>
                  Our team will investigate within 1-2 business days. You may be contacted for more information.
                </Text>
              </View>

              <Pressable
                style={({ pressed }) => [{ backgroundColor: Colors.error, borderRadius: 14, paddingVertical: 16, alignItems: 'center', borderCurve: 'continuous', opacity: pressed ? 0.85 : 1 }]}
                onPress={handleSubmit}
              >
                <Text style={{ fontSize: 16, fontFamily: Fonts.bold, color: Colors.white }}>Submit Fraud Report</Text>
              </Pressable>
              <Pressable style={{ alignItems: 'center', paddingVertical: 8 }} onPress={() => setStep(1)}>
                <Text style={{ fontSize: 13, fontFamily: Fonts.medium, color: Colors.textSecondary }}>Back</Text>
              </Pressable>
            </>
          )}

          {step === 3 && (
            <View style={{ alignItems: 'center', gap: 16, paddingVertical: 20 }}>
              <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: '#E8F5E9', alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name="checkmark-circle" size={48} color={Colors.success} />
              </View>
              <Text style={{ fontSize: 22, fontFamily: Fonts.bold, color: Colors.textPrimary }}>Report Submitted</Text>
              <Text style={{ fontSize: 14, fontFamily: Fonts.regular, color: Colors.textSecondary, textAlign: 'center', lineHeight: 22 }}>
                Your fraud report has been received.{'\n\n'}
                Reference: {reference}{'\n\n'}
                Our team will contact you within 1-2 business days.
              </Text>
              <Text style={{ fontSize: 12, fontFamily: Fonts.regular, color: Colors.textSecondary, textAlign: 'center' }}>
                For urgent fraud, call 133 462 (24/7)
              </Text>
              <Pressable
                style={({ pressed }) => [{ backgroundColor: Colors.accent, borderRadius: 14, paddingHorizontal: 40, paddingVertical: 14, borderCurve: 'continuous', opacity: pressed ? 0.85 : 1 }]}
                onPress={handleClose}
              >
                <Text style={{ fontSize: 16, fontFamily: Fonts.bold, color: Colors.primary }}>Done</Text>
              </Pressable>
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}

export default function SecurityScreen() {
  const { security, updateSecurity, setAuthenticated, setPasscode } = useAppStore();
  const [showTwoFA, setShowTwoFA] = useState(false);
  const [showDevices, setShowDevices] = useState(false);
  const [showFraudReport, setShowFraudReport] = useState(false);
  const [showSessionTimeout, setShowSessionTimeout] = useState(false);

  const scoreBase = 40;
  const scoreBonus = [
    security.twoFAEnabled ? 20 : 0,
    security.biometricsEnabled ? 15 : 0,
    security.loginAlertsEnabled ? 10 : 0,
    security.sessionTimeoutMinutes <= 5 ? 15 : 0,
  ].reduce((a, b) => a + b, 0);
  const score = scoreBase + scoreBonus;

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

  const handleToggle2FA = (value: boolean) => {
    if (value) {
      setShowTwoFA(true);
    } else {
      Alert.alert(
        'Disable 2FA',
        'Disabling two-factor authentication makes your account less secure. Are you sure?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Disable',
            style: 'destructive',
            onPress: () => updateSecurity({ twoFAEnabled: false }),
          },
        ]
      );
    }
  };

  const currentTimeout = SESSION_TIMEOUT_OPTIONS.find((o) => o.value === security.sessionTimeoutMinutes);

  return (
    <>
      <ScrollView contentContainerStyle={{ padding: 20, gap: 24, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>

        {/* Security score */}
        <View style={{ backgroundColor: Colors.primary, borderRadius: 16, padding: 20, gap: 10, borderCurve: 'continuous', boxShadow: '0 6px 20px rgba(0,75,90,0.2)' }}>
          <Text style={{ fontSize: 11, fontFamily: Fonts.semiBold, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: 0.5 }}>Security Score</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
            <Text style={{ fontSize: 44, fontFamily: Fonts.bold, color: Colors.accent }}>{score}</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 16, fontFamily: Fonts.semiBold, color: Colors.white }}>
                {score >= 90 ? 'Excellent' : score >= 70 ? 'Good' : score >= 50 ? 'Fair' : 'Needs Improvement'}
              </Text>
              <Text style={{ fontSize: 12, fontFamily: Fonts.regular, color: 'rgba(255,255,255,0.65)', marginTop: 2 }}>
                {score < 100 ? 'Enable all features to reach 100' : 'Maximum protection enabled'}
              </Text>
            </View>
          </View>
          <View style={{ height: 6, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 3, overflow: 'hidden' }}>
            <View style={{ width: `${score}%`, height: 6, backgroundColor: Colors.accent, borderRadius: 3 }} />
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
              value={security.biometricsEnabled}
              onValueChange={(v) => updateSecurity({ biometricsEnabled: v })}
            />
            <SettingRow
              icon="shield-checkmark-outline"
              label="Two-Factor Authentication"
              subtitle="SMS code on new device logins"
              value={security.twoFAEnabled}
              onValueChange={handleToggle2FA}
              isLast
            />
          </View>
        </View>

        <View style={{ gap: 10 }}>
          <Text style={{ fontSize: 12, fontFamily: Fonts.semiBold, color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, paddingHorizontal: 4 }}>Devices & Sessions</Text>
          <View style={{ backgroundColor: Colors.white, borderRadius: 16, overflow: 'hidden', borderCurve: 'continuous', boxShadow: '0 2px 10px rgba(0,75,90,0.06)' }}>
            <SettingRow
              icon="phone-portrait-outline"
              label="Trusted Devices"
              subtitle={`${security.trustedDevices.length} device${security.trustedDevices.length !== 1 ? 's' : ''} trusted`}
              onPress={() => setShowDevices(true)}
            />
            <SettingRow
              icon="timer-outline"
              label="Session Timeout"
              subtitle={`Auto-logout after ${currentTimeout?.label ?? '5 minutes'} of inactivity`}
              onPress={() => setShowSessionTimeout(true)}
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
              subtitle="Alert when logged in on a new device"
              value={security.loginAlertsEnabled}
              onValueChange={(v) => updateSecurity({ loginAlertsEnabled: v })}
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
          <Text style={{ fontSize: 12, fontFamily: Fonts.semiBold, color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, paddingHorizontal: 4 }}>Fraud & Security</Text>
          <View style={{ backgroundColor: Colors.white, borderRadius: 16, overflow: 'hidden', borderCurve: 'continuous', boxShadow: '0 2px 10px rgba(0,75,90,0.06)' }}>
            <SettingRow
              icon="alert-circle-outline"
              label="Report Fraud"
              subtitle="Dispute a transaction or report fraud"
              onPress={() => setShowFraudReport(true)}
            />
            <SettingRow
              icon="lock-closed-outline"
              label="Freeze All Accounts"
              subtitle="Temporarily suspend all transactions"
              onPress={() => Alert.alert('Freeze Accounts', 'This will block all transactions and card payments. Call 133 462 to unfreeze.\n\nAre you sure?', [{ text: 'Cancel' }, { text: 'Freeze All', style: 'destructive' }])}
              destructive
              isLast
            />
          </View>
        </View>
      </ScrollView>

      <TwoFASetupModal
        visible={showTwoFA}
        onClose={(confirmed) => {
          setShowTwoFA(false);
          if (confirmed) updateSecurity({ twoFAEnabled: true });
        }}
      />

      <TrustedDevicesModal
        devices={security.trustedDevices}
        visible={showDevices}
        onClose={() => setShowDevices(false)}
      />

      <FraudReportModal
        visible={showFraudReport}
        onClose={() => setShowFraudReport(false)}
      />

      {/* Session Timeout Picker */}
      <Modal visible={showSessionTimeout} animationType="slide" presentationStyle="formSheet" onRequestClose={() => setShowSessionTimeout(false)}>
        <View style={{ flex: 1, backgroundColor: Colors.background }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', padding: 20, paddingTop: 24, backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.borderLight }}>
            <Text style={{ flex: 1, fontSize: 18, fontFamily: Fonts.bold, color: Colors.textPrimary }}>Session Timeout</Text>
            <Pressable onPress={() => setShowSessionTimeout(false)} style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name="close" size={20} color={Colors.textSecondary} />
            </Pressable>
          </View>
          <ScrollView contentContainerStyle={{ padding: 20, gap: 16 }}>
            <Text style={{ fontSize: 13, fontFamily: Fonts.regular, color: Colors.textSecondary, lineHeight: 20 }}>
              The app will automatically sign you out after this period of inactivity.
            </Text>
            <View style={{ backgroundColor: Colors.white, borderRadius: 16, overflow: 'hidden', borderCurve: 'continuous', boxShadow: '0 2px 10px rgba(0,75,90,0.06)' }}>
              {SESSION_TIMEOUT_OPTIONS.map((option, idx) => (
                <Pressable
                  key={option.value}
                  style={({ pressed }) => [{
                    flexDirection: 'row',
                    alignItems: 'center',
                    padding: 16,
                    gap: 12,
                    borderBottomWidth: idx < SESSION_TIMEOUT_OPTIONS.length - 1 ? 1 : 0,
                    borderBottomColor: Colors.borderLight,
                    backgroundColor: pressed ? Colors.background : security.sessionTimeoutMinutes === option.value ? '#F0F8FA' : 'transparent',
                    minHeight: 56,
                  }]}
                  onPress={() => {
                    updateSecurity({ sessionTimeoutMinutes: option.value });
                    setShowSessionTimeout(false);
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 15, fontFamily: security.sessionTimeoutMinutes === option.value ? Fonts.semiBold : Fonts.regular, color: security.sessionTimeoutMinutes === option.value ? Colors.primary : Colors.textPrimary }}>
                      {option.label}
                    </Text>
                    {option.value <= 5 && <Text style={{ fontSize: 12, fontFamily: Fonts.regular, color: Colors.success, marginTop: 2 }}>Recommended for security</Text>}
                  </View>
                  {security.sessionTimeoutMinutes === option.value && (
                    <Ionicons name="checkmark-circle" size={22} color={Colors.primary} />
                  )}
                </Pressable>
              ))}
            </View>
          </ScrollView>
        </View>
      </Modal>
    </>
  );
}
