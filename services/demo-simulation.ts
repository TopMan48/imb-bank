/**
 * Demo simulation layer for payment APIs.
 * Used when API keys are not configured (demo mode).
 * Provides realistic responses with appropriate delays to simulate real API behavior.
 */

import type {
  PayIdResolutionResult,
  PayIdRegistrationResult,
  PayIdRegistration,
  PayIdType,
  PaymentRequest,
  PaymentRequestStatus,
  CreatePaymentRequest,
  NppPayment,
  NppPaymentRequest,
  NppPaymentStatus,
  DirectCredit,
  DirectDebit,
  AccountVerificationResult,
  WebhookEvent,
  WebhookEventType,
  ZaiUser,
  ZaiTransaction,
  ZaiVirtualAccount,
  PayVantagePayment,
  PayVantageBatchPayment,
  PayVantageReconciliation,
} from './types';

// ─── Simulated Delay ──────────────────────────────────────────────────────────

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function randomDelay(minMs = 400, maxMs = 1200): Promise<void> {
  return delay(minMs + Math.random() * (maxMs - minMs));
}

function generateId(prefix = 'sim'): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function generateReference(): string {
  return `IMB${Date.now().toString().slice(-8)}${Math.random().toString(36).slice(2, 5).toUpperCase()}`;
}

// ─── PayID Demo Registry ──────────────────────────────────────────────────────

interface DemoPayIdEntry {
  payId: string;
  type: PayIdType;
  registeredName: string;
  financialInstitution: string;
}

const DEMO_PAYID_REGISTRY: DemoPayIdEntry[] = [
  { payId: 'sarah.johnson@gmail.com', type: 'email', registeredName: 'Sarah Johnson', financialInstitution: 'CommBank' },
  { payId: 'tom.williams@outlook.com', type: 'email', registeredName: 'Tom Williams', financialInstitution: 'Westpac' },
  { payId: 'billing@spotify.com.au', type: 'email', registeredName: 'Spotify Australia Pty Ltd', financialInstitution: 'NAB' },
  { payId: 'payments@nrma.com.au', type: 'email', registeredName: 'NRMA Insurance', financialInstitution: 'ANZ' },
  { payId: 'mum@imb.com.au', type: 'email', registeredName: 'Margaret Johnson', financialInstitution: 'IMB Bank' },
  { payId: 'jenny.chen@email.com', type: 'email', registeredName: 'Jenny Chen', financialInstitution: 'St George' },
  { payId: 'mike.patel@business.com', type: 'email', registeredName: 'Patel Engineering Pty Ltd', financialInstitution: 'ANZ' },
  { payId: 'info@wavesurfschool.com.au', type: 'email', registeredName: 'Wave Surf School', financialInstitution: 'Bendigo Bank' },
  { payId: '0412345678', type: 'mobile', registeredName: 'Sarah Johnson', financialInstitution: 'CommBank' },
  { payId: '0423456789', type: 'mobile', registeredName: 'Tom Williams', financialInstitution: 'Westpac' },
  { payId: '0411223344', type: 'mobile', registeredName: 'David Kim', financialInstitution: 'ING' },
  { payId: '0455667788', type: 'mobile', registeredName: 'Rachel Brown', financialInstitution: 'Macquarie' },
  { payId: '0281234567', type: 'mobile', registeredName: "Gold's Gym Wollongong", financialInstitution: 'NAB' },
  { payId: '51824753556', type: 'abn', registeredName: 'Woolworths Group Ltd', financialInstitution: 'CommBank' },
  { payId: '43004028077', type: 'abn', registeredName: 'Telstra Corporation Ltd', financialInstitution: 'NAB' },
  { payId: '80608166988', type: 'abn', registeredName: 'Coles Group Ltd', financialInstitution: 'Westpac' },
  { payId: '33007457141', type: 'abn', registeredName: 'Qantas Airways Ltd', financialInstitution: 'ANZ' },
  { payId: 'ORG001234', type: 'organisation-id', registeredName: 'Wollongong City Council', financialInstitution: 'Westpac' },
  { payId: 'ORG005678', type: 'organisation-id', registeredName: 'NSW Health', financialInstitution: 'Commonwealth' },
  { payId: 'ORG009012', type: 'organisation-id', registeredName: 'Service NSW', financialInstitution: 'NAB' },
];

