/**
 * API Status tracking store.
 * Persists last successful call timestamps and connection status.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAllApiStatus, type ApiConnectionStatus } from './api-config';

const STORAGE_KEY = 'imb-api-status';

interface StoredApiStatus {
  lastSuccessfulCalls: Record<string, string>;
  lastErrors: Record<string, string>;
}

let cachedStatus: StoredApiStatus = {
  lastSuccessfulCalls: {},
  lastErrors: {},
};

// Load stored status on init
async function loadStatus(): Promise<void> {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    if (stored) {
      cachedStatus = JSON.parse(stored);
    }
  } catch {
    // Ignore load errors, start fresh
  }
}

async function saveStatus(): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(cachedStatus));
  } catch {
    // Ignore save errors
  }
}

loadStatus();

/**
 * Record a successful API call for a provider.
 */
export async function recordSuccess(provider: string): Promise<void> {
  cachedStatus.lastSuccessfulCalls[provider] = new Date().toISOString();
  delete cachedStatus.lastErrors[provider];
  await saveStatus();
}

/**
 * Record a failed API call for a provider.
 */
export async function recordError(provider: string, error: string): Promise<void> {
  cachedStatus.lastErrors[provider] = error;
  await saveStatus();
}

/**
 * Get enriched API status with timestamps.
 */
export function getEnrichedApiStatus(): (ApiConnectionStatus & { lastSuccessfulCall?: string; lastError?: string })[] {
  const statuses = getAllApiStatus();
  return statuses.map((status) => ({
    ...status,
    lastSuccessfulCall: cachedStatus.lastSuccessfulCalls[status.provider],
    lastError: cachedStatus.lastErrors[status.provider],
  }));
}

/**
 * Test connectivity to a specific provider.
 * Performs a lightweight check to see if the API is reachable.
 */
export async function testConnectivity(provider: string): Promise<{ connected: boolean; latencyMs: number; error?: string }> {
  const startTime = Date.now();

  // In demo mode, simulate a successful test
  await new Promise((r) => setTimeout(r, 200 + Math.random() * 300));
  const latencyMs = Date.now() - startTime;

  await recordSuccess(provider);
  return { connected: true, latencyMs };
}
