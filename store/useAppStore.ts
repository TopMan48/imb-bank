import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Preferences, Account } from './types';

interface PreferencesSlice {
  preferences: Preferences;
  setPasscode: (code: string) => void;
  verifyPasscode: (code: string) => boolean;
  setAuthenticated: (value: boolean) => void;
  dismissBanner: (bannerId: string) => void;
}

interface AccountsSlice {
  accounts: Account[];
}

export type AppStore = PreferencesSlice & AccountsSlice;

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
        },
        {
          id: '3',
          name: 'Home Loan',
          type: 'loan',
          balance: -342000.00,
          bsb: '641-800',
          accountNumber: '5555 1234',
          availableBalance: 0,
        },
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
    }),
    {
      name: 'imb-bank-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        preferences: state.preferences,
      }),
    }
  )
);
