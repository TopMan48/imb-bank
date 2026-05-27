import React, { useState, useEffect, useCallback } from 'react';
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
import { payIdService } from '@/services/payid-service';
import { webhookHandler } from '@/services/webhook-handler';
import { isDemoMode } from '@/services/api-config';
import type { PaymentRequest, PaymentRequestStatus } from '@/services/types';

function getStatusColor(status: PaymentRequestStatus): string {
  switch (status) {
    case 'pending': return '#FF9800';
    case 'paid': return Colors.success;
    case 'expired': return Colors.textSecondary;
    case 'cancelled': return Colors.error;
  }
}

function getStatusIcon(status: PaymentRequestStatus): keyof typeof Ionicons.glyphMap {
  switch (status) {
    case 'pending': return 'time-outline';
    case 'paid': return 'checkmark-circle';
    case 'expired': return 'close-circle-outline';
    case 'cancelled': return 'ban-outline';
  }
}

function formatCurrency(amount: number): string {
  return `$${amount.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatTime(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleString('en-AU', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function PaymentRequestsScreen() {
  const [requests, setRequests] = useState<PaymentRequest[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [payId, setPayId] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [expiryMinutes, setExpiryMinutes] = useState('60');
  const [isCreating, setIsCreating] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadRequests = useCallback(() => {
    const reqs = payIdService.getPaymentRequests();
    setRequests(reqs);
  }, []);

  useEffect(() => {
    loadRequests();

    // Subscribe to payment request events for real-time updates
    const unsubscribe = webhookHandler.subscribe(
      ['payment_request.paid', 'payment_request.expired'],
      () => {
        loadRequests();
      }
    );

    // Poll for updates every 5 seconds (in production would use WebSocket)
    const interval = setInterval(loadRequests, 5000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, [loadRequests]);

  const handleCreate = async () => {
    if (!payId.trim()) {
      Alert.alert('Error', 'Please enter a PayID.');
      return;
    }
    const amt = parseFloat(amount);
    if (!amount || isNaN(amt) || amt <= 0) {
      Alert.alert('Error', 'Please enter a valid amount.');
      return;
    }

    setIsCreating(true);
    try {
      await payIdService.createPaymentRequest({
        payId: payId.trim(),
        amount: amt,
        description: description.trim() || 'Payment request',
        expiryMinutes: parseInt(expiryMinutes) || 60,
      });

      loadRequests();
      setShowCreate(false);
      setPayId('');
      setAmount('');
      setDescription('');
      Alert.alert('Request Created', 'Your payment request has been sent. You will be notified when it is paid.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create request';
      Alert.alert('Error', message);
    } finally {
      setIsCreating(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadRequests();
    setTimeout(() => setRefreshing(false), 500);
  };

  const pendingRequests = requests.filter((r) => r.status === 'pending');
  const completedRequests = requests.filter((r) => r.status !== 'pending');

  return (
    <>
      <Stack.Screen options={{ title: 'Payment Requests' }} />
      <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Demo Indicator */}
        {isDemoMode() && (
          <View style={styles.demoBanner}>
            <Ionicons name="flask-outline" size={16} color="#FF9800" />
            <Text style={styles.demoBannerText}>Demo Mode — requests are simulated and auto-paid after ~10s</Text>
          </View>
        )}

        {/* Action Header */}
        <View style={styles.actionRow}>
          <Pressable
            style={({ pressed }) => [styles.createBtn, pressed && { opacity: 0.85 }]}
            onPress={() => setShowCreate(!showCreate)}
          >
            <Ionicons name={showCreate ? 'close' : 'add'} size={18} color={Colors.primary} />
            <Text style={styles.createBtnText}>
              {showCreate ? 'Cancel' : 'New Request'}
            </Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.refreshBtn, pressed && { opacity: 0.7 }]}
            onPress={handleRefresh}
          >
            {refreshing ? (
              <ActivityIndicator size="small" color={Colors.primary} />
            ) : (
              <Ionicons name="refresh-outline" size={20} color={Colors.primary} />
            )}
          </Pressable>
        </View>

        {/* Create Form */}
        {showCreate && (
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>Create Payment Request</Text>

            <View style={styles.formField}>
              <Text style={styles.formLabel}>Your PayID</Text>
              <TextInput
                style={styles.formInput}
                value={payId}
                onChangeText={setPayId}
                placeholder="your.email@example.com"
                placeholderTextColor={Colors.textSecondary}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.formField}>
              <Text style={styles.formLabel}>Amount (AUD)</Text>
              <View style={styles.amountRow}>
                <Text style={styles.dollarSign}>$</Text>
                <TextInput
                  style={styles.amountInput}
                  value={amount}
                  onChangeText={setAmount}
                  placeholder="0.00"
                  placeholderTextColor={Colors.textSecondary}
                  keyboardType="decimal-pad"
                />
              </View>
            </View>

            <View style={styles.formField}>
              <Text style={styles.formLabel}>Description</Text>
              <TextInput
                style={styles.formInput}
                value={description}
                onChangeText={setDescription}
                placeholder="e.g. Dinner split, Rent"
                placeholderTextColor={Colors.textSecondary}
                maxLength={35}
              />
            </View>

            <View style={styles.formField}>
              <Text style={styles.formLabel}>Expires After</Text>
              <View style={styles.expiryRow}>
                {['30', '60', '120', '1440'].map((mins) => (
                  <Pressable
                    key={mins}
                    style={[styles.expiryChip, expiryMinutes === mins && styles.expiryChipActive]}
                    onPress={() => setExpiryMinutes(mins)}
                  >
                    <Text style={[styles.expiryChipText, expiryMinutes === mins && styles.expiryChipTextActive]}>
                      {mins === '30' ? '30m' : mins === '60' ? '1hr' : mins === '120' ? '2hr' : '24hr'}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <Pressable
              style={({ pressed }) => [styles.submitBtn, pressed && { opacity: 0.85 }, isCreating && { opacity: 0.6 }]}
              onPress={handleCreate}
              disabled={isCreating}
            >
              {isCreating ? (
                <ActivityIndicator color={Colors.primary} />
              ) : (
                <>
                  <Ionicons name="send" size={16} color={Colors.primary} />
                  <Text style={styles.submitBtnText}>Send Request</Text>
                </>
              )}
            </Pressable>
          </View>
        )}

        {/* Pending Requests */}
        {pendingRequests.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Pending ({pendingRequests.length})</Text>
            {pendingRequests.map((req) => (
              <RequestCard key={req.id} request={req} />
            ))}
          </View>
        )}

        {/* Completed/Expired */}
        {completedRequests.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>History</Text>
            {completedRequests.map((req) => (
              <RequestCard key={req.id} request={req} />
            ))}
          </View>
        )}

        {/* Empty State */}
        {requests.length === 0 && !showCreate && (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Ionicons name="receipt-outline" size={36} color={Colors.textSecondary} />
            </View>
            <Text style={styles.emptyTitle}>No Payment Requests</Text>
            <Text style={styles.emptySubtitle}>
              Create a payment request to receive instant payments via PayID. Recipients will be notified and can pay with one tap.
            </Text>
          </View>
        )}
      </ScrollView>
    </>
  );
}

function RequestCard({ request }: { request: PaymentRequest }) {
  const statusColor = getStatusColor(request.status);

  return (
    <View style={styles.requestCard}>
      <View style={styles.requestHeader}>
        <Ionicons name={getStatusIcon(request.status)} size={20} color={statusColor} />
        <View style={{ flex: 1 }}>
          <Text style={styles.requestAmount}>{formatCurrency(request.amount)}</Text>
          <Text style={styles.requestDesc}>{request.description}</Text>
        </View>
        <View style={[styles.requestBadge, { backgroundColor: `${statusColor}18` }]}>
          <Text style={[styles.requestBadgeText, { color: statusColor }]}>
            {request.status}
          </Text>
        </View>
      </View>
      <View style={styles.requestDetails}>
        <View style={styles.requestDetailRow}>
          <Text style={styles.requestDetailLabel}>PayID</Text>
          <Text selectable style={styles.requestDetailValue}>{request.payId}</Text>
        </View>
        <View style={styles.requestDetailRow}>
          <Text style={styles.requestDetailLabel}>Reference</Text>
          <Text selectable style={styles.requestDetailValue}>{request.reference}</Text>
        </View>
        <View style={styles.requestDetailRow}>
          <Text style={styles.requestDetailLabel}>Created</Text>
          <Text style={styles.requestDetailValue}>{formatTime(request.createdAt)}</Text>
        </View>
        {request.status === 'pending' && (
          <View style={styles.requestDetailRow}>
            <Text style={styles.requestDetailLabel}>Expires</Text>
            <Text style={[styles.requestDetailValue, { color: '#FF9800' }]}>
              {formatTime(request.expiresAt)}
            </Text>
          </View>
        )}
        {request.paidAt && (
          <View style={styles.requestDetailRow}>
            <Text style={styles.requestDetailLabel}>Paid</Text>
            <Text style={[styles.requestDetailValue, { color: Colors.success }]}>
              {formatTime(request.paidAt)}
              {request.payerName ? ` by ${request.payerName}` : ''}
            </Text>
          </View>
        )}
      </View>
    </View>
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
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  createBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.accent,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderCurve: 'continuous',
  },
  createBtnText: {
    fontSize: 14,
    fontFamily: Fonts.semiBold,
    color: Colors.primary,
  },
  refreshBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 8px rgba(0,75,90,0.06)',
  },
  formCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    gap: 16,
    borderCurve: 'continuous',
    boxShadow: '0 4px 16px rgba(0,75,90,0.08)',
  },
  formTitle: {
    fontSize: 16,
    fontFamily: Fonts.bold,
    color: Colors.textPrimary,
  },
  formField: {
    gap: 6,
  },
  formLabel: {
    fontSize: 11,
    fontFamily: Fonts.semiBold,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  formInput: {
    fontSize: 15,
    fontFamily: Fonts.regular,
    color: Colors.textPrimary,
    padding: 12,
    backgroundColor: Colors.background,
    borderRadius: 10,
    borderCurve: 'continuous',
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: 10,
    paddingHorizontal: 12,
    borderCurve: 'continuous',
  },
  dollarSign: {
    fontSize: 20,
    fontFamily: Fonts.bold,
    color: Colors.textSecondary,
  },
  amountInput: {
    flex: 1,
    fontSize: 24,
    fontFamily: Fonts.bold,
    color: Colors.textPrimary,
    padding: 12,
    fontVariant: ['tabular-nums'],
  },
  expiryRow: {
    flexDirection: 'row',
    gap: 8,
  },
  expiryChip: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderCurve: 'continuous',
  },
  expiryChipActive: {
    backgroundColor: Colors.primary,
  },
  expiryChipText: {
    fontSize: 13,
    fontFamily: Fonts.medium,
    color: Colors.textSecondary,
  },
  expiryChipTextActive: {
    color: Colors.white,
    fontFamily: Fonts.semiBold,
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: Colors.accent,
    borderRadius: 14,
    paddingVertical: 16,
    borderCurve: 'continuous',
    marginTop: 4,
  },
  submitBtnText: {
    fontSize: 15,
    fontFamily: Fonts.bold,
    color: Colors.primary,
  },
  section: {
    gap: 10,
  },
  sectionTitle: {
    fontSize: 12,
    fontFamily: Fonts.semiBold,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  requestCard: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    borderCurve: 'continuous',
    overflow: 'hidden',
    boxShadow: '0 2px 10px rgba(0, 75, 90, 0.06)',
  },
  requestHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  requestAmount: {
    fontSize: 16,
    fontFamily: Fonts.bold,
    color: Colors.textPrimary,
    fontVariant: ['tabular-nums'],
  },
  requestDesc: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  requestBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  requestBadgeText: {
    fontSize: 11,
    fontFamily: Fonts.semiBold,
    textTransform: 'capitalize',
  },
  requestDetails: {
    padding: 14,
    gap: 8,
  },
  requestDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  requestDetailLabel: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    color: Colors.textSecondary,
  },
  requestDetailValue: {
    fontSize: 12,
    fontFamily: Fonts.medium,
    color: Colors.textPrimary,
    maxWidth: '60%',
    textAlign: 'right',
  },
  emptyState: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    gap: 12,
    borderCurve: 'continuous',
    boxShadow: '0 2px 10px rgba(0, 75, 90, 0.06)',
    marginTop: 20,
  },
  emptyIcon: {
    width: 68,
    height: 68,
    borderRadius: 34,
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
    maxWidth: 280,
  },
});
