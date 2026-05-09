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
}

export interface Transaction {
  id: string;
  accountId: string;
  description: string;
  amount: number;
  date: string;
  type: 'debit' | 'credit';
  category: string;
}
