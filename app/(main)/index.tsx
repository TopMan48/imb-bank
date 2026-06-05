import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Modal,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppStore } from '@/store/useAppStore';
import { Colors } from '@/constants/Colors';
import { Fonts } from '@/constants/Typography';
import type { Transaction } from '@/store/types';

const CATEGORY_ICONS: Record<string, { icon: keyof typeof Ionicons.glyphMap; bg: string }> = {
  shopping: { icon: 'bag-outline', bg: '#E8F5E9' },
  food: { icon: 'fast-food-outline', bg: '#FFF3E0' },
  transport: { icon: 'car-outline', bg: '#E3F2FD' },
  utilities: { icon: 'flash-outline', bg: '#FFF9C4' },
  health: { icon: 'medkit-outline', bg: '#FCE4EC' },
  entertainment: { icon: 'musical-notes-outline', bg: '#F3E5F5' },
  transfer: { icon: 'swap-horizontal-outline', bg: '#E0F2F1' },
  income: { icon: 'trending-up-outline', bg: '#E8F5E9' },
  other: { icon: 'ellipsis-horizontal-outline', bg: '#ECEFF1' },
};

function formatCurrency(amount: number): string {
  const abs = Math.abs(amount);
  const formatted = `$${abs.toFixed(2)}`;
  if (amount < 0) return `-${formatted}`;
  return formatted;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return 'Today';
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' });
}

function formatLoginTime(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  if (diffMins < 2) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' });
}

