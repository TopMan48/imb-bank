import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Modal,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppStore } from '@/store/useAppStore';
import { Colors } from '@/constants/Colors';
import { Fonts } from '@/constants/Typography';
import type { Account, Transaction } from '@/store/types';

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

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' });
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
              {isCredit ? '+' : '-'}${Math.abs(tx.amount).toFixed(2)}
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

function AccountDetailModal({
  account,
  transactions,
  visible,
  onClose,
}: {
  account: Account;
  transactions: Transaction[];
  visible: boolean;
  onClose: () => void;
}) {
  const insets = useSafeAreaInsets();
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [showTxDetail, setShowTxDetail] = useState(false);

  const txForAccount = transactions
    .filter((t) => t.accountId === account.id)
    .sort((a, b) => b.date.localeCompare(a.date));

  const handleTxPress = (tx: Transaction) => {
    setSelectedTx(tx);
    setShowTxDetail(true);
  };

  return (
    <>
      <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
        <View style={[styles.modalContainer, { paddingBottom: insets.bottom }]}>
          {/* Modal Header */}
          <View style={[styles.modalHeader, { paddingTop: insets.top + 12 }]}>
            <Pressable onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="chevron-down" size={24} color={Colors.primary} />
            </Pressable>
            <Text style={styles.modalTitle}>{account.name}</Text>
            <View style={{ width: 44 }} />
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
            {/* Balance Card */}
            <View style={styles.detailHero}>
              <View style={styles.detailHeroInner}>
                <Text style={styles.detailBalanceLabel}>
                  {account.balance < 0 ? 'Amount Owing' : 'Available Balance'}
                </Text>
                <Text style={styles.detailBalance}>
                  ${Math.abs(account.balance).toLocaleString('en-AU', { minimumFractionDigits: 2 })}
                </Text>
                <View style={styles.detailMeta}>
                  <View style={styles.detailMetaItem}>
                    <Text style={styles.detailMetaLabel}>BSB</Text>
                    <Text style={styles.detailMetaValue} selectable>{account.bsb}</Text>
                  </View>
                  <View style={styles.detailMetaDivider} />
                  <View style={styles.detailMetaItem}>
                    <Text style={styles.detailMetaLabel}>Account</Text>
                    <Text style={styles.detailMetaValue} selectable>{account.accountNumber}</Text>
                  </View>
                  {account.interestRate && (
                    <>
                      <View style={styles.detailMetaDivider} />
                      <View style={styles.detailMetaItem}>
                        <Text style={styles.detailMetaLabel}>Interest</Text>
                        <Text style={styles.detailMetaValue}>{account.interestRate}% p.a.</Text>
                      </View>
                    </>
                  )}
                </View>
              </View>
            </View>

            {/* Quick Actions */}
            <View style={styles.detailActions}>
              {([
                { label: 'Transfer', icon: 'swap-horizontal-outline' as const },
                { label: 'Pay', icon: 'send-outline' as const },
                { label: 'BPAY', icon: 'barcode-outline' as const },
              ]).map((action) => (
                <Pressable
                  key={action.label}
                  style={({ pressed }) => [styles.detailAction, pressed && { opacity: 0.7 }]}
                  onPress={() => {
                    onClose();
                    router.push('/(main)/pay');
                  }}
                >
                  <View style={styles.detailActionIcon}>
                    <Ionicons name={action.icon} size={20} color={Colors.primary} />
                  </View>
                  <Text style={styles.detailActionLabel}>{action.label}</Text>
                </Pressable>
              ))}
            </View>

            {/* Transactions */}
            <View style={styles.txSection}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                <Text style={styles.txSectionTitle}>Transactions</Text>
                <Pressable onPress={() => { onClose(); router.push('/settings/transaction-history'); }}>
                  <Text style={{ fontSize: 13, fontFamily: Fonts.medium, color: Colors.primary }}>View all</Text>
                </Pressable>
              </View>
              {txForAccount.length === 0 ? (
                <View style={styles.emptyState}>
                  <Ionicons name="receipt-outline" size={40} color={Colors.textSecondary} />
                  <Text style={styles.emptyStateText}>No transactions yet</Text>
                </View>
              ) : (
                <View style={{ backgroundColor: Colors.white, borderRadius: 16, overflow: 'hidden', borderCurve: 'continuous', boxShadow: '0 2px 8px rgba(0,75,90,0.06)' }}>
                  {txForAccount.map((tx, index) => {
                    const cat = CATEGORY_ICONS[tx.category] ?? CATEGORY_ICONS.other;
                    const isCredit = tx.type === 'credit';
                    return (
                      <Pressable
                        key={tx.id}
                        style={({ pressed }) => [styles.txRow, pressed && { backgroundColor: Colors.background }, index === txForAccount.length - 1 && { borderBottomWidth: 0 }]}
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
                          {isCredit ? '+' : ''}${Math.abs(tx.amount).toFixed(2)}
                        </Text>
                        <Ionicons name="chevron-forward" size={14} color={Colors.textSecondary} />
                      </Pressable>
                    );
                  })}
                </View>
              )}
            </View>
          </ScrollView>
        </View>
      </Modal>
      <TransactionDetailModal
        tx={selectedTx}
        visible={showTxDetail}
        onClose={() => setShowTxDetail(false)}
      />
    </>
  );
}

