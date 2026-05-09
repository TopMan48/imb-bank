import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';
import { Fonts } from '@/constants/Typography';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

const FEATURES = [
  'Community focused',
  'Locally owned',
  'Award winning',
  'Customer first',
];

export function HeroSection() {
  const [featureIndex, setFeatureIndex] = useState(0);
  const opacity = useSharedValue(1);
  const translateY = useSharedValue(0);

  useEffect(() => {
    const interval = setInterval(() => {
      opacity.value = withTiming(0, { duration: 300 });
      translateY.value = withTiming(-10, { duration: 300 });

      setTimeout(() => {
        setFeatureIndex((prev) => (prev + 1) % FEATURES.length);
        translateY.value = 10;
        translateY.value = withTiming(0, { duration: 300 });
        opacity.value = withTiming(1, { duration: 300 });
      }, 350);
    }, 3000);

    return () => clearInterval(interval);
  }, [opacity, translateY]);

  const featureStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <View style={styles.container}>
      {/* Background gradient simulation */}
      <View style={styles.heroBackground}>
        <View style={styles.gradientOverlay} />
      </View>

      <View style={styles.content}>
        <Text style={styles.heading}>You can bank on</Text>

        <Animated.View style={[styles.featureChip, featureStyle]}>
          <View style={styles.chipIcon}>
            <Text style={styles.chipIconText}>✦</Text>
          </View>
          <Text style={styles.chipText}>{FEATURES[featureIndex]}</Text>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    minHeight: 320,
    overflow: 'hidden',
  },
  heroBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#2A6B5E',
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.15)',
  },
  content: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 28,
    paddingBottom: 40,
  },
  heading: {
    fontSize: 32,
    fontFamily: Fonts.bold,
    color: Colors.white,
    marginBottom: 20,
  },
  featureChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 12,
    alignSelf: 'flex-start',
    gap: 10,
    borderCurve: 'continuous',
    boxShadow: '0 4px 14px rgba(0,0,0,0.1)',
  },
  chipIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipIconText: {
    fontSize: 16,
    color: Colors.primary,
  },
  chipText: {
    fontSize: 16,
    fontFamily: Fonts.semiBold,
    color: Colors.textPrimary,
  },
});