function TransactionDetailModal({ tx, visible, onClose }: { tx: Transaction | null; visible: boolean; onClose: () => void }) {
  if (!tx) return null;
  const cat = CATEGORY_ICONS[tx.category] ?? CATEGORY_ICONS.other;
  const isCredit = tx.type === 'credit';

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="formSheet" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: Colors.background }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', padding: 20, paddingTop: 24, backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.borderLight }}>
          <Text style={{ flex: 1, fontSize: 18, fontFamily: Fonts.bold, color: Colors.textPrimary }}>Transaction Details</Text>
          <Pressable onPress={onClose} style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name="close" size={20} color={Colors.textSecondary} />
          </Pressable>
        </View>
        <ScrollView contentContainerStyle={{ padding: 20, gap: 16 }}>
          <View style={{ alignItems: 'center', gap: 12, paddingVertical: 12 }}>
            <View style={[{ width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center' }, { backgroundColor: cat.bg }]}>
              <Ionicons name={cat.icon} size={28} color={Colors.primary} />
            </View>
            <Text style={{ fontSize: 30, fontFamily: Fonts.bold, color: isCredit ? Colors.success : Colors.textPrimary }}>
              {isCredit ? '+' : '-'}{formatCurrency(Math.abs(tx.amount))}
            </Text>
            <Text style={{ fontSize: 16, fontFamily: Fonts.semiBold, color: Colors.textPrimary }}>
              {tx.merchant ?? tx.description}
            </Text>
          </View>
          <View style={{ backgroundColor: Colors.white, borderRadius: 16, overflow: 'hidden', borderCurve: 'continuous', boxShadow: '0 2px 10px rgba(0,75,90,0.06)' }}>
            {[
              { label: 'Date', value: new Date(tx.date).toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' }) },
              { label: 'Category', value: tx.category.charAt(0).toUpperCase() + tx.category.slice(1) },
              tx.paymentMethod ? { label: 'Method', value: tx.paymentMethod.toUpperCase() } : null,
              tx.recipientName ? { label: 'To/From', value: tx.recipientName } : null,
              tx.reference ? { label: 'Reference', value: tx.reference } : null,
              { label: 'Status', value: 'Settled' },
            ].filter(Boolean).map((row, idx, arr) => (
              <View key={row!.label} style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 14, borderBottomWidth: idx === arr.length - 1 ? 0 : 1, borderBottomColor: Colors.borderLight }}>
                <Text style={{ fontSize: 14, fontFamily: Fonts.regular, color: Colors.textSecondary }}>{row!.label}</Text>
                <Text style={{ fontSize: 14, fontFamily: Fonts.semiBold, color: Colors.textPrimary }} selectable>{row!.value}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const accounts = useAppStore((s) => s.accounts);
  const transactions = useAppStore((s) => s.transactions);
  const setAuthenticated = useAppStore((s) => s.setAuthenticated);
  const profile = useAppStore((s) => s.profile);
  const loginActivity = useAppStore((s) => s.loginActivity);
  const preferences = useAppStore((s) => s.preferences);
  const dismissBanner = useAppStore((s) => s.dismissBanner);

  const [balanceVisible, setBalanceVisible] = useState(true);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [showTxDetail, setShowTxDetail] = useState(false);

  const primaryAccount = accounts.find((a) => a.type === 'everyday') ?? accounts[0];
  const recentTx = transactions
    .filter((t) => t.accountId === primaryAccount?.id)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5);

  const totalBalance = accounts.reduce((sum, a) => sum + (a.balance > 0 ? a.balance : 0), 0);

  const recentLogins = loginActivity
    .filter((a) => a.successful)
    .slice(0, 3);

  const greetingHour = new Date().getHours();
  const greeting = greetingHour < 12 ? 'Good morning,' : greetingHour < 18 ? 'Good afternoon,' : 'Good evening,';

  const scamAlertDismissed = preferences.dismissedBanners?.includes('scam-alert-2026');
  const maintenanceDismissed = preferences.dismissedBanners?.includes('maintenance-2026');

  const handleSignOut = () => {
    setAuthenticated(false);
    router.replace('/');
  };

  const handleTxPress = (tx: Transaction) => {
    setSelectedTx(tx);
    setShowTxDetail(true);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>{greeting}</Text>
          <Text style={styles.userName}>{profile.firstName} {profile.lastName}</Text>
        </View>
        <View style={styles.headerRight}>
          <Pressable style={styles.headerBtn} onPress={() => router.push('/settings/notifications')}>
            <Ionicons name="notifications-outline" size={22} color={Colors.primary} />
          </Pressable>
          <Pressable style={styles.headerBtn} onPress={handleSignOut}>
            <Ionicons name="log-out-outline" size={22} color={Colors.primary} />
          </Pressable>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* ── Scam Alert Banner ──────────────────────────────────────────── */}
        {!scamAlertDismissed && (
          <View style={styles.alertBanner}>
            <Ionicons name="warning" size={18} color="#B71C1C" />
            <View style={{ flex: 1 }}>
              <Text style={styles.alertTitle}>Scam Alert</Text>
              <Text style={styles.alertText}>
                IMB Bank will never ask for your passcode or full card number via SMS or phone. Report scams at imb.com.au/security.
              </Text>
              <Pressable onPress={() => router.push('/settings/report-scam')}>
                <Text style={styles.alertLink}>Report a scam →</Text>
              </Pressable>
            </View>
            <Pressable onPress={() => dismissBanner('scam-alert-2026')} hitSlop={12}>
              <Ionicons name="close" size={18} color="#B71C1C" />
            </Pressable>
          </View>
        )}

        {/* ── Maintenance Notice ─────────────────────────────────────────── */}
        {!maintenanceDismissed && (
          <View style={styles.maintenanceBanner}>
            <Ionicons name="information-circle" size={18} color={Colors.info} />
            <View style={{ flex: 1 }}>
              <Text style={styles.maintenanceTitle}>Service Update</Text>
              <Text style={styles.maintenanceText}>
                Scheduled maintenance Sunday 8 June, 2–4am AEST. Pay Anyone and BPAY may be temporarily unavailable.
              </Text>
            </View>
            <Pressable onPress={() => dismissBanner('maintenance-2026')} hitSlop={12}>
              <Ionicons name="close" size={18} color={Colors.info} />
            </Pressable>
          </View>
        )}

        {/* ── Balance Hero Card ──────────────────────────────────────────── */}
        <View style={styles.heroCard}>
          <View style={styles.heroCardInner}>
            <View style={styles.balanceRow}>
              <Text style={styles.balanceLabel}>Total Balance</Text>
              <Pressable onPress={() => setBalanceVisible((v) => !v)} hitSlop={12}>
                <Ionicons
                  name={balanceVisible ? 'eye-outline' : 'eye-off-outline'}
                  size={18}
                  color="rgba(255,255,255,0.7)"
                />
              </Pressable>
            </View>
            <Text style={styles.balanceAmount}>
              {balanceVisible ? `$${totalBalance.toLocaleString('en-AU', { minimumFractionDigits: 2 })}` : '••••••'}
            </Text>
            <Text style={styles.balanceDate}>As at {new Date().toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })}</Text>
          </View>
          <View style={styles.circle1} />
          <View style={styles.circle2} />
        </View>

        {/* ── Quick Actions ──────────────────────────────────────────────── */}
        <View style={styles.quickActions}>
          {[
            { label: 'Pay', icon: 'send-outline' as const, onPress: () => router.push('/(main)/pay') },
            { label: 'Transfer', icon: 'swap-horizontal-outline' as const, onPress: () => router.push('/(main)/pay') },
            { label: 'BPAY', icon: 'barcode-outline' as const, onPress: () => router.push('/(main)/pay') },
            { label: 'More', icon: 'grid-outline' as const, onPress: () => router.push('/(main)/more') },
          ].map((action) => (
            <Pressable
              key={action.label}
              style={({ pressed }) => [styles.quickAction, pressed && { opacity: 0.7 }]}
              onPress={action.onPress}
              accessibilityRole="button"
              accessibilityLabel={action.label}
            >
              <View style={styles.quickActionIcon}>
                <Ionicons name={action.icon} size={22} color={Colors.primary} />
              </View>
              <Text style={styles.quickActionLabel}>{action.label}</Text>
            </Pressable>
          ))}
        </View>

        {/* ── Accounts Section ───────────────────────────────────────────── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>My Accounts</Text>
            <Pressable onPress={() => router.push('/(main)/accounts')}>
              <Text style={styles.seeAll}>See all</Text>
            </Pressable>
          </View>

          {accounts.map((account) => (
            <Pressable
              key={account.id}
              style={({ pressed }) => [styles.accountCard, pressed && { opacity: 0.9 }]}
              onPress={() => router.push('/(main)/accounts')}
            >
              <View style={[styles.accountIcon, {
                backgroundColor: account.type === 'loan' ? '#FFF3E0' : account.type === 'savings' ? '#E8F5E9' : '#E3F2FD',
              }]}>
                <Ionicons
                  name={account.type === 'loan' ? 'home-outline' : account.type === 'savings' ? 'leaf-outline' : 'card-outline'}
                  size={20}
                  color={Colors.primary}
                />
              </View>
              <View style={styles.accountInfo}>
                <Text style={styles.accountName}>{account.name}</Text>
                <Text style={styles.accountNumber}>{account.bsb} · {account.accountNumber}</Text>
              </View>
              <View style={styles.accountBalance}>
                <Text style={[styles.accountBalanceAmount, account.balance < 0 && { color: Colors.error }]}>
                  {balanceVisible
                    ? `$${Math.abs(account.balance).toLocaleString('en-AU', { minimumFractionDigits: 2 })}`
                    : '••••'}
                </Text>
                {account.interestRate && (
                  <Text style={styles.accountRate}>{account.interestRate}% p.a.</Text>
                )}
              </View>
              <Ionicons name="chevron-forward" size={16} color={Colors.textSecondary} />
            </Pressable>
          ))}
        </View>

        {/* ── Recent Transactions ────────────────────────────────────────── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Transactions</Text>
            <Pressable onPress={() => router.push('/settings/transaction-history')}>
              <Text style={styles.seeAll}>View all</Text>
            </Pressable>
          </View>

          {recentTx.length === 0 ? (
            <View style={[styles.txList, { padding: 24, alignItems: 'center', gap: 8 }]}>
              <Ionicons name="receipt-outline" size={32} color={Colors.textSecondary} />
              <Text style={{ fontSize: 14, fontFamily: Fonts.regular, color: Colors.textSecondary }}>No recent transactions</Text>
            </View>
          ) : (
            <View style={styles.txList}>
              {recentTx.map((tx, index) => {
                const cat = CATEGORY_ICONS[tx.category] ?? CATEGORY_ICONS.other;
                const isCredit = tx.type === 'credit';
                return (
                  <Pressable
                    key={tx.id}
                    style={({ pressed }) => [styles.txRow, pressed && { backgroundColor: Colors.background }, index === recentTx.length - 1 && { borderBottomWidth: 0 }]}
                    onPress={() => handleTxPress(tx)}
                  >
                    <View style={[styles.txIcon, { backgroundColor: cat.bg }]}>
                      <Ionicons name={cat.icon} size={18} color={Colors.primary} />
                    </View>
                    <View style={styles.txInfo}>
                      <Text style={styles.txName} numberOfLines={1}>
                        {tx.merchant ?? tx.description}
                      </Text>
                      <Text style={styles.txDate}>{formatDate(tx.date)}</Text>
                    </View>
                    <Text style={[styles.txAmount, isCredit ? styles.txCredit : styles.txDebit]}>
                      {isCredit ? '+' : ''}{formatCurrency(tx.amount)}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          )}
        </View>

        {/* ── Recent Login Activity ──────────────────────────────────────── */}
        {recentLogins.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Login Activity</Text>
              <Pressable onPress={() => router.push('/settings/login-activity')}>
                <Text style={styles.seeAll}>View all</Text>
              </Pressable>
            </View>
            <View style={styles.loginCard}>
              {recentLogins.map((login, index) => (
                <View key={login.id} style={[styles.loginRow, index === recentLogins.length - 1 && { borderBottomWidth: 0 }]}>
                  <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#E8F5E9', alignItems: 'center', justifyContent: 'center' }}>
                    <Ionicons name="shield-checkmark-outline" size={18} color={Colors.success} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.loginDevice}>{login.device}</Text>
                    <Text style={styles.loginMeta}>{login.location}</Text>
                  </View>
                  <Text style={styles.loginTime}>{formatLoginTime(login.timestamp)}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* ── Promo Banner ───────────────────────────────────────────────── */}
        <View style={styles.promoBanner}>
          <View style={styles.promoContent}>
            <Text style={styles.promoTitle}>Get up to</Text>
            <Text style={styles.promoHighlight}>$3,000 cashback</Text>
            <Text style={styles.promoDesc}>On new purchase or refinance home loans</Text>
            <Pressable
              style={styles.promoBtn}
              onPress={() => router.push('/settings/about')}
            >
              <Text style={styles.promoBtnText}>Find out more</Text>
              <Ionicons name="arrow-forward" size={14} color={Colors.primary} />
            </Pressable>
          </View>
          <View style={styles.promoCircle} />
        </View>
      </ScrollView>

      <TransactionDetailModal
        tx={selectedTx}
        visible={showTxDetail}
        onClose={() => setShowTxDetail(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  greeting: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    color: Colors.textSecondary,
  },
  userName: {
    fontSize: 18,
    fontFamily: Fonts.bold,
    color: Colors.textPrimary,
  },
  headerRight: {
    flexDirection: 'row',
    gap: 4,
  },
  headerBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
  },
  content: {
    padding: 20,
    gap: 20,
    paddingBottom: 32,
  },
  // ── Alert banners ────────────────────────────────────────────────────────────
  alertBanner: {
    backgroundColor: '#FFEBEE',
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: '#FFCDD2',
    borderCurve: 'continuous',
  },
  alertTitle: {
    fontSize: 13,
    fontFamily: Fonts.semiBold,
    color: '#B71C1C',
    marginBottom: 3,
  },
  alertText: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    color: '#C62828',
    lineHeight: 17,
  },
  alertLink: {
    fontSize: 12,
    fontFamily: Fonts.semiBold,
    color: '#B71C1C',
    marginTop: 6,
  },
  maintenanceBanner: {
    backgroundColor: '#E3F2FD',
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: '#BBDEFB',
    borderCurve: 'continuous',
  },
  maintenanceTitle: {
    fontSize: 13,
    fontFamily: Fonts.semiBold,
    color: Colors.info,
    marginBottom: 3,
  },
  maintenanceText: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    color: Colors.info,
    lineHeight: 17,
  },
  // ── Hero card ────────────────────────────────────────────────────────────────
  heroCard: {
    backgroundColor: Colors.primary,
    borderRadius: 20,
    overflow: 'hidden',
    borderCurve: 'continuous',
    boxShadow: '0 8px 24px rgba(0, 75, 90, 0.25)',
  },
  heroCardInner: {
    padding: 24,
    zIndex: 2,
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  balanceLabel: {
    fontSize: 13,
    fontFamily: Fonts.regular,
    color: 'rgba(255,255,255,0.7)',
  },
  balanceAmount: {
    fontSize: 36,
    fontFamily: Fonts.bold,
    color: Colors.white,
    letterSpacing: -0.5,
  },
  balanceDate: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 4,
  },
  circle1: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(255,255,255,0.05)',
    right: -40,
    top: -40,
  },
  circle2: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(200,230,74,0.12)',
    right: 40,
    bottom: -30,
  },
  // ── Quick actions ─────────────────────────────────────────────────────────────
  quickActions: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    justifyContent: 'space-around',
    borderCurve: 'continuous',
    boxShadow: '0 2px 10px rgba(0, 75, 90, 0.06)',
  },
  quickAction: {
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionLabel: {
    fontSize: 12,
    fontFamily: Fonts.medium,
    color: Colors.textPrimary,
  },
  // ── Sections ─────────────────────────────────────────────────────────────────
  section: {
    gap: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontSize: 17,
    fontFamily: Fonts.semiBold,
    color: Colors.textPrimary,
  },
  seeAll: {
    fontSize: 13,
    fontFamily: Fonts.medium,
    color: Colors.primary,
  },
  // ── Accounts ─────────────────────────────────────────────────────────────────
  accountCard: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderCurve: 'continuous',
    boxShadow: '0 2px 8px rgba(0, 75, 90, 0.06)',
  },
  accountIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderCurve: 'continuous',
  },
  accountInfo: {
    flex: 1,
  },
  accountName: {
    fontSize: 14,
    fontFamily: Fonts.semiBold,
    color: Colors.textPrimary,
  },
  accountNumber: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  accountBalance: {
    alignItems: 'flex-end',
  },
  accountBalanceAmount: {
    fontSize: 15,
    fontFamily: Fonts.semiBold,
    color: Colors.textPrimary,
    fontVariant: ['tabular-nums'],
  },
  accountRate: {
    fontSize: 11,
    fontFamily: Fonts.regular,
    color: Colors.success,
    marginTop: 2,
  },
  // ── Transactions ──────────────────────────────────────────────────────────────
  txList: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    overflow: 'hidden',
    borderCurve: 'continuous',
    boxShadow: '0 2px 8px rgba(0, 75, 90, 0.06)',
  },
  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    minHeight: 60,
  },
  txIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  txInfo: {
    flex: 1,
  },
  txName: {
    fontSize: 14,
    fontFamily: Fonts.medium,
    color: Colors.textPrimary,
  },
  txDate: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  txAmount: {
    fontSize: 14,
    fontFamily: Fonts.semiBold,
    fontVariant: ['tabular-nums'],
  },
  txCredit: {
    color: Colors.success,
  },
  txDebit: {
    color: Colors.textPrimary,
  },
  // ── Login activity ────────────────────────────────────────────────────────────
  loginCard: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    overflow: 'hidden',
    borderCurve: 'continuous',
    boxShadow: '0 2px 8px rgba(0, 75, 90, 0.06)',
  },
  loginRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  loginDevice: {
    fontSize: 13,
    fontFamily: Fonts.medium,
    color: Colors.textPrimary,
  },
  loginMeta: {
    fontSize: 11,
    fontFamily: Fonts.regular,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  loginTime: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    color: Colors.textSecondary,
  },
  // ── Promo ─────────────────────────────────────────────────────────────────────
  promoBanner: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    padding: 22,
    overflow: 'hidden',
    borderCurve: 'continuous',
    flexDirection: 'row',
  },
  promoContent: {
    flex: 1,
    zIndex: 2,
  },
  promoTitle: {
    fontSize: 13,
    fontFamily: Fonts.regular,
    color: 'rgba(255,255,255,0.7)',
  },
  promoHighlight: {
    fontSize: 22,
    fontFamily: Fonts.bold,
    color: Colors.accent,
    marginBottom: 4,
  },
  promoDesc: {
    fontSize: 13,
    fontFamily: Fonts.regular,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 14,
  },
  promoBtn: {
    backgroundColor: Colors.accent,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  promoBtnText: {
    fontSize: 13,
    fontFamily: Fonts.semiBold,
    color: Colors.primary,
  },
  promoCircle: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255,255,255,0.05)',
    right: -30,
    bottom: -30,
  },
});
