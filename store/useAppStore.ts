import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
  Preferences,
  Account,
  Transaction,
  Card,
  Payee,
  NotificationPreferences,
  UserProfile,
  PayToAgreement,
  ScheduledPayment,
  LoginActivity,
} from './types';

const DEFAULT_NOTIFICATIONS: NotificationPreferences = {
  pushEnabled: true,
  smsEnabled: true,
  emailEnabled: true,
  transactionAlerts: true,
  lowBalanceAlerts: true,
  lowBalanceThreshold: 200,
  paymentReminders: true,
  promotionalOffers: false,
  securityAlerts: true,
  statementReady: true,
};

const DEFAULT_PROFILE: UserProfile = {
  firstName: 'Alex',
  lastName: 'Johnson',
  email: 'alex.johnson@email.com',
  phone: '0412 345 678',
  address: '42 Coastal Drive, Wollongong NSW 2500',
  dateOfBirth: '15/06/1988',
  memberNumber: 'IMB-2019-00847',
  memberSince: '2019',
};

// Pre-populated login history for demo realism
const SEED_LOGIN_ACTIVITY: LoginActivity[] = [
  {
    id: 'la1',
    timestamp: new Date(Date.now() - 1 * 60 * 1000).toISOString(), // 1 min ago
    device: 'iPhone 16 Pro Max',
    location: 'Wollongong, NSW',
    ipAddress: '101.168.xxx.xxx',
    successful: true,
  },
  {
    id: 'la2',
    timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), // 8h ago
    device: 'iPhone 16 Pro Max',
    location: 'Wollongong, NSW',
    ipAddress: '101.168.xxx.xxx',
    successful: true,
  },
  {
    id: 'la3',
    timestamp: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(), // Yesterday
    device: 'iPhone 16 Pro Max',
    location: 'Sydney, NSW',
    ipAddress: '203.45.xxx.xxx',
    successful: true,
  },
  {
    id: 'la4',
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    device: 'MacBook Pro (Safari)',
    location: 'Wollongong, NSW',
    ipAddress: '101.168.xxx.xxx',
    successful: true,
  },
  {
    id: 'la5',
    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    device: 'iPhone 16 Pro Max',
    location: 'Wollongong, NSW',
    ipAddress: '101.168.xxx.xxx',
    successful: false,
  },
];

interface PreferencesSlice {
  preferences: Preferences;
  notifications: NotificationPreferences;
  profile: UserProfile;
  loginActivity: LoginActivity[];
  setPasscode: (code: string) => void;
  verifyPasscode: (code: string) => boolean;
  setAuthenticated: (value: boolean) => void;
  dismissBanner: (bannerId: string) => void;
  updateNotifications: (prefs: Partial<NotificationPreferences>) => void;
  updateProfile: (profile: Partial<UserProfile>) => void;
  addLoginActivity: (activity: Omit<LoginActivity, 'id'>) => void;
  clearLoginActivity: () => void;
}

interface DataSlice {
  accounts: Account[];
  transactions: Transaction[];
  cards: Card[];
  payees: Payee[];
  payToAgreements: PayToAgreement[];
  scheduledPayments: ScheduledPayment[];

  // Card actions
  toggleCardLock: (cardId: string) => void;
  reportCard: (cardId: string, reason: string) => void;
  updateCard: (cardId: string, updates: Partial<Card>) => void;

  // Transaction actions
  addTransaction: (tx: Omit<Transaction, 'id'>) => void;
  updateAccountBalance: (accountId: string, delta: number) => void;

  // Payee actions
  addPayee: (payee: Omit<Payee, 'id'>) => void;
  updatePayee: (id: string, updates: Partial<Payee>) => void;
  deletePayee: (id: string) => void;

  // PayTo actions
  addPayToAgreement: (agreement: Omit<PayToAgreement, 'id'>) => void;
  updatePayToAgreement: (id: string, updates: Partial<PayToAgreement>) => void;

  // Scheduled payment actions
  addScheduledPayment: (payment: Omit<ScheduledPayment, 'id'>) => void;
  updateScheduledPayment: (id: string, updates: Partial<ScheduledPayment>) => void;
  deleteScheduledPayment: (id: string) => void;
}

export type AppStore = PreferencesSlice & DataSlice;

