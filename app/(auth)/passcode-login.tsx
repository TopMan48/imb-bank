import React, { useState } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { router } from 'expo-router';
import { PasscodePad } from '@/components/passcode-pad';
import { useAppStore } from '@/store/useAppStore';
import { Colors } from '@/constants/Colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const SIMULATED_DEVICES = [
  'iPhone 16 Pro Max',
  'iPhone 16',
  'iPhone 15 Pro',
  'iPad Pro (M4)',
  'iPhone SE (3rd gen)',
];

const SIMULATED_LOCATIONS = [
  'Wollongong, NSW',
  'Sydney, NSW',
  'Illawarra, NSW',
  'Wollongong, NSW',
  'Wollongong, NSW',
];

function getSimulatedDevice(): string {
  if (Platform.OS === 'web') return 'Chrome (Web)';
  const idx = Math.floor(Math.random() * SIMULATED_DEVICES.length);
  return SIMULATED_DEVICES[idx];
}

function getSimulatedLocation(): string {
  const idx = Math.floor(Math.random() * SIMULATED_LOCATIONS.length);
  return SIMULATED_LOCATIONS[idx];
}

function getSimulatedIp(): string {
  return `${101 + Math.floor(Math.random() * 10)}.${168 + Math.floor(Math.random() * 5)}.xxx.xxx`;
}

export default function PasscodeLoginScreen() {
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);
  const verifyPasscode = useAppStore((s) => s.verifyPasscode);
  const setAuthenticated = useAppStore((s) => s.setAuthenticated);
  const addLoginActivity = useAppStore((s) => s.addLoginActivity);
  const insets = useSafeAreaInsets();

  const handleComplete = (code: string) => {
    if (verifyPasscode(code)) {
      // Log successful login
      addLoginActivity({
        timestamp: new Date().toISOString(),
        device: getSimulatedDevice(),
        location: getSimulatedLocation(),
        ipAddress: getSimulatedIp(),
        successful: true,
      });
      setAuthenticated(true);
      router.replace('/(main)');
    } else {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      // Log failed attempt
      addLoginActivity({
        timestamp: new Date().toISOString(),
        device: getSimulatedDevice(),
        location: getSimulatedLocation(),
        ipAddress: getSimulatedIp(),
        successful: false,
      });
      setError(
        newAttempts >= 3
          ? `Incorrect passcode. ${5 - newAttempts} attempts remaining.`
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
        length={6}
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
