import React from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';
import { Fonts } from '@/constants/Typography';

const NAV_ITEMS = [
  'About IMB',
  'Community',
  'Members',
  'Our people',
  'Lenders',
  'Business Managers',
  'Media',
  'Complaints',
];

export function FooterNav() {
  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ flexGrow: 0 }}
        contentContainerStyle={styles.scrollContent}
      >
        {NAV_ITEMS.map((item) => (
          <Pressable key={item} style={styles.navItem}>
            <Text style={styles.navText}>{item}</Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    backgroundColor: Colors.white,
    paddingVertical: 16,
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 20,
  },
  navItem: {
    minHeight: 44,
    justifyContent: 'center',
  },
  navText: {
    fontSize: 13,
    fontFamily: Fonts.medium,
    color: Colors.primary,
  },
});
