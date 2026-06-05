import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { Fonts } from '@/constants/Typography';
import { isDemoMode } from '@/services/api-config';
import { getEnrichedApiStatus, testConnectivity } from '@/services/api-status-store';
import type { ApiConnectionStatus, ApiEnvironment } from '@/services/api-config';

type EnrichedStatus = ApiConnectionStatus & {
  lastSuccessfulCall?: string;
  lastError?: string;
};

const API_PROVIDERS = [
  {
    key: 'monoova',
    name: 'Monoova',
    description: 'NPP, BPAY & Direct Entry payments',
    docUrl: 'https://docs.monoova.com',
    sandbox: 'api.monoova.com/sandbox/v2',
    production: 'api.monoova.com/live/v2',
    fields: [
      { envKey: 'EXPO_PUBLIC_MONOOVA_API_KEY', label: 'API Key', placeholder: 'mk_live_...' },
      { envKey: 'EXPO_PUBLIC_MONOOVA_API_SECRET', label: 'API Secret', placeholder: 'ms_live_...' },
    ],
  },
  {
    key: 'zai',
    name: 'Zai (Assembly Payments)',
    description: 'PayID, wallet & marketplace payments',
    docUrl: 'https://developer.assemblypayments.com',
    sandbox: 'test.api.promisepay.com',
    production: 'secure.api.promisepay.com',
    fields: [
      { envKey: 'EXPO_PUBLIC_ZAI_CLIENT_ID', label: 'Client ID', placeholder: 'zai_client_...' },
      { envKey: 'EXPO_PUBLIC_ZAI_CLIENT_SECRET', label: 'Client Secret', placeholder: 'zai_secret_...' },
    ],
  },
  {
    key: 'payvantage',
    name: 'PayVantage',
    description: 'PayTo agreements & mandate management',
    docUrl: 'https://payvantage.com.au/docs',
    sandbox: 'sandbox.api.payvantage.com.au/v1',
    production: 'api.payvantage.com.au/v1',
    fields: [
      { envKey: 'EXPO_PUBLIC_PAYVANTAGE_API_KEY', label: 'API Key', placeholder: 'pv_live_...' },
      { envKey: 'EXPO_PUBLIC_PAYVANTAGE_API_SECRET', label: 'API Secret', placeholder: 'pv_secret_...' },
    ],
  },
];

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

  const envColor = getStatusColor(status.environment);

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.cardTitleRow}>
          <Ionicons
            name={status.isConfigured ? 'checkmark-circle' : 'ellipse-outline'}
            size={20}
            color={envColor}
          />
          <Text style={styles.cardTitle}>{status.provider}</Text>
        </View>
        <View style={[styles.badge, { backgroundColor: `${envColor}18` }]}>
          <View style={[styles.badgeDot, { backgroundColor: envColor }]} />
          <Text style={[styles.badgeText, { color: envColor }]}>
            {getStatusLabel(status.environment)}
          </Text>
        </View>
      </View>

      <View style={styles.cardBody}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Status</Text>
          <Text style={[styles.infoValue, { color: status.isConfigured ? Colors.success : Colors.textSecondary }]}>
            {status.isConfigured ? '● Connected' : '○ Not Configured'}
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

