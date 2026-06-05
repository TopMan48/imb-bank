import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Switch,
  Alert,
  Modal,
  TextInput,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppStore } from '@/store/useAppStore';
import { Colors } from '@/constants/Colors';
import { Fonts } from '@/constants/Typography';
import type { Card } from '@/store/types';

function CardVisual({ card, flipped, showSensitive }: { card: Card; flipped: boolean; showSensitive: boolean }) {
  if (flipped) {
    return (
      <View style={[styles.cardVisual, { backgroundColor: card.colour }]}>
        <View style={styles.magneticStrip} />
        <View style={styles.cvvRow}>
          <View style={styles.cvvBox}>
            <Text style={styles.cvvText} selectable={showSensitive}>
              {showSensitive ? card.cvv || '---' : '•••'}
            </Text>
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
      <View style={styles.chipArea}>
        <View style={styles.chip} />
        {card.isContactless && (
          <Ionicons name="wifi-outline" size={20} color="rgba(255,255,255,0.6)" style={{ transform: [{ rotate: '90deg' }] }} />
        )}
      </View>
      <Text style={styles.cardNumber} selectable={showSensitive}>
        {showSensitive
          ? (card.fullNumber || `•••• •••• •••• ${card.last4}`)
          : `•••• •••• •••• ${card.last4}`
        }
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
      <View style={styles.cardDecor1} />
      <View style={styles.cardDecor2} />
      {card.isLocked && (
        <View style={styles.lockOverlay}>
          <Ionicons name="lock-closed" size={32} color={Colors.white} />
          <Text style={styles.lockText}>Card Locked</Text>
        </View>
      )}
      {(card.status === 'reported-lost' || card.status === 'reported-stolen' || card.status === 'reported-damaged') && (
        <View style={[styles.lockOverlay, { backgroundColor: 'rgba(198,40,40,0.7)' }]}>
          <Ionicons name="warning" size={32} color={Colors.white} />
          <Text style={styles.lockText}>
            {card.status === 'reported-lost' ? 'Reported Lost' : card.status === 'reported-stolen' ? 'Reported Stolen' : 'Reported Damaged'}
          </Text>
        </View>
      )}
    </View>
  );
}

function AnimatedCard({ card, showSensitive }: { card: Card; showSensitive: boolean }) {
  const flipAnim = useRef(new Animated.Value(0)).current;
  const [isFlipped, setIsFlipped] = useState(false);

  const flipCard = () => {
    const toValue = isFlipped ? 0 : 1;
    Animated.spring(flipAnim, {
      toValue,
      friction: 8,
      tension: 60,
      useNativeDriver: true,
    }).start();
    setIsFlipped(!isFlipped);
  };

  const frontInterpolate = flipAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ['0deg', '90deg', '180deg'],
  });

  const backInterpolate = flipAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ['180deg', '270deg', '360deg'],
  });

  const frontOpacity = flipAnim.interpolate({
    inputRange: [0, 0.5, 0.5, 1],
    outputRange: [1, 1, 0, 0],
  });

  const backOpacity = flipAnim.interpolate({
    inputRange: [0, 0.5, 0.5, 1],
    outputRange: [0, 0, 1, 1],
  });

  return (
    <View>
      <Pressable onPress={flipCard} style={{ marginBottom: 16 }}>
        <View style={{ position: 'relative' }}>
          <Animated.View
            style={[
              { backfaceVisibility: 'hidden', opacity: frontOpacity },
              { transform: [{ perspective: 1000 }, { rotateY: frontInterpolate }] },
            ]}
          >
            <CardVisual card={card} flipped={false} showSensitive={showSensitive} />
          </Animated.View>
          <Animated.View
            style={[
              { backfaceVisibility: 'hidden', position: 'absolute', top: 0, left: 0, right: 0, opacity: backOpacity },
              { transform: [{ perspective: 1000 }, { rotateY: backInterpolate }] },
            ]}
          >
            <CardVisual card={card} flipped={true} showSensitive={showSensitive} />
          </Animated.View>
        </View>
        <Text style={styles.flipHint}>
          <Ionicons name="sync-outline" size={12} color={Colors.textSecondary} /> Tap to {isFlipped ? 'flip front' : 'see back'}
        </Text>
      </Pressable>
    </View>
  );
}

