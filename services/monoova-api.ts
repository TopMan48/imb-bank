/**
 * Monoova API Service Layer
 * Handles NPP payments, PayID resolution/registration, direct credits/debits,
 * and account verification via the Monoova platform.
 *
 * When API keys are not configured, falls back to demo simulation.
 */

import { getMonoovaConfig } from './api-config';
import {
  demoResolvePayId,
  demoRegisterPayId,
  demoSendNppPayment,
  demoGetNppPaymentStatus,
  demoGetNppPayments,
  demoSendDirectCredit,
  demoSendDirectDebit,
  demoVerifyAccount,
} from './demo-simulation';
import type {
  PayIdResolutionResult,
  PayIdRegistration,
  PayIdRegistrationResult,
  NppPayment,
  NppPaymentRequest,
  DirectCredit,
  DirectDebit,
  AccountVerificationResult,
} from './types';

class MonoovaApiService {
  private getHeaders(): Record<string, string> {
    const config = getMonoovaConfig();
    return {
      'Content-Type': 'application/json',
      Authorization: `Basic ${btoa(`${config.apiKey}:${config.apiSecret}`)}`,
    };
  }

  private get baseUrl(): string {
    return getMonoovaConfig().baseUrl;
  }

  private get isLive(): boolean {
    return getMonoovaConfig().isConfigured;
  }

  // ─── PayID Resolution ─────────────────────────────────────────────────────

