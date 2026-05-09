import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { PasscodePad } from '@/components/passcode-pad';
import { useAppStore } from '@/store/useAppStore';
import { Colors } from '@/constants/Colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function PasscodeLoginScreen() {
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);
  const verifyPasscode = useAppStore((s) => s.verifyPasscode);
  const setAuthenticated = useAppStore((s) => s.setAuthenticated);
  const insets = useSafeAreaInsets();

  const handleComplete = (code: string) => {
    if (verifyPasscode(code)) {
      setAuthenticated(true);
      router.replace('/(main)');
    } else {
      setAttempts((a) => a + 1);
      setError(
        attempts >= 2
          ? `Incorrect passcode. ${5 - attempts - 1} attempts remaining.`
          : 'Incorrect passcode. Please try again.'
      );
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <PasscodePad
        title="Welcome Back"
        subtitle="Enter your passcode to continue"
        onComplete={handleComplete}
        error={error}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
});
