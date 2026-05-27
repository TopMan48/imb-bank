/**
 * Central API configuration and environment detection.
 * Determines whether to use live APIs or demo simulation mode.
 */

export type ApiEnvironment = 'sandbox' | 'production' | 'demo';

export interface ApiConnectionStatus {
  provider: string;
  isConfigured: boolean;
  environment: ApiEnvironment;
  lastSuccessfulCall?: string;
  lastError?: string;
}

// Environment variable keys
const ENV_KEYS = {
  monoova: {
    apiKey: 'EXPO_PUBLIC_MONOOVA_API_KEY',
    apiSecret: 'EXPO_PUBLIC_MONOOVA_API_SECRET',
    env: 'EXPO_PUBLIC_MONOOVA_ENV',
  },
  zai: {
    clientId: 'EXPO_PUBLIC_ZAI_CLIENT_ID',
    clientSecret: 'EXPO_PUBLIC_ZAI_CLIENT_SECRET',
    env: 'EXPO_PUBLIC_ZAI_ENV',
  },
  payvantage: {
    apiKey: 'EXPO_PUBLIC_PAYVANTAGE_API_KEY',
    apiSecret: 'EXPO_PUBLIC_PAYVANTAGE_API_SECRET',
    env: 'EXPO_PUBLIC_PAYVANTAGE_ENV',
  },
  payid: {
    enabled: 'EXPO_PUBLIC_PAYID_ENABLED',
  },
} as const;

// Base URLs for each provider
export const API_URLS = {
  monoova: {
    sandbox: 'https://api.monoova.com/sandbox/v2',
    production: 'https://api.monoova.com/live/v2',
  },
  zai: {
    sandbox: 'https://test.api.promisepay.com',
    production: 'https://secure.api.promisepay.com',
  },
  payvantage: {
    sandbox: 'https://sandbox.api.payvantage.com.au/v1',
    production: 'https://api.payvantage.com.au/v1',
  },
} as const;

function getEnv(key: string): string {
  return (process.env as Record<string, string | undefined>)[key] ?? '';
}

export function getMonoovaConfig() {
  const apiKey = getEnv(ENV_KEYS.monoova.apiKey);
  const apiSecret = getEnv(ENV_KEYS.monoova.apiSecret);
  const env = (getEnv(ENV_KEYS.monoova.env) || 'sandbox') as 'sandbox' | 'production';
  const isConfigured = Boolean(apiKey && apiSecret);

  return {
    apiKey,
    apiSecret,
    environment: isConfigured ? env : 'demo' as ApiEnvironment,
    baseUrl: isConfigured ? API_URLS.monoova[env] : '',
    isConfigured,
  };
}

export function getZaiConfig() {
  const clientId = getEnv(ENV_KEYS.zai.clientId);
  const clientSecret = getEnv(ENV_KEYS.zai.clientSecret);
  const env = (getEnv(ENV_KEYS.zai.env) || 'sandbox') as 'sandbox' | 'production';
  const isConfigured = Boolean(clientId && clientSecret);

  return {
    clientId,
    clientSecret,
    environment: isConfigured ? env : 'demo' as ApiEnvironment,
    baseUrl: isConfigured ? API_URLS.zai[env] : '',
    isConfigured,
  };
}

export function getPayvantageConfig() {
  const apiKey = getEnv(ENV_KEYS.payvantage.apiKey);
  const apiSecret = getEnv(ENV_KEYS.payvantage.apiSecret);
  const env = (getEnv(ENV_KEYS.payvantage.env) || 'sandbox') as 'sandbox' | 'production';
  const isConfigured = Boolean(apiKey && apiSecret);

  return {
    apiKey,
    apiSecret,
    environment: isConfigured ? env : 'demo' as ApiEnvironment,
    baseUrl: isConfigured ? API_URLS.payvantage[env] : '',
    isConfigured,
  };
}

export function isPayIdEnabled(): boolean {
  return getEnv(ENV_KEYS.payid.enabled) !== 'false';
}

export function isDemoMode(): boolean {
  const monoova = getMonoovaConfig();
  const zai = getZaiConfig();
  const payvantage = getPayvantageConfig();
  // Demo mode if none of the providers are configured
  return !monoova.isConfigured && !zai.isConfigured && !payvantage.isConfigured;
}

/** Get connection status for all providers */
export function getAllApiStatus(): ApiConnectionStatus[] {
  const monoova = getMonoovaConfig();
  const zai = getZaiConfig();
  const payvantage = getPayvantageConfig();

  return [
    {
      provider: 'Monoova (NPP/PayID)',
      isConfigured: monoova.isConfigured,
      environment: monoova.environment,
    },
    {
      provider: 'Zai (Assembly Payments)',
      isConfigured: zai.isConfigured,
      environment: zai.environment,
    },
    {
      provider: 'PayVantage',
      isConfigured: payvantage.isConfigured,
      environment: payvantage.environment,
    },
  ];
}
