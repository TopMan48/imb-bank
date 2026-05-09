import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { Fonts } from '@/constants/Typography';

const LINKS = [
  { label: 'Investor Centre', href: '#' },
  { label: 'Corporate governance', href: '#' },
  { label: 'Help Centre', href: '#' },
  { label: 'AGM', href: '#' },
  { label: 'Open Banking', href: '#' },
];

export function AboutSection() {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.heading}>Supporting{'\n'}people and{'\n'}communities</Text>
        <Text style={styles.highlight}>since 1880</Text>
        <Text style={styles.description}>
          One of Australia&apos;s most enduring financial institutions, IMB is right by you.
        </Text>
      </View>

      <View style={styles.linksSection}>
        <Text style={styles.linksTitle}>MORE ON IMB</Text>
        {LINKS.map((link) => (
          <Pressable key={link.label} style={styles.linkRow}>
            <Text style={styles.linkText}>{link.label}</Text>
            <Ionicons name="arrow-forward" size={16} color={Colors.primary} />
          </Pressable>
        ))}
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
    marginBottom: 32,
  },
  heading: {
    fontSize: 28,
    fontFamily: Fonts.bold,
    color: Colors.white,
    lineHeight: 36,
  },
  highlight: {
    fontSize: 28,
    fontFamily: Fonts.bold,
    color: Colors.accent,
    marginTop: 4,
    marginBottom: 16,
  },
  description: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 21,
  },
  linksSection: {
    gap: 0,
  },
  linksTitle: {
    fontSize: 12,
    fontFamily: Fonts.semiBold,
    color: Colors.textSecondary,
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    minHeight: 48,
  },
  linkText: {
    fontSize: 15,
    fontFamily: Fonts.medium,
    color: Colors.primary,
  },
});