// ─── BSB Registry for verification ───────────────────────────────────────────

const BSB_REGISTRY: Record<string, { institution: string; branch: string }> = {
  '062': { institution: 'Commonwealth Bank', branch: 'Sydney' },
  '032': { institution: 'Westpac', branch: 'Sydney' },
  '012': { institution: 'ANZ', branch: 'Melbourne' },
  '082': { institution: 'NAB', branch: 'Sydney' },
  '641': { institution: 'IMB Bank', branch: 'Wollongong' },
  '112': { institution: 'St George', branch: 'Sydney' },
  '923': { institution: 'ING', branch: 'Sydney' },
  '182': { institution: 'Macquarie', branch: 'Sydney' },
  '633': { institution: 'Bendigo Bank', branch: 'Bendigo' },
};

// In-memory stores for demo state
const registeredPayIds: PayIdRegistrationResult[] = [];
const paymentRequests: PaymentRequest[] = [];
const nppPayments: NppPayment[] = [];
const webhookEvents: WebhookEvent[] = [];

// ─── PayID Resolution ─────────────────────────────────────────────────────────

export async function demoResolvePayId(payId: string): Promise<PayIdResolutionResult | null> {
  await randomDelay(600, 1000);

  const normalized = payId.trim().toLowerCase().replace(/\s+/g, '').replace(/-/g, '');
  const entry = DEMO_PAYID_REGISTRY.find(
    (e) => e.payId.toLowerCase().replace(/\s+/g, '').replace(/-/g, '') === normalized
  );

  if (!entry) return null;

  return {
    payId: entry.payId,
    type: entry.type,
    registeredName: entry.registeredName,
    financialInstitution: entry.financialInstitution,
    accountName: entry.registeredName,
    status: 'active',
    resolvedAt: new Date().toISOString(),
  };
}

// ─── PayID Registration ───────────────────────────────────────────────────────

export async function demoRegisterPayId(
  registration: PayIdRegistration
): Promise<PayIdRegistrationResult> {
  await randomDelay(800, 1500);

  const result: PayIdRegistrationResult = {
    id: generateId('payid'),
    payId: registration.payId,
    type: registration.type,
    status: 'active',
    registeredAt: new Date().toISOString(),
    isReusable: registration.isReusable,
  };

  registeredPayIds.push(result);

  // Add to demo registry
  DEMO_PAYID_REGISTRY.push({
    payId: registration.payId,
    type: registration.type,
    registeredName: registration.accountName,
    financialInstitution: 'IMB Bank',
  });

  emitWebhook('payid.created', { payId: result.payId, type: result.type });

  return result;
}

export function demoGetRegisteredPayIds(): PayIdRegistrationResult[] {
  return [...registeredPayIds];
}

// ─── Payment Requests ─────────────────────────────────────────────────────────

export async function demoCreatePaymentRequest(
  request: CreatePaymentRequest
): Promise<PaymentRequest> {
  await randomDelay(500, 900);

  const expiryMinutes = request.expiryMinutes ?? 60;
  const now = new Date();
  const expires = new Date(now.getTime() + expiryMinutes * 60000);

  const paymentRequest: PaymentRequest = {
    id: generateId('preq'),
    payId: request.payId,
    amount: request.amount,
    description: request.description,
    status: 'pending',
    createdAt: now.toISOString(),
    expiresAt: expires.toISOString(),
    reference: generateReference(),
  };

  paymentRequests.push(paymentRequest);

  // Simulate payment being received after 5-15 seconds in demo mode
  setTimeout(() => {
    const idx = paymentRequests.findIndex((p) => p.id === paymentRequest.id);
    if (idx >= 0 && paymentRequests[idx].status === 'pending') {
      paymentRequests[idx] = {
        ...paymentRequests[idx],
        status: 'paid',
        paidAt: new Date().toISOString(),
        payerName: 'Demo Payer',
      };
      emitWebhook('payment_request.paid', { requestId: paymentRequest.id, amount: request.amount });
    }
  }, 5000 + Math.random() * 10000);

  return paymentRequest;
}

