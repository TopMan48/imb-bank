/**
 * Base entity types for the IMB Bank app store.
 */

export interface Preferences {
  hasSetupPasscode?: boolean;
  passcode?: string;
  isAuthenticated?: boolean;
  dismissedBanners?: string[];
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
}

export interface Card {
  id: string;
  accountId: string;
  last4: string;
  name: string;
  type: 'visa' | 'mastercard';
  expiry: string;
  isLocked: boolean;
  isContactless: boolean;
  colour: string;
}

export interface Payee {
  id: string;
  name: string;
  bsb: string;
  accountNumber: string;
  avatarColour: string;
}
