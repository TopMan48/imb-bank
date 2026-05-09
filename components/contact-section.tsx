import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { Fonts } from '@/constants/Typography';

const HELPFUL_LINKS = [
  { label: 'Report a scam', href: '#' },
  { label: 'Report a missing card', href: '#' },
  { label: 'Forgotten password', href: '#' },
  { label: 'Notify IMB of travel', href: '#' },
];

export function ContactSection() {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.heading}>Online, on the{'\n'}phone,{'\n'}in-person</Text>
        <Text style={styles.description}>
          Our friendly team are here to help from our Australian contact centre, in our branch
          network and wherever works for you.
        </Text>
      </View>

      <View style={styles.helpfulLinks}>
        <Text style={styles.helpfulTitle}>HELPFUL LINKS</Text>
        {HELPFUL_LINKS.map((link) => (
          <Pressable key={link.label} style={styles.linkRow}>
            <Text style={styles.linkText}>{link.label}</Text>
            <Ionicons name="arrow-forward" size={16} color={Colors.primary} />
          </Pressable>
        ))}
      </View>

      <View style={styles.callSection}>
        <Text style={styles.callTitle}>Give us a call</Text>
        <Pressable style={styles.phoneRow}>
          <Ionicons name="call" size={18} color={Colors.primary} />
          <Text style={styles.phoneText}>133 462</Text>
        </Pressable>
        <Text style={styles.callHours}>
          Mon-Fri 8am-8pm | Sat 9am-4pm (AEST)
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  card: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    padding: 28,
    borderCurve: 'continuous',
    marginBottom: 24,
  },
  heading: {
    fontSize: 26,
    fontFamily: Fonts.bold,
    color: Colors.white,
    lineHeight: 34,
    marginBottom: 16,
  },
  description: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 21,
  },
  helpfulLinks: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 20,
    borderCurve: 'continuous',
    boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
    marginBottom: 32,
  },
  helpfulTitle: {
    fontSize: 12,
    fontFamily: Fonts.semiBold,
    color: Colors.accent,
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    minHeight: 44,
  },
  linkText: {
    fontSize: 15,
    fontFamily: Fonts.regular,
    color: Colors.textPrimary,
  },
  callSection: {
    paddingVertical: 16,
  },
  callTitle: {
    fontSize: 22,
    fontFamily: Fonts.bold,
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  phoneText: {
    fontSize: 18,
    fontFamily: Fonts.semiBold,
    color: Colors.primary,
  },
  callHours: {
    fontSize: 13,
    fontFamily: Fonts.regular,
    color: Colors.textSecondary,
  },
});