export function demoGetPaymentRequests(): PaymentRequest[] {
  // Check and expire old requests
  const now = new Date();
  return paymentRequests.map((req) => {
    if (req.status === 'pending' && new Date(req.expiresAt) < now) {
      req.status = 'expired';
    }
    return req;
  });
}

export function demoGetPaymentRequest(id: string): PaymentRequest | null {
  return paymentRequests.find((r) => r.id === id) ?? null;
}

// ─── NPP Payments ─────────────────────────────────────────────────────────────

export async function demoSendNppPayment(request: NppPaymentRequest): Promise<NppPayment> {
  await randomDelay(800, 1500);

  const payment: NppPayment = {
    id: generateId('npp'),
    transactionId: `TXN${Date.now().toString().slice(-10)}`,
    amount: request.amount,
    currency: 'AUD',
    fromAccountBsb: request.fromAccountBsb,
    fromAccountNumber: request.fromAccountNumber,
    toPayId: request.toPayId,
    toBsb: request.toBsb,
    toAccountNumber: request.toAccountNumber,
    recipientName: request.recipientName,
    description: request.description,
    reference: generateReference(),
    status: 'processing',
    createdAt: new Date().toISOString(),
  };

  nppPayments.push(payment);

  // Simulate completion after 2-4 seconds
  setTimeout(() => {
    const idx = nppPayments.findIndex((p) => p.id === payment.id);
    if (idx >= 0) {
      nppPayments[idx] = {
        ...nppPayments[idx],
        status: 'completed',
        completedAt: new Date().toISOString(),
      };
      emitWebhook('payment.completed', {
        paymentId: payment.id,
        transactionId: payment.transactionId,
        amount: payment.amount,
      });
    }
  }, 2000 + Math.random() * 2000);

  return payment;
}

export function demoGetNppPaymentStatus(paymentId: string): NppPayment | null {
  return nppPayments.find((p) => p.id === paymentId) ?? null;
}

export function demoGetNppPayments(): NppPayment[] {
  return [...nppPayments];
}

// ─── Direct Credits ───────────────────────────────────────────────────────────

export async function demoSendDirectCredit(params: {
  amount: number;
  toBsb: string;
  toAccountNumber: string;
  toAccountName: string;
  fromAccountName: string;
  reference?: string;
}): Promise<DirectCredit> {
  await randomDelay(600, 1200);

  const credit: DirectCredit = {
    id: generateId('dc'),
    amount: params.amount,
    toBsb: params.toBsb,
    toAccountNumber: params.toAccountNumber,
    toAccountName: params.toAccountName,
    fromAccountName: params.fromAccountName,
    reference: params.reference ?? generateReference(),
    lodgementReference: `LR${Date.now().toString().slice(-8)}`,
    status: 'processing',
    createdAt: new Date().toISOString(),
  };

  // Simulate settlement after delay
  setTimeout(() => {
    credit.status = 'settled';
    credit.settledAt = new Date().toISOString();
    emitWebhook('direct_credit.settled', { creditId: credit.id, amount: credit.amount });
  }, 3000 + Math.random() * 5000);

  return credit;
}

export async function demoSendDirectDebit(params: {
  amount: number;
  fromBsb: string;
  fromAccountNumber: string;
  fromAccountName: string;
  reference?: string;
}): Promise<DirectDebit> {
  await randomDelay(600, 1200);

  const debit: DirectDebit = {
    id: generateId('dd'),
    amount: params.amount,
    fromBsb: params.fromBsb,
    fromAccountNumber: params.fromAccountNumber,
    fromAccountName: params.fromAccountName,
    reference: params.reference ?? generateReference(),
    lodgementReference: `LR${Date.now().toString().slice(-8)}`,
    status: 'processing',
    createdAt: new Date().toISOString(),
  };

  setTimeout(() => {
    debit.status = 'settled';
    debit.settledAt = new Date().toISOString();
    emitWebhook('direct_debit.settled', { debitId: debit.id, amount: debit.amount });
  }, 4000 + Math.random() * 6000);

  return debit;
}

// ─── Account Verification ─────────────────────────────────────────────────────

