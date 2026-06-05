import React from 'react';
import { View, Text, ScrollView, Pressable, Alert, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '@/store/useAppStore';
import { Colors } from '@/constants/Colors';
import { Fonts } from '@/constants/Typography';

const MOCK_STATEMENTS = [
  { id: 's1', period: 'May 2026', accountId: '1', date: '31/05/2026', size: '142 KB' },
  { id: 's2', period: 'April 2026', accountId: '1', date: '30/04/2026', size: '156 KB' },
  { id: 's3', period: 'March 2026', accountId: '1', date: '31/03/2026', size: '121 KB' },
  { id: 's4', period: 'February 2026', accountId: '1', date: '28/02/2026', size: '98 KB' },
  { id: 's5', period: 'January 2026', accountId: '1', date: '31/01/2026', size: '167 KB' },
  { id: 's6', period: 'December 2025', accountId: '1', date: '31/12/2025', size: '203 KB' },
  { id: 's7', period: 'May 2026', accountId: '2', date: '31/05/2026', size: '78 KB' },
  { id: 's8', period: 'April 2026', accountId: '2', date: '30/04/2026', size: '84 KB' },
  { id: 's9', period: 'March 2026', accountId: '2', date: '31/03/2026', size: '75 KB' },
];

export default function StatementsScreen() {
  const { accounts, notifications, updateNotifications } = useAppStore();

  const accountStatements = accounts
    .filter((a) => a.type !== 'loan')
    .map((acct) => ({
      account: acct,
      statements: MOCK_STATEMENTS.filter((s) => s.accountId === acct.id),
    }));

  return (
    <ScrollView contentContainerStyle={{ padding: 20, gap: 24, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>

      {/* eStatements preference */}
      <View style={{ gap: 10 }}>
        <Text style={{ fontSize: 12, fontFamily: Fonts.semiBold, color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, paddingHorizontal: 4 }}>
          Statement Preferences
        </Text>
        <View style={{ backgroundColor: Colors.white, borderRadius: 16, overflow: 'hidden', borderCurve: 'continuous', boxShadow: '0 2px 10px rgba(0,75,90,0.06)' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12, borderBottomWidth: 1, borderBottomColor: Colors.borderLight }}>
            <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: '#E8F5E9', alignItems: 'center', justifyContent: 'center', borderCurve: 'continuous' }}>
              <Ionicons name="leaf-outline" size={20} color={Colors.success} />
            </View>
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={{ fontSize: 15, fontFamily: Fonts.semiBold, color: Colors.textPrimary }}>eStatements (Paperless)</Text>
              <Text style={{ fontSize: 12, fontFamily: Fonts.regular, color: Colors.textSecondary }}>
                Receive statements via email instead of post
              </Text>
            </View>
            <Switch
              value={notifications.eStatementsEnabled}
              onValueChange={(v) => updateNotifications({ eStatementsEnabled: v })}
              trackColor={{ false: Colors.border, true: Colors.primary }}
              thumbColor={Colors.white}
            />
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 }}>
            <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: Colors.infoBg, alignItems: 'center', justifyContent: 'center', borderCurve: 'continuous' }}>
              <Ionicons name="notifications-outline" size={20} color={Colors.info} />
            </View>
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={{ fontSize: 15, fontFamily: Fonts.semiBold, color: Colors.textPrimary }}>Statement Ready Alerts</Text>
              <Text style={{ fontSize: 12, fontFamily: Fonts.regular, color: Colors.textSecondary }}>
                Notify me when statement is available
              </Text>
            </View>
            <Switch
              value={notifications.statementReady}
              onValueChange={(v) => updateNotifications({ statementReady: v })}
              trackColor={{ false: Colors.border, true: Colors.primary }}
              thumbColor={Colors.white}
            />
          </View>
        </View>

        {notifications.eStatementsEnabled && (
          <View style={{ backgroundColor: '#E8F5E9', borderRadius: 12, padding: 12, flexDirection: 'row', gap: 10, borderCurve: 'continuous' }}>
            <Ionicons name="checkmark-circle" size={18} color={Colors.success} />
            <Text style={{ flex: 1, fontSize: 13, fontFamily: Fonts.regular, color: Colors.textPrimary, lineHeight: 18 }}>
              eStatements are active. You will receive an email notification when each statement is ready to view.
            </Text>
          </View>
        )}
      </View>

      <View style={{ backgroundColor: Colors.infoBg, borderRadius: 12, padding: 14, flexDirection: 'row', gap: 10, borderCurve: 'continuous' }}>
        <Ionicons name="information-circle-outline" size={20} color={Colors.info} />
        <Text style={{ flex: 1, fontSize: 13, fontFamily: Fonts.regular, color: Colors.textPrimary, lineHeight: 18 }}>
          Statements are generated monthly and available for download as PDF. Archives kept for 7 years.
        </Text>
      </View>

      {accountStatements.map(({ account, statements }) => (
        <View key={account.id} style={{ gap: 10 }}>
          <Text style={{ fontSize: 12, fontFamily: Fonts.semiBold, color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, paddingHorizontal: 4 }}>
            {account.name}
          </Text>
          <View style={{ backgroundColor: Colors.white, borderRadius: 16, overflow: 'hidden', borderCurve: 'continuous', boxShadow: '0 2px 10px rgba(0,75,90,0.06)' }}>
            {statements.length === 0 ? (
              <View style={{ padding: 20, alignItems: 'center', gap: 8 }}>
                <Ionicons name="document-text-outline" size={32} color={Colors.textSecondary} />
                <Text style={{ fontSize: 14, fontFamily: Fonts.regular, color: Colors.textSecondary }}>No statements available</Text>
              </View>
            ) : statements.map((stmt, idx) => (
              <View
                key={stmt.id}
                style={{ flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12, borderBottomWidth: idx < statements.length - 1 ? 1 : 0, borderBottomColor: Colors.borderLight, minHeight: 60 }}
              >
                <View style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: '#FFF3E0', alignItems: 'center', justifyContent: 'center', borderCurve: 'continuous' }}>
                  <Ionicons name="document-text" size={20} color={Colors.warning} />
                </View>
                <View style={{ flex: 1, gap: 2 }}>
                  <Text style={{ fontSize: 14, fontFamily: Fonts.semiBold, color: Colors.textPrimary }}>{stmt.period}</Text>
                  <Text style={{ fontSize: 12, fontFamily: Fonts.regular, color: Colors.textSecondary }}>{stmt.date} · {stmt.size}</Text>
                </View>
                <Pressable
                  style={({ pressed }) => [{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 4,
                    backgroundColor: Colors.background,
                    borderRadius: 8,
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    opacity: pressed ? 0.7 : 1,
                    borderCurve: 'continuous',
                    minHeight: 36,
                  }]}
                  onPress={() => Alert.alert('Download Statement', `Preparing ${stmt.period} statement for ${account.name}...\n\nThe PDF will open in your document viewer.`)}
                >
                  <Ionicons name="download-outline" size={16} color={Colors.primary} />
                  <Text style={{ fontSize: 13, fontFamily: Fonts.semiBold, color: Colors.primary }}>PDF</Text>
                </Pressable>
              </View>
            ))}
          </View>
        </View>
      ))}
    </ScrollView>
  );
}
