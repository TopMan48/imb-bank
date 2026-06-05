import React from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '@/store/useAppStore';
import { Colors } from '@/constants/Colors';
import { Fonts } from '@/constants/Typography';
import type { LoginActivity } from '@/store/types';

function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 2) return 'Just now';
  if (diffMins < 60) return `${diffMins} minutes ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  return d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' });
}

function fullTimestamp(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function ActivityRow({ activity, isLast }: { activity: LoginActivity; isLast: boolean }) {
  return (
    <View style={[styles.row, !isLast && styles.rowBorder]}>
      <View style={[
        styles.statusIcon,
        { backgroundColor: activity.successful ? '#E8F5E9' : '#FFEBEE' },
      ]}>
        <Ionicons
          name={activity.successful ? 'checkmark-circle' : 'close-circle'}
          size={20}
          color={activity.successful ? Colors.success : Colors.error}
        />
      </View>
      <View style={styles.rowInfo}>
        <Text style={styles.rowDevice}>{activity.device}</Text>
        <Text style={styles.rowLocation}>
          <Ionicons name="location-outline" size={11} color={Colors.textSecondary} /> {activity.location}
        </Text>
        <Text style={styles.rowTime}>{fullTimestamp(activity.timestamp)}</Text>
        <Text style={styles.rowIp}>IP: {activity.ipAddress}</Text>
      </View>
      <View style={{ alignItems: 'flex-end', gap: 4 }}>
        <Text style={[
          styles.statusBadge,
          { backgroundColor: activity.successful ? '#E8F5E9' : '#FFEBEE', color: activity.successful ? Colors.success : Colors.error },
        ]}>
          {activity.successful ? 'Success' : 'Failed'}
        </Text>
        <Text style={styles.rowTimeAgo}>{formatTimestamp(activity.timestamp)}</Text>
      </View>
    </View>
  );
}

export default function LoginActivityScreen() {
  const loginActivity = useAppStore((s) => s.loginActivity);
  const clearLoginActivity = useAppStore((s) => s.clearLoginActivity);

  const handleClear = () => {
    Alert.alert(
      'Clear Login History',
      'Are you sure you want to clear all login activity? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: clearLoginActivity,
        },
      ]
    );
  };

  const successCount = loginActivity.filter((a) => a.successful).length;
  const failedCount = loginActivity.filter((a) => !a.successful).length;

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Summary card */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryNumber}>{successCount}</Text>
            <Text style={styles.summaryLabel}>Successful</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryNumber, failedCount > 0 && { color: Colors.error }]}>{failedCount}</Text>
            <Text style={styles.summaryLabel}>Failed</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryNumber}>{loginActivity.length}</Text>
            <Text style={styles.summaryLabel}>Total</Text>
          </View>
        </View>
      </View>

      {failedCount > 0 && (
        <View style={styles.warningBanner}>
          <Ionicons name="warning-outline" size={16} color={Colors.warning} />
          <Text style={styles.warningText}>
            {failedCount} failed login attempt{failedCount !== 1 ? 's' : ''} detected. If you don&apos;t recognise these, contact us on 133 462.
          </Text>
        </View>
      )}

      {/* Activity list */}
      <Text style={styles.sectionTitle}>Login History</Text>
      {loginActivity.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="time-outline" size={44} color={Colors.textSecondary} />
          <Text style={styles.emptyText}>No login activity recorded</Text>
        </View>
      ) : (
        <View style={styles.card}>
          {loginActivity.map((activity, index) => (
            <ActivityRow
              key={activity.id}
              activity={activity}
              isLast={index === loginActivity.length - 1}
            />
          ))}
        </View>
      )}

      {loginActivity.length > 0 && (
        <Pressable
          style={({ pressed }) => [styles.clearBtn, pressed && { opacity: 0.7 }]}
          onPress={handleClear}
        >
          <Ionicons name="trash-outline" size={16} color={Colors.error} />
          <Text style={styles.clearBtnText}>Clear All Login History</Text>
        </Pressable>
      )}

      <Text style={styles.footerNote}>
        Login history is retained for 90 days. Suspicious activity should be reported to IMB Bank immediately on 133 462.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 20,
    gap: 16,
    paddingBottom: 40,
  },
  summaryCard: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    padding: 20,
    borderCurve: 'continuous',
    boxShadow: '0 4px 16px rgba(0,75,90,0.2)',
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  summaryNumber: {
    fontSize: 28,
    fontFamily: Fonts.bold,
    color: Colors.white,
    fontVariant: ['tabular-nums'],
  },
  summaryLabel: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    color: 'rgba(255,255,255,0.65)',
  },
  summaryDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  warningBanner: {
    backgroundColor: '#FFF3E0',
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: '#FFE0B2',
    borderCurve: 'continuous',
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    fontFamily: Fonts.regular,
    color: Colors.textPrimary,
    lineHeight: 18,
  },
  sectionTitle: {
    fontSize: 12,
    fontFamily: Fonts.semiBold,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: 4,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    overflow: 'hidden',
    borderCurve: 'continuous',
    boxShadow: '0 2px 10px rgba(0,75,90,0.06)',
  },
  row: {
    flexDirection: 'row',
    padding: 14,
    gap: 12,
    alignItems: 'flex-start',
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  statusIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowInfo: {
    flex: 1,
    gap: 3,
  },
  rowDevice: {
    fontSize: 14,
    fontFamily: Fonts.semiBold,
    color: Colors.textPrimary,
  },
  rowLocation: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    color: Colors.textSecondary,
  },
  rowTime: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    color: Colors.textSecondary,
  },
  rowIp: {
    fontSize: 11,
    fontFamily: Fonts.regular,
    color: Colors.textSecondary,
  },
  statusBadge: {
    fontSize: 11,
    fontFamily: Fonts.semiBold,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    overflow: 'hidden',
  },
  rowTimeAgo: {
    fontSize: 11,
    fontFamily: Fonts.regular,
    color: Colors.textSecondary,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 12,
    backgroundColor: Colors.white,
    borderRadius: 16,
    borderCurve: 'continuous',
  },
  emptyText: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: Colors.textSecondary,
  },
  clearBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.white,
    borderRadius: 12,
    paddingVertical: 14,
    borderCurve: 'continuous',
    borderWidth: 1.5,
    borderColor: '#FFCDD2',
  },
  clearBtnText: {
    fontSize: 14,
    fontFamily: Fonts.medium,
    color: Colors.error,
  },
  footerNote: {
    fontSize: 11,
    fontFamily: Fonts.regular,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 16,
    paddingHorizontal: 10,
  },
});