export async function demoVerifyAccount(
  bsb: string,
  accountNumber: string
): Promise<AccountVerificationResult> {
  await randomDelay(500, 900);

  const bsbPrefix = bsb.replace(/-/g, '').slice(0, 3);
  const bsbInfo = BSB_REGISTRY[bsbPrefix];

  if (!bsbInfo) {
    return {
      bsb,
      accountNumber,
      accountName: '',
      financialInstitution: 'Unknown',
      branchName: 'Unknown',
      isValid: false,
      verifiedAt: new Date().toISOString(),
    };
  }

  // Generate realistic account name
  const names = ['J Smith', 'S Williams', 'M Johnson', 'A Brown', 'K Chen', 'P Patel'];
  const randomName = names[Math.floor(Math.random() * names.length)];

  return {
    bsb,
    accountNumber,
    accountName: randomName,
    financialInstitution: bsbInfo.institution,
    branchName: bsbInfo.branch,
    isValid: true,
    verifiedAt: new Date().toISOString(),
  };
}

// ─── Zai Demo ─────────────────────────────────────────────────────────────────

const demoZaiUsers: ZaiUser[] = [];
const demoZaiTransactions: ZaiTransaction[] = [];
const demoZaiVirtualAccounts: ZaiVirtualAccount[] = [];

export async function demoZaiCreateUser(params: {
  email: string;
  firstName: string;
  lastName: string;
  mobile?: string;
}): Promise<ZaiUser> {
  await randomDelay(600, 1000);

  const user: ZaiUser = {
    id: generateId('zai_user'),
    email: params.email,
    firstName: params.firstName,
    lastName: params.lastName,
    mobile: params.mobile,
    status: 'active',
    kycVerified: false,
    createdAt: new Date().toISOString(),
  };

  demoZaiUsers.push(user);
  return user;
}

export async function demoZaiCreateTransaction(params: {
  amount: number;
  type: 'pay_in' | 'pay_out' | 'transfer';
  fromUserId?: string;
  toUserId?: string;
  description?: string;
}): Promise<ZaiTransaction> {
  await randomDelay(700, 1200);

  const transaction: ZaiTransaction = {
    id: generateId('zai_txn'),
    amount: params.amount,
    currency: 'AUD',
    type: params.type,
    status: 'processing',
    fromUserId: params.fromUserId,
    toUserId: params.toUserId,
    description: params.description,
    reference: generateReference(),
    createdAt: new Date().toISOString(),
  };

  demoZaiTransactions.push(transaction);

  // Simulate completion
  setTimeout(() => {
    const idx = demoZaiTransactions.findIndex((t) => t.id === transaction.id);
    if (idx >= 0) {
      demoZaiTransactions[idx] = {
        ...demoZaiTransactions[idx],
        status: 'completed',
        completedAt: new Date().toISOString(),
      };
    }
  }, 2000 + Math.random() * 3000);

  return transaction;
}

export async function demoZaiGetTransactions(): Promise<ZaiTransaction[]> {
  await randomDelay(300, 600);
  return [...demoZaiTransactions];
}

export async function demoZaiCreateVirtualAccount(userId: string): Promise<ZaiVirtualAccount> {
  await randomDelay(600, 1000);

  const account: ZaiVirtualAccount = {
    id: generateId('zai_va'),
    bsb: '641-800',
    accountNumber: `${Math.floor(10000000 + Math.random() * 89999999)}`,
    accountName: 'IMB Virtual Account',
    balance: 0,
    currency: 'AUD',
    status: 'active',
    userId,
    createdAt: new Date().toISOString(),
  };

  demoZaiVirtualAccounts.push(account);
  return account;
}

export async function demoZaiTriggerKyc(userId: string): Promise<{ status: string; message: string }> {
  await randomDelay(500, 800);
  const idx = demoZaiUsers.findIndex((u) => u.id === userId);
  if (idx >= 0) {
    demoZaiUsers[idx].kycVerified = true;
  }
  return { status: 'verified', message: 'KYC verification completed successfully (demo)' };
}

// ─── PayVantage Demo ──────────────────────────────────────────────────────────

const demoPayVantagePayments: PayVantagePayment[] = [];