export default function AccountsScreen() {
  const insets = useSafeAreaInsets();
  const accounts = useAppStore((s) => s.accounts);
  const transactions = useAppStore((s) => s.transactions);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);

  const totalAssets = accounts
    .filter((a) => a.balance > 0)
    .reduce((sum, a) => sum + a.balance, 0);

  const totalLiabilities = accounts
    .filter((a) => a.balance < 0)
    .reduce((sum, a) => sum + Math.abs(a.balance), 0);

  const accountTypeLabel: Record<string, string> = {
    everyday: 'Transaction',
    savings: 'Savings',
    'term-deposit': 'Term Deposit',
    loan: 'Home Loan',
  };

  const accountTypeColor: Record<string, string> = {
    everyday: '#E3F2FD',
    savings: '#E8F5E9',
    'term-deposit': '#FFF9C4',
    loan: '#FFF3E0',
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Accounts</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Net Worth Summary */}
        <View style={styles.netWorthCard}>
          <Text style={styles.netWorthLabel}>Net Position</Text>
          <Text style={styles.netWorthAmount}>
            ${(totalAssets - totalLiabilities).toLocaleString('en-AU', { minimumFractionDigits: 2 })}
          </Text>
          <View style={styles.netWorthRow}>
            <View style={styles.netWorthItem}>
              <View style={[styles.netWorthDot, { backgroundColor: Colors.success }]} />
              <Text style={styles.netWorthItemLabel}>Assets</Text>
              <Text style={styles.netWorthItemValue}>
                ${totalAssets.toLocaleString('en-AU', { minimumFractionDigits: 2 })}
              </Text>
            </View>
            <View style={styles.netWorthDivider} />
            <View style={styles.netWorthItem}>
              <View style={[styles.netWorthDot, { backgroundColor: Colors.warning }]} />
              <Text style={styles.netWorthItemLabel}>Owing</Text>
              <Text style={styles.netWorthItemValue}>
                ${totalLiabilities.toLocaleString('en-AU', { minimumFractionDigits: 2 })}
              </Text>
            </View>
          </View>
        </View>

        {/* Account Cards */}
        {accounts.map((account) => (
          <Pressable
            key={account.id}
            style={({ pressed }) => [styles.accountCard, pressed && { opacity: 0.9 }]}
            onPress={() => setSelectedAccount(account)}
          >
            <View style={styles.accountCardTop}>
              <View style={[styles.accountTypeChip, { backgroundColor: accountTypeColor[account.type] }]}>
                <Text style={styles.accountTypeLabel}>{accountTypeLabel[account.type]}</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={Colors.textSecondary} />
            </View>
            <Text style={styles.accountName}>{account.name}</Text>
            <Text style={[
              styles.accountBalance,
              account.balance < 0 && { color: Colors.error }
            ]}>
              {account.balance < 0 ? '-' : ''}${Math.abs(account.balance).toLocaleString('en-AU', { minimumFractionDigits: 2 })}
            </Text>
            <View style={styles.accountCardBottom}>
              <Text style={styles.accountMeta}>{account.bsb} · {account.accountNumber}</Text>
              {account.interestRate && (
                <Text style={styles.accountRate}>{account.interestRate}% p.a.</Text>
              )}
            </View>
          </Pressable>
        ))}

        {/* Open Account CTA */}
        <Pressable
          style={({ pressed }) => [styles.openAccountBtn, pressed && { opacity: 0.8 }]}
          onPress={() => Alert.alert('Open New Account', 'To open a new account, please visit your nearest IMB Bank branch or call us on 133 462.')}
        >
          <Ionicons name="add-circle-outline" size={20} color={Colors.primary} />
          <Text style={styles.openAccountText}>Open a new account</Text>
          <Ionicons name="chevron-forward" size={16} color={Colors.primary} />
        </Pressable>
      </ScrollView>

      {selectedAccount && (
        <AccountDetailModal
          account={selectedAccount}
          transactions={transactions}
          visible={!!selectedAccount}
          onClose={() => setSelectedAccount(null)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  headerTitle: {
    fontSize: 22,
    fontFamily: Fonts.bold,
    color: Colors.textPrimary,
  },
  content: {
    padding: 20,
    gap: 16,
    paddingBottom: 40,
  },
  netWorthCard: {
    backgroundColor: Colors.primary,
    borderRadius: 20,
    padding: 22,
    borderCurve: 'continuous',
    boxShadow: '0 8px 24px rgba(0, 75, 90, 0.25)',
  },
  netWorthLabel: {
    fontSize: 13,
    fontFamily: Fonts.regular,
    color: 'rgba(255,255,255,0.65)',
    marginBottom: 4,
  },
  netWorthAmount: {
    fontSize: 34,
    fontFamily: Fonts.bold,
    color: Colors.white,
    marginBottom: 18,
    letterSpacing: -0.5,
  },
  netWorthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
    padding: 14,
    gap: 12,
  },
  netWorthItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  netWorthDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  netWorthItemLabel: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    color: 'rgba(255,255,255,0.65)',
    flex: 1,
  },
  netWorthItemValue: {
    fontSize: 13,
    fontFamily: Fonts.semiBold,
    color: Colors.white,
    fontVariant: ['tabular-nums'],
  },
  netWorthDivider: {
    width: 1,
    height: 28,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  accountCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 18,
    gap: 6,
    borderCurve: 'continuous',
    boxShadow: '0 2px 10px rgba(0, 75, 90, 0.06)',
  },
  accountCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  accountTypeChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  accountTypeLabel: {
    fontSize: 11,
    fontFamily: Fonts.semiBold,
    color: Colors.primary,
    letterSpacing: 0.3,
  },
  accountName: {
    fontSize: 16,
    fontFamily: Fonts.semiBold,
    color: Colors.textPrimary,
  },
  accountBalance: {
    fontSize: 28,
    fontFamily: Fonts.bold,
    color: Colors.textPrimary,
    letterSpacing: -0.5,
    fontVariant: ['tabular-nums'],
  },
  accountCardBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  accountMeta: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    color: Colors.textSecondary,
  },
  accountRate: {
    fontSize: 12,
    fontFamily: Fonts.semiBold,
    color: Colors.success,
  },
  openAccountBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 16,
    borderWidth: 2,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    borderCurve: 'continuous',
  },
  openAccountText: {
    flex: 1,
    fontSize: 15,
    fontFamily: Fonts.medium,
    color: Colors.primary,
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  closeBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    flex: 1,
    fontSize: 17,
    fontFamily: Fonts.semiBold,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  detailHero: {
    backgroundColor: Colors.primary,
    margin: 20,
    borderRadius: 20,
    overflow: 'hidden',
    borderCurve: 'continuous',
    boxShadow: '0 8px 24px rgba(0, 75, 90, 0.25)',
  },
  detailHeroInner: {
    padding: 24,
  },
  detailBalanceLabel: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    color: 'rgba(255,255,255,0.65)',
    marginBottom: 6,
  },
  detailBalance: {
    fontSize: 36,
    fontFamily: Fonts.bold,
    color: Colors.white,
    letterSpacing: -0.5,
    marginBottom: 20,
    fontVariant: ['tabular-nums'],
  },
  detailMeta: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 14,
    gap: 12,
  },
  detailMetaItem: {
    flex: 1,
    gap: 3,
  },
  detailMetaLabel: {
    fontSize: 11,
    fontFamily: Fonts.regular,
    color: 'rgba(255,255,255,0.55)',
  },
  detailMetaValue: {
    fontSize: 13,
    fontFamily: Fonts.semiBold,
    color: Colors.white,
  },
  detailMetaDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  detailActions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 20,
  },
  detailAction: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    gap: 8,
    borderCurve: 'continuous',
    boxShadow: '0 2px 8px rgba(0, 75, 90, 0.06)',
  },
  detailActionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailActionLabel: {
    fontSize: 12,
    fontFamily: Fonts.medium,
    color: Colors.textPrimary,
  },
  txSection: {
    paddingHorizontal: 20,
    gap: 12,
  },
  txSectionTitle: {
    fontSize: 17,
    fontFamily: Fonts.semiBold,
    color: Colors.textPrimary,
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
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 12,
    backgroundColor: Colors.white,
    borderRadius: 16,
    borderCurve: 'continuous',
  },
  emptyStateText: {
    fontSize: 15,
    fontFamily: Fonts.regular,
    color: Colors.textSecondary,
  },
});