const generateId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      preferences: {},
      notifications: DEFAULT_NOTIFICATIONS,
      profile: DEFAULT_PROFILE,
      loginActivity: SEED_LOGIN_ACTIVITY,

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
        { id: 't1', accountId: '1', description: 'Woolworths Wollongong', merchant: 'Woolworths', amount: -87.45, date: '2026-06-04', type: 'debit', category: 'shopping' },
        { id: 't2', accountId: '1', description: 'Salary - IMB Bank', merchant: 'IMB Bank', amount: 3250.00, date: '2026-06-03', type: 'credit', category: 'income' },
        { id: 't3', accountId: '1', description: 'McDonald\'s Shellharbour', merchant: 'McDonald\'s', amount: -14.50, date: '2026-06-03', type: 'debit', category: 'food' },
        { id: 't4', accountId: '1', description: 'Netflix', merchant: 'Netflix', amount: -22.99, date: '2026-06-02', type: 'debit', category: 'entertainment' },
        { id: 't5', accountId: '1', description: 'Shell Petrol', merchant: 'Shell', amount: -85.20, date: '2026-06-02', type: 'debit', category: 'transport' },
        { id: 't6', accountId: '1', description: 'Ausgrid Electricity', merchant: 'Ausgrid', amount: -124.00, date: '2026-06-01', type: 'debit', category: 'utilities' },
        { id: 't7', accountId: '1', description: 'Transfer to Smart Saver', amount: -500.00, date: '2026-05-31', type: 'debit', category: 'transfer', paymentMethod: 'internal' },
        { id: 't8', accountId: '1', description: 'Chemist Warehouse', merchant: 'Chemist Warehouse', amount: -32.80, date: '2026-05-30', type: 'debit', category: 'health' },
        { id: 't9', accountId: '1', description: 'JB Hi-Fi', merchant: 'JB Hi-Fi', amount: -349.00, date: '2026-05-28', type: 'debit', category: 'shopping' },
        { id: 't10', accountId: '1', description: 'Uber Eats', merchant: 'Uber Eats', amount: -28.90, date: '2026-05-27', type: 'debit', category: 'food' },
        { id: 't11', accountId: '2', description: 'Transfer from Everyday', amount: 500.00, date: '2026-05-31', type: 'credit', category: 'transfer', paymentMethod: 'internal' },
        { id: 't12', accountId: '2', description: 'Interest Payment', amount: 78.50, date: '2026-06-01', type: 'credit', category: 'income' },
        { id: 't13', accountId: '3', description: 'Home Loan Repayment', amount: -1850.00, date: '2026-06-01', type: 'debit', category: 'transfer' },
        { id: 't14', accountId: '3', description: 'Home Loan Repayment', amount: -1850.00, date: '2026-05-01', type: 'debit', category: 'transfer' },
      ],

      cards: [
        {
          id: 'c1',
          accountId: '1',
          last4: '4521',
          fullNumber: '4321 5678 9012 4521',
          cvv: '847',
          name: 'Alex Johnson',
          type: 'visa',
          expiry: '09/28',
          isLocked: false,
          isContactless: true,
          colour: '#004B5A',
          status: 'active',
        },
        {
          id: 'c2',
          accountId: '2',
          last4: '8893',
          fullNumber: '4756 2341 6789 8893',
          cvv: '312',
          name: 'Alex Johnson',
          type: 'visa',
          expiry: '03/27',
          isLocked: false,
          isContactless: true,
          colour: '#1a6b7a',
          status: 'active',
        },
      ],

      payees: [
        { id: 'p1', name: 'Sarah Johnson', bsb: '062-000', accountNumber: '1234 5678', avatarColour: '#E91E63' },
        { id: 'p2', name: 'Tom Williams', bsb: '033-000', accountNumber: '9876 5432', avatarColour: '#9C27B0' },
        { id: 'p3', name: 'Ausgrid', bsb: '012-000', accountNumber: '4567 8901', avatarColour: '#FF9800' },
        { id: 'p4', name: 'Body Corp', bsb: '641-800', accountNumber: '2468 1357', avatarColour: '#2196F3' },
        { id: 'p5', name: 'Mum', bsb: '055-000', accountNumber: '1111 2222', avatarColour: '#4CAF50' },
      ],

      payToAgreements: [
        {
          id: 'pt1',
          merchantName: 'Spotify Australia',
          description: 'Premium subscription',
          amount: 11.99,
          frequency: 'monthly',
          status: 'active',
          startDate: '2025-01-15',
          nextPaymentDate: '2026-06-15',
          lastPaymentDate: '2026-05-15',
          accountId: '1',
          reference: 'SPT-2025-00847',
          payId: 'billing@spotify.com.au',
        },
        {
          id: 'pt2',
          merchantName: 'NRMA Insurance',
          description: 'Home & contents insurance',
          amount: 245.00,
          frequency: 'quarterly',
          status: 'active',
          startDate: '2025-03-01',
          nextPaymentDate: '2026-06-01',
          lastPaymentDate: '2026-03-01',
          accountId: '1',
          reference: 'NRMA-HOME-2025',
          payId: 'payments@nrma.com.au',
        },
        {
          id: 'pt3',
          merchantName: 'Gold\'s Gym Wollongong',
          description: 'Monthly membership',
          amount: 79.90,
          frequency: 'monthly',
          status: 'paused',
          startDate: '2024-09-01',
          nextPaymentDate: undefined,
          lastPaymentDate: '2026-04-01',
          accountId: '2',
          reference: 'GYM-ALEX-001',
          payId: '0281234567',
        },
      ],

      scheduledPayments: [
        {
          id: 'sp1',
          payeeId: 'p4',
          payeeName: 'Body Corp',
          amount: 450.00,
          frequency: 'monthly',
          nextDate: '2026-06-01',
          accountId: '1',
          description: 'Monthly body corp levy',
          status: 'active',
        },
        {
          id: 'sp2',
          payeeId: 'p5',
          payeeName: 'Mum',
          amount: 200.00,
          frequency: 'fortnightly',
          nextDate: '2026-06-05',
          accountId: '1',
          description: 'Weekly transfer',
          status: 'active',
        },
      ],

      // ─── Preferences actions ───────────────────────────────────────────────

      setPasscode: (code) =>
        set((state) => ({
          preferences: { ...state.preferences, hasSetupPasscode: true, passcode: code },
        })),

      verifyPasscode: (code) => get().preferences.passcode === code,

      setAuthenticated: (value) =>
        set((state) => ({
          preferences: { ...state.preferences, isAuthenticated: value },
        })),

      dismissBanner: (bannerId) =>
        set((state) => ({
          preferences: {
            ...state.preferences,
            dismissedBanners: [...(state.preferences.dismissedBanners || []), bannerId],
          },
        })),

      updateNotifications: (prefs) =>
        set((state) => ({
          notifications: { ...state.notifications, ...prefs },
        })),

      updateProfile: (updates) =>
        set((state) => ({
          profile: { ...state.profile, ...updates },
        })),

      addLoginActivity: (activity) =>
        set((state) => ({
          loginActivity: [{ ...activity, id: generateId() }, ...state.loginActivity].slice(0, 50),
        })),

      clearLoginActivity: () =>
        set({ loginActivity: [] }),

      // ─── Card actions ──────────────────────────────────────────────────────

      toggleCardLock: (cardId) =>
        set((state) => ({
          cards: state.cards.map((c) =>
            c.id === cardId ? { ...c, isLocked: !c.isLocked } : c
          ),
        })),

      reportCard: (cardId, reason) =>
        set((state) => ({
          cards: state.cards.map((c) =>
            c.id === cardId
              ? { ...c, status: reason as Card['status'], isLocked: true, reportedAt: new Date().toISOString(), reportReason: reason }
              : c
          ),
        })),

      updateCard: (cardId, updates) =>
        set((state) => ({
          cards: state.cards.map((c) =>
            c.id === cardId ? { ...c, ...updates } : c
          ),
        })),

      // ─── Transaction actions ───────────────────────────────────────────────

      addTransaction: (tx) =>
        set((state) => ({
          transactions: [{ ...tx, id: generateId() }, ...state.transactions],
        })),

      updateAccountBalance: (accountId, delta) =>
        set((state) => ({
          accounts: state.accounts.map((a) =>
            a.id === accountId
              ? { ...a, balance: a.balance + delta, availableBalance: a.availableBalance + delta }
              : a
          ),
        })),

      // ─── Payee actions ─────────────────────────────────────────────────────

      addPayee: (payee) =>
        set((state) => ({
          payees: [...state.payees, { ...payee, id: generateId() }],
        })),

      updatePayee: (id, updates) =>
        set((state) => ({
          payees: state.payees.map((p) => (p.id === id ? { ...p, ...updates } : p)),
        })),

      deletePayee: (id) =>
        set((state) => ({
          payees: state.payees.filter((p) => p.id !== id),
        })),

      // ─── PayTo actions ─────────────────────────────────────────────────────

      addPayToAgreement: (agreement) =>
        set((state) => ({
          payToAgreements: [...state.payToAgreements, { ...agreement, id: generateId() }],
        })),

      updatePayToAgreement: (id, updates) =>
        set((state) => ({
          payToAgreements: state.payToAgreements.map((a) =>
            a.id === id ? { ...a, ...updates } : a
          ),
        })),

      // ─── Scheduled payment actions ──────────────────────────────────────────

      addScheduledPayment: (payment) =>
        set((state) => ({
          scheduledPayments: [...state.scheduledPayments, { ...payment, id: generateId() }],
        })),

      updateScheduledPayment: (id, updates) =>
        set((state) => ({
          scheduledPayments: state.scheduledPayments.map((p) =>
            p.id === id ? { ...p, ...updates } : p
          ),
        })),

      deleteScheduledPayment: (id) =>
        set((state) => ({
          scheduledPayments: state.scheduledPayments.filter((p) => p.id !== id),
        })),
    }),
    {
      name: 'imb-bank-storage-v3',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        preferences: state.preferences,
        cards: state.cards,
        payees: state.payees,
        accounts: state.accounts,
        transactions: state.transactions,
        payToAgreements: state.payToAgreements,
        scheduledPayments: state.scheduledPayments,
        notifications: state.notifications,
        profile: state.profile,
        loginActivity: state.loginActivity,
      }),
    }
  )
);
