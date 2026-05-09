import { Redirect } from 'expo-router';
import { useAppStore } from '@/store/useAppStore';

export default function Index() {
  const hasSetupPasscode = useAppStore((s) => s.preferences.hasSetupPasscode);
  const isAuthenticated = useAppStore((s) => s.preferences.isAuthenticated);

  // If no passcode has been set up yet, go to passcode setup
  if (!hasSetupPasscode) {
    return <Redirect href="/(auth)/passcode-setup" />;
  }

  // If passcode exists but not authenticated this session, go to login
  if (!isAuthenticated) {
    return <Redirect href="/(auth)/passcode-login" />;
  }

  // Authenticated — go to main app
  return <Redirect href="/(main)" />;
}
