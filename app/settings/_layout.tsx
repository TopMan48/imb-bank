import { Stack } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { Fonts } from '@/constants/Typography';

export default function SettingsLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: Colors.white },
        headerTintColor: Colors.primary,
        headerTitleStyle: { fontFamily: Fonts.semiBold, color: Colors.textPrimary },
        headerShadowVisible: false,
        headerBackButtonDisplayMode: 'minimal',
        contentStyle: { backgroundColor: Colors.background },
      }}
    >
      <Stack.Screen name="profile" options={{ title: 'Personal Details' }} />
      <Stack.Screen name="security" options={{ title: 'Security' }} />
      <Stack.Screen name="notifications" options={{ title: 'Notifications' }} />
      <Stack.Screen name="privacy" options={{ title: 'Privacy' }} />
      <Stack.Screen name="transaction-history" options={{ title: 'Transaction History' }} />
      <Stack.Screen name="statements" options={{ title: 'Statements' }} />
      <Stack.Screen name="scheduled-payments" options={{ title: 'Scheduled Payments' }} />
      <Stack.Screen name="manage-payees" options={{ title: 'Manage Payees' }} />
      <Stack.Screen name="add-payee" options={{ title: 'Add New Payee', presentation: 'modal' }} />
      <Stack.Screen name="edit-payee" options={{ title: 'Edit Payee', presentation: 'modal' }} />
      <Stack.Screen name="report-card" options={{ title: 'Report Card', presentation: 'modal' }} />
      <Stack.Screen name="payto-agreements" options={{ title: 'PayTo Agreements' }} />
      <Stack.Screen name="help" options={{ title: 'Help Centre' }} />
      <Stack.Screen name="contact" options={{ title: 'Contact Us' }} />
      <Stack.Screen name="about" options={{ title: 'About IMB Bank' }} />
      <Stack.Screen name="terms" options={{ title: 'Terms & Conditions' }} />
      <Stack.Screen name="report-scam" options={{ title: 'Report a Scam' }} />
    </Stack>
  );
}
