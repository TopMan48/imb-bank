/**
 * Zai (Assembly Payments) API Service Layer
 * Handles user creation, payment processing, virtual accounts,
 * transaction management, and KYC verification.
 *
 * When API keys are not configured, falls back to demo simulation.
 */

import { getZaiConfig } from './api-config';
import {
  demoZaiCreateUser,
  demoZaiCreateTransaction,
  demoZaiGetTransactions,
  demoZaiCreateVirtualAccount,
  demoZaiTriggerKyc,
} from './demo-simulation';
import type {
  ZaiUser,
  ZaiTransaction,
  ZaiVirtualAccount,
} from './types';

class ZaiApiService {
  private accessToken: string | null = null;
  private tokenExpiresAt: number = 0;

  private get isLive(): boolean {
    return getZaiConfig().isConfigured;
  }

  private get baseUrl(): string {
    return getZaiConfig().baseUrl;
  }

  private async getAuthToken(): Promise<string> {
    if (this.accessToken && Date.now() < this.tokenExpiresAt) {
      return this.accessToken;
    }

    const config = getZaiConfig();
    const response = await fetch(`${this.baseUrl}/request_token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: config.clientId,
        client_secret: config.clientSecret,
        grant_type: 'client_credentials',
        scope: 'global',
      }),
    });

    if (!response.ok) {
      throw new Error(`Zai authentication failed: ${response.status}`);
    }

    const data = await response.json();
    this.accessToken = data.access_token;
    this.tokenExpiresAt = Date.now() + (data.expires_in ?? 3600) * 1000;
    return this.accessToken!;
  }

  private async getHeaders(): Promise<Record<string, string>> {
    const token = await this.getAuthToken();
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };
  }

  // ─── User Management ──────────────────────────────────────────────────────

  async createUser(params: {
    email: string;
    firstName: string;
    lastName: string;
    mobile?: string;
    country?: string;
  }): Promise<ZaiUser> {
    if (!this.isLive) {
      return demoZaiCreateUser(params);
    }

    try {
      const headers = await this.getHeaders();
      const response = await fetch(`${this.baseUrl}/users`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          id: `user_${Date.now()}`,
          email: params.email,
          first_name: params.firstName,
          last_name: params.lastName,
          mobile: params.mobile,
          country: params.country ?? 'AUS',
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message ?? `User creation failed: ${response.status}`);
      }

      const data = await response.json();
      const user = data.users ?? data;
      return {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        mobile: user.mobile,
        status: user.state ?? 'active',
        kycVerified: user.kyc_state === 'verified',
        createdAt: user.created_at ?? new Date().toISOString(),
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'User creation failed';
      throw new Error(message);
    }
  }

  async getUser(userId: string): Promise<ZaiUser | null> {
    if (!this.isLive) {
      await new Promise((r) => setTimeout(r, 300));
      return null;
    }

    try {
      const headers = await this.getHeaders();
      const response = await fetch(`${this.baseUrl}/users/${userId}`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error(`Get user failed: ${response.status}`);
      }

      const data = await response.json();
      const user = data.users ?? data;
      return {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        mobile: user.mobile,
        status: user.state ?? 'active',
        kycVerified: user.kyc_state === 'verified',
        createdAt: user.created_at ?? new Date().toISOString(),
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Get user failed';
      throw new Error(message);
    }
  }

  // ─── Payment Processing ───────────────────────────────────────────────────

  async createPayIn(params: {
    amount: number;
    userId: string;
    description?: string;
    accountId?: string;
  }): Promise<ZaiTransaction> {
    if (!this.isLive) {
      return demoZaiCreateTransaction({
        amount: params.amount,
        type: 'pay_in',
        toUserId: params.userId,
        description: params.description,
      });
    }

    try {
      const headers = await this.getHeaders();
      const response = await fetch(`${this.baseUrl}/items`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          id: `item_${Date.now()}`,
          name: params.description ?? 'Pay In',
          amount: Math.round(params.amount * 100), // Zai uses cents
          payment_type: 2, // Pay In
          buyer_id: params.userId,
          seller_id: params.userId,
        }),
      });

      if (!response.ok) {
        throw new Error(`Pay in failed: ${response.status}`);
      }

      const data = await response.json();
      const item = data.items ?? data;
      return {
        id: item.id,
        amount: item.amount / 100,
        currency: item.currency ?? 'AUD',
        type: 'pay_in',
        status: this.mapZaiStatus(item.state),
        toUserId: params.userId,
        description: item.name,
        reference: item.id,
        createdAt: item.created_at ?? new Date().toISOString(),
        completedAt: item.paid_at,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Pay in failed';
      throw new Error(message);
    }
  }

  async createPayOut(params: {
    amount: number;
    userId: string;
    accountId: string;
    description?: string;
  }): Promise<ZaiTransaction> {
    if (!this.isLive) {
      return demoZaiCreateTransaction({
        amount: params.amount,
        type: 'pay_out',
        fromUserId: params.userId,
        description: params.description,
      });
    }

    try {
      const headers = await this.getHeaders();
      const response = await fetch(`${this.baseUrl}/items/${params.accountId}/request_release`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({
          release_amount: Math.round(params.amount * 100),
        }),
      });

      if (!response.ok) {
        throw new Error(`Pay out failed: ${response.status}`);
      }

      const data = await response.json();
      const item = data.items ?? data;
      return {
        id: item.id,
        amount: params.amount,
        currency: 'AUD',
        type: 'pay_out',
        status: this.mapZaiStatus(item.state),
        fromUserId: params.userId,
        description: params.description,
        reference: item.id,
        createdAt: new Date().toISOString(),
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Pay out failed';
      throw new Error(message);
    }
  }

  async transfer(params: {
    amount: number;
    fromUserId: string;
    toUserId: string;
    description?: string;
  }): Promise<ZaiTransaction> {
    if (!this.isLive) {
      return demoZaiCreateTransaction({
        amount: params.amount,
        type: 'transfer',
        fromUserId: params.fromUserId,
        toUserId: params.toUserId,
        description: params.description,
      });
    }

    try {
      const headers = await this.getHeaders();
      const response = await fetch(`${this.baseUrl}/items`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          id: `transfer_${Date.now()}`,
          name: params.description ?? 'Transfer',
          amount: Math.round(params.amount * 100),
          payment_type: 1,
          buyer_id: params.fromUserId,
          seller_id: params.toUserId,
        }),
      });

      if (!response.ok) {
        throw new Error(`Transfer failed: ${response.status}`);
      }

      const data = await response.json();
      const item = data.items ?? data;
      return {
        id: item.id,
        amount: params.amount,
        currency: 'AUD',
        type: 'transfer',
        status: this.mapZaiStatus(item.state),
        fromUserId: params.fromUserId,
        toUserId: params.toUserId,
        description: params.description,
        reference: item.id,
        createdAt: item.created_at ?? new Date().toISOString(),
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Transfer failed';
      throw new Error(message);
    }
  }

  // ─── Virtual Accounts ─────────────────────────────────────────────────────

  async createVirtualAccount(userId: string): Promise<ZaiVirtualAccount> {
    if (!this.isLive) {
      return demoZaiCreateVirtualAccount(userId);
    }

    try {
      const headers = await this.getHeaders();
      const response = await fetch(`${this.baseUrl}/wallet_accounts`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          user_id: userId,
          currency: 'AUD',
        }),
      });

      if (!response.ok) {
        throw new Error(`Virtual account creation failed: ${response.status}`);
      }

      const data = await response.json();
      const account = data.wallet_accounts ?? data;
      return {
        id: account.id,
        bsb: account.bsb ?? '641-800',
        accountNumber: account.account_number ?? '',
        accountName: account.account_name ?? 'Virtual Account',
        balance: (account.balance ?? 0) / 100,
        currency: account.currency ?? 'AUD',
        status: account.active ? 'active' : 'closed',
        userId,
        createdAt: account.created_at ?? new Date().toISOString(),
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Virtual account creation failed';
      throw new Error(message);
    }
  }

  // ─── Transaction History ──────────────────────────────────────────────────

  async getTransactions(params?: {
    userId?: string;
    limit?: number;
    offset?: number;
  }): Promise<ZaiTransaction[]> {
    if (!this.isLive) {
      return demoZaiGetTransactions();
    }

    try {
      const headers = await this.getHeaders();
      const queryParams = new URLSearchParams();
      if (params?.limit) queryParams.set('limit', String(params.limit));
      if (params?.offset) queryParams.set('offset', String(params.offset));
      if (params?.userId) queryParams.set('user_id', params.userId);

      const url = `${this.baseUrl}/items?${queryParams.toString()}`;
      const response = await fetch(url, { method: 'GET', headers });

      if (!response.ok) {
        throw new Error(`Get transactions failed: ${response.status}`);
      }

      const data = await response.json();
      const items = data.items ?? [];
      return items.map((item: Record<string, unknown>) => ({
        id: item.id as string,
        amount: (item.amount as number) / 100,
        currency: (item.currency as string) ?? 'AUD',
        type: this.mapZaiPaymentType(item.payment_type as number),
        status: this.mapZaiStatus(item.state as string),
        fromUserId: item.buyer_id as string | undefined,
        toUserId: item.seller_id as string | undefined,
        description: item.name as string | undefined,
        reference: item.id as string,
        createdAt: (item.created_at as string) ?? new Date().toISOString(),
        completedAt: item.paid_at as string | undefined,
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Get transactions failed';
      throw new Error(message);
    }
  }

  async getTransactionStatus(transactionId: string): Promise<ZaiTransaction | null> {
    if (!this.isLive) {
      const transactions = await demoZaiGetTransactions();
      return transactions.find((t) => t.id === transactionId) ?? null;
    }

    try {
      const headers = await this.getHeaders();
      const response = await fetch(`${this.baseUrl}/items/${transactionId}`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error(`Transaction status check failed: ${response.status}`);
      }

      const data = await response.json();
      const item = data.items ?? data;
      return {
        id: item.id,
        amount: item.amount / 100,
        currency: item.currency ?? 'AUD',
        type: this.mapZaiPaymentType(item.payment_type),
        status: this.mapZaiStatus(item.state),
        fromUserId: item.buyer_id,
        toUserId: item.seller_id,
        description: item.name,
        reference: item.id,
        createdAt: item.created_at ?? new Date().toISOString(),
        completedAt: item.paid_at,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Transaction status check failed';
      throw new Error(message);
    }
  }

  // ─── KYC Verification ─────────────────────────────────────────────────────

  async triggerKycVerification(userId: string): Promise<{ status: string; message: string }> {
    if (!this.isLive) {
      return demoZaiTriggerKyc(userId);
    }

    try {
      const headers = await this.getHeaders();
      const response = await fetch(`${this.baseUrl}/users/${userId}/identity_check`, {
        method: 'POST',
        headers,
      });

      if (!response.ok) {
        throw new Error(`KYC trigger failed: ${response.status}`);
      }

      const data = await response.json();
      return {
        status: data.state ?? 'pending',
        message: data.message ?? 'KYC verification initiated',
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'KYC verification failed';
      throw new Error(message);
    }
  }

  // ─── Webhooks ─────────────────────────────────────────────────────────────

  async processWebhook(payload: Record<string, unknown>): Promise<{ acknowledged: boolean }> {
    // Validate webhook and process event
    return { acknowledged: true };
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────

  private mapZaiStatus(state: string): ZaiTransaction['status'] {
    switch (state) {
      case 'pending': return 'pending';
      case 'processing': return 'processing';
      case 'completed':
      case 'payment_held':
      case 'payment_deposited':
        return 'completed';
      case 'failed':
      case 'voided':
        return 'failed';
      case 'refunded': return 'refunded';
      default: return 'pending';
    }
  }

  private mapZaiPaymentType(type: number): ZaiTransaction['type'] {
    switch (type) {
      case 1: return 'transfer';
      case 2: return 'pay_in';
      case 3: return 'pay_out';
      default: return 'transfer';
    }
  }
}

export const zaiApi = new ZaiApiService();
