import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { Fonts } from '@/constants/Typography';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface IMBHeaderProps {
  onMenuPress?: () => void;
  onSearchPress?: () => void;
  onLoginPress?: () => void;
}

export function IMBHeader({ onMenuPress, onSearchPress, onLoginPress }: IMBHeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.inner}>
        <Pressable
          onPress={onMenuPress}
          style={styles.iconButton}
          accessibilityLabel="Menu"
        >
          <Ionicons name="menu" size={26} color={Colors.primary} />
        </Pressable>

        <View style={styles.logoContainer}>
          <View style={styles.logo}>
            <Text style={styles.logoText}>imb</Text>
            <Text style={styles.logoSubtext}>bank</Text>
          </View>
        </View>

        <View style={styles.rightActions}>
          <Pressable
            onPress={onSearchPress}
            style={styles.iconButton}
            accessibilityLabel="Search"
          >
            <Ionicons name="search" size={22} color={Colors.primary} />
          </Pressable>

          <Pressable
            onPress={onLoginPress}
            style={styles.loginButton}
            accessibilityLabel="Login"
          >
            <Ionicons name="lock-closed" size={14} color={Colors.primary} />
            <Text style={styles.loginText}>Login</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 56,
    paddingHorizontal: 16,
  },
  iconButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    flex: 1,
    alignItems: 'flex-start',
    paddingLeft: 4,
  },
  logo: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 2,
  },
  logoText: {
    fontSize: 28,
    fontFamily: Fonts.bold,
    color: Colors.primary,
    letterSpacing: -0.5,
  },
  logoSubtext: {
    fontSize: 14,
    fontFamily: Fonts.medium,
    color: Colors.primary,
    marginLeft: 1,
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.accent,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  loginText: {
    fontSize: 14,
    fontFamily: Fonts.semiBold,
    color: Colors.primary,
  },
});