function TravelModeModal({ card, visible, onClose }: { card: Card; visible: boolean; onClose: () => void }) {
  const COUNTRIES = ['New Zealand', 'United Kingdom', 'United States', 'Japan', 'Singapore', 'France', 'Germany', 'Canada', 'Italy', 'Thailand'];
  const [selected, setSelected] = useState<string[]>([]);

  const toggle = (c: string) => {
    setSelected((prev) => prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]);
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="formSheet" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: Colors.background }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', padding: 20, paddingTop: 24, backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.borderLight }}>
          <Text style={{ flex: 1, fontSize: 18, fontFamily: Fonts.bold, color: Colors.textPrimary }}>Travel Mode</Text>
          <Pressable onPress={onClose} style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name="close" size={20} color={Colors.textSecondary} />
          </Pressable>
        </View>
        <ScrollView contentContainerStyle={{ padding: 20, gap: 16 }}>
          <View style={{ backgroundColor: '#E3F2FD', borderRadius: 12, padding: 14, flexDirection: 'row', gap: 10 }}>
            <Ionicons name="airplane-outline" size={18} color={Colors.info} />
            <Text style={{ flex: 1, fontSize: 13, fontFamily: Fonts.regular, color: Colors.info, lineHeight: 18 }}>
              Enable Travel Mode so your card works overseas without triggering fraud alerts. Select your destination countries.
            </Text>
          </View>
          <Text style={{ fontSize: 12, fontFamily: Fonts.semiBold, color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Destinations
          </Text>
          <View style={{ backgroundColor: Colors.white, borderRadius: 16, overflow: 'hidden', borderCurve: 'continuous', boxShadow: '0 2px 10px rgba(0,75,90,0.06)' }}>
            {COUNTRIES.map((country, index) => (
              <Pressable
                key={country}
                style={({ pressed }) => [{
                  flexDirection: 'row',
                  alignItems: 'center',
                  padding: 14,
                  gap: 12,
                  borderBottomWidth: index === COUNTRIES.length - 1 ? 0 : 1,
                  borderBottomColor: Colors.borderLight,
                  minHeight: 52,
                  backgroundColor: pressed ? Colors.background : 'transparent',
                }]}
                onPress={() => toggle(country)}
              >
                <Ionicons name={selected.includes(country) ? 'checkmark-circle' : 'ellipse-outline'} size={22} color={selected.includes(country) ? Colors.primary : Colors.border} />
                <Text style={{ flex: 1, fontSize: 14, fontFamily: Fonts.medium, color: Colors.textPrimary }}>{country}</Text>
              </Pressable>
            ))}
          </View>
          <Pressable
            style={({ pressed }) => [{
              backgroundColor: selected.length > 0 ? Colors.accent : Colors.border,
              borderRadius: 14,
              paddingVertical: 16,
              alignItems: 'center',
              borderCurve: 'continuous',
              opacity: pressed ? 0.85 : 1,
            }]}
            onPress={() => {
              if (selected.length === 0) return;
              Alert.alert(
                'Travel Mode Enabled',
                `Your card ending in ${card.last4} is now enabled for: ${selected.join(', ')}.\n\nRemember to disable Travel Mode when you return.`,
                [{ text: 'Done', onPress: onClose }]
              );
            }}
            disabled={selected.length === 0}
          >
            <Text style={{ fontSize: 16, fontFamily: Fonts.bold, color: selected.length > 0 ? Colors.primary : Colors.textSecondary }}>
              Enable Travel Mode{selected.length > 0 ? ` (${selected.length})` : ''}
            </Text>
          </Pressable>
        </ScrollView>
      </View>
    </Modal>
  );
}

