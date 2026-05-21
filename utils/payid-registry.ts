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

// Pre-registered PayIDs in the mock NPP registry.
// The app user (Alex Johnson) is registered here so lookups for their own PayIDs succeed.
const REGISTRY: PayIdRecord[] = [
  // App user — auto-registered on account setup
  { payId: 'alex.johnson@email.com', type: 'email', registeredName: 'Alex Johnson', financialInstitution: 'IMB Bank' },
  { payId: '0401234567', type: 'mobile', registeredName: 'Alex Johnson', financialInstitution: 'IMB Bank' },
  // Other registered users
  { payId: 'sarah.johnson@gmail.com', type: 'email', registeredName: 'Sarah Johnson', financialInstitution: 'CommBank' },
  { payId: 'tom.williams@outlook.com', type: 'email', registeredName: 'Tom Williams', financialInstitution: 'Westpac' },
  { payId: 'billing@spotify.com.au', type: 'email', registeredName: 'Spotify Australia Pty Ltd', financialInstitution: 'NAB' },
  { payId: 'payments@nrma.com.au', type: 'email', registeredName: 'NRMA Insurance', financialInstitution: 'ANZ' },
  { payId: 'mum@imb.com.au', type: 'email', registeredName: 'Margaret Johnson', financialInstitution: 'IMB Bank' },
  { payId: '0412345678', type: 'mobile', registeredName: 'Sarah Johnson', financialInstitution: 'CommBank' },
  { payId: '0423456789', type: 'mobile', registeredName: 'Tom Williams', financialInstitution: 'Westpac' },
  { payId: '0281234567', type: 'mobile', registeredName: "Gold's Gym Wollongong", financialInstitution: 'NAB' },
  { payId: '51824753556', type: 'abn', registeredName: 'Woolworths Group Ltd', financialInstitution: 'CommBank' },
  { payId: '43004028077', type: 'abn', registeredName: 'Telstra Corporation Ltd', financialInstitution: 'NAB' },
  { payId: 'ORG001234', type: 'organisation-id', registeredName: 'Wollongong City Council', financialInstitution: 'Westpac' },
  { payId: 'ORG005678', type: 'organisation-id', registeredName: 'NSW Health', financialInstitution: 'Commonwealth' },
];

/**
 * Normalise a PayID string for case-insensitive comparison.
 * Strips whitespace, hyphens, and lowercases so that:
 *   "0412 345 678" === "0412345678"
 *   "Sarah.Johnson@Gmail.COM" === "sarah.johnson@gmail.com"
 */
function normalise(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, '').replace(/-/g, '');
}

/**
 * Look up a PayID against the registry.
 *
 * @param payId         The PayID string entered by the user.
 * @param extraEntries  Optional additional records to check (e.g. the current user's
 *                      own registered PayIDs from their profile). Checked AFTER the
 *                      static registry so static entries take priority for deduplication.
 */
export async function lookupPayId(
  payId: string,
  extraEntries: PayIdRecord[] = []
): Promise<PayIdRecord | null> {
  // Simulate NPP network latency
  await new Promise((r) => setTimeout(r, 800));
  const norm = normalise(payId);
  // Search static registry first, then any caller-supplied dynamic entries
  const allEntries = [...REGISTRY, ...extraEntries];
  return allEntries.find((r) => normalise(r.payId) === norm) ?? null;
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
