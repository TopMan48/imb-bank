import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { Fonts } from '@/constants/Typography';

const FAQ_ITEMS = [
  { q: 'How do I transfer money to another bank?', a: 'Tap the Pay tab, select "Pay Anyone", choose your payee or add a new one, enter the amount and confirm.' },
  { q: 'What is my BSB number?', a: 'IMB Bank BSB is 641-800. You can find your individual account BSB in the Accounts tab.' },
  { q: 'How do I dispute a transaction?', a: 'Call 133 462 or visit your nearest IMB branch. Have your account number and the transaction details ready.' },
  { q: 'What are the daily transfer limits?', a: 'Default daily limits: Pay Anyone $25,000, BPAY $10,000, International $5,000. Contact us to change your limits.' },
  { q: 'How do I unlock my card?', a: 'Go to the Cards tab and toggle the lock switch. If your card is lost or stolen, use "Report Card" in the More menu.' },
  { q: 'What is PayID / Osko?', a: 'PayID is an identifier (email, mobile, ABN) linked to your bank account. Osko enables near-instant payments 24/7.' },
  { q: 'How do I set up a PayTo agreement?', a: 'In the Pay tab, select "PayTo" from the payment methods. You can manage active agreements from More > PayTo Agreements.' },
  { q: 'How do I enable biometrics?', a: 'Go to More > Security > Biometric Login and toggle it on. You\'ll need to verify your passcode first.' },
];

export default function HelpScreen() {
  const [searchText, setSearchText] = useState('');
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const filtered = FAQ_ITEMS.filter(
    (item) =>
      !searchText ||
      item.q.toLowerCase().includes(searchText.toLowerCase()) ||
      item.a.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <ScrollView contentContainerStyle={{ padding: 20, gap: 20, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>

      {/* Search */}
      <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.white, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, gap: 10, borderCurve: 'continuous', boxShadow: '0 2px 10px rgba(0,75,90,0.06)' }}>
        <Ionicons name="search-outline" size={20} color={Colors.textSecondary} />
        <TextInput
          value={searchText}
          onChangeText={setSearchText}
          placeholder="Search help articles..."
          placeholderTextColor={Colors.textSecondary}
          style={{ flex: 1, fontSize: 15, fontFamily: Fonts.regular, color: Colors.textPrimary }}
        />
      </View>

      {/* Quick actions */}
      <View style={{ flexDirection: 'row', gap: 12 }}>
        {[
          { icon: 'call-outline' as const, label: 'Call Us', sub: '133 462' },
          { icon: 'chatbubble-outline' as const, label: 'Live Chat', sub: 'Online now' },
          { icon: 'location-outline' as const, label: 'Find Branch', sub: '27 locations' },
        ].map((item) => (
          <Pressable
            key={item.label}
            style={({ pressed }) => [{
              flex: 1,
              backgroundColor: Colors.white,
              borderRadius: 14,
              padding: 14,
              alignItems: 'center',
              gap: 6,
              borderCurve: 'continuous',
              boxShadow: '0 2px 10px rgba(0,75,90,0.06)',
              opacity: pressed ? 0.8 : 1,
            }]}
          >
            <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name={item.icon} size={20} color={Colors.primary} />
            </View>
            <Text style={{ fontSize: 12, fontFamily: Fonts.semiBold, color: Colors.textPrimary, textAlign: 'center' }}>{item.label}</Text>
            <Text style={{ fontSize: 11, fontFamily: Fonts.regular, color: Colors.textSecondary }}>{item.sub}</Text>
          </Pressable>
        ))}
      </View>

      {/* FAQ */}
      <View style={{ gap: 10 }}>
        <Text style={{ fontSize: 12, fontFamily: Fonts.semiBold, color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, paddingHorizontal: 4 }}>
          Frequently Asked Questions
        </Text>
        <View style={{ backgroundColor: Colors.white, borderRadius: 16, overflow: 'hidden', borderCurve: 'continuous', boxShadow: '0 2px 10px rgba(0,75,90,0.06)' }}>
          {filtered.length === 0 ? (
            <View style={{ padding: 24, alignItems: 'center', gap: 8 }}>
              <Ionicons name="search-outline" size={32} color={Colors.textSecondary} />
              <Text style={{ fontSize: 14, fontFamily: Fonts.regular, color: Colors.textSecondary }}>No results found</Text>
            </View>
          ) : filtered.map((item, index) => (
            <View key={index} style={{ borderBottomWidth: index < filtered.length - 1 ? 1 : 0, borderBottomColor: Colors.borderLight }}>
              <Pressable
                style={({ pressed }) => [{
                  flexDirection: 'row',
                  alignItems: 'center',
                  padding: 16,
                  gap: 12,
                  backgroundColor: pressed ? Colors.background : 'transparent',
                }]}
                onPress={() => setExpandedIndex(expandedIndex === index ? null : index)}
              >
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontFamily: Fonts.medium, color: Colors.textPrimary }}>{item.q}</Text>
                </View>
                <Ionicons
                  name={expandedIndex === index ? 'chevron-up' : 'chevron-down'}
                  size={16}
                  color={Colors.textSecondary}
                />
              </Pressable>
              {expandedIndex === index && (
                <View style={{ paddingHorizontal: 16, paddingBottom: 16, paddingTop: 0 }}>
                  <Text style={{ fontSize: 14, fontFamily: Fonts.regular, color: Colors.textSecondary, lineHeight: 20 }}>
                    {item.a}
                  </Text>
                </View>
              )}
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}