function CardActivationModal({ card, visible, onClose }: { card: Card; visible: boolean; onClose: () => void }) {
  const [done, setDone] = useState(false);

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="formSheet" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: Colors.background }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', padding: 20, paddingTop: 24, backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.borderLight }}>
          <Text style={{ flex: 1, fontSize: 18, fontFamily: Fonts.bold, color: Colors.textPrimary }}>Activate Card</Text>
          <Pressable onPress={onClose} style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name="close" size={20} color={Colors.textSecondary} />
          </Pressable>
        </View>
        <View style={{ flex: 1, padding: 20, gap: 20 }}>
          {done ? (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 }}>
              <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: '#E8F5E9', alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name="checkmark-circle" size={48} color={Colors.success} />
              </View>
              <Text style={{ fontSize: 22, fontFamily: Fonts.bold, color: Colors.textPrimary }}>Card Activated!</Text>
              <Text style={{ fontSize: 14, fontFamily: Fonts.regular, color: Colors.textSecondary, textAlign: 'center' }}>
                Your Visa card ending in {card.last4} is now active and ready to use.
              </Text>
              <Pressable
                style={{ backgroundColor: Colors.accent, borderRadius: 14, paddingVertical: 14, paddingHorizontal: 40, borderCurve: 'continuous' }}
                onPress={onClose}
              >
                <Text style={{ fontSize: 15, fontFamily: Fonts.bold, color: Colors.primary }}>Done</Text>
              </Pressable>
            </View>
          ) : (
            <>
              <View style={{ backgroundColor: '#E8F5E9', borderRadius: 12, padding: 14, flexDirection: 'row', gap: 10 }}>
                <Ionicons name="information-circle-outline" size={18} color={Colors.success} />
                <Text style={{ flex: 1, fontSize: 13, fontFamily: Fonts.regular, color: Colors.textPrimary, lineHeight: 18 }}>
                  {'To activate your new card, you\'ll need to make a purchase or ATM transaction with your PIN. Alternatively, tap "Activate Now" below.'}
                </Text>
              </View>
              <View style={{ backgroundColor: Colors.white, borderRadius: 16, padding: 18, gap: 10, borderCurve: 'continuous', boxShadow: '0 2px 10px rgba(0,75,90,0.06)' }}>
                <Text style={{ fontSize: 13, fontFamily: Fonts.semiBold, color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 }}>Card Details</Text>
                <Text style={{ fontSize: 15, fontFamily: Fonts.medium, color: Colors.textPrimary }}>Visa •••• {card.last4}</Text>
                <Text style={{ fontSize: 13, fontFamily: Fonts.regular, color: Colors.textSecondary }}>{card.name}</Text>
                <Text style={{ fontSize: 13, fontFamily: Fonts.regular, color: Colors.textSecondary }}>Expires: {card.expiry}</Text>
              </View>
              <View style={{ flex: 1 }} />
              <Pressable
                style={({ pressed }) => [{
                  backgroundColor: Colors.accent,
                  borderRadius: 14,
                  paddingVertical: 16,
                  alignItems: 'center',
                  borderCurve: 'continuous',
                  opacity: pressed ? 0.85 : 1,
                }]}
                onPress={() => setDone(true)}
              >
                <Text style={{ fontSize: 16, fontFamily: Fonts.bold, color: Colors.primary }}>Activate Card Now</Text>
              </Pressable>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

function EditCardModal({
  card,
  visible,
  onClose,
}: {
  card: Card;
  visible: boolean;
  onClose: () => void;
}) {
  const updateCard = useAppStore((s) => s.updateCard);
  const [name, setName] = useState(card.name);
  const [fullNumber, setFullNumber] = useState(card.fullNumber || '');
  const [expiry, setExpiry] = useState(card.expiry);
  const [cvv, setCvv] = useState(card.cvv || '');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (visible) {
      setName(card.name);
      setFullNumber(card.fullNumber || '');
      setExpiry(card.expiry);
      setCvv(card.cvv || '');
      setErrors({});
    }
  }, [visible, card]);

  const formatCardNumber = (text: string) => {
    const digits = text.replace(/\D/g, '').slice(0, 16);
    const parts = digits.match(/.{1,4}/g) || [];
    return parts.join(' ');
  };

  const formatExpiry = (text: string) => {
    const digits = text.replace(/\D/g, '').slice(0, 4);
    if (digits.length > 2) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    return digits;
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = 'Name is required';
    const numDigits = fullNumber.replace(/\D/g, '');
    if (numDigits.length !== 16) newErrors.fullNumber = 'Card number must be 16 digits';
    const expiryDigits = expiry.replace(/\D/g, '');
    if (expiryDigits.length !== 4) newErrors.expiry = 'Enter MM/YY format';
    else {
      const month = parseInt(expiryDigits.slice(0, 2), 10);
      if (month < 1 || month > 12) newErrors.expiry = 'Invalid month';
    }
    if (cvv.length < 3 || cvv.length > 4) newErrors.cvv = 'CVV must be 3-4 digits';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    const numDigits = fullNumber.replace(/\D/g, '');
    const newLast4 = numDigits.slice(-4);
    updateCard(card.id, {
      name: name.trim(),
      fullNumber: formatCardNumber(numDigits),
      last4: newLast4,
      expiry,
      cvv,
    });
    Alert.alert('Card Updated', 'Your card details have been saved successfully.');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="formSheet" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: Colors.background }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', padding: 20, paddingTop: 24, backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.borderLight }}>
          <Text style={{ flex: 1, fontSize: 18, fontFamily: Fonts.bold, color: Colors.textPrimary }}>Edit Card Details</Text>
          <Pressable onPress={onClose} style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name="close" size={20} color={Colors.textSecondary} />
          </Pressable>
        </View>
        <ScrollView contentContainerStyle={{ padding: 20, gap: 16 }}>
          <View style={{ backgroundColor: '#E3F2FD', borderRadius: 12, padding: 14, flexDirection: 'row', gap: 10 }}>
            <Ionicons name="information-circle-outline" size={18} color={Colors.info} />
            <Text style={{ flex: 1, fontSize: 13, fontFamily: Fonts.regular, color: Colors.info, lineHeight: 18 }}>
              Update your card details below. Changes will take effect immediately.
            </Text>
          </View>

          <View style={{ backgroundColor: Colors.white, borderRadius: 16, borderCurve: 'continuous', boxShadow: '0 2px 10px rgba(0,75,90,0.06)', overflow: 'hidden' }}>
            {/* Cardholder Name */}
            <View style={{ padding: 14, gap: 4 }}>
              <Text style={editStyles.label}>Cardholder Name</Text>
              <TextInput
                style={editStyles.input}
                value={name}
                onChangeText={setName}
                placeholder="Full name on card"
                placeholderTextColor={Colors.textSecondary}
                autoCapitalize="words"
              />
              {errors.name && <Text style={editStyles.error}>{errors.name}</Text>}
            </View>
            <View style={editStyles.divider} />

            {/* Card Number */}
            <View style={{ padding: 14, gap: 4 }}>
              <Text style={editStyles.label}>Card Number</Text>
              <TextInput
                style={editStyles.input}
                value={fullNumber}
                onChangeText={(v) => setFullNumber(formatCardNumber(v))}
                placeholder="XXXX XXXX XXXX XXXX"
                placeholderTextColor={Colors.textSecondary}
                keyboardType="numeric"
                maxLength={19}
              />
              {errors.fullNumber && <Text style={editStyles.error}>{errors.fullNumber}</Text>}
            </View>
            <View style={editStyles.divider} />

            {/* Expiry + CVV Row */}
            <View style={{ flexDirection: 'row' }}>
              <View style={{ flex: 1, padding: 14, gap: 4 }}>
                <Text style={editStyles.label}>Expiry (MM/YY)</Text>
                <TextInput
                  style={editStyles.input}
                  value={expiry}
                  onChangeText={(v) => setExpiry(formatExpiry(v))}
                  placeholder="MM/YY"
                  placeholderTextColor={Colors.textSecondary}
                  keyboardType="numeric"
                  maxLength={5}
                />
                {errors.expiry && <Text style={editStyles.error}>{errors.expiry}</Text>}
              </View>
              <View style={{ width: 1, backgroundColor: Colors.borderLight }} />
              <View style={{ flex: 1, padding: 14, gap: 4 }}>
                <Text style={editStyles.label}>CVV</Text>
                <TextInput
                  style={editStyles.input}
                  value={cvv}
                  onChangeText={(v) => setCvv(v.replace(/\D/g, '').slice(0, 4))}
                  placeholder="XXX"
                  placeholderTextColor={Colors.textSecondary}
                  keyboardType="numeric"
                  maxLength={4}
                  secureTextEntry
                />
                {errors.cvv && <Text style={editStyles.error}>{errors.cvv}</Text>}
              </View>
            </View>
          </View>

          <Pressable
            style={({ pressed }) => [{
              backgroundColor: Colors.accent,
              borderRadius: 14,
              paddingVertical: 16,
              alignItems: 'center',
              borderCurve: 'continuous',
              opacity: pressed ? 0.85 : 1,
              marginTop: 8,
            }]}
            onPress={handleSave}
          >
            <Text style={{ fontSize: 16, fontFamily: Fonts.bold, color: Colors.primary }}>Save Changes</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [{ paddingVertical: 14, alignItems: 'center', opacity: pressed ? 0.6 : 1 }]}
            onPress={onClose}
          >
            <Text style={{ fontSize: 14, fontFamily: Fonts.medium, color: Colors.textSecondary }}>Cancel</Text>
          </Pressable>
        </ScrollView>
      </View>
    </Modal>
  );
}

