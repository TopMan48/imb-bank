import React, { useState, useCallback } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';
import { Fonts } from '@/constants/Typography';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

interface PasscodePadProps {
  title: string;
  subtitle?: string;
  onComplete: (code: string) => void;
  error?: string;
  length?: number;
}

export function PasscodePad({
  title,
  subtitle,
  onComplete,
  error,
  length = 4,
}: PasscodePadProps) {
  const [code, setCode] = useState('');
  const shakeX = useSharedValue(0);

  const shakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeX.value }],
  }));

  const triggerShake = useCallback(() => {
    shakeX.value = withSequence(
      withTiming(-10, { duration: 50 }),
      withTiming(10, { duration: 50 }),
      withTiming(-10, { duration: 50 }),
      withTiming(10, { duration: 50 }),
      withTiming(0, { duration: 50 })
    );
  }, [shakeX]);

  React.useEffect(() => {
    if (error) {
      triggerShake();
      setCode('');
    }
  }, [error, triggerShake]);

  const handlePress = useCallback(
    (digit: string) => {
      if (code.length >= length) return;
      const newCode = code + digit;
      setCode(newCode);
      if (newCode.length === length) {
        setTimeout(() => onComplete(newCode), 150);
      }
    },
    [code, length, onComplete]
  );

  const handleDelete = useCallback(() => {
    setCode((prev) => prev.slice(0, -1));
  }, []);

  const digits = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>

      <Animated.View style={[styles.dotsContainer, shakeStyle]}>
        {Array.from({ length }).map((_, i) => (
          <View
            key={i}
            style={[styles.dot, i < code.length && styles.dotFilled]}
          />
        ))}
      </Animated.View>

      {error && <Text style={styles.error}>{error}</Text>}

      <View style={styles.pad}>
        {digits.map((digit, i) => {
          if (digit === '') {
            return <View key={i} style={styles.key} />;
          }
          if (digit === 'del') {
            return (
              <Pressable
                key={i}
                style={({ pressed }) => [
                  styles.key,
                  pressed && styles.keyPressed,
                ]}
                onPress={handleDelete}
                accessibilityLabel="Delete"
              >
                <Text style={styles.keyTextSmall}>⌫</Text>
              </Pressable>
            );
          }
          return (
            <Pressable
              key={i}
              style={({ pressed }) => [
                styles.key,
                pressed && styles.keyPressed,
              ]}
              onPress={() => handlePress(digit)}
              accessibilityLabel={digit}
            >
              <Text style={styles.keyText}>{digit}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 24,
    fontFamily: Fonts.bold,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: Colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 20,
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: Colors.primary,
    backgroundColor: 'transparent',
  },
  dotFilled: {
    backgroundColor: Colors.primary,
  },
  error: {
    fontSize: 13,
    fontFamily: Fonts.medium,
    color: Colors.error,
    marginBottom: 12,
    textAlign: 'center',
  },
  pad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: 260,
    marginTop: 20,
  },
  key: {
    width: 260 / 3,
    height: 68,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 34,
  },
  keyPressed: {
    backgroundColor: Colors.borderLight,
  },
  keyText: {
    fontSize: 28,
    fontFamily: Fonts.medium,
    color: Colors.textPrimary,
  },
  keyTextSmall: {
    fontSize: 22,
    color: Colors.textSecondary,
  },
});
