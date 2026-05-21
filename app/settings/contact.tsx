import React from 'react';
import { View, Text, ScrollView, Pressable, Linking, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { Fonts } from '@/constants/Typography';

function ContactCard({
  icon,
  title,
  subtitle,
  action,
  actionLabel,
  badge,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  action?: () => void;
  actionLabel?: string;
  badge?: string;
}) {
  return (
    <View style={{ backgroundColor: Colors.white, borderRadius: 16, padding: 18, gap: 12, borderCurve: 'continuous', boxShadow: '0 2px 10px rgba(0,75,90,0.06)' }}>
      <View style={{ flexDirection: 'row', gap: 14, alignItems: 'flex-start' }}>
        <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name={icon} size={24} color={Colors.primary} />
        </View>
        <View style={{ flex: 1, gap: 4 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Text style={{ fontSize: 16, fontFamily: Fonts.semiBold, color: Colors.textPrimary }}>{title}</Text>
            {badge && (
              <View style={{ backgroundColor: Colors.success, borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2 }}>
                <Text style={{ fontSize: 10, fontFamily: Fonts.semiBold, color: Colors.white }}>{badge}</Text>
              </View>
            )}
          </View>
          <Text style={{ fontSize: 13, fontFamily: Fonts.regular, color: Colors.textSecondary, lineHeight: 18 }}>{subtitle}</Text>
        </View>
      </View>
      {action && actionLabel && (
        <Pressable
          style={({ pressed }) => [{
            backgroundColor: Colors.primary,
            borderRadius: 10,
            paddingVertical: 12,
            alignItems: 'center',
            borderCurve: 'continuous',
            opacity: pressed ? 0.85 : 1,
          }]}
          onPress={action}
        >
          <Text style={{ fontSize: 14, fontFamily: Fonts.semiBold, color: Colors.white }}>{actionLabel}</Text>
        </Pressable>
      )}
    </View>
  );
}

export default function ContactScreen() {
  return (
    <ScrollView contentContainerStyle={{ padding: 20, gap: 16, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>

      <View style={{ backgroundColor: Colors.primary, borderRadius: 16, padding: 20, gap: 4, borderCurve: 'continuous' }}>
        <Text style={{ fontSize: 20, fontFamily: Fonts.bold, color: Colors.white }}>We&apos;re here to help</Text>
        <Text style={{ fontSize: 14, fontFamily: Fonts.regular, color: 'rgba(255,255,255,0.75)', lineHeight: 20 }}>
          Our friendly team is available via phone, online, or at any of our 27 branches across NSW and ACT.
        </Text>
      </View>

      <ContactCard
        icon="call-outline"
        title="Phone Banking"
        subtitle="133 462 · Monday–Friday 8am–8pm, Saturday 9am–5pm AEST"
        action={() => Linking.openURL('tel:133462')}
        actionLabel="Call 133 462"
      />

      <ContactCard
        icon="chatbubble-ellipses-outline"
        title="Live Chat"
        subtitle="Chat with a team member in real-time during business hours"
        action={() => Alert.alert('Live Chat', 'Chat feature coming soon. Please call 133 462 for immediate assistance.')}
        actionLabel="Start Chat"
        badge="Online"
      />

      <ContactCard
        icon="mail-outline"
        title="Secure Message"
        subtitle="Send a message securely from your online banking. Response within 2 business days."
        action={() => Alert.alert('Secure Message', 'Compose a new secure message to IMB Bank support.')}
        actionLabel="Send Message"
      />

      <ContactCard
        icon="location-outline"
        title="Visit a Branch"
        subtitle="27 branches across Wollongong, Sydney, Canberra and regional NSW"
        action={() => Alert.alert('Branch Finder', 'Nearest branches:\n\n• IMB Wollongong — 388 Crown St, 0.3km\n• IMB Fairy Meadow — 31 Princes Hwy, 4.2km\n• IMB Figtree — 11 Princes Hwy, 7.8km')}
        actionLabel="Find Nearest Branch"
      />

      <View style={{ gap: 10 }}>
        <Text style={{ fontSize: 12, fontFamily: Fonts.semiBold, color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, paddingHorizontal: 4 }}>Helpful Links</Text>
        {[
          { label: 'Report a Scam', icon: 'warning-outline' as const },
          { label: 'Report a Missing Card', icon: 'card-outline' as const },
          { label: 'Forgotten Password', icon: 'lock-open-outline' as const },
          { label: 'Notify IMB of Travel', icon: 'airplane-outline' as const },
          { label: 'Complaints Process', icon: 'document-text-outline' as const },
        ].map((item, index, arr) => (
          <Pressable
            key={item.label}
            style={({ pressed }) => [{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: Colors.white,
              borderRadius: 12,
              paddingHorizontal: 16,
              paddingVertical: 14,
              gap: 12,
              borderCurve: 'continuous',
              opacity: pressed ? 0.8 : 1,
            }]}
            onPress={() => Alert.alert(item.label, `Navigate to the ${item.label} process.`)}
          >
            <Ionicons name={item.icon} size={20} color={Colors.primary} />
            <Text style={{ flex: 1, fontSize: 15, fontFamily: Fonts.medium, color: Colors.textPrimary }}>{item.label}</Text>
            <Ionicons name="chevron-forward" size={16} color={Colors.textSecondary} />
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}
