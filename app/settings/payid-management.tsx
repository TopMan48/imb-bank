import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { Fonts } from '@/constants/Typography';
import { useAppStore } from '@/store/useAppStore';
import { payIdService } from '@/services/payid-service';
import { isDemoMode } from '@/services/api-config';
import type { PayIdRegistrationResult, PayIdType } from '@/services/types';

const PAYID_TYPE_OPTIONS: { key: PayIdType; label: string; icon: keyof typeof Ionicons.glyphMap; placeholder: string }[] = [
  { key: 'email', label: 'Email', icon: 'mail-outline', placeholder: 'you@example.com' },
  { key: 'mobile', label: 'Mobile', icon: 'phone-portrait-outline', placeholder: '0412 345 678' },
  { key: 'abn', label: 'ABN', icon: 'business-outline', placeholder: '12 345 678 901' },
  { key: 'organisation-id', label: 'Org ID', icon: 'people-outline', placeholder: 'ORG001234' },
];

export default function PayIdManagementScreen() {
  const { accounts, profile } = useAppStore();
  const [registeredPayIds, setRegisteredPayIds] = useState<PayIdRegistrationResult[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedType, setSelectedType] = useState<PayIdType>('email');
  const [payIdValue, setPayIdValue] = useState('');
  const [selectedAccountId, setSelectedAccountId] = useState(accounts[0]?.id ?? '');
  const [isReusable, setIsReusable] = useState(true);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadRegisteredPayIds();
  }, []);

  const loadRegisteredPayIds = () => {
    const payIds = payIdService.getRegisteredPayIds();
    setRegisteredPayIds(payIds);
    setIsLoading(false);
  };

  const handleRegister = async () => {
    if (!payIdValue.trim()) {
      Alert.alert('Error', 'Please enter a PayID value.');
      return;
    }

    const account = accounts.find((a) => a.id === selectedAccountId);
    if (!account) {
      Alert.alert('Error', 'Please select an account.');
      return;
    }

    setIsRegistering(true);
    try {
      await payIdService.registerPayId({
        payId: payIdValue.trim(),
        type: selectedType,
        accountBsb: account.bsb,
        accountNumber: account.accountNumber,
        accountName: `${profile.firstName} ${profile.lastName}`,
        isReusable,
      });

      loadRegisteredPayIds();
      setShowCreateForm(false);
      setPayIdValue('');
      Alert.alert('Success', 'PayID registered successfully!');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Registration failed';
      Alert.alert('Registration Failed', message);
    } finally {
      setIsRegistering(false);
    }
  };

  const handleDeregister = (payId: string) => {
    Alert.alert(
      'Deregister PayID',
      `Are you sure you want to remove "${payId}"? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Deregister',
          style: 'destructive',
          onPress: async () => {
            try {
              await payIdService.deregisterPayId(payId);
              loadRegisteredPayIds();
            } catch {
              Alert.alert('Error', 'Failed to deregister PayID.');
            }
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <>
        <Stack.Screen options={{ title: 'PayID Management' }} />
        <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: 'PayID Management' }} />
      <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Demo Mode Indicator */}
        {isDemoMode() && (
          <View style={styles.demoBanner}>
            <Ionicons name="flask-outline" size={16} color="#FF9800" />
            <Text style={styles.demoBannerText}>Demo Mode — PayID operations are simulated locally</Text>
          </View>
        )}

        {/* My PayIDs */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>My PayIDs</Text>
            <Pressable
              style={({ pressed }) => [styles.addBtn, pressed && { opacity: 0.7 }]}
              onPress={() => setShowCreateForm(!showCreateForm)}
            >
              <Ionicons name={showCreateForm ? 'close' : 'add'} size={18} color={Colors.white} />
            </Pressable>
          </View>

          {registeredPayIds.length === 0 && !showCreateForm && (
            <View style={styles.emptyState}>
              <View style={styles.emptyIcon}>
                <Ionicons name="at-outline" size={32} color={Colors.textSecondary} />
              </View>
              <Text style={styles.emptyTitle}>No PayIDs Registered</Text>
              <Text style={styles.emptySubtitle}>
                Register a PayID (email, mobile, or ABN) to receive instant payments via the NPP network.
              </Text>
              <Pressable
                style={({ pressed }) => [styles.emptyBtn, pressed && { opacity: 0.85 }]}
                onPress={() => setShowCreateForm(true)}
              >
                <Ionicons name="add-circle-outline" size={18} color={Colors.primary} />
                <Text style={styles.emptyBtnText}>Register PayID</Text>
              </Pressable>
            </View>
          )}

          {registeredPayIds.map((payid) => (
            <View key={payid.id} style={styles.payIdCard}>
              <View style={styles.payIdCardHeader}>
                <View style={styles.payIdTypeIcon}>
                  <Ionicons
                    name={PAYID_TYPE_OPTIONS.find((t) => t.key === payid.type)?.icon ?? 'at-outline'}
                    size={18}
                    color={Colors.primary}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text selectable style={styles.payIdValue}>{payid.payId}</Text>
                  <Text style={styles.payIdMeta}>
                    {payid.type === 'email' ? 'Email' : payid.type === 'mobile' ? 'Mobile' : payid.type === 'abn' ? 'ABN' : 'Org ID'}
                    {' · '}
                    {payid.isReusable ? 'Static' : 'Single-use'}
                  </Text>
                </View>
                <View style={[styles.statusBadge, payid.status === 'active' ? styles.statusActive : styles.statusInactive]}>
                  <Text style={[styles.statusText, payid.status === 'active' ? styles.statusTextActive : styles.statusTextInactive]}>
                    {payid.status}
                  </Text>
                </View>
              </View>
              <View style={styles.payIdCardFooter}>
                <Text style={styles.payIdDate}>
                  Registered {new Date(payid.registeredAt).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })}
                </Text>
                <Pressable
                  style={({ pressed }) => [styles.deregisterBtn, pressed && { opacity: 0.7 }]}
                  onPress={() => handleDeregister(payid.payId)}
                >
                  <Text style={styles.deregisterText}>Remove</Text>
                </Pressable>
              </View>
            </View>
          ))}
        </View>

        {/* Create Form */}
        {showCreateForm && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Register New PayID</Text>

            {/* Type Selection */}
            <View style={styles.typeRow}>
              {PAYID_TYPE_OPTIONS.map((opt) => (
                <Pressable
                  key={opt.key}
                  style={[styles.typeChip, selectedType === opt.key && styles.typeChipActive]}
                  onPress={() => { setSelectedType(opt.key); setPayIdValue(''); }}
                >
                  <Ionicons
                    name={opt.icon}
                    size={16}
                    color={selectedType === opt.key ? Colors.white : Colors.textSecondary}
                  />
                  <Text style={[styles.typeChipText, selectedType === opt.key && styles.typeChipTextActive]}>
                    {opt.label}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* PayID Value Input */}
            <View style={styles.inputCard}>
              <Text style={styles.inputLabel}>PayID Value</Text>
              <TextInput
                style={styles.input}
                value={payIdValue}
                onChangeText={setPayIdValue}
                placeholder={PAYID_TYPE_OPTIONS.find((t) => t.key === selectedType)?.placeholder}
                placeholderTextColor={Colors.textSecondary}
                keyboardType={
                  selectedType === 'email' ? 'email-address' :
                  selectedType === 'mobile' || selectedType === 'abn' ? 'phone-pad' : 'default'
                }
                autoCapitalize="none"
              />
            </View>

            {/* Account Selection */}
            <View style={styles.inputCard}>
              <Text style={styles.inputLabel}>Link to Account</Text>
              {accounts.filter((a) => a.type !== 'loan').map((account) => (
                <Pressable
                  key={account.id}
                  style={[styles.accountRow, selectedAccountId === account.id && styles.accountRowActive]}
                  onPress={() => setSelectedAccountId(account.id)}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={styles.accountName}>{account.name}</Text>
                    <Text style={styles.accountDetails}>{account.bsb} · {account.accountNumber}</Text>
                  </View>
                  {selectedAccountId === account.id && (
                    <Ionicons name="checkmark-circle" size={20} color={Colors.primary} />
                  )}
                </Pressable>
              ))}
            </View>

            {/* PayID Type (Static vs Single-use) */}
            <View style={styles.inputCard}>
              <Text style={styles.inputLabel}>Usage Type</Text>
              <View style={styles.toggleGroup}>
                <Pressable
                  style={[styles.toggleOption, isReusable && styles.toggleOptionActive]}
                  onPress={() => setIsReusable(true)}
                >
                  <Ionicons name="refresh-outline" size={16} color={isReusable ? Colors.white : Colors.textSecondary} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.toggleTitle, isReusable && styles.toggleTitleActive]}>Static (Reusable)</Text>
                    <Text style={[styles.toggleDesc, isReusable && styles.toggleDescActive]}>
                      Can be used to receive multiple payments
                    </Text>
                  </View>
                </Pressable>
                <Pressable
                  style={[styles.toggleOption, !isReusable && styles.toggleOptionActive]}
                  onPress={() => setIsReusable(false)}
                >
                  <Ionicons name="key-outline" size={16} color={!isReusable ? Colors.white : Colors.textSecondary} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.toggleTitle, !isReusable && styles.toggleTitleActive]}>Single-Use</Text>
                    <Text style={[styles.toggleDesc, !isReusable && styles.toggleDescActive]}>
                      Automatically deregistered after one payment
                    </Text>
                  </View>
                </Pressable>
              </View>
            </View>

            {/* Register Button */}
            <Pressable
              style={({ pressed }) => [styles.registerBtn, pressed && { opacity: 0.85 }, isRegistering && { opacity: 0.6 }]}
              onPress={handleRegister}
              disabled={isRegistering}
            >
              {isRegistering ? (
                <ActivityIndicator color={Colors.primary} />
              ) : (
                <>
                  <Ionicons name="checkmark-circle" size={18} color={Colors.primary} />
                  <Text style={styles.registerBtnText}>Register PayID</Text>
                </>
              )}
            </Pressable>
          </View>
        )}

        {/* Info Section */}
        <View style={styles.infoCard}>
          <Ionicons name="information-circle-outline" size={20} color={Colors.info} />
          <View style={{ flex: 1, gap: 6 }}>
            <Text style={styles.infoTitle}>About PayID</Text>
            <Text style={styles.infoText}>
              PayID is a service on the NPP (New Payments Platform) that makes it easier to receive payments.
              Instead of sharing your BSB and account number, you can register a memorable PayID like your email or phone number.
            </Text>
            <Text style={styles.infoText}>
              Anyone can pay you using just your PayID — payments arrive in seconds via Osko®.
            </Text>
          </View>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
    gap: 20,
  },
  demoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFF8E1',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#FFE082',
    borderCurve: 'continuous',
  },
  demoBannerText: {
    fontSize: 12,
    fontFamily: Fonts.medium,
    color: '#F57C00',
    flex: 1,
  },
  section: {
    gap: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontSize: 12,
    fontFamily: Fonts.semiBold,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  addBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 28,
    alignItems: 'center',
    gap: 12,
    borderCurve: 'continuous',
    boxShadow: '0 2px 10px rgba(0, 75, 90, 0.06)',
  },
  emptyIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 16,
    fontFamily: Fonts.bold,
    color: Colors.textPrimary,
  },
  emptySubtitle: {
    fontSize: 13,
    fontFamily: Fonts.regular,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 19,
  },
  emptyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: Colors.background,
    borderCurve: 'continuous',
    marginTop: 4,
  },
  emptyBtnText: {
    fontSize: 14,
    fontFamily: Fonts.semiBold,
    color: Colors.primary,
  },
  payIdCard: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    borderCurve: 'continuous',
    overflow: 'hidden',
    boxShadow: '0 2px 10px rgba(0, 75, 90, 0.06)',
  },
  payIdCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  payIdTypeIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    borderCurve: 'continuous',
  },
  payIdValue: {
    fontSize: 14,
    fontFamily: Fonts.semiBold,
    color: Colors.textPrimary,
  },
  payIdMeta: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  statusActive: {
    backgroundColor: '#E8F5E9',
  },
  statusInactive: {
    backgroundColor: '#FFEBEE',
  },
  statusText: {
    fontSize: 11,
    fontFamily: Fonts.semiBold,
    textTransform: 'capitalize',
  },
  statusTextActive: {
    color: Colors.success,
  },
  statusTextInactive: {
    color: Colors.error,
  },
  payIdCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    marginTop: 4,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  payIdDate: {
    fontSize: 11,
    fontFamily: Fonts.regular,
    color: Colors.textSecondary,
  },
  deregisterBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  deregisterText: {
    fontSize: 12,
    fontFamily: Fonts.semiBold,
    color: Colors.error,
  },
  typeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  typeChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  typeChipText: {
    fontSize: 13,
    fontFamily: Fonts.medium,
    color: Colors.textSecondary,
  },
  typeChipTextActive: {
    color: Colors.white,
    fontFamily: Fonts.semiBold,
  },
  inputCard: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 14,
    gap: 10,
    borderCurve: 'continuous',
    boxShadow: '0 2px 10px rgba(0, 75, 90, 0.06)',
  },
  inputLabel: {
    fontSize: 11,
    fontFamily: Fonts.semiBold,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    fontSize: 15,
    fontFamily: Fonts.regular,
    color: Colors.textPrimary,
    padding: 12,
    backgroundColor: Colors.background,
    borderRadius: 10,
    borderCurve: 'continuous',
  },
  accountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    gap: 12,
    borderCurve: 'continuous',
  },
  accountRowActive: {
    backgroundColor: '#F0F8FA',
  },
  accountName: {
    fontSize: 14,
    fontFamily: Fonts.medium,
    color: Colors.textPrimary,
  },
  accountDetails: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  toggleGroup: {
    gap: 8,
  },
  toggleOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 12,
    backgroundColor: Colors.background,
    borderCurve: 'continuous',
  },
  toggleOptionActive: {
    backgroundColor: Colors.primary,
  },
  toggleTitle: {
    fontSize: 14,
    fontFamily: Fonts.semiBold,
    color: Colors.textPrimary,
  },
  toggleTitleActive: {
    color: Colors.white,
  },
  toggleDesc: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  toggleDescActive: {
    color: 'rgba(255,255,255,0.7)',
  },
  registerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: Colors.accent,
    borderRadius: 14,
    paddingVertical: 16,
    borderCurve: 'continuous',
  },
  registerBtnText: {
    fontSize: 16,
    fontFamily: Fonts.bold,
    color: Colors.primary,
  },
  infoCard: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: Colors.infoBg,
    borderRadius: 14,
    padding: 16,
    borderCurve: 'continuous',
    alignItems: 'flex-start',
  },
  infoTitle: {
    fontSize: 14,
    fontFamily: Fonts.semiBold,
    color: Colors.textPrimary,
  },
  infoText: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    color: Colors.textSecondary,
    lineHeight: 17,
  },
});