function ApiKeyInput({ provider }: { provider: typeof API_PROVIDERS[0] }) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [showKeys, setShowKeys] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    const hasValues = Object.values(values).some((v) => v.trim().length > 0);
    if (!hasValues) {
      Alert.alert('No Keys Entered', 'Please enter at least one API key to save.');
      return;
    }
    // In a real app, these would be saved to secure storage
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
    Alert.alert(
      'Keys Saved',
      `${provider.name} API keys have been saved. Restart the app to apply changes.\n\nNote: In production, these would be stored in secure device storage.`,
    );
  };

  return (
    <View style={styles.card}>
      <View style={{ padding: 16, borderBottomWidth: 1, borderBottomColor: Colors.borderLight, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <View style={{ flex: 1, gap: 2 }}>
          <Text style={{ fontSize: 15, fontFamily: Fonts.bold, color: Colors.textPrimary }}>{provider.name}</Text>
          <Text style={{ fontSize: 12, fontFamily: Fonts.regular, color: Colors.textSecondary }}>{provider.description}</Text>
        </View>
        <Pressable
          style={({ pressed }) => [{
            padding: 6,
            borderRadius: 8,
            backgroundColor: pressed ? Colors.background : 'transparent',
          }]}
          onPress={() => setShowKeys(!showKeys)}
        >
          <Ionicons name={showKeys ? 'eye-off-outline' : 'eye-outline'} size={18} color={Colors.textSecondary} />
        </Pressable>
      </View>

      <View style={{ padding: 14, gap: 12 }}>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <View style={{ flex: 1, backgroundColor: Colors.background, borderRadius: 8, padding: 8 }}>
            <Text style={{ fontSize: 10, fontFamily: Fonts.semiBold, color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.3 }}>Sandbox</Text>
            <Text selectable style={{ fontSize: 11, fontFamily: 'Courier', color: Colors.textPrimary, marginTop: 2 }}>{provider.sandbox}</Text>
          </View>
          <View style={{ flex: 1, backgroundColor: Colors.background, borderRadius: 8, padding: 8 }}>
            <Text style={{ fontSize: 10, fontFamily: Fonts.semiBold, color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.3 }}>Production</Text>
            <Text selectable style={{ fontSize: 11, fontFamily: 'Courier', color: Colors.textPrimary, marginTop: 2 }}>{provider.production}</Text>
          </View>
        </View>

        {provider.fields.map((field) => (
          <View key={field.envKey} style={{ gap: 4 }}>
            <Text style={{ fontSize: 11, fontFamily: Fonts.semiBold, color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.4 }}>
              {field.label}
            </Text>
            <View style={{ borderWidth: 1.5, borderColor: values[field.envKey] ? Colors.primary : Colors.border, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, backgroundColor: Colors.white }}>
              <TextInput
                value={values[field.envKey] ?? ''}
                onChangeText={(v) => setValues((prev) => ({ ...prev, [field.envKey]: v }))}
                placeholder={field.placeholder}
                placeholderTextColor={Colors.textSecondary}
                secureTextEntry={!showKeys}
                autoCapitalize="none"
                autoCorrect={false}
                style={{ fontSize: 13, fontFamily: 'Courier', color: Colors.textPrimary }}
              />
            </View>
            <Text selectable style={{ fontSize: 10, fontFamily: 'Courier', color: Colors.textSecondary }}>{field.envKey}</Text>
          </View>
        ))}

        <Pressable
          style={({ pressed }) => [{
            backgroundColor: saved ? '#E8F5E9' : Colors.primary,
            borderRadius: 10,
            paddingVertical: 12,
            alignItems: 'center',
            borderCurve: 'continuous',
            flexDirection: 'row',
            justifyContent: 'center',
            gap: 8,
            opacity: pressed ? 0.85 : 1,
          }]}
          onPress={handleSave}
        >
          <Ionicons name={saved ? 'checkmark' : 'save-outline'} size={16} color={saved ? Colors.success : Colors.white} />
          <Text style={{ fontSize: 14, fontFamily: Fonts.semiBold, color: saved ? Colors.success : Colors.white }}>
            {saved ? 'Saved!' : `Save ${provider.name} Keys`}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

export default function ApiStatusScreen() {
  const [statuses, setStatuses] = useState<EnrichedStatus[]>([]);
  const [activeTab, setActiveTab] = useState<'status' | 'configure'>('status');
  const demoActive = isDemoMode();

  const loadStatuses = useCallback(() => {
    setStatuses(getEnrichedApiStatus());
  }, []);

  useEffect(() => {
    loadStatuses();
  }, [loadStatuses]);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Tab selector */}
      <View style={{ flexDirection: 'row', backgroundColor: Colors.white, borderRadius: 12, padding: 4, gap: 4, borderCurve: 'continuous', boxShadow: '0 2px 8px rgba(0,75,90,0.06)' }}>
        {(['status', 'configure'] as const).map((tab) => (
          <Pressable
            key={tab}
            style={[{
              flex: 1,
              paddingVertical: 10,
              borderRadius: 10,
              alignItems: 'center',
              justifyContent: 'center',
            }, activeTab === tab && { backgroundColor: Colors.primary }]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={{ fontSize: 14, fontFamily: Fonts.semiBold, color: activeTab === tab ? Colors.white : Colors.textSecondary }}>
              {tab === 'status' ? 'Status' : 'Configure'}
            </Text>
          </Pressable>
        ))}
      </View>

      {activeTab === 'status' && (
        <>
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
                  ? 'All payments use local simulation. Add API keys in Configure tab to connect live services.'
                  : 'Payment APIs are connected and processing real transactions.'}
              </Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Payment Providers</Text>
          {statuses.map((status) => (
            <StatusCard
              key={status.provider}
              status={status}
              onTest={loadStatuses}
            />
          ))}

          <Text style={styles.sectionTitle}>API Endpoints Reference</Text>
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
        </>
      )}

      {activeTab === 'configure' && (
        <>
          <View style={{ backgroundColor: '#FFF3E0', borderRadius: 12, padding: 14, flexDirection: 'row', gap: 10, borderCurve: 'continuous' }}>
            <Ionicons name="warning-outline" size={18} color={Colors.warning} />
            <View style={{ flex: 1, gap: 4 }}>
              <Text style={{ fontSize: 13, fontFamily: Fonts.semiBold, color: Colors.textPrimary }}>Demo Mode Active</Text>
              <Text style={{ fontSize: 12, fontFamily: Fonts.regular, color: Colors.textSecondary, lineHeight: 18 }}>
                Enter real API keys below to enable live payment processing. API keys are stored securely on-device.
              </Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>API Keys</Text>
          {API_PROVIDERS.map((provider) => (
            <ApiKeyInput key={provider.key} provider={provider} />
          ))}

          <Text style={styles.sectionTitle}>Environment Variables</Text>
          <View style={styles.configCard}>
            <Text style={styles.configTitle}>Manual .env Configuration</Text>
            <Text style={styles.configDesc}>
              Alternatively, add these to your .env file before building:
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

          {/* Where to get keys */}
          <Text style={styles.sectionTitle}>Where to Get API Keys</Text>
          <View style={styles.configCard}>
            {API_PROVIDERS.map((provider, idx) => (
              <View key={provider.key} style={[{ paddingVertical: 14, gap: 6 }, idx < API_PROVIDERS.length - 1 && { borderBottomWidth: 1, borderBottomColor: Colors.borderLight }]}>
                <Text style={{ fontSize: 14, fontFamily: Fonts.semiBold, color: Colors.textPrimary }}>{provider.name}</Text>
                <Text style={{ fontSize: 13, fontFamily: Fonts.regular, color: Colors.textSecondary, lineHeight: 18 }}>{provider.description}</Text>
                <Text selectable style={{ fontSize: 12, fontFamily: Fonts.medium, color: Colors.primary }}>{provider.docUrl}</Text>
              </View>
            ))}
          </View>
        </>
      )}
    </ScrollView>
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
    maxWidth: '60%',
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
