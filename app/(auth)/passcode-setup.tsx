import React, { useState, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { PasscodePad } from '@/components/passcode-pad';
import { useAppStore } from '@/store/useAppStore';
import { Colors } from '@/constants/Colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function PasscodeSetupScreen() {
  const [step, setStep] = useState<'create' | 'confirm'>('create');
  const [firstCode, setFirstCode] = useState('');
  const [createError, setCreateError] = useState('');
  const [confirmError, setConfirmError] = useState('');
  const setPasscode = useAppStore((s) => s.setPasscode);
  const setAuthenticated = useAppStore((s) => s.setAuthenticated);
  const insets = useSafeAreaInsets();
  // Ref to hold the reset timeout so we can cancel it if needed
  const resetTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleCreate = (code: string) => {
    setFirstCode(code);
    setCreateError('');
    setConfirmError('');
    setStep('confirm');
  };

  const handleConfirm = (code: string) => {
    if (code === firstCode) {
      setPasscode(code);
      setAuthenticated(true);
      router.replace('/(main)');
    } else {
      // Show the error on the confirm step first so the shake animation plays
      setConfirmError('Passcodes do not match. Try again.');
      // After shake animation completes, reset BOTH steps back to start
      if (resetTimeoutRef.current) clearTimeout(resetTimeoutRef.current);
      resetTimeoutRef.current = setTimeout(() => {
        setConfirmError('');
        setFirstCode('');
        setStep('create');
      }, 1200);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      {step === 'create' ? (
        // key="create" forces a full remount when switching back from confirm → create,
        // ensuring internal code state is wiped and dots start empty
        <PasscodePad
          key="create"
          title="Create a Passcode"
          subtitle="Set a 4-digit passcode to secure your account"
          onComplete={handleCreate}
          error={createError}
        />
      ) : (
        // key="confirm" forces a fresh remount when transitioning create → confirm,
        // clearing any digits carried over from the create step
        <PasscodePad
          key="confirm"
          title="Confirm Passcode"
          subtitle="Re-enter your passcode to confirm"
          onComplete={handleConfirm}
          error={confirmError}
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
