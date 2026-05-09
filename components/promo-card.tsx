import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { Fonts } from '@/constants/Typography';

interface PromoCardProps {
  title: string;
  highlight: string;
  description: string;
  footnote?: string;
  onPress?: () => void;
}

export function PromoCard({
  title,
  highlight,
  description,
  footnote,
  onPress,
}: PromoCardProps) {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.highlight}>{highlight}</Text>
        <Text style={styles.description}>{description}</Text>
        {footnote && <Text style={styles.footnote}>{footnote}</Text>}
      </View>
      <Pressable onPress={onPress} style={styles.arrowButton} accessibilityLabel="Learn more">
        <View style={styles.arrowCircle}>
          <Ionicons name="arrow-forward" size={20} color={Colors.white} />
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#E8F5F0',
    borderRadius: 16,
    padding: 24,
    marginHorizontal: 16,
    borderCurve: 'continuous',
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 16,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontFamily: Fonts.semiBold,
    color: Colors.primary,
    marginBottom: 4,
  },
  highlight: {
    fontSize: 28,
    fontFamily: Fonts.bold,
    color: Colors.accent,
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: Colors.textPrimary,
    lineHeight: 20,
  },
  footnote: {
    fontSize: 11,
    fontFamily: Fonts.regular,
    color: Colors.textSecondary,
    marginTop: 8,
  },
  arrowButton: {
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
