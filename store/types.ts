/**
 * Base entity types for the IMB Bank app store.
 */

export interface Preferences {
  hasSetupPasscode?: boolean;
  passcode?: string;
  isAuthenticated?: boolean;
  dismissedBanners?: string[];
}

export interface NotificationPreferences {
  pushEnabled: boolean;
  smsEnabled: boolean;
  emailEnabled: boolean;
  transactionAlerts: boolean;
  lowBalanceAlerts: boolean;
  lowBalanceThreshold: number;
  largeTransactionAlerts: boolean;
  largeTransactionThreshold: number;
  unusualActivityAlerts: boolean;
  interestRateAlerts: boolean;
  paymentReminders: boolean;
  promotionalOffers: boolean;
  securityAlerts: boolean;
  statementReady: boolean;
  eStatementsEnabled: boolean;
  paymentDueReminder: boolean;
}

export interface TrustedDevice {
  id: string;
  name: string;
  addedAt: string;
  lastUsed: string;
  type: 'mobile' | 'tablet' | 'desktop';
}

export interface SecuritySettings {
  twoFAEnabled: boolean;
  biometricsEnabled: boolean;
  loginAlertsEnabled: boolean;
  sessionTimeoutMinutes: number;
  trustedDevices: TrustedDevice[];
  fraudReports: FraudReport[];
}

export interface FraudReport {
  id: string;
  transactionId?: string;
  description: string;
  amount?: number;
  reportedAt: string;
  status: 'pending' | 'investigating' | 'resolved';
  reference: string;
}

export interface AccessibilitySettings {
  fontSize: 'small' | 'medium' | 'large' | 'xlarge';
  highContrast: boolean;
  reduceMotion: boolean;
  largerTouchTargets: boolean;
}

export interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  dateOfBirth: string;
  memberNumber: string;
  memberSince: string;
}

export interface Account {
  id: string;
  name: string;
  type: 'savings' | 'everyday' | 'term-deposit' | 'loan';
  balance: number;
  bsb: string;
  accountNumber: string;
  availableBalance: number;
  interestRate?: number;
}

export interface Transaction {
  id: string;
  accountId: string;
  description: string;
  merchant?: string;
  amount: number;
  date: string;
  type: 'debit' | 'credit';
  category: 'shopping' | 'food' | 'transport' | 'utilities' | 'health' | 'entertainment' | 'transfer' | 'income' | 'other';
  paymentMethod?: 'bsb' | 'payid' | 'bpay' | 'swift' | 'internal' | 'payto';
  reference?: string;
  recipientName?: string;
}

export interface Card {
  id: string;
  accountId: string;
  last4: string;
  fullNumber: string;
  cvv: string;
  name: string;
  type: 'visa' | 'mastercard';
  expiry: string;
  isLocked: boolean;
  isContactless: boolean;
  colour: string;
  status?: 'active' | 'reported-lost' | 'reported-stolen' | 'reported-damaged';
  reportedAt?: string;
  reportReason?: string;
}

export interface Payee {
  id: string;
  name: string;
  bsb: string;
  accountNumber: string;
  nickname?: string;
  avatarColour: string;
}

export type PayToFrequency = 'one-off' | 'weekly' | 'fortnightly' | 'monthly' | 'quarterly' | 'annually';
export type PayToStatus = 'active' | 'paused' | 'cancelled';

export interface PayToAgreement {
  id: string;
  merchantName: string;
  description: string;
  amount: number;
  frequency: PayToFrequency;
  status: PayToStatus;
  startDate: string;
  nextPaymentDate?: string;
  lastPaymentDate?: string;
  accountId: string;
  reference: string;
  payId?: string;
}

export interface ScheduledPayment {
  id: string;
  payeeId?: string;
  payeeName: string;
  amount: number;
  frequency: 'once' | 'weekly' | 'fortnightly' | 'monthly';
  nextDate: string;
  accountId: string;
  description?: string;
  status: 'active' | 'paused' | 'cancelled';
}

export interface LoginActivity {
  id: string;
  timestamp: string;
  device: string;
  location: string;
  ipAddress: string;
  successful: boolean;
}
