import React from 'react';
import { View, Text, ScrollView, Pressable, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { Fonts } from '@/constants/Typography';

function LinkRow({ label, icon, isLast, onPress }: { label: string; icon: keyof typeof Ionicons.glyphMap; isLast?: boolean; onPress?: () => void }) {
  return (
    <Pressable
      style={({ pressed }) => [{
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 14,
        gap: 12,
        borderBottomWidth: isLast ? 0 : 1,
        borderBottomColor: Colors.borderLight,
        backgroundColor: pressed ? Colors.background : 'transparent',
      }]}
      onPress={onPress}
    >
      <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center', borderCurve: 'continuous' }}>
        <Ionicons name={icon} size={18} color={Colors.primary} />
      </View>
      <Text style={{ flex: 1, fontSize: 15, fontFamily: Fonts.medium, color: Colors.textPrimary }}>{label}</Text>
      <Ionicons name="chevron-forward" size={16} color={Colors.textSecondary} />
    </Pressable>
  );
}

export default function AboutScreen() {
  return (
    <ScrollView contentContainerStyle={{ padding: 20, gap: 20, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>

      {/* Logo card */}
      <View style={{ backgroundColor: Colors.primary, borderRadius: 20, padding: 28, alignItems: 'center', gap: 12, borderCurve: 'continuous' }}>
        <View style={{ width: 80, height: 80, borderRadius: 20, backgroundColor: Colors.white, alignItems: 'center', justifyContent: 'center', borderCurve: 'continuous' }}>
          <Text style={{ fontSize: 26, fontFamily: Fonts.bold, color: Colors.primary }}>IMB</Text>
        </View>
        <Text style={{ fontSize: 24, fontFamily: Fonts.bold, color: Colors.white }}>IMB Bank</Text>
        <Text style={{ fontSize: 13, fontFamily: Fonts.regular, color: 'rgba(255,255,255,0.75)', textAlign: 'center' }}>
          Supporting people and communities since 1880
        </Text>
        <View style={{ flexDirection: 'row', gap: 20 }}>
          <View style={{ alignItems: 'center' }}>
            <Text style={{ fontSize: 20, fontFamily: Fonts.bold, color: Colors.accent }}>145+</Text>
            <Text style={{ fontSize: 11, fontFamily: Fonts.regular, color: 'rgba(255,255,255,0.7)' }}>Years</Text>
          </View>
          <View style={{ width: 1, backgroundColor: 'rgba(255,255,255,0.2)' }} />
          <View style={{ alignItems: 'center' }}>
            <Text style={{ fontSize: 20, fontFamily: Fonts.bold, color: Colors.accent }}>180K+</Text>
            <Text style={{ fontSize: 11, fontFamily: Fonts.regular, color: 'rgba(255,255,255,0.7)' }}>Members</Text>
          </View>
          <View style={{ width: 1, backgroundColor: 'rgba(255,255,255,0.2)' }} />
          <View style={{ alignItems: 'center' }}>
            <Text style={{ fontSize: 20, fontFamily: Fonts.bold, color: Colors.accent }}>27</Text>
            <Text style={{ fontSize: 11, fontFamily: Fonts.regular, color: 'rgba(255,255,255,0.7)' }}>Branches</Text>
          </View>
        </View>
      </View>

      {/* App version */}
      <View style={{ backgroundColor: Colors.white, borderRadius: 16, padding: 16, gap: 8, borderCurve: 'continuous', boxShadow: '0 2px 10px rgba(0,75,90,0.06)' }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={{ fontSize: 14, fontFamily: Fonts.medium, color: Colors.textSecondary }}>App Version</Text>
          <Text style={{ fontSize: 14, fontFamily: Fonts.semiBold, color: Colors.textPrimary }}>2.4.1</Text>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={{ fontSize: 14, fontFamily: Fonts.medium, color: Colors.textSecondary }}>Build</Text>
          <Text style={{ fontSize: 14, fontFamily: Fonts.semiBold, color: Colors.textPrimary }}>2024.05.21.001</Text>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={{ fontSize: 14, fontFamily: Fonts.medium, color: Colors.textSecondary }}>Platform</Text>
          <Text style={{ fontSize: 14, fontFamily: Fonts.semiBold, color: Colors.textPrimary }}>iOS / Android / Web</Text>
        </View>
      </View>

      <View style={{ gap: 10 }}>
        <Text style={{ fontSize: 12, fontFamily: Fonts.semiBold, color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, paddingHorizontal: 4 }}>Company</Text>
        <View style={{ backgroundColor: Colors.white, borderRadius: 16, overflow: 'hidden', borderCurve: 'continuous', boxShadow: '0 2px 10px rgba(0,75,90,0.06)' }}>
          <LinkRow label="Investor Centre" icon="trending-up-outline" onPress={() => Alert.alert('Investor Centre', 'IMB is a mutual bank — owned by its members, not shareholders.')} />
          <LinkRow label="Corporate Governance" icon="business-outline" onPress={() => Alert.alert('Corporate Governance', 'IMB operates under strong governance frameworks guided by APRA and ASIC.')} />
          <LinkRow label="AGM" icon="people-outline" onPress={() => Alert.alert('AGM', 'Annual General Meeting information will be published on our website.')} />
          <LinkRow label="Community Initiatives" icon="heart-outline" onPress={() => Alert.alert('Community', 'IMB Foundation has donated $13M+ to Illawarra communities since 1999.')} isLast />
        </View>
      </View>

      <View style={{ gap: 10 }}>
        <Text style={{ fontSize: 12, fontFamily: Fonts.semiBold, color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, paddingHorizontal: 4 }}>Legal</Text>
        <View style={{ backgroundColor: Colors.white, borderRadius: 16, overflow: 'hidden', borderCurve: 'continuous', boxShadow: '0 2px 10px rgba(0,75,90,0.06)' }}>
          <LinkRow label="Terms & Conditions" icon="document-text-outline" />
          <LinkRow label="Privacy Policy" icon="shield-outline" />
          <LinkRow label="Financial Services Guide" icon="information-circle-outline" />
          <LinkRow label="Open Banking" icon="share-social-outline" isLast />
        </View>
      </View>

      <Text style={{ fontSize: 12, fontFamily: Fonts.regular, color: Colors.textSecondary, textAlign: 'center', lineHeight: 18 }}>
        IMB Ltd ABN 92 087 651 974 AFSL/Australian Credit Licence 237 391{'\n'}
        © 2026 IMB Bank. All rights reserved.
      </Text>
    </ScrollView>
  );
}
