import React from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppStore } from '@/store/useAppStore';
import { Colors } from '@/constants/Colors';
import { Fonts } from '@/constants/Typography';

type MenuItemData = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  subtitle?: string;
  onPress: () => void;
  destructive?: boolean;
};

function MenuItem({ item }: { item: MenuItemData }) {
  return (
    <Pressable
      style={({ pressed }) => [styles.menuItem, pressed && { backgroundColor: Colors.background }]}
      onPress={item.onPress}
    >
      <View style={[styles.menuIcon, item.destructive && styles.menuIconDestructive]}>
        <Ionicons
          name={item.icon}
          size={20}
          color={item.destructive ? Colors.error : Colors.primary}
        />
      </View>
      <View style={styles.menuText}>
        <Text style={[styles.menuLabel, item.destructive && styles.menuLabelDestructive]}>
          {item.label}
        </Text>
        {item.subtitle && (
          <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
        )}
      </View>
      {!item.destructive && (
        <Ionicons name="chevron-forward" size={16} color={Colors.textSecondary} />
      )}
    </Pressable>
  );
}

function MenuSection({ title, items }: { title: string; items: MenuItemData[] }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionCard}>
        {items.map((item, index) => (
          <View key={item.label}>
            <MenuItem item={item} />
            {index < items.length - 1 && <View style={styles.divider} />}
          </View>
        ))}
      </View>
    </View>
  );
}

export default function MoreScreen() {
  const insets = useSafeAreaInsets();
  const setAuthenticated = useAppStore((s) => s.setAuthenticated);

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: () => {
            setAuthenticated(false);
            router.replace('/');
          },
        },
      ]
    );
  };

  const accountMenuItems: MenuItemData[] = [
    {
      icon: 'person-outline',
      label: 'Personal Details',
      subtitle: 'Alex Johnson · alex.johnson@email.com',
      onPress: () => {},
    },
    {
      icon: 'shield-checkmark-outline',
      label: 'Security',
      subtitle: 'Passcode, biometrics, 2FA',
      onPress: () => {},
    },
    {
      icon: 'notifications-outline',
      label: 'Notifications',
      subtitle: 'Push alerts, SMS, email',
      onPress: () => {},
    },
  ];

  const bankingMenuItems: MenuItemData[] = [
    {
      icon: 'swap-horizontal-outline',
      label: 'Transaction History',
      onPress: () => {},
    },
    {
      icon: 'document-text-outline',
      label: 'Statements',
      subtitle: 'Download or view statements',
      onPress: () => {},
    },
    {
      icon: 'receipt-outline',
      label: 'Scheduled Payments',
      onPress: () => {},
    },
    {
      icon: 'people-outline',
      label: 'Manage Payees',
      onPress: () => {},
    },
  ];

  const supportMenuItems: MenuItemData[] = [
    {
      icon: 'help-circle-outline',
      label: 'Help Centre',
      onPress: () => {},
    },
    {
      icon: 'call-outline',
      label: 'Contact Us',
      subtitle: '133 462 · Mon-Fri 8am-8pm',
      onPress: () => {},
    },
    {
      icon: 'warning-outline',
      label: 'Report a Scam',
      onPress: () => {},
    },
    {
      icon: 'card-outline',
      label: 'Report Missing Card',
      onPress: () => {},
    },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>More</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>AJ</Text>
            </View>
            <View style={styles.avatarBadge}>
              <Ionicons name="checkmark" size={10} color={Colors.white} />
            </View>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>Alex Johnson</Text>
            <Text style={styles.profileSub}>Member since 2019</Text>
            <View style={styles.membershipBadge}>
              <Ionicons name="star" size={10} color={Colors.accent} />
              <Text style={styles.membershipText}>IMB Member</Text>
            </View>
          </View>
          <Pressable style={styles.editBtn}>
            <Ionicons name="pencil" size={16} color={Colors.primary} />
          </Pressable>
        </View>

        <MenuSection title="Account" items={accountMenuItems} />
        <MenuSection title="Banking" items={bankingMenuItems} />
        <MenuSection title="Support" items={supportMenuItems} />

        {/* Sign Out */}
        <Pressable
          style={({ pressed }) => [styles.signOutBtn, pressed && { opacity: 0.8 }]}
          onPress={handleSignOut}
        >
          <Ionicons name="log-out-outline" size={20} color={Colors.error} />
          <Text style={styles.signOutText}>Sign Out</Text>
        </Pressable>

        {/* App Version */}
        <Text style={styles.version}>IMB Bank v2.4.1 · © 2026 IMB Ltd</Text>
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
    gap: 20,
  },
  profileCard: {
    backgroundColor: Colors.primary,
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    borderCurve: 'continuous',
    boxShadow: '0 8px 24px rgba(0, 75, 90, 0.25)',
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontFamily: Fonts.bold,
    color: Colors.primary,
  },
  avatarBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: Colors.success,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  profileInfo: {
    flex: 1,
    gap: 3,
  },
  profileName: {
    fontSize: 18,
    fontFamily: Fonts.bold,
    color: Colors.white,
  },
  profileSub: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    color: 'rgba(255,255,255,0.65)',
  },
  membershipBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  membershipText: {
    fontSize: 11,
    fontFamily: Fonts.semiBold,
    color: Colors.accent,
  },
  editBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: {
    gap: 10,
  },
  sectionTitle: {
    fontSize: 12,
    fontFamily: Fonts.semiBold,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: 4,
  },
  sectionCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    overflow: 'hidden',
    borderCurve: 'continuous',
    boxShadow: '0 2px 10px rgba(0, 75, 90, 0.06)',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
    minHeight: 56,
  },
  menuIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    borderCurve: 'continuous',
  },
  menuIconDestructive: {
    backgroundColor: '#FFEBEE',
  },
  menuText: {
    flex: 1,
    gap: 2,
  },
  menuLabel: {
    fontSize: 14,
    fontFamily: Fonts.medium,
    color: Colors.textPrimary,
  },
  menuLabelDestructive: {
    color: Colors.error,
  },
  menuSubtitle: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    color: Colors.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginLeft: 64,
  },
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: Colors.white,
    borderRadius: 16,
    paddingVertical: 16,
    borderCurve: 'continuous',
    borderWidth: 1.5,
    borderColor: '#FFCDD2',
    boxShadow: '0 2px 10px rgba(0, 75, 90, 0.04)',
  },
  signOutText: {
    fontSize: 15,
    fontFamily: Fonts.semiBold,
    color: Colors.error,
  },
  version: {
    fontSize: 11,
    fontFamily: Fonts.regular,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});
