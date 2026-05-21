import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAppStore } from '@/store/useAppStore';
import { Colors } from '@/constants/Colors';
import { Fonts } from '@/constants/Typography';
import type { Card } from '@/store/types';

const REPORT_REASONS = [
  { id: 'reported-lost', label: 'Lost', subtitle: 'I cannot find my card', icon: 'help-circle-outline' as const },
  { id: 'reported-stolen', label: 'Stolen', subtitle: 'My card was taken without consent', icon: 'warning-outline' as const },
  { id: 'reported-damaged', label: 'Damaged', subtitle: 'Card is physically damaged/worn', icon: 'build-outline' as const },
];

export default function ReportCardScreen() {
  const { cards, accounts, reportCard } = useAppStore();
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const activeCards = cards.filter((c) => c.status === 'active' || !c.status);
  const accountForCard = (card: Card) => accounts.find((a) => a.id === card.accountId);

  const handleSubmit = () => {
    if (!selectedCardId || !selectedReason) {
      Alert.alert('Required', 'Please select a card and reason.');
      return;
    }
    const card = cards.find((c) => c.id === selectedCardId);
    const reason = REPORT_REASONS.find((r) => r.id === selectedReason);
    Alert.alert(
      'Confirm Report',
      `Report card ending in ${card?.last4} as ${reason?.label}?\n\nThis will immediately lock the card and a replacement will be mailed within 5-7 business days.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm Report',
          style: 'destructive',
          onPress: () => {
            reportCard(selectedCardId, selectedReason);
            setSubmitted(true);
          },
        },
      ]
    );
  };

  if (submitted) {
    const card = cards.find((c) => c.id === selectedCardId);
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32, gap: 16 }}>
        <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: '#E8F5E9', alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name="checkmark-circle" size={48} color={Colors.success} />
        </View>
        <Text style={{ fontSize: 22, fontFamily: Fonts.bold, color: Colors.textPrimary, textAlign: 'center' }}>Card Reported</Text>
        <Text style={{ fontSize: 14, fontFamily: Fonts.regular, color: Colors.textSecondary, textAlign: 'center', lineHeight: 22 }}>
          Card ending in {card?.last4} has been locked.{'\n\n'}
          Reference: RPT-{Date.now().toString().slice(-6)}{'\n\n'}
          A replacement card will be mailed to your registered address within 5-7 business days.
        </Text>
        <Pressable
          style={{ backgroundColor: Colors.primary, borderRadius: 14, paddingHorizontal: 32, paddingVertical: 14, marginTop: 8 }}
          onPress={() => router.back()}
        >
          <Text style={{ fontSize: 16, fontFamily: Fonts.bold, color: Colors.white }}>Done</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={{ padding: 20, gap: 20, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>

      <View style={{ backgroundColor: '#FFF3E0', borderRadius: 12, padding: 14, flexDirection: 'row', gap: 10, borderCurve: 'continuous' }}>
        <Ionicons name="warning" size={20} color={Colors.warning} />
        <Text style={{ flex: 1, fontSize: 13, fontFamily: Fonts.regular, color: Colors.textPrimary, lineHeight: 18 }}>
          Reporting a card as lost or stolen will immediately lock it and cancel any pending transactions.
        </Text>
      </View>

      {/* Card selection */}
      <View style={{ gap: 10 }}>
        <Text style={{ fontSize: 12, fontFamily: Fonts.semiBold, color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 }}>Select Card</Text>
        {activeCards.map((card) => {
          const acct = accountForCard(card);
          return (
            <Pressable
              key={card.id}
              style={({ pressed }) => [{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 14,
                backgroundColor: Colors.white,
                borderRadius: 14,
                padding: 16,
                borderWidth: 2,
                borderColor: selectedCardId === card.id ? Colors.primary : 'transparent',
                borderCurve: 'continuous',
                opacity: pressed ? 0.8 : 1,
              }]}
              onPress={() => setSelectedCardId(card.id)}
            >
              <View style={{ width: 52, height: 32, borderRadius: 6, backgroundColor: card.colour, alignItems: 'center', justifyContent: 'center', borderCurve: 'continuous' }}>
                <Text style={{ fontSize: 10, fontFamily: Fonts.bold, color: Colors.white }}>VISA</Text>
              </View>
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={{ fontSize: 14, fontFamily: Fonts.semiBold, color: Colors.textPrimary }}>
                  •••• •••• •••• {card.last4}
                </Text>
                <Text style={{ fontSize: 12, fontFamily: Fonts.regular, color: Colors.textSecondary }}>
                  {acct?.name ?? ''} · Exp {card.expiry}
                </Text>
              </View>
              <View style={{ width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: selectedCardId === card.id ? Colors.primary : Colors.border, alignItems: 'center', justifyContent: 'center' }}>
                {selectedCardId === card.id && <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: Colors.primary }} />}
              </View>
            </Pressable>
          );
        })}

        {activeCards.length === 0 && (
          <View style={{ backgroundColor: Colors.white, borderRadius: 14, padding: 20, alignItems: 'center' }}>
            <Text style={{ fontSize: 14, fontFamily: Fonts.regular, color: Colors.textSecondary }}>No active cards to report.</Text>
          </View>
        )}
      </View>

      {/* Reason */}
      <View style={{ gap: 10 }}>
        <Text style={{ fontSize: 12, fontFamily: Fonts.semiBold, color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 }}>Reason</Text>
        {REPORT_REASONS.map((reason) => (
          <Pressable
            key={reason.id}
            style={({ pressed }) => [{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 14,
              backgroundColor: Colors.white,
              borderRadius: 14,
              padding: 16,
              borderWidth: 2,
              borderColor: selectedReason === reason.id ? Colors.primary : 'transparent',
              borderCurve: 'continuous',
              opacity: pressed ? 0.8 : 1,
            }]}
            onPress={() => setSelectedReason(reason.id)}
          >
            <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name={reason.icon} size={20} color={Colors.primary} />
            </View>
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={{ fontSize: 15, fontFamily: Fonts.semiBold, color: Colors.textPrimary }}>{reason.label}</Text>
              <Text style={{ fontSize: 12, fontFamily: Fonts.regular, color: Colors.textSecondary }}>{reason.subtitle}</Text>
            </View>
            <View style={{ width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: selectedReason === reason.id ? Colors.primary : Colors.border, alignItems: 'center', justifyContent: 'center' }}>
              {selectedReason === reason.id && <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: Colors.primary }} />}
            </View>
          </Pressable>
        ))}
      </View>

      <Pressable
        style={({ pressed }) => [{
          backgroundColor: selectedCardId && selectedReason ? Colors.error : Colors.border,
          borderRadius: 14,
          paddingVertical: 16,
          alignItems: 'center',
          borderCurve: 'continuous',
          opacity: pressed ? 0.85 : 1,
        }]}
        onPress={handleSubmit}
        disabled={!selectedCardId || !selectedReason}
      >
        <Text style={{ fontSize: 16, fontFamily: Fonts.bold, color: Colors.white }}>Report Card</Text>
      </Pressable>

      <Text style={{ fontSize: 12, fontFamily: Fonts.regular, color: Colors.textSecondary, textAlign: 'center', lineHeight: 18 }}>
        For urgent assistance call 133 462 (24/7 for lost/stolen cards)
      </Text>
    </ScrollView>
  );
}
