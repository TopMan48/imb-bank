import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="passcode-setup" />
      <Stack.Screen name="passcode-login" />
    </Stack>
  );
}
