/**
 * PayVantage API Service Layer
 * Handles real-time payments, batch processing, payment status,
 * account validation, and reconciliation reports.
 *
 * When API keys are not configured, falls back to demo simulation.
 */

import { getPayvantageConfig } from './api-config';
import {
  demoPayVantageSendPayment,
  demoPayVantageBatchPayment,
  demoPayVantageGetPaymentStatus,
  demoPayVantageValidateAccount,
  demoPayVantageGetReconciliation,
} from './demo-simulation';
import type {
  PayVantagePayment,
  PayVantageBatchPayment,
  PayVantageReconciliation,
} from './types';

class PayVantageApiService {
  private get isLive(): boolean {
    return getPayvantageConfig().isConfigured;
  }

  private get baseUrl(): string {
    return getPayvantageConfig().baseUrl;
  }

  private getHeaders(): Record<string, string> {
    const config = getPayvantageConfig();
    return {
      'Content-Type': 'application/json',
      'X-API-Key': config.apiKey,
      'X-API-Secret': config.apiSecret,
    };
  }

  // ─── Real-Time Payments ───────────────────────────────────────────────────

  async sendPayment(params: {
    amount: number;
    recipientBsb: string;
    recipientAccountNumber: string;
    recipientAccountName: string;
    reference?: string;
    description?: string;
  }): Promise<PayVantagePayment> {
    if (!this.isLive) {
      return demoPayVantageSendPayment(params);
    }

    try {
      const response = await fetch(`${this.baseUrl}/payments`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          amount: params.amount,
          recipient_bsb: params.recipientBsb,
          recipient_account_number: params.recipientAccountNumber,
          recipient_account_name: params.recipientAccountName,
          reference: params.reference,
          description: params.description,
          payment_method: 'real_time',
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message ?? `Payment failed: ${response.status}`);
      }

      const data = await response.json();
      return {
        id: data.id ?? data.payment_id,
        amount: data.amount,
        currency: data.currency ?? 'AUD',
        recipientBsb: params.recipientBsb,
        recipientAccountNumber: params.recipientAccountNumber,
        recipientAccountName: params.recipientAccountName,
        reference: data.reference ?? params.reference ?? '',
        status: this.mapStatus(data.status),
        createdAt: data.created_at ?? new Date().toISOString(),
        processedAt: data.processed_at,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Payment failed';
      throw new Error(message);
    }
  }

  // ─── Batch Payments ───────────────────────────────────────────────────────

  async sendBatchPayment(payments: Array<{
    amount: number;
    recipientBsb: string;
    recipientAccountNumber: string;
    recipientAccountName: string;
    reference?: string;
  }>): Promise<PayVantageBatchPayment> {
    if (!this.isLive) {
      return demoPayVantageBatchPayment(payments);
    }

    try {
      const response = await fetch(`${this.baseUrl}/payments/batch`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          payments: payments.map((p) => ({
            amount: p.amount,
            recipient_bsb: p.recipientBsb,
            recipient_account_number: p.recipientAccountNumber,
            recipient_account_name: p.recipientAccountName,
            reference: p.reference,
          })),
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message ?? `Batch payment failed: ${response.status}`);
      }

      const data = await response.json();
      return {
        id: data.id ?? data.batch_id,
        batchReference: data.batch_reference ?? data.reference,
        totalAmount: data.total_amount ?? payments.reduce((s, p) => s + p.amount, 0),
        paymentCount: data.payment_count ?? payments.length,
        status: data.status ?? 'processing',
        payments: (data.payments ?? []).map((p: Record<string, unknown>) => ({
          id: p.id as string,
          amount: p.amount as number,
          currency: (p.currency as string) ?? 'AUD',
          recipientBsb: p.recipient_bsb as string,
          recipientAccountNumber: p.recipient_account_number as string,
          recipientAccountName: p.recipient_account_name as string,
          reference: (p.reference as string) ?? '',
          status: this.mapStatus(p.status as string),
          createdAt: (p.created_at as string) ?? new Date().toISOString(),
          processedAt: p.processed_at as string | undefined,
        })),
        createdAt: data.created_at ?? new Date().toISOString(),
        completedAt: data.completed_at,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Batch payment failed';
      throw new Error(message);
    }
  }

  // ─── Payment Status ───────────────────────────────────────────────────────

  async getPaymentStatus(paymentId: string): Promise<PayVantagePayment | null> {
    if (!this.isLive) {
      return demoPayVantageGetPaymentStatus(paymentId);
    }

    try {
      const response = await fetch(`${this.baseUrl}/payments/${paymentId}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error(`Payment status check failed: ${response.status}`);
      }

      const data = await response.json();
      return {
        id: data.id ?? data.payment_id,
        amount: data.amount,
        currency: data.currency ?? 'AUD',
        recipientBsb: data.recipient_bsb,
        recipientAccountNumber: data.recipient_account_number,
        recipientAccountName: data.recipient_account_name,
        reference: data.reference ?? '',
        status: this.mapStatus(data.status),
        createdAt: data.created_at,
        processedAt: data.processed_at,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Payment status check failed';
      throw new Error(message);
    }
  }

  // ─── Account Validation ───────────────────────────────────────────────────

  async validateAccount(
    bsb: string,
    accountNumber: string
  ): Promise<{ isValid: boolean; accountName?: string }> {
    if (!this.isLive) {
      return demoPayVantageValidateAccount(bsb, accountNumber);
    }

    try {
      const response = await fetch(`${this.baseUrl}/accounts/validate`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ bsb, account_number: accountNumber }),
      });

      if (!response.ok) {
        throw new Error(`Account validation failed: ${response.status}`);
      }

      const data = await response.json();
      return {
        isValid: data.is_valid ?? data.valid ?? false,
        accountName: data.account_name,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Account validation failed';
      throw new Error(message);
    }
  }

  // ─── Reconciliation ───────────────────────────────────────────────────────

  async getReconciliation(date?: string): Promise<PayVantageReconciliation> {
    if (!this.isLive) {
      return demoPayVantageGetReconciliation(date);
    }

    try {
      const queryParams = date ? `?date=${date}` : '';
      const response = await fetch(`${this.baseUrl}/reconciliation${queryParams}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Reconciliation request failed: ${response.status}`);
      }

      const data = await response.json();
      return {
        id: data.id,
        date: data.date,
        openingBalance: data.opening_balance,
        closingBalance: data.closing_balance,
        totalCredits: data.total_credits,
        totalDebits: data.total_debits,
        transactionCount: data.transaction_count,
        status: data.status ?? 'available',
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Reconciliation request failed';
      throw new Error(message);
    }
  }

  // ─── Webhooks ─────────────────────────────────────────────────────────────

  async processWebhook(payload: Record<string, unknown>): Promise<{ acknowledged: boolean }> {
    return { acknowledged: true };
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────

  private mapStatus(status: string): PayVantagePayment['status'] {
    switch (status) {
      case 'queued': return 'queued';
      case 'processing':
      case 'in_progress':
        return 'processing';
      case 'completed':
      case 'settled':
      case 'success':
        return 'completed';
      case 'failed':
      case 'error':
        return 'failed';
      case 'cancelled': return 'cancelled';
      default: return 'queued';
    }
  }
}

export const payvantageApi = new PayVantageApiService();
