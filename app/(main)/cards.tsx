import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Switch,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppStore } from '@/store/useAppStore';
import { Colors } from '@/constants/Colors';
import { Fonts } from '@/constants/Typography';
import type { Card } from '@/store/types';

function CardVisual({ card, flipped }: { card: Card; flipped: boolean }) {
  if (flipped) {
    return (
      <View style={[styles.cardVisual, { backgroundColor: card.colour }]}>
        {/* Magnetic strip */}
        <View style={styles.magneticStrip} />
        <View style={styles.cvvRow}>
          <View style={styles.cvvBox}>
            <Text style={styles.cvvText}>•••</Text>
          </View>
          <Text style={styles.cvvLabel}>CVV</Text>
        </View>
        <View style={styles.cardBottomRow}>
          <Text style={styles.cardNetwork}>VISA</Text>
        </View>
        <View style={styles.cardDecor1} />
      </View>
    );
  }

  return (
    <View style={[styles.cardVisual, { backgroundColor: card.colour }]}>
      {/* Chip */}
      <View style={styles.chipArea}>
        <View style={styles.chip} />
        {card.isContactless && (
          <Ionicons name="wifi-outline" size={20} color="rgba(255,255,255,0.6)" style={{ transform: [{ rotate: '90deg' }] }} />
        )}
      </View>

      <Text style={styles.cardNumber}>
        •••• •••• •••• {card.last4}
      </Text>

      <View style={styles.cardBottomRow}>
        <View>
          <Text style={styles.cardLabel}>Card Holder</Text>
          <Text style={styles.cardValue}>{card.name}</Text>
        </View>
        <View>
          <Text style={styles.cardLabel}>Expires</Text>
          <Text style={styles.cardValue}>{card.expiry}</Text>
        </View>
        <Text style={styles.cardNetwork}>VISA</Text>
      </View>

      {/* Decorative circles */}
      <View style={styles.cardDecor1} />
      <View style={styles.cardDecor2} />

      {card.isLocked && (
        <View style={styles.lockOverlay}>
          <Ionicons name="lock-closed" size={32} color={Colors.white} />
          <Text style={styles.lockText}>Card Locked</Text>
        </View>
      )}
    </View>
  );
}

