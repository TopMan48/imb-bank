import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, Pressable, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '@/store/useAppStore';
import { Colors } from '@/constants/Colors';
import { Fonts } from '@/constants/Typography';
import type { Transaction } from '@/store/types';

const CATEGORY_ICONS: Record<Transaction['category'], keyof typeof Ionicons.glyphMap> = {
  shopping: 'bag-outline',
  food: 'restaurant-outline',
  transport: 'car-outline',
  utilities: 'flash-outline',
  health: 'medkit-outline',
  entertainment: 'film-outline',
  transfer: 'swap-horizontal-outline',
  income: 'trending-up-outline',
  other: 'ellipse-outline',
};

const CATEGORY_COLORS: Record<Transaction['category'], string> = {
  shopping: '#E91E63',
  food: '#FF9800',
  transport: '#2196F3',
  utilities: '#9C27B0',
  health: '#4CAF50',
  entertainment: '#F44336',
  transfer: '#607D8B',
  income: '#4CAF50',
  other: '#9E9E9E',
};

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  bsb: 'BSB Transfer',
  payid: 'PayID / Osko',
  bpay: 'BPAY',
  swift: 'International',
  internal: 'Internal Transfer',
  payto: 'PayTo',
};

type DateFilter = 'all' | '7d' | '30d' | '90d';
type TypeFilter = 'all' | 'debit' | 'credit';

