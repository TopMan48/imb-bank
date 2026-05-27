/**
 * Shared types for the Australian payment API integration layer.
 */

// ─── PayID Types ──────────────────────────────────────────────────────────────

export type PayIdType = 'email' | 'mobile' | 'abn' | 'organisation-id';

export type PayIdStatus = 'active' | 'deregistered' | 'pending' | 'disabled';

export interface PayIdResolutionResult {
  payId: string;
  type: PayIdType;
  registeredName: string;
  financialInstitution: string;
  accountName?: string;
  status: PayIdStatus;
  resolvedAt: string;
}

export interface PayIdRegistration {
  payId: string;
  type: PayIdType;
  accountBsb: string;
  accountNumber: string;
  accountName: string;
  isReusable: boolean; // static (true) or single-use (false)
}

export interface PayIdRegistrationResult {
  id: string;
  payId: string;
  type: PayIdType;
  status: PayIdStatus;
  registeredAt: string;
  isReusable: boolean;
}

// ─── Payment Request Types ────────────────────────────────────────────────────

export type PaymentRequestStatus = 'pending' | 'paid' | 'expired' | 'cancelled';

export interface PaymentRequest {
  id: string;
  payId: string;
  amount: number;
  description: string;
  status: PaymentRequestStatus;
  createdAt: string;
  expiresAt: string;
  paidAt?: string;
  payerName?: string;
  reference: string;
}

export interface CreatePaymentRequest {
  payId: string;
  amount: number;
  description: string;
  expiryMinutes?: number; // default 60
}

// ─── NPP Payment Types ───────────────────────────────────────────────────────

export type NppPaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'rejected';

export interface NppPayment {
  id: string;
  transactionId: string;
  amount: number;
  currency: string;
  fromAccountBsb: string;
  fromAccountNumber: string;
  toPayId?: string;
  toBsb?: string;
  toAccountNumber?: string;
  recipientName: string;
  description?: string;
  reference: string;
  status: NppPaymentStatus;
  createdAt: string;
  completedAt?: string;
  failureReason?: string;
}

export interface NppPaymentRequest {
  amount: number;
  fromAccountBsb: string;
  fromAccountNumber: string;
  toPayId?: string;
  toBsb?: string;
  toAccountNumber?: string;
  recipientName: string;
  description?: string;
}

// ─── Direct Credit/Debit Types ────────────────────────────────────────────────

export type DirectEntryStatus = 'pending' | 'processing' | 'settled' | 'returned' | 'dishonoured';

export interface DirectCredit {
  id: string;
  amount: number;
  toBsb: string;
  toAccountNumber: string;
  toAccountName: string;
  fromAccountName: string;
  reference: string;
  lodgementReference: string;
  status: DirectEntryStatus;
  createdAt: string;
  settledAt?: string;
}

export interface DirectDebit {
  id: string;
  amount: number;
  fromBsb: string;
  fromAccountNumber: string;
  fromAccountName: string;
  reference: string;
  lodgementReference: string;
  status: DirectEntryStatus;
  createdAt: string;
  settledAt?: string;
}

// ─── Account Verification Types ───────────────────────────────────────────────

export interface AccountVerificationResult {
  bsb: string;
  accountNumber: string;
  accountName: string;
  financialInstitution: string;
  branchName: string;
  isValid: boolean;
  verifiedAt: string;
}

// ─── Webhook Types ────────────────────────────────────────────────────────────

export type WebhookEventType =
  | 'payment.completed'
  | 'payment.failed'
  | 'payment.pending'
  | 'payid.created'
  | 'payid.deregistered'
  | 'payid.payment_received'
  | 'payment_request.paid'
  | 'payment_request.expired'
  | 'direct_credit.settled'
  | 'direct_debit.settled'
  | 'direct_debit.dishonoured';

export interface WebhookEvent {
  id: string;
  type: WebhookEventType;
  timestamp: string;
  data: Record<string, unknown>;
  processed: boolean;
}

// ─── Zai Types ────────────────────────────────────────────────────────────────

export type ZaiUserStatus = 'pending' | 'active' | 'inactive' | 'suspended';
export type ZaiTransactionStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';

export interface ZaiUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  mobile?: string;
  status: ZaiUserStatus;
  kycVerified: boolean;
  createdAt: string;
}

export interface ZaiTransaction {
  id: string;
  amount: number;
  currency: string;
  type: 'pay_in' | 'pay_out' | 'transfer';
  status: ZaiTransactionStatus;
  fromUserId?: string;
  toUserId?: string;
  description?: string;
  reference: string;
  createdAt: string;
  completedAt?: string;
}

export interface ZaiVirtualAccount {
  id: string;
  bsb: string;
  accountNumber: string;
  accountName: string;
  balance: number;
  currency: string;
  status: 'active' | 'closed';
  userId: string;
  createdAt: string;
}

// ─── PayVantage Types ─────────────────────────────────────────────────────────

export type PayVantagePaymentStatus = 'queued' | 'processing' | 'completed' | 'failed' | 'cancelled';

export interface PayVantagePayment {
  id: string;
  amount: number;
  currency: string;
  recipientBsb: string;
  recipientAccountNumber: string;
  recipientAccountName: string;
  reference: string;
  status: PayVantagePaymentStatus;
  createdAt: string;
  processedAt?: string;
}

export interface PayVantageBatchPayment {
  id: string;
  batchReference: string;
  totalAmount: number;
  paymentCount: number;
  status: 'pending' | 'processing' | 'completed' | 'partially_failed';
  payments: PayVantagePayment[];
  createdAt: string;
  completedAt?: string;
}

export interface PayVantageReconciliation {
  id: string;
  date: string;
  openingBalance: number;
  closingBalance: number;
  totalCredits: number;
  totalDebits: number;
  transactionCount: number;
  status: 'available' | 'pending';
}