function CardItem({ card }: { card: Card }) {
  const [flipped, setFlipped] = useState(false);
  const toggleCardLock = useAppStore((s) => s.toggleCardLock);
  const accounts = useAppStore((s) => s.accounts);
  const account = accounts.find((a) => a.id === card.accountId);

  return (
    <View style={styles.cardWrapper}>
      <Pressable onPress={() => setFlipped((f) => !f)} style={{ marginBottom: 16 }}>
        <CardVisual card={card} flipped={flipped} />
        <Text style={styles.flipHint}>
          <Ionicons name="sync-outline" size={12} color={Colors.textSecondary} /> Tap to {flipped ? 'flip front' : 'see back'}
        </Text>
      </Pressable>

      {/* Card Details */}
      <View style={styles.cardDetails}>
        <View style={styles.cardDetailRow}>
          <View style={styles.cardDetailLeft}>
            <Ionicons name="card-outline" size={18} color={Colors.primary} />
            <Text style={styles.cardDetailLabel}>Linked Account</Text>
          </View>
          <Text style={styles.cardDetailValue}>{account?.name ?? 'Unknown'}</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.cardDetailRow}>
          <View style={styles.cardDetailLeft}>
            <Ionicons name="wifi-outline" size={18} color={Colors.primary} />
            <Text style={styles.cardDetailLabel}>Contactless</Text>
          </View>
          <Text style={[styles.cardDetailValue, { color: card.isContactless ? Colors.success : Colors.textSecondary }]}>
            {card.isContactless ? 'Enabled' : 'Disabled'}
          </Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.cardDetailRow}>
          <View style={styles.cardDetailLeft}>
            <Ionicons name={card.isLocked ? 'lock-closed' : 'lock-open-outline'} size={18} color={card.isLocked ? Colors.error : Colors.primary} />
            <View>
              <Text style={styles.cardDetailLabel}>Lock Card</Text>
              <Text style={styles.cardDetailSub}>Temporarily freeze your card</Text>
            </View>
          </View>
          <Switch
            value={card.isLocked}
            onValueChange={() => toggleCardLock(card.id)}
            trackColor={{ false: Colors.borderLight, true: '#FFCDD2' }}
            thumbColor={card.isLocked ? Colors.error : Colors.white}
          />
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.cardActions}>
        {[
          {
            icon: 'pin-outline' as const,
            label: 'PIN',
            onPress: () => Alert.alert('Change PIN', 'To change your card PIN, please visit an IMB Bank ATM or call us on 133 462.'),
          },
          {
            icon: 'shield-outline' as const,
            label: 'Manage',
            onPress: () => router.push('/settings/security'),
          },
          {
            icon: 'receipt-outline' as const,
            label: 'Transactions',
            onPress: () => router.push('/settings/transaction-history'),
          },
          {
            icon: 'help-circle-outline' as const,
            label: 'Report',
            onPress: () => router.push('/settings/report-card'),
          },
        ].map((action) => (
          <Pressable key={action.label} style={({ pressed }) => [styles.cardAction, pressed && { opacity: 0.7 }]} onPress={action.onPress}>
            <View style={styles.cardActionIcon}>
              <Ionicons name={action.icon} size={18} color={Colors.primary} />
            </View>
            <Text style={styles.cardActionLabel}>{action.label}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

export default function CardsScreen() {
  const insets = useSafeAreaInsets();
  const cards = useAppStore((s) => s.cards);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Cards</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {cards.map((card) => (
          <CardItem key={card.id} card={card} />
        ))}

        {/* Apply for new card */}
        <Pressable
          style={({ pressed }) => [styles.newCardBtn, pressed && { opacity: 0.8 }]}
          onPress={() => Alert.alert('Apply for a New Card', 'To apply for a new card, please visit your nearest IMB Bank branch or call us on 133 462.\n\nAlternatively, log in to IMB Internet Banking to apply online.')}
        >
          <View style={styles.newCardIcon}>
            <Ionicons name="add" size={22} color={Colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.newCardTitle}>Apply for a new card</Text>
            <Text style={styles.newCardSub}>Credit, debit, or travel cards available</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={Colors.textSecondary} />
        </Pressable>
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
    paddingBottom: 40,
    gap: 24,
  },
  cardWrapper: {
    gap: 0,
  },
  cardVisual: {
    height: 200,
    borderRadius: 20,
    padding: 24,
    borderCurve: 'continuous',
    overflow: 'hidden',
    boxShadow: '0 10px 30px rgba(0, 75, 90, 0.3)',
    justifyContent: 'space-between',
  },
  chipArea: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  chip: {
    width: 44,
    height: 34,
    borderRadius: 6,
    backgroundColor: '#C8A850',
    borderWidth: 1,
    borderColor: '#B8983F',
  },
  cardNumber: {
    fontSize: 20,
    fontFamily: Fonts.medium,
    color: Colors.white,
    letterSpacing: 2,
    textAlign: 'center',
  },
  cardBottomRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  cardLabel: {
    fontSize: 10,
    fontFamily: Fonts.regular,
    color: 'rgba(255,255,255,0.6)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cardValue: {
    fontSize: 13,
    fontFamily: Fonts.semiBold,
    color: Colors.white,
    marginTop: 2,
  },
  cardNetwork: {
    fontSize: 18,
    fontFamily: Fonts.bold,
    color: Colors.white,
    fontStyle: 'italic',
    letterSpacing: 1,
  },
  cardDecor1: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.06)',
    right: -60,
    top: -60,
  },
  cardDecor2: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255,255,255,0.04)',
    right: 60,
    bottom: -60,
  },
  lockOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 20,
  },
  lockText: {
    fontSize: 16,
    fontFamily: Fonts.semiBold,
    color: Colors.white,
  },
  magneticStrip: {
    height: 42,
    backgroundColor: 'rgba(0,0,0,0.4)',
    marginHorizontal: -24,
    marginTop: -4,
  },
  cvvRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 12,
  },
  cvvBox: {
    backgroundColor: Colors.white,
    paddingHorizontal: 20,
    paddingVertical: 6,
    borderRadius: 4,
    flex: 1,
  },
  cvvText: {
    fontSize: 14,
    fontFamily: Fonts.semiBold,
    color: Colors.textPrimary,
    letterSpacing: 2,
    textAlign: 'right',
  },
  cvvLabel: {
    fontSize: 12,
    fontFamily: Fonts.medium,
    color: 'rgba(255,255,255,0.7)',
  },
  flipHint: {
    fontSize: 11,
    fontFamily: Fonts.regular,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
  },
  cardDetails: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    borderCurve: 'continuous',
    boxShadow: '0 2px 10px rgba(0, 75, 90, 0.06)',
    marginBottom: 12,
  },
  cardDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  cardDetailLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  cardDetailLabel: {
    fontSize: 14,
    fontFamily: Fonts.medium,
    color: Colors.textPrimary,
  },
  cardDetailSub: {
    fontSize: 11,
    fontFamily: Fonts.regular,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  cardDetailValue: {
    fontSize: 13,
    fontFamily: Fonts.medium,
    color: Colors.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.borderLight,
  },
  cardActions: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    justifyContent: 'space-around',
    borderCurve: 'continuous',
    boxShadow: '0 2px 10px rgba(0, 75, 90, 0.06)',
  },
  cardAction: {
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  cardActionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardActionLabel: {
    fontSize: 11,
    fontFamily: Fonts.medium,
    color: Colors.textPrimary,
  },
  newCardBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 18,
    borderCurve: 'continuous',
    boxShadow: '0 2px 10px rgba(0, 75, 90, 0.06)',
  },
  newCardIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.border,
    borderStyle: 'dashed',
  },
  newCardTitle: {
    fontSize: 15,
    fontFamily: Fonts.semiBold,
    color: Colors.textPrimary,
  },
  newCardSub: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    color: Colors.textSecondary,
    marginTop: 2,
  },
});
