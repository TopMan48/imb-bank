/**
 * Mock PayID registry for Australian Osko/PayID lookups.
 * In production this would call the NPP (New Payments Platform) API.
 */

export type PayIdType = 'email' | 'mobile' | 'abn' | 'organisation-id';

export interface PayIdRecord {
  payId: string;
  type: PayIdType;
  registeredName: string;
  financialInstitution: string;
}

// Mock registry of registered PayIDs
const REGISTRY: PayIdRecord[] = [
  { payId: 'sarah.johnson@gmail.com', type: 'email', registeredName: 'Sarah Johnson', financialInstitution: 'CommBank' },
  { payId: 'tom.williams@outlook.com', type: 'email', registeredName: 'Tom Williams', financialInstitution: 'Westpac' },
  { payId: 'billing@spotify.com.au', type: 'email', registeredName: 'Spotify Australia Pty Ltd', financialInstitution: 'NAB' },
  { payId: 'payments@nrma.com.au', type: 'email', registeredName: 'NRMA Insurance', financialInstitution: 'ANZ' },
  { payId: 'mum@imb.com.au', type: 'email', registeredName: 'Margaret Johnson', financialInstitution: 'IMB Bank' },
  { payId: '0412345678', type: 'mobile', registeredName: 'Sarah Johnson', financialInstitution: 'CommBank' },
  { payId: '0423456789', type: 'mobile', registeredName: 'Tom Williams', financialInstitution: 'Westpac' },
  { payId: '0281234567', type: 'mobile', registeredName: 'Gold\'s Gym Wollongong', financialInstitution: 'NAB' },
  { payId: '51824753556', type: 'abn', registeredName: 'Woolworths Group Ltd', financialInstitution: 'CommBank' },
  { payId: '43004028077', type: 'abn', registeredName: 'Telstra Corporation Ltd', financialInstitution: 'NAB' },
  { payId: 'ORG001234', type: 'organisation-id', registeredName: 'Wollongong City Council', financialInstitution: 'Westpac' },
  { payId: 'ORG005678', type: 'organisation-id', registeredName: 'NSW Health', financialInstitution: 'Commonwealth' },
];

/** Normalise a PayID string for comparison */
function normalise(s: string): string {
  return s.toLowerCase().replace(/\s+/g, '').replace(/-/g, '');
}

/** Look up a PayID. Returns the record or null if not found. */
export async function lookupPayId(payId: string): Promise<PayIdRecord | null> {
  // Simulate network latency
  await new Promise((r) => setTimeout(r, 800));
  const norm = normalise(payId);
  return REGISTRY.find((r) => normalise(r.payId) === norm) ?? null;
}

/** Format mobile number to standard Australian format */
export function formatMobile(mobile: string): string {
  const digits = mobile.replace(/\D/g, '');
  if (digits.startsWith('61') && digits.length === 11) {
    return '0' + digits.slice(2);
  }
  return digits;
}

/** Validate ABN (11 digits) */
export function isValidABN(abn: string): boolean {
  const digits = abn.replace(/\s+/g, '');
  return /^\d{11}$/.test(digits);
}

/** Validate Australian mobile number */
export function isValidMobile(mobile: string): boolean {
  const digits = mobile.replace(/\D/g, '');
  return /^(04|61[^0])\d{8,9}$/.test(digits) || /^04\d{8}$/.test(digits);
}

/** Get a human-readable label for a PayID type */
export function getPayIdTypeLabel(type: PayIdType): string {
  switch (type) {
    case 'email': return 'Email';
    case 'mobile': return 'Mobile Number';
    case 'abn': return 'ABN';
    case 'organisation-id': return 'Organisation ID';
  }
}
