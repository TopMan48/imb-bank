import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { Fonts } from '@/constants/Typography';
import { isDemoMode } from '@/services/api-config';
import { getEnrichedApiStatus, testConnectivity } from '@/services/api-status-store';
import type { ApiConnectionStatus, ApiEnvironment } from '@/services/api-config';

type EnrichedStatus = ApiConnectionStatus & {
  lastSuccessfulCall?: string;
  lastError?: string;
};

function getStatusColor(env: ApiEnvironment): string {
  switch (env) {
    case 'production': return Colors.success;
    case 'sandbox': return '#FF9800';
    case 'demo': return Colors.textSecondary;
  }
}

function getStatusLabel(env: ApiEnvironment): string {
  switch (env) {
    case 'production': return 'Production';
    case 'sandbox': return 'Sandbox';
    case 'demo': return 'Demo Mode';
  }
}

function getStatusIcon(isConfigured: boolean): keyof typeof Ionicons.glyphMap {
  return isConfigured ? 'checkmark-circle' : 'ellipse-outline';
}

function formatTimestamp(iso?: string): string {
  if (!iso) return 'Never';
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  return date.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' });
}

function StatusCard({ status, onTest }: { status: EnrichedStatus; onTest: () => void }) {
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ connected: boolean; latencyMs: number } | null>(null);

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const result = await testConnectivity(status.provider);
      setTestResult(result);
    } catch {
      setTestResult({ connected: false, latencyMs: 0 });
    }
    setTesting(false);
    onTest();
  };

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.cardTitleRow}>
          <Ionicons
            name={getStatusIcon(status.isConfigured)}
            size={20}
            color={getStatusColor(status.environment)}
          />
          <Text style={styles.cardTitle}>{status.provider}</Text>
        </View>
        <View style={[styles.badge, { backgroundColor: `${getStatusColor(status.environment)}18` }]}>
          <View style={[styles.badgeDot, { backgroundColor: getStatusColor(status.environment) }]} />
          <Text style={[styles.badgeText, { color: getStatusColor(status.environment) }]}>
            {getStatusLabel(status.environment)}
          </Text>
        </View>
      </View>

      <View style={styles.cardBody}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Status</Text>
          <Text style={[styles.infoValue, { color: status.isConfigured ? Colors.success : Colors.textSecondary }]}>
            {status.isConfigured ? 'Connected' : 'Not Configured'}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Last Call</Text>
          <Text style={styles.infoValue}>{formatTimestamp(status.lastSuccessfulCall)}</Text>
        </View>
        {status.lastError && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Last Error</Text>
            <Text style={[styles.infoValue, { color: Colors.error }]} numberOfLines={1}>
              {status.lastError}
            </Text>
          </View>
        )}
        {testResult && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Latency</Text>
            <Text style={[styles.infoValue, { color: testResult.connected ? Colors.success : Colors.error }]}>
              {testResult.connected ? `${testResult.latencyMs}ms ✓` : 'Failed ✗'}
            </Text>
          </View>
        )}
      </View>

      <Pressable
        style={({ pressed }) => [styles.testBtn, pressed && { opacity: 0.7 }]}
        onPress={handleTest}
        disabled={testing}
      >
        {testing ? (
          <ActivityIndicator size="small" color={Colors.primary} />
        ) : (
          <>
            <Ionicons name="pulse-outline" size={14} color={Colors.primary} />
            <Text style={styles.testBtnText}>Test Connection</Text>
          </>
        )}
      </Pressable>
    </View>
  );
}