const editStyles = StyleSheet.create({
  label: {
    fontSize: 11,
    fontFamily: Fonts.semiBold,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    fontSize: 15,
    fontFamily: Fonts.regular,
    color: Colors.textPrimary,
    paddingVertical: 4,
  },
  error: {
    fontSize: 11,
    fontFamily: Fonts.regular,
    color: Colors.error,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginHorizontal: 14,
  },
});

function CardItem({ card }: { card: Card }) {
  const [showTravel, setShowTravel] = useState(false);
  const [showActivation, setShowActivation] = useState(false);
  const [showEditCard, setShowEditCard] = useState(false);
  const [showSensitive, setShowSensitive] = useState(false);
  const toggleCardLock = useAppStore((s) => s.toggleCardLock);
  const accounts = useAppStore((s) => s.accounts);
  const account = accounts.find((a) => a.id === card.accountId);

  const isReported = card.status && card.status !== 'active';

  return (
    <View style={styles.cardWrapper}>
      <AnimatedCard card={card} showSensitive={showSensitive} />

      {/* Show/Hide toggle */}
      <Pressable
        style={({ pressed }) => [styles.eyeToggle, pressed && { opacity: 0.7 }]}
        onPress={() => setShowSensitive(!showSensitive)}
      >
        <Ionicons
          name={showSensitive ? 'eye-off-outline' : 'eye-outline'}
          size={16}
          color={Colors.primary}
        />
        <Text style={styles.eyeToggleText}>
          {showSensitive ? 'Hide Details' : 'Show Details'}
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
              <Text style={styles.cardDetailLabel}>Freeze Card</Text>
              <Text style={styles.cardDetailSub}>Temporarily block all transactions</Text>
            </View>
          </View>
          <Switch
            value={card.isLocked}
            onValueChange={() => toggleCardLock(card.id)}
            trackColor={{ false: Colors.borderLight, true: '#FFCDD2' }}
            thumbColor={card.isLocked ? Colors.error : Colors.white}
            disabled={!!isReported}
          />
        </View>

        {isReported && (
          <View>
            <View style={styles.divider} />
            <View style={[styles.cardDetailRow, { paddingVertical: 12 }]}>
              <View style={[styles.reportedBadge]}>
                <Ionicons name="warning-outline" size={14} color="#B71C1C" />
                <Text style={styles.reportedText}>
                  This card has been {card.status === 'reported-lost' ? 'reported lost' : card.status === 'reported-stolen' ? 'reported stolen' : 'reported damaged'}.
                  {card.reportedAt ? ` Reported on ${new Date(card.reportedAt).toLocaleDateString('en-AU')}.` : ''}
                </Text>
              </View>
            </View>
          </View>
        )}
      </View>

      {/* Quick Actions */}
      <View style={styles.cardActions}>
        {[
          {
            icon: 'pin-outline' as const,
            label: 'Change PIN',
            onPress: () => Alert.alert('Change PIN', 'To change your card PIN, please visit an IMB Bank ATM or call us on 133 462.'),
          },
          {
            icon: 'airplane-outline' as const,
            label: 'Travel Mode',
            onPress: () => setShowTravel(true),
          },
          {
            icon: 'flash-outline' as const,
            label: 'Activate',
            onPress: () => setShowActivation(true),
          },
          {
            icon: 'refresh-outline' as const,
            label: 'Replace',
            onPress: () => setShowEditCard(true),
          },
          {
            icon: 'receipt-outline' as const,
            label: 'Transactions',
            onPress: () => router.push('/settings/transaction-history'),
          },
          {
            icon: 'warning-outline' as const,
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

      <TravelModeModal card={card} visible={showTravel} onClose={() => setShowTravel(false)} />
      <CardActivationModal card={card} visible={showActivation} onClose={() => setShowActivation(false)} />
      <EditCardModal card={card} visible={showEditCard} onClose={() => setShowEditCard(false)} />
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
  eyeToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: Colors.white,
    borderRadius: 20,
    alignSelf: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    minHeight: 36,
  },
  eyeToggleText: {
    fontSize: 12,
    fontFamily: Fonts.medium,
    color: Colors.primary,
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
  reportedBadge: {
    flex: 1,
    flexDirection: 'row',
    gap: 8,
    backgroundColor: '#FFEBEE',
    borderRadius: 10,
    padding: 12,
    alignItems: 'flex-start',
  },
  reportedText: {
    flex: 1,
    fontSize: 12,
    fontFamily: Fonts.regular,
    color: '#B71C1C',
    lineHeight: 17,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.borderLight,
  },
  cardActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    borderCurve: 'continuous',
    boxShadow: '0 2px 10px rgba(0, 75, 90, 0.06)',
    gap: 8,
  },
  cardAction: {
    alignItems: 'center',
    gap: 6,
    width: '30%',
    minWidth: 70,
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
    textAlign: 'center',
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
