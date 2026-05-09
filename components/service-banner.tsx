import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { Fonts } from '@/constants/Typography';

interface ServiceBannerProps {
  message: string;
  onDismiss: () => void;
  linkText?: string;
  onLinkPress?: () => void;
}

export function ServiceBanner({
  message,
  onDismiss,
  linkText,
  onLinkPress,
}: ServiceBannerProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconWrap}>
        <Ionicons name="information-circle" size={22} color={Colors.info} />
      </View>
      <View style={styles.content}>
        <Text style={styles.label}>SERVICE UPDATE: </Text>
        <Text style={styles.message}>
          {message}
          {linkText && (
            <Text style={styles.link} onPress={onLinkPress}>
              {' '}
              {linkText}
            </Text>
          )}
        </Text>
      </View>
      <Pressable
        onPress={onDismiss}
        style={styles.closeButton}
        accessibilityLabel="Dismiss banner"
      >
        <Ionicons name="close" size={20} color={Colors.textSecondary} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: Colors.infoBg,
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 10,
    alignItems: 'flex-start',
  },
  iconWrap: {
    paddingTop: 2,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  label: {
    fontSize: 13,
    fontFamily: Fonts.bold,
    color: Colors.textPrimary,
  },
  message: {
    fontSize: 13,
    fontFamily: Fonts.regular,
    color: Colors.textPrimary,
    lineHeight: 19,
  },
  link: {
    fontSize: 13,
    fontFamily: Fonts.medium,
    color: Colors.primary,
    textDecorationLine: 'underline',
  },
  closeButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
