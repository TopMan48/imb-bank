/**
 * Payment Gateway — Unified payment routing layer.
 * Routes payments through the appropriate API based on payment type:
 * - PayID → Monoova NPP
 * - BSB/Account → Monoova Direct Credit or PayVantage
 * - International → appropriate provider
 *
 * Provides a single interface for the UI to interact with regardless of provider.
 */

import { monoovaApi } from './monoova-api';
import { payvantageApi } from './payvantage-api';
import { zaiApi } from './zai-api';
import { payIdService } from './payid-service';
import { isDemoMode } from './api-config';
import type {
  NppPayment,
  PayIdResolutionResult,
  DirectCredit,
  PayVantagePayment,
  NppPaymentStatus,
} from './types';

export type PaymentMethod = 'payid' | 'bsb' | 'bpay' | 'international' | 'internal';

export interface PaymentResult {
  success: boolean;
  transactionId: string;
  reference: string;
  status: NppPaymentStatus;
  provider: 'monoova' | 'payvantage' | 'zai' | 'demo';
  completedAt?: string;
  error?: string;
}

export interface PaymentParams {
  method: PaymentMethod;
  amount: number;
  fromAccountBsb: string;
  fromAccountNumber: string;
  fromAccountName: string;
  // PayID-specific
  toPayId?: string;
  // BSB-specific
  toBsb?: string;
  toAccountNumber?: string;
  toAccountName?: string;
  // Shared
  recipientName: string;
  description?: string;
}

class PaymentGateway {
  /**
   * Send a payment through the appropriate API.
   * Automatically routes based on payment method.
   */
  async sendPayment(params: PaymentParams): Promise<PaymentResult> {
    const provider = isDemoMode() ? 'demo' : this.selectProvider(params.method);

    try {
      switch (params.method) {
        case 'payid':
          return await this.sendViaPayId(params, provider);
        case 'bsb':
          return await this.sendViaBsb(params, provider);
        case 'international':
          return await this.sendInternational(params, provider);
        default:
          return await this.sendViaBsb(params, provider);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Payment failed';
      return {
        success: false,
        transactionId: '',
        reference: '',
        status: 'failed',
        provider,
        error: message,
      };
    }
  }

  /**
   * Resolve a PayID before sending payment.
   */
  async resolvePayId(payId: string): Promise<PayIdResolutionResult | null> {
    return payIdService.resolvePayId(payId);
  }

  /**
   * Verify a BSB/Account number combination.
   */
  async verifyAccount(bsb: string, accountNumber: string) {
    return monoovaApi.verifyAccount(bsb, accountNumber);
  }

  /**
   * Get the status of a payment by its transaction ID.
   */
  async getPaymentStatus(transactionId: string, provider: PaymentResult['provider']): Promise<PaymentResult | null> {
    try {
      switch (provider) {
        case 'monoova':
        case 'demo': {
          const payment = await monoovaApi.getNppPaymentStatus(transactionId);
          if (!payment) return null;
          return {
            success: payment.status === 'completed',
            transactionId: payment.id,
            reference: payment.reference,
            status: payment.status,
            provider,
            completedAt: payment.completedAt,
          };
        }
        case 'payvantage': {
          const pvPayment = await payvantageApi.getPaymentStatus(transactionId);
          if (!pvPayment) return null;
          return {
            success: pvPayment.status === 'completed',
            transactionId: pvPayment.id,
            reference: pvPayment.reference,
            status: pvPayment.status === 'completed' ? 'completed' : 'processing',
            provider,
            completedAt: pvPayment.processedAt,
          };
        }
        default:
          return null;
      }
    } catch {
      return null;
    }
  }

  // ─── Private Routing ──────────────────────────────────────────────────────

  private selectProvider(method: PaymentMethod): PaymentResult['provider'] {
    switch (method) {
      case 'payid':
        return 'monoova'; // NPP PayID goes through Monoova
      case 'bsb':
        return 'monoova'; // Direct credit via Monoova
      case 'international':
        return 'zai'; // International via Zai
      default:
        return 'monoova';
    }
  }

  private async sendViaPayId(
    params: PaymentParams,
    provider: PaymentResult['provider']
  ): Promise<PaymentResult> {
    if (!params.toPayId) {
      throw new Error('PayID is required for PayID payments');
    }

    const payment: NppPayment = await monoovaApi.sendNppPayment({
      amount: params.amount,
      fromAccountBsb: params.fromAccountBsb,
      fromAccountNumber: params.fromAccountNumber,
      toPayId: params.toPayId,
      recipientName: params.recipientName,
      description: params.description,
    });

    return {
      success: payment.status !== 'failed' && payment.status !== 'rejected',
      transactionId: payment.id,
      reference: payment.reference,
      status: payment.status,
      provider,
      completedAt: payment.completedAt,
    };
  }

  private async sendViaBsb(
    params: PaymentParams,
    provider: PaymentResult['provider']
  ): Promise<PaymentResult> {
    if (!params.toBsb || !params.toAccountNumber) {
      throw new Error('BSB and account number are required');
    }

    if (provider === 'payvantage') {
      const payment: PayVantagePayment = await payvantageApi.sendPayment({
        amount: params.amount,
        recipientBsb: params.toBsb,
        recipientAccountNumber: params.toAccountNumber,
        recipientAccountName: params.toAccountName ?? params.recipientName,
        reference: params.description,
      });

      return {
        success: payment.status !== 'failed' && payment.status !== 'cancelled',
        transactionId: payment.id,
        reference: payment.reference,
        status: payment.status === 'completed' ? 'completed' : 'processing',
        provider,
        completedAt: payment.processedAt,
      };
    }

    // Default: Monoova direct credit
    const credit: DirectCredit = await monoovaApi.sendDirectCredit({
      amount: params.amount,
      toBsb: params.toBsb,
      toAccountNumber: params.toAccountNumber,
      toAccountName: params.toAccountName ?? params.recipientName,
      fromAccountName: params.fromAccountName,
      reference: params.description,
    });

    return {
      success: credit.status !== 'returned' && credit.status !== 'dishonoured',
      transactionId: credit.id,
      reference: credit.reference,
      status: credit.status === 'settled' ? 'completed' : 'processing',
      provider,
      completedAt: credit.settledAt,
    };
  }

  private async sendInternational(
    params: PaymentParams,
    provider: PaymentResult['provider']
  ): Promise<PaymentResult> {
    // International transfers via Zai
    const transaction = await zaiApi.transfer({
      amount: params.amount,
      fromUserId: 'current_user', // Would be actual user ID
      toUserId: 'recipient', // Would be resolved from params
      description: params.description ?? `International transfer to ${params.recipientName}`,
    });

    return {
      success: transaction.status !== 'failed',
      transactionId: transaction.id,
      reference: transaction.reference,
      status: transaction.status === 'completed' ? 'completed' : 'processing',
      provider,
      completedAt: transaction.completedAt,
    };
  }
}

export const paymentGateway = new PaymentGateway();
