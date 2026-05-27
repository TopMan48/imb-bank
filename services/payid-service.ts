/**
 * PayID Service — High-level service orchestrating PayID operations.
 * Provides PayID resolution, registration, payment requests, and status tracking.
 * Routes through Monoova API (or demo mode) for NPP network access.
 */

import { monoovaApi } from './monoova-api';
import {
  demoCreatePaymentRequest,
  demoGetPaymentRequests,
  demoGetPaymentRequest,
  demoGetRegisteredPayIds,
  demoSubscribeToWebhooks,
  demoGetWebhookEvents,
} from './demo-simulation';
import type {
  PayIdResolutionResult,
  PayIdRegistration,
  PayIdRegistrationResult,
  PaymentRequest,
  CreatePaymentRequest,
  WebhookEvent,
} from './types';
import { isDemoMode } from './api-config';

class PayIdService {
  // ─── PayID Resolution ─────────────────────────────────────────────────────

  /**
   * Resolve a PayID to verify it exists and retrieve the registered name.
   * Used before sending a payment to confirm the recipient.
   */
  async resolvePayId(payId: string): Promise<PayIdResolutionResult | null> {
    return monoovaApi.resolvePayId(payId);
  }

  // ─── PayID Registration ───────────────────────────────────────────────────

  /**
   * Register a new PayID linked to an account.
   * Supports email, mobile, ABN, and organisation IDs.
   * Can be static (reusable) or single-use.
   */
  async registerPayId(registration: PayIdRegistration): Promise<PayIdRegistrationResult> {
    // Validate PayID format before attempting registration
    this.validatePayIdFormat(registration.payId, registration.type);
    return monoovaApi.registerPayId(registration);
  }

  /**
   * Deregister (remove) a PayID.
   */
  async deregisterPayId(payId: string): Promise<void> {
    return monoovaApi.deregisterPayId(payId);
  }

  /**
   * Get all registered PayIDs for the current user.
   */
  getRegisteredPayIds(): PayIdRegistrationResult[] {
    if (isDemoMode()) {
      return demoGetRegisteredPayIds();
    }
    // In live mode, this would query the API
    return demoGetRegisteredPayIds();
  }

  // ─── Payment Requests ─────────────────────────────────────────────────────

  /**
   * Create a payment request that can be paid via PayID.
   * The request generates a reference that the payer can use to send money.
   */
  async createPaymentRequest(request: CreatePaymentRequest): Promise<PaymentRequest> {
    if (isDemoMode()) {
      return demoCreatePaymentRequest(request);
    }

    // Live implementation would call Monoova's payment request API
    return demoCreatePaymentRequest(request);
  }

  /**
   * Get all payment requests (pending, paid, expired).
   */
  getPaymentRequests(): PaymentRequest[] {
    if (isDemoMode()) {
      return demoGetPaymentRequests();
    }
    return demoGetPaymentRequests();
  }

  /**
   * Get a specific payment request by ID.
   */
  getPaymentRequest(id: string): PaymentRequest | null {
    if (isDemoMode()) {
      return demoGetPaymentRequest(id);
    }
    return demoGetPaymentRequest(id);
  }

  // ─── Status Tracking & Webhooks ───────────────────────────────────────────

  /**
   * Subscribe to real-time webhook events.
   * Returns an unsubscribe function.
   */
  subscribeToEvents(listener: (event: WebhookEvent) => void): () => void {
    if (isDemoMode()) {
      return demoSubscribeToWebhooks(listener);
    }
    // In live mode, this would connect to a WebSocket or polling mechanism
    return demoSubscribeToWebhooks(listener);
  }

  /**
   * Get all recent webhook events.
   */
  getRecentEvents(): WebhookEvent[] {
    if (isDemoMode()) {
      return demoGetWebhookEvents();
    }
    return demoGetWebhookEvents();
  }

  // ─── Validation Helpers ───────────────────────────────────────────────────

  private validatePayIdFormat(payId: string, type: PayIdRegistration['type']): void {
    switch (type) {
      case 'email':
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payId)) {
          throw new Error('Invalid email format for PayID');
        }
        break;
      case 'mobile':
        const digits = payId.replace(/\D/g, '');
        if (!/^(04\d{8}|614\d{8})$/.test(digits)) {
          throw new Error('Invalid Australian mobile number for PayID');
        }
        break;
      case 'abn':
        const abnDigits = payId.replace(/\s/g, '');
        if (!/^\d{11}$/.test(abnDigits)) {
          throw new Error('ABN must be exactly 11 digits');
        }
        break;
      case 'organisation-id':
        if (!payId.trim()) {
          throw new Error('Organisation ID cannot be empty');
        }
        break;
    }
  }

  /**
   * Detect the PayID type from a given string.
   */
  detectPayIdType(payId: string): PayIdRegistration['type'] | null {
    const trimmed = payId.trim();
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return 'email';
    const digits = trimmed.replace(/\D/g, '');
    if (/^(04\d{8}|614\d{8})$/.test(digits)) return 'mobile';
    if (/^\d{11}$/.test(digits.replace(/\s/g, ''))) return 'abn';
    if (trimmed.startsWith('ORG')) return 'organisation-id';
    return null;
  }
}

export const payIdService = new PayIdService();
