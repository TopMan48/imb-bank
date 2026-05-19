import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
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

function formatCurrency(amount: number, showSign = false): string {
  const abs = Math.abs(amount);
  const formatted = abs >= 1000
    ? `$${(abs / 1000).toFixed(1)}k`
    : `$${abs.toFixed(2)}`;
  if (showSign && amount > 0) return `+${formatted}`;
  if (amount < 0) return `-${formatted}`;
  return formatted;
}

function TransactionRow({ tx }: { tx: Transaction }) {
  const cat = CATEGORY_ICONS[tx.category] ?? CATEGORY_ICONS.other;
  const isCredit = tx.type === 'credit';
  return (
    <View style={styles.txRow}>
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
    </View>
  );
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

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const accounts = useAppStore((s) => s.accounts);
  const transactions = useAppStore((s) => s.transactions);
  const setAuthenticated = useAppStore((s) => s.setAuthenticated);
  const [balanceVisible, setBalanceVisible] = useState(true);

  const primaryAccount = accounts.find((a) => a.type === 'everyday') ?? accounts[0];
  const recentTx = transactions
    .filter((t) => t.accountId === primaryAccount?.id)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5);

  const totalBalance = accounts.reduce((sum, a) => sum + (a.balance > 0 ? a.balance : 0), 0);

  const handleSignOut = () => {
    setAuthenticated(false);
    router.replace('/');
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Good morning,</Text>
          <Text style={styles.userName}>Alex Johnson</Text>
        </View>
        <View style={styles.headerRight}>
          <Pressable style={styles.headerBtn}>
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
        {/* Balance Hero Card */}
        <View style={styles.heroCard}>
          <View style={styles.heroCardInner}>
            <View style={styles.balanceRow}>
              <Text style={styles.balanceLabel}>Total Balance</Text>
              <Pressable
                onPress={() => setBalanceVisible((v) => !v)}
                hitSlop={12}
              >
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
          {/* Decorative circles */}
          <View style={styles.circle1} />
          <View style={styles.circle2} />
        </View>

        {/* Quick Actions */}
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
            >
              <View style={styles.quickActionIcon}>
                <Ionicons name={action.icon} size={22} color={Colors.primary} />
              </View>
              <Text style={styles.quickActionLabel}>{action.label}</Text>
            </Pressable>
          ))}
        </View>

        {/* Accounts Section */}
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
              onPress={() => router.push(`/(main)/accounts`)}
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

        {/* Recent Transactions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Transactions</Text>
            <Pressable onPress={() => router.push('/(main)/accounts')}>
              <Text style={styles.seeAll}>See all</Text>
            </Pressable>
          </View>

          <View style={styles.txList}>
            {recentTx.map((tx) => (
              <TransactionRow key={tx.id} tx={tx} />
            ))}
          </View>
        </View>

        {/* Promo Banner */}
        <View style={styles.promoBanner}>
          <View style={styles.promoContent}>
            <Text style={styles.promoTitle}>Get up to</Text>
            <Text style={styles.promoHighlight}>$3,000 cashback</Text>
            <Text style={styles.promoDesc}>On new purchase or refinance home loans</Text>
            <Pressable style={styles.promoBtn}>
              <Text style={styles.promoBtnText}>Find out more</Text>
              <Ionicons name="arrow-forward" size={14} color={Colors.primary} />
            </Pressable>
          </View>
          <View style={styles.promoCircle} />
        </View>
      </ScrollView>
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