  async resolvePayId(payId: string): Promise<PayIdResolutionResult | null> {
    if (!this.isLive) {
      return demoResolvePayId(payId);
    }

    try {
      const response = await fetch(`${this.baseUrl}/payid/resolve`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ payId }),
      });

      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error(`PayID resolution failed: ${response.status}`);
      }

      const data = await response.json();
      return {
        payId: data.payId,
        type: data.type,
        registeredName: data.registeredName ?? data.name,
        financialInstitution: data.financialInstitution ?? data.institution,
        accountName: data.accountName,
        status: data.status ?? 'active',
        resolvedAt: data.resolvedAt ?? new Date().toISOString(),
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'PayID resolution failed';
      throw new Error(message);
    }
  }

  // ─── PayID Registration ───────────────────────────────────────────────────

  async registerPayId(registration: PayIdRegistration): Promise<PayIdRegistrationResult> {
    if (!this.isLive) {
      return demoRegisterPayId(registration);
    }

    try {
      const response = await fetch(`${this.baseUrl}/payid/register`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          payId: registration.payId,
          type: registration.type,
          bsb: registration.accountBsb,
          accountNumber: registration.accountNumber,
          accountName: registration.accountName,
          isReusable: registration.isReusable,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message ?? `PayID registration failed: ${response.status}`);
      }

      const data = await response.json();
      return {
        id: data.id,
        payId: data.payId,
        type: data.type,
        status: data.status ?? 'active',
        registeredAt: data.registeredAt ?? new Date().toISOString(),
        isReusable: data.isReusable ?? registration.isReusable,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'PayID registration failed';
      throw new Error(message);
    }
  }

  async deregisterPayId(payId: string): Promise<void> {
    if (!this.isLive) {
      await new Promise((r) => setTimeout(r, 500));
      return;
    }

    const response = await fetch(`${this.baseUrl}/payid/deregister`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ payId }),
    });

    if (!response.ok) {
      throw new Error(`PayID deregistration failed: ${response.status}`);
    }
  }

  // ─── NPP Payments (Instant Transfers) ─────────────────────────────────────

  async sendNppPayment(request: NppPaymentRequest): Promise<NppPayment> {
    if (!this.isLive) {
      return demoSendNppPayment(request);
    }

    try {
      const response = await fetch(`${this.baseUrl}/npp/payment`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          amount: request.amount,
          fromBsb: request.fromAccountBsb,
          fromAccountNumber: request.fromAccountNumber,
          toPayId: request.toPayId,
          toBsb: request.toBsb,
          toAccountNumber: request.toAccountNumber,
          recipientName: request.recipientName,
          description: request.description,
          paymentType: request.toPayId ? 'payid' : 'bsb',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message ?? `NPP payment failed: ${response.status}`);
      }

      const data = await response.json();
      return {
        id: data.id,
        transactionId: data.transactionId,
        amount: data.amount,
        currency: data.currency ?? 'AUD',
        fromAccountBsb: request.fromAccountBsb,
        fromAccountNumber: request.fromAccountNumber,
        toPayId: request.toPayId,
        toBsb: request.toBsb,
        toAccountNumber: request.toAccountNumber,
        recipientName: request.recipientName,
        description: request.description,
        reference: data.reference,
        status: data.status ?? 'processing',
        createdAt: data.createdAt ?? new Date().toISOString(),
        completedAt: data.completedAt,
        failureReason: data.failureReason,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'NPP payment failed';
      throw new Error(message);
    }
  }

  async getNppPaymentStatus(paymentId: string): Promise<NppPayment | null> {
    if (!this.isLive) {
      return demoGetNppPaymentStatus(paymentId);
    }

    try {
      const response = await fetch(`${this.baseUrl}/npp/payment/${paymentId}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error(`Payment status check failed: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Payment status check failed';
      throw new Error(message);
    }
  }

  async getNppPayments(): Promise<NppPayment[]> {
    if (!this.isLive) {
      return demoGetNppPayments();
    }

    try {
      const response = await fetch(`${this.baseUrl}/npp/payments`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) throw new Error(`Failed to list payments: ${response.status}`);
      const data = await response.json();
      return data.payments ?? data;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to list payments';
      throw new Error(message);
    }
  }

  // ─── Direct Credits ───────────────────────────────────────────────────────

  async sendDirectCredit(params: {
    amount: number;
    toBsb: string;
    toAccountNumber: string;
    toAccountName: string;
    fromAccountName: string;
    reference?: string;
  }): Promise<DirectCredit> {
    if (!this.isLive) {
      return demoSendDirectCredit(params);
    }

    try {
      const response = await fetch(`${this.baseUrl}/directcredit`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          amount: params.amount,
          bsb: params.toBsb,
          accountNumber: params.toAccountNumber,
          accountName: params.toAccountName,
          remitterName: params.fromAccountName,
          reference: params.reference,
        }),
      });

      if (!response.ok) {
        throw new Error(`Direct credit failed: ${response.status}`);
      }

      const data = await response.json();
      return {
        id: data.id,
        amount: params.amount,
        toBsb: params.toBsb,
        toAccountNumber: params.toAccountNumber,
        toAccountName: params.toAccountName,
        fromAccountName: params.fromAccountName,
        reference: data.reference ?? params.reference ?? '',
        lodgementReference: data.lodgementReference ?? '',
        status: data.status ?? 'processing',
        createdAt: data.createdAt ?? new Date().toISOString(),
        settledAt: data.settledAt,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Direct credit failed';
      throw new Error(message);
    }
  }

  // ─── Direct Debits ────────────────────────────────────────────────────────

  async sendDirectDebit(params: {
    amount: number;
    fromBsb: string;
    fromAccountNumber: string;
    fromAccountName: string;
    reference?: string;
  }): Promise<DirectDebit> {
    if (!this.isLive) {
      return demoSendDirectDebit(params);
    }

    try {
      const response = await fetch(`${this.baseUrl}/directdebit`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          amount: params.amount,
          bsb: params.fromBsb,
          accountNumber: params.fromAccountNumber,
          accountName: params.fromAccountName,
          reference: params.reference,
        }),
      });

      if (!response.ok) {
        throw new Error(`Direct debit failed: ${response.status}`);
      }

      const data = await response.json();
      return {
        id: data.id,
        amount: params.amount,
        fromBsb: params.fromBsb,
        fromAccountNumber: params.fromAccountNumber,
        fromAccountName: params.fromAccountName,
        reference: data.reference ?? params.reference ?? '',
        lodgementReference: data.lodgementReference ?? '',
        status: data.status ?? 'processing',
        createdAt: data.createdAt ?? new Date().toISOString(),
        settledAt: data.settledAt,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Direct debit failed';
      throw new Error(message);
    }
  }

  // ─── Account Verification ─────────────────────────────────────────────────

  async verifyAccount(bsb: string, accountNumber: string): Promise<AccountVerificationResult> {
    if (!this.isLive) {
      return demoVerifyAccount(bsb, accountNumber);
    }

    try {
      const response = await fetch(`${this.baseUrl}/account/verify`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ bsb, accountNumber }),
      });

      if (!response.ok) {
        throw new Error(`Account verification failed: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Account verification failed';
      throw new Error(message);
    }
  }

  // ─── Webhooks ─────────────────────────────────────────────────────────────

  async processWebhook(payload: Record<string, unknown>): Promise<{ acknowledged: boolean }> {
    // In a real implementation, this would validate the webhook signature
    // and process the event. For now, just acknowledge.
    return { acknowledged: true };
  }
}

export const monoovaApi = new MonoovaApiService();
