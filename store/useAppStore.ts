import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Preferences, Account, Transaction, Card, Payee } from './types';

interface PreferencesSlice {
  preferences: Preferences;
  setPasscode: (code: string) => void;
  verifyPasscode: (code: string) => boolean;
  setAuthenticated: (value: boolean) => void;
  dismissBanner: (bannerId: string) => void;
}

interface DataSlice {
  accounts: Account[];
  transactions: Transaction[];
  cards: Card[];
  payees: Payee[];
  toggleCardLock: (cardId: string) => void;
}

export type AppStore = PreferencesSlice & DataSlice;

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      preferences: {},

      accounts: [
        {
          id: '1',
          name: 'Everyday Account',
          type: 'everyday',
          balance: 4256.78,
          bsb: '641-800',
          accountNumber: '1234 5678',
          availableBalance: 4256.78,
        },
        {
          id: '2',
          name: 'Smart Saver',
          type: 'savings',
          balance: 18432.50,
          bsb: '641-800',
          accountNumber: '8765 4321',
          availableBalance: 18432.50,
          interestRate: 5.10,
        },
        {
          id: '3',
          name: 'Home Loan',
          type: 'loan',
          balance: -342000.00,
          bsb: '641-800',
          accountNumber: '5555 1234',
          availableBalance: 0,
          interestRate: 6.24,
        },
      ],

      transactions: [
        { id: 't1', accountId: '1', description: 'Woolworths Wollongong', merchant: 'Woolworths', amount: -87.45, date: '2026-05-19', type: 'debit', category: 'shopping' },
        { id: 't2', accountId: '1', description: 'Salary - IMB Bank', merchant: 'IMB Bank', amount: 3250.00, date: '2026-05-17', type: 'credit', category: 'income' },
        { id: 't3', accountId: '1', description: 'McDonald\'s Shellharbour', merchant: 'McDonald\'s', amount: -14.50, date: '2026-05-17', type: 'debit', category: 'food' },
        { id: 't4', accountId: '1', description: 'Netflix', merchant: 'Netflix', amount: -22.99, date: '2026-05-16', type: 'debit', category: 'entertainment' },
        { id: 't5', accountId: '1', description: 'Shell Petrol', merchant: 'Shell', amount: -85.20, date: '2026-05-16', type: 'debit', category: 'transport' },
        { id: 't6', accountId: '1', description: 'Ausgrid Electricity', merchant: 'Ausgrid', amount: -124.00, date: '2026-05-15', type: 'debit', category: 'utilities' },
        { id: 't7', accountId: '1', description: 'Transfer to Smart Saver', amount: -500.00, date: '2026-05-14', type: 'debit', category: 'transfer' },
        { id: 't8', accountId: '1', description: 'Chemist Warehouse', merchant: 'Chemist Warehouse', amount: -32.80, date: '2026-05-13', type: 'debit', category: 'health' },
        { id: 't9', accountId: '1', description: 'JB Hi-Fi', merchant: 'JB Hi-Fi', amount: -349.00, date: '2026-05-12', type: 'debit', category: 'shopping' },
        { id: 't10', accountId: '1', description: 'Uber Eats', merchant: 'Uber Eats', amount: -28.90, date: '2026-05-11', type: 'debit', category: 'food' },
        { id: 't11', accountId: '2', description: 'Transfer from Everyday', amount: 500.00, date: '2026-05-14', type: 'credit', category: 'transfer' },
        { id: 't12', accountId: '2', description: 'Interest Payment', amount: 78.50, date: '2026-05-01', type: 'credit', category: 'income' },
        { id: 't13', accountId: '3', description: 'Home Loan Repayment', amount: -1850.00, date: '2026-05-01', type: 'debit', category: 'transfer' },
        { id: 't14', accountId: '3', description: 'Home Loan Repayment', amount: -1850.00, date: '2026-04-01', type: 'debit', category: 'transfer' },
      ],

      cards: [
        {
          id: 'c1',
          accountId: '1',
          last4: '4521',
          name: 'Alex Johnson',
          type: 'visa',
          expiry: '09/28',
          isLocked: false,
          isContactless: true,
          colour: '#004B5A',
        },
        {
          id: 'c2',
          accountId: '2',
          last4: '8893',
          name: 'Alex Johnson',
          type: 'visa',
          expiry: '03/27',
          isLocked: false,
          isContactless: true,
          colour: '#1a6b7a',
        },
      ],

      payees: [
        { id: 'p1', name: 'Sarah Johnson', bsb: '062-000', accountNumber: '1234 5678', avatarColour: '#E91E63' },
        { id: 'p2', name: 'Tom Williams', bsb: '033-000', accountNumber: '9876 5432', avatarColour: '#9C27B0' },
        { id: 'p3', name: 'Ausgrid', bsb: '012-000', accountNumber: '4567 8901', avatarColour: '#FF9800' },
        { id: 'p4', name: 'Body Corp', bsb: '641-800', accountNumber: '2468 1357', avatarColour: '#2196F3' },
        { id: 'p5', name: 'Mum', bsb: '055-000', accountNumber: '1111 2222', avatarColour: '#4CAF50' },
      ],

      setPasscode: (code: string) =>
        set((state) => ({
          preferences: {
            ...state.preferences,
            hasSetupPasscode: true,
            passcode: code,
          },
        })),

      verifyPasscode: (code: string) => {
        return get().preferences.passcode === code;
      },

      setAuthenticated: (value: boolean) =>
        set((state) => ({
          preferences: { ...state.preferences, isAuthenticated: value },
        })),

      dismissBanner: (bannerId: string) =>
        set((state) => ({
          preferences: {
            ...state.preferences,
            dismissedBanners: [
              ...(state.preferences.dismissedBanners || []),
              bannerId,
            ],
          },
        })),

      toggleCardLock: (cardId: string) =>
        set((state) => ({
          cards: state.cards.map((c) =>
            c.id === cardId ? { ...c, isLocked: !c.isLocked } : c
          ),
        })),
    }),
    {
      name: 'imb-bank-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        preferences: state.preferences,
        cards: state.cards,
      }),
    }
  )
);
