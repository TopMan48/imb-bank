import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { PasscodePad } from '@/components/passcode-pad';
import { useAppStore } from '@/store/useAppStore';
import { Colors } from '@/constants/Colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function PasscodeSetupScreen() {
  const [step, setStep] = useState<'create' | 'confirm'>('create');
  const [firstCode, setFirstCode] = useState('');
  const [error, setError] = useState('');
  const setPasscode = useAppStore((s) => s.setPasscode);
  const setAuthenticated = useAppStore((s) => s.setAuthenticated);
  const insets = useSafeAreaInsets();

  const handleCreate = (code: string) => {
    setFirstCode(code);
    setStep('confirm');
    setError('');
  };

  const handleConfirm = (code: string) => {
    if (code === firstCode) {
      setPasscode(code);
      setAuthenticated(true);
      router.replace('/(main)');
    } else {
      setError('Passcodes do not match. Try again.');
      setStep('create');
      setFirstCode('');
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      {step === 'create' ? (
        <PasscodePad
          title="Create a Passcode"
          subtitle="Set a 4-digit passcode to secure your account"
          onComplete={handleCreate}
          error={error}
        />
      ) : (
        <PasscodePad
          title="Confirm Passcode"
          subtitle="Re-enter your passcode to confirm"
          onComplete={handleConfirm}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
});
