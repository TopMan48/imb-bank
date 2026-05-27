/**
 * Webhook Handler — Processes incoming webhook events from payment providers.
 * Provides real-time status updates for payments, PayID changes, and requests.
 *
 * In demo mode, listens to simulated webhook events.
 * In production, would validate signatures and process real webhook payloads.
 */

import { isDemoMode } from './api-config';
import { demoSubscribeToWebhooks, demoGetWebhookEvents } from './demo-simulation';
import type { WebhookEvent, WebhookEventType } from './types';

type EventHandler = (event: WebhookEvent) => void;

interface EventSubscription {
  id: string;
  eventTypes: WebhookEventType[];
  handler: EventHandler;
}

class WebhookHandler {
  private subscriptions: EventSubscription[] = [];
  private unsubscribeDemo: (() => void) | null = null;
  private eventLog: WebhookEvent[] = [];

  constructor() {
    this.initializeListener();
  }

  private initializeListener() {
    if (isDemoMode()) {
      this.unsubscribeDemo = demoSubscribeToWebhooks((event) => {
        this.processEvent(event);
      });
    }
  }

  /**
   * Subscribe to specific webhook event types.
   * Returns an unsubscribe function.
   */
  subscribe(eventTypes: WebhookEventType[], handler: EventHandler): () => void {
    const subscription: EventSubscription = {
      id: `sub_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      eventTypes,
      handler,
    };

    this.subscriptions.push(subscription);

    return () => {
      const idx = this.subscriptions.findIndex((s) => s.id === subscription.id);
      if (idx >= 0) this.subscriptions.splice(idx, 1);
    };
  }

  /**
   * Subscribe to all events.
   */
  subscribeAll(handler: EventHandler): () => void {
    return this.subscribe(
      [
        'payment.completed',
        'payment.failed',
        'payment.pending',
        'payid.created',
        'payid.deregistered',
        'payid.payment_received',
        'payment_request.paid',
        'payment_request.expired',
        'direct_credit.settled',
        'direct_debit.settled',
        'direct_debit.dishonoured',
      ],
      handler
    );
  }

  /**
   * Process an incoming webhook event.
   * In production, this would be called from an API endpoint.
   */
  processEvent(event: WebhookEvent): void {
    this.eventLog.push(event);

    // Notify matching subscribers
    for (const sub of this.subscriptions) {
      if (sub.eventTypes.includes(event.type)) {
        try {
          sub.handler(event);
        } catch (err) {
          console.error(`Webhook handler error for ${event.type}:`, err);
        }
      }
    }
  }

  /**
   * Process a raw webhook payload from a provider.
   * Validates the payload and converts it to a WebhookEvent.
   */
  processRawWebhook(
    provider: 'monoova' | 'zai' | 'payvantage',
    payload: Record<string, unknown>,
    signature?: string
  ): { acknowledged: boolean; error?: string } {
    try {
      // In production, validate signature here
      if (!this.validateSignature(provider, payload, signature)) {
        return { acknowledged: false, error: 'Invalid signature' };
      }

      const event = this.normalizePayload(provider, payload);
      if (event) {
        this.processEvent(event);
      }

      return { acknowledged: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Webhook processing failed';
      return { acknowledged: false, error: message };
    }
  }

  /**
   * Get all logged webhook events.
   */
  getEventLog(): WebhookEvent[] {
    if (isDemoMode()) {
      return demoGetWebhookEvents();
    }
    return [...this.eventLog];
  }

  /**
   * Get events of a specific type.
   */
  getEventsByType(type: WebhookEventType): WebhookEvent[] {
    return this.eventLog.filter((e) => e.type === type);
  }

  /**
   * Cleanup subscriptions.
   */
  destroy() {
    this.subscriptions = [];
    if (this.unsubscribeDemo) {
      this.unsubscribeDemo();
      this.unsubscribeDemo = null;
    }
  }

  // ─── Private Helpers ──────────────────────────────────────────────────────

  private validateSignature(
    _provider: string,
    _payload: Record<string, unknown>,
    _signature?: string
  ): boolean {
    // In production: validate HMAC signature against provider's signing secret
    // For now, always return true in demo/sandbox mode
    return true;
  }

  private normalizePayload(
    provider: string,
    payload: Record<string, unknown>
  ): WebhookEvent | null {
    const type = this.mapEventType(provider, payload);
    if (!type) return null;

    return {
      id: `wh_${provider}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      type,
      timestamp: new Date().toISOString(),
      data: payload,
      processed: false,
    };
  }

  private mapEventType(
    provider: string,
    payload: Record<string, unknown>
  ): WebhookEventType | null {
    const eventType = (payload.event ?? payload.type ?? payload.event_type ?? '') as string;

    // Map provider-specific event names to our unified types
    const mappings: Record<string, Record<string, WebhookEventType>> = {
      monoova: {
        'payment.success': 'payment.completed',
        'payment.failed': 'payment.failed',
        'payment.pending': 'payment.pending',
        'payid.registered': 'payid.created',
        'payid.deregistered': 'payid.deregistered',
        'payid.payment_received': 'payid.payment_received',
      },
      zai: {
        'items.completed': 'payment.completed',
        'items.failed': 'payment.failed',
        'items.pending': 'payment.pending',
      },
      payvantage: {
        'payment.completed': 'payment.completed',
        'payment.failed': 'payment.failed',
        'batch.completed': 'direct_credit.settled',
      },
    };

    return mappings[provider]?.[eventType] ?? null;
  }
}

export const webhookHandler = new WebhookHandler();