export default function ApiStatusScreen() {
  const [statuses, setStatuses] = useState<EnrichedStatus[]>([]);
  const demoActive = isDemoMode();

  const loadStatuses = useCallback(() => {
    setStatuses(getEnrichedApiStatus());
  }, []);

  useEffect(() => {
    loadStatuses();
  }, [loadStatuses]);

  return (
    <>
      <Stack.Screen options={{ title: 'API Status' }} />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Mode Banner */}
        <View style={[styles.modeBanner, demoActive ? styles.modeBannerDemo : styles.modeBannerLive]}>
          <View style={styles.modeBannerIcon}>
            <Ionicons
              name={demoActive ? 'flask-outline' : 'shield-checkmark-outline'}
              size={22}
              color={demoActive ? '#FF9800' : Colors.success}
            />
          </View>
          <View style={styles.modeBannerContent}>
            <Text style={styles.modeBannerTitle}>
              {demoActive ? 'Demo Mode Active' : 'Live APIs Connected'}
            </Text>
            <Text style={styles.modeBannerSubtitle}>
              {demoActive
                ? 'All payments use local simulation. Add API keys in .env to connect live services.'
                : 'Payment APIs are connected and processing real transactions.'}
            </Text>
          </View>
        </View>

        {/* Provider Cards */}
        <Text style={styles.sectionTitle}>Payment Providers</Text>
        {statuses.map((status) => (
          <StatusCard
            key={status.provider}
            status={status}
            onTest={loadStatuses}
          />
        ))}

        {/* Configuration Guide */}
        <Text style={styles.sectionTitle}>Configuration</Text>
        <View style={styles.configCard}>
          <Text style={styles.configTitle}>Environment Variables</Text>
          <Text style={styles.configDesc}>
            Add the following to your .env file to connect live APIs:
          </Text>
          <View style={styles.codeBlock}>
            <Text selectable style={styles.codeText}>
              {`EXPO_PUBLIC_MONOOVA_API_KEY=your_key\nEXPO_PUBLIC_MONOOVA_API_SECRET=your_secret\nEXPO_PUBLIC_MONOOVA_ENV=sandbox\n\nEXPO_PUBLIC_ZAI_CLIENT_ID=your_id\nEXPO_PUBLIC_ZAI_CLIENT_SECRET=your_secret\nEXPO_PUBLIC_ZAI_ENV=sandbox\n\nEXPO_PUBLIC_PAYVANTAGE_API_KEY=your_key\nEXPO_PUBLIC_PAYVANTAGE_API_SECRET=your_secret\nEXPO_PUBLIC_PAYVANTAGE_ENV=sandbox\n\nEXPO_PUBLIC_PAYID_ENABLED=true`}
            </Text>
          </View>
          <View style={styles.configNote}>
            <Ionicons name="information-circle-outline" size={16} color={Colors.info} />
            <Text style={styles.configNoteText}>
              The app automatically switches between demo and live mode based on whether API keys are present.
            </Text>
          </View>
        </View>

        {/* Endpoints Reference */}
        <Text style={styles.sectionTitle}>API Endpoints</Text>
        <View style={styles.configCard}>
          {[
            { name: 'Monoova Sandbox', url: 'api.monoova.com/sandbox/v2' },
            { name: 'Monoova Production', url: 'api.monoova.com/live/v2' },
            { name: 'Zai Sandbox', url: 'test.api.promisepay.com' },
            { name: 'Zai Production', url: 'secure.api.promisepay.com' },
            { name: 'PayVantage Sandbox', url: 'sandbox.api.payvantage.com.au/v1' },
            { name: 'PayVantage Production', url: 'api.payvantage.com.au/v1' },
          ].map((endpoint, idx, arr) => (
            <View key={endpoint.name} style={[styles.endpointRow, idx < arr.length - 1 && styles.endpointDivider]}>
              <Text style={styles.endpointName}>{endpoint.name}</Text>
              <Text selectable style={styles.endpointUrl}>{endpoint.url}</Text>
            </View>
          ))}
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
    gap: 16,
  },
  modeBanner: {
    flexDirection: 'row',
    borderRadius: 16,
    padding: 16,
    gap: 14,
    alignItems: 'center',
    borderCurve: 'continuous',
  },
  modeBannerDemo: {
    backgroundColor: '#FFF8E1',
    borderWidth: 1,
    borderColor: '#FFE082',
  },
  modeBannerLive: {
    backgroundColor: '#E8F5E9',
    borderWidth: 1,
    borderColor: '#A5D6A7',
  },
  modeBannerIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderCurve: 'continuous',
  },
  modeBannerContent: {
    flex: 1,
    gap: 4,
  },
  modeBannerTitle: {
    fontSize: 15,
    fontFamily: Fonts.bold,
    color: Colors.textPrimary,
  },
  modeBannerSubtitle: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    color: Colors.textSecondary,
    lineHeight: 17,
  },
  sectionTitle: {
    fontSize: 12,
    fontFamily: Fonts.semiBold,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 8,
    paddingHorizontal: 4,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    borderCurve: 'continuous',
    overflow: 'hidden',
    boxShadow: '0 2px 10px rgba(0, 75, 90, 0.06)',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  cardTitle: {
    fontSize: 14,
    fontFamily: Fonts.semiBold,
    color: Colors.textPrimary,
    flex: 1,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  badgeText: {
    fontSize: 11,
    fontFamily: Fonts.semiBold,
  },
  cardBody: {
    padding: 16,
    gap: 10,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 13,
    fontFamily: Fonts.regular,
    color: Colors.textSecondary,
  },
  infoValue: {
    fontSize: 13,
    fontFamily: Fonts.medium,
    color: Colors.textPrimary,
    maxWidth: '50%',
    textAlign: 'right',
  },
  testBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    minHeight: 44,
  },
  testBtnText: {
    fontSize: 13,
    fontFamily: Fonts.semiBold,
    color: Colors.primary,
  },
  configCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    borderCurve: 'continuous',
    gap: 12,
    boxShadow: '0 2px 10px rgba(0, 75, 90, 0.06)',
  },
  configTitle: {
    fontSize: 15,
    fontFamily: Fonts.semiBold,
    color: Colors.textPrimary,
  },
  configDesc: {
    fontSize: 13,
    fontFamily: Fonts.regular,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  codeBlock: {
    backgroundColor: '#1A2B33',
    borderRadius: 10,
    padding: 14,
    borderCurve: 'continuous',
  },
  codeText: {
    fontSize: 11,
    fontFamily: 'Courier',
    color: '#A5D6A7',
    lineHeight: 16,
  },
  configNote: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-start',
    backgroundColor: Colors.infoBg,
    borderRadius: 10,
    padding: 12,
    borderCurve: 'continuous',
  },
  configNoteText: {
    flex: 1,
    fontSize: 12,
    fontFamily: Fonts.regular,
    color: Colors.textPrimary,
    lineHeight: 17,
  },
  endpointRow: {
    paddingVertical: 10,
    gap: 4,
  },
  endpointDivider: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  endpointName: {
    fontSize: 13,
    fontFamily: Fonts.medium,
    color: Colors.textPrimary,
  },
  endpointUrl: {
    fontSize: 11,
    fontFamily: 'Courier',
    color: Colors.textSecondary,
  },
});