export async function demoPayVantageSendPayment(params: {
  amount: number;
  recipientBsb: string;
  recipientAccountNumber: string;
  recipientAccountName: string;
  reference?: string;
}): Promise<PayVantagePayment> {
  await randomDelay(700, 1300);

  const payment: PayVantagePayment = {
    id: generateId('pv'),
    amount: params.amount,
    currency: 'AUD',
    recipientBsb: params.recipientBsb,
    recipientAccountNumber: params.recipientAccountNumber,
    recipientAccountName: params.recipientAccountName,
    reference: params.reference ?? generateReference(),
    status: 'processing',
    createdAt: new Date().toISOString(),
  };

  demoPayVantagePayments.push(payment);

  setTimeout(() => {
    const idx = demoPayVantagePayments.findIndex((p) => p.id === payment.id);
    if (idx >= 0) {
      demoPayVantagePayments[idx] = {
        ...demoPayVantagePayments[idx],
        status: 'completed',
        processedAt: new Date().toISOString(),
      };
    }
  }, 2500 + Math.random() * 3000);

  return payment;
}

export async function demoPayVantageBatchPayment(payments: Array<{
  amount: number;
  recipientBsb: string;
  recipientAccountNumber: string;
  recipientAccountName: string;
}>): Promise<PayVantageBatchPayment> {
  await randomDelay(1000, 2000);

  const batchPayments: PayVantagePayment[] = payments.map((p) => ({
    id: generateId('pv'),
    amount: p.amount,
    currency: 'AUD',
    recipientBsb: p.recipientBsb,
    recipientAccountNumber: p.recipientAccountNumber,
    recipientAccountName: p.recipientAccountName,
    reference: generateReference(),
    status: 'processing' as const,
    createdAt: new Date().toISOString(),
  }));

  const batch: PayVantageBatchPayment = {
    id: generateId('pvb'),
    batchReference: `BATCH_${Date.now().toString().slice(-6)}`,
    totalAmount: payments.reduce((sum, p) => sum + p.amount, 0),
    paymentCount: payments.length,
    status: 'processing',
    payments: batchPayments,
    createdAt: new Date().toISOString(),
  };

  setTimeout(() => {
    batch.status = 'completed';
    batch.completedAt = new Date().toISOString();
    batch.payments = batch.payments.map((p) => ({ ...p, status: 'completed', processedAt: new Date().toISOString() }));
  }, 5000 + Math.random() * 5000);

  return batch;
}

export async function demoPayVantageGetPaymentStatus(paymentId: string): Promise<PayVantagePayment | null> {
  await randomDelay(300, 500);
  return demoPayVantagePayments.find((p) => p.id === paymentId) ?? null;
}

export async function demoPayVantageGetReconciliation(date?: string): Promise<PayVantageReconciliation> {
  await randomDelay(400, 800);

  return {
    id: generateId('pvr'),
    date: date ?? new Date().toISOString().slice(0, 10),
    openingBalance: 15420.50,
    closingBalance: 14890.25,
    totalCredits: 2300.00,
    totalDebits: 2830.25,
    transactionCount: 12,
    status: 'available',
  };
}

export async function demoPayVantageValidateAccount(
  bsb: string,
  accountNumber: string
): Promise<{ isValid: boolean; accountName?: string }> {
  await randomDelay(400, 700);
  const bsbPrefix = bsb.replace(/-/g, '').slice(0, 3);
  const isValid = Object.keys(BSB_REGISTRY).includes(bsbPrefix);
  return {
    isValid,
    accountName: isValid ? 'Account Holder' : undefined,
  };
}

// ─── Webhook Simulation ───────────────────────────────────────────────────────

function emitWebhook(type: WebhookEventType, data: Record<string, unknown>) {
  const event: WebhookEvent = {
    id: generateId('wh'),
    type,
    timestamp: new Date().toISOString(),
    data,
    processed: false,
  };
  webhookEvents.push(event);
  // Notify listeners
  webhookListeners.forEach((listener) => listener(event));
}

type WebhookListener = (event: WebhookEvent) => void;
const webhookListeners: WebhookListener[] = [];

export function demoSubscribeToWebhooks(listener: WebhookListener): () => void {
  webhookListeners.push(listener);
  return () => {
    const idx = webhookListeners.indexOf(listener);
    if (idx >= 0) webhookListeners.splice(idx, 1);
  };
}

export function demoGetWebhookEvents(): WebhookEvent[] {
  return [...webhookEvents];
}

export function demoMarkWebhookProcessed(eventId: string): void {
  const event = webhookEvents.find((e) => e.id === eventId);
  if (event) event.processed = true;
}