export default function TransactionHistoryScreen() {
  const { accounts, transactions } = useAppStore();
  const [selectedAccountId, setSelectedAccountId] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<DateFilter>('30d');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [searchText, setSearchText] = useState('');

  const filtered = useMemo(() => {
    const now = new Date('2026-05-21');
    const cutoffs: Record<DateFilter, number> = {
      all: 0,
      '7d': 7,
      '30d': 30,
      '90d': 90,
    };

    return transactions.filter((tx) => {
      if (selectedAccountId !== 'all' && tx.accountId !== selectedAccountId) return false;
      if (typeFilter !== 'all' && tx.type !== typeFilter) return false;
      if (dateFilter !== 'all') {
        const txDate = new Date(tx.date);
        const diffDays = (now.getTime() - txDate.getTime()) / (1000 * 60 * 60 * 24);
        if (diffDays > cutoffs[dateFilter]) return false;
      }
      if (searchText) {
        const lower = searchText.toLowerCase();
        return (
          tx.description.toLowerCase().includes(lower) ||
          (tx.merchant ?? '').toLowerCase().includes(lower) ||
          (tx.recipientName ?? '').toLowerCase().includes(lower)
        );
      }
      return true;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, selectedAccountId, dateFilter, typeFilter, searchText]);

  const totalDebit = filtered.filter((t) => t.type === 'debit').reduce((s, t) => s + Math.abs(t.amount), 0);
  const totalCredit = filtered.filter((t) => t.type === 'credit').reduce((s, t) => s + t.amount, 0);

  // Group by date
  const grouped = useMemo(() => {
    const groups: Record<string, Transaction[]> = {};
    filtered.forEach((tx) => {
      if (!groups[tx.date]) groups[tx.date] = [];
      groups[tx.date].push(tx);
    });
    return Object.entries(groups).sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime());
  }, [filtered]);

  const formatDate = (d: string) => {
    const date = new Date(d);
    const today = new Date('2026-05-21');
    const yesterday = new Date('2026-05-20');
    if (d === today.toISOString().slice(0, 10)) return 'Today';
    if (d === yesterday.toISOString().slice(0, 10)) return 'Yesterday';
    return date.toLocaleDateString('en-AU', { weekday: 'short', day: 'numeric', month: 'short' });
  };

  const accountForTx = (tx: Transaction) => accounts.find((a) => a.id === tx.accountId);

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>

      {/* Summary */}
      <View style={{ flexDirection: 'row', margin: 16, gap: 12 }}>
        <View style={{ flex: 1, backgroundColor: '#FFF8E1', borderRadius: 12, padding: 14, gap: 4, borderCurve: 'continuous' }}>
          <Text style={{ fontSize: 11, fontFamily: Fonts.semiBold, color: Colors.textSecondary, textTransform: 'uppercase' }}>OUT</Text>
          <Text style={{ fontSize: 18, fontFamily: Fonts.bold, color: Colors.error }}>
            ${totalDebit.toFixed(2)}
          </Text>
        </View>
        <View style={{ flex: 1, backgroundColor: '#E8F5E9', borderRadius: 12, padding: 14, gap: 4, borderCurve: 'continuous' }}>
          <Text style={{ fontSize: 11, fontFamily: Fonts.semiBold, color: Colors.textSecondary, textTransform: 'uppercase' }}>IN</Text>
          <Text style={{ fontSize: 18, fontFamily: Fonts.bold, color: Colors.success }}>
            ${totalCredit.toFixed(2)}
          </Text>
        </View>
        <View style={{ flex: 1, backgroundColor: Colors.background, borderRadius: 12, padding: 14, gap: 4, borderCurve: 'continuous' }}>
          <Text style={{ fontSize: 11, fontFamily: Fonts.semiBold, color: Colors.textSecondary, textTransform: 'uppercase' }}>NET</Text>
          <Text style={{ fontSize: 18, fontFamily: Fonts.bold, color: totalCredit - totalDebit >= 0 ? Colors.success : Colors.error }}>
            {totalCredit - totalDebit >= 0 ? '+' : ''}${(totalCredit - totalDebit).toFixed(2)}
          </Text>
        </View>
      </View>

      {/* Search */}
      <View style={{ marginHorizontal: 16, marginBottom: 12, flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.white, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 11, gap: 10, borderCurve: 'continuous', boxShadow: '0 2px 8px rgba(0,75,90,0.06)' }}>
        <Ionicons name="search-outline" size={18} color={Colors.textSecondary} />
        <TextInput
          value={searchText}
          onChangeText={setSearchText}
          placeholder="Search transactions..."
          placeholderTextColor={Colors.textSecondary}
          style={{ flex: 1, fontSize: 14, fontFamily: Fonts.regular, color: Colors.textPrimary }}
        />
        {searchText ? (
          <Pressable onPress={() => setSearchText('')}>
            <Ionicons name="close-circle" size={18} color={Colors.textSecondary} />
          </Pressable>
        ) : null}
      </View>

      {/* Account filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0 }} contentContainerStyle={{ paddingHorizontal: 16, gap: 8, paddingBottom: 4 }}>
        {[{ id: 'all', name: 'All Accounts' }, ...accounts].map((acct) => (
          <Pressable
            key={acct.id}
            style={({ pressed }) => [{
              backgroundColor: selectedAccountId === acct.id ? Colors.primary : Colors.white,
              borderRadius: 20,
              paddingHorizontal: 14,
              paddingVertical: 8,
              borderWidth: 1.5,
              borderColor: selectedAccountId === acct.id ? Colors.primary : Colors.border,
              opacity: pressed ? 0.8 : 1,
            }]}
            onPress={() => setSelectedAccountId(acct.id)}
          >
            <Text style={{ fontSize: 13, fontFamily: Fonts.medium, color: selectedAccountId === acct.id ? Colors.white : Colors.textSecondary }}>
              {acct.name}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Date + type filters */}
      <View style={{ flexDirection: 'row', marginHorizontal: 16, marginTop: 12, gap: 8 }}>
        <View style={{ flexDirection: 'row', flex: 1, backgroundColor: Colors.white, borderRadius: 10, overflow: 'hidden', borderCurve: 'continuous' }}>
          {(['7d', '30d', '90d', 'all'] as DateFilter[]).map((f, i, arr) => (
            <Pressable
              key={f}
              style={{ flex: 1, paddingVertical: 8, alignItems: 'center', backgroundColor: dateFilter === f ? Colors.primary : 'transparent', borderRightWidth: i < arr.length - 1 ? 1 : 0, borderRightColor: Colors.borderLight }}
              onPress={() => setDateFilter(f)}
            >
              <Text style={{ fontSize: 12, fontFamily: Fonts.medium, color: dateFilter === f ? Colors.white : Colors.textSecondary }}>
                {f === 'all' ? 'All' : f}
              </Text>
            </Pressable>
          ))}
        </View>
        <View style={{ flexDirection: 'row', backgroundColor: Colors.white, borderRadius: 10, overflow: 'hidden', borderCurve: 'continuous' }}>
          {(['all', 'debit', 'credit'] as TypeFilter[]).map((f, i, arr) => (
            <Pressable
              key={f}
              style={{ paddingHorizontal: 12, paddingVertical: 8, backgroundColor: typeFilter === f ? Colors.primary : 'transparent', borderRightWidth: i < arr.length - 1 ? 1 : 0, borderRightColor: Colors.borderLight }}
              onPress={() => setTypeFilter(f)}
            >
              <Text style={{ fontSize: 12, fontFamily: Fonts.medium, color: typeFilter === f ? Colors.white : Colors.textSecondary }}>
                {f === 'all' ? 'All' : f === 'debit' ? 'Out' : 'In'}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Transaction list */}
      <View style={{ margin: 16, gap: 20 }}>
        {grouped.length === 0 ? (
          <View style={{ padding: 32, alignItems: 'center', gap: 12, backgroundColor: Colors.white, borderRadius: 16, borderCurve: 'continuous' }}>
            <Ionicons name="receipt-outline" size={40} color={Colors.textSecondary} />
            <Text style={{ fontSize: 16, fontFamily: Fonts.semiBold, color: Colors.textPrimary }}>No Transactions</Text>
            <Text style={{ fontSize: 14, fontFamily: Fonts.regular, color: Colors.textSecondary, textAlign: 'center' }}>
              No transactions match your current filters.
            </Text>
          </View>
        ) : grouped.map(([date, txs]) => (
          <View key={date} style={{ gap: 8 }}>
            <Text style={{ fontSize: 12, fontFamily: Fonts.semiBold, color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              {formatDate(date)}
            </Text>
            <View style={{ backgroundColor: Colors.white, borderRadius: 16, overflow: 'hidden', borderCurve: 'continuous', boxShadow: '0 2px 10px rgba(0,75,90,0.06)' }}>
              {txs.map((tx, idx) => {
                const acct = accountForTx(tx);
                const color = CATEGORY_COLORS[tx.category];
                return (
                  <View key={tx.id} style={{ flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12, borderBottomWidth: idx < txs.length - 1 ? 1 : 0, borderBottomColor: Colors.borderLight }}>
                    <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: color + '22', alignItems: 'center', justifyContent: 'center' }}>
                      <Ionicons name={CATEGORY_ICONS[tx.category]} size={18} color={color} />
                    </View>
                    <View style={{ flex: 1, gap: 2 }}>
                      <Text style={{ fontSize: 14, fontFamily: Fonts.semiBold, color: Colors.textPrimary }} numberOfLines={1}>{tx.description}</Text>
                      <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
                        {tx.paymentMethod && (
                          <View style={{ backgroundColor: Colors.background, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 1 }}>
                            <Text style={{ fontSize: 10, fontFamily: Fonts.medium, color: Colors.textSecondary }}>{PAYMENT_METHOD_LABELS[tx.paymentMethod]}</Text>
                          </View>
                        )}
                        {acct && selectedAccountId === 'all' && (
                          <Text style={{ fontSize: 11, fontFamily: Fonts.regular, color: Colors.textSecondary }}>{acct.name}</Text>
                        )}
                      </View>
                    </View>
                    <Text style={{ fontSize: 15, fontFamily: Fonts.bold, color: tx.type === 'credit' ? Colors.success : Colors.textPrimary, fontVariant: ['tabular-nums'] }}>
                      {tx.type === 'credit' ? '+' : '-'}${Math.abs(tx.amount).toFixed(2)}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
