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

/**
 * Pre-registered PayIDs in the mock NPP registry.
 * The app user (Alex Johnson) is registered here so lookups for their own PayIDs succeed.
 *
 * TO TEST: Use any of the values in the payId column below.
 */
const REGISTRY: PayIdRecord[] = [
  // ── App user (Alex Johnson at IMB Bank) ─────────────────────────────────────
  { payId: 'alex.johnson@email.com', type: 'email', registeredName: 'Alex Johnson', financialInstitution: 'IMB Bank' },
  { payId: '0401234567', type: 'mobile', registeredName: 'Alex Johnson', financialInstitution: 'IMB Bank' },
  { payId: '0412345678', type: 'mobile', registeredName: 'Alex Johnson', financialInstitution: 'IMB Bank' },

  // ── Family & friends ────────────────────────────────────────────────────────
  { payId: 'mum@imb.com.au', type: 'email', registeredName: 'Margaret Johnson', financialInstitution: 'IMB Bank' },
  { payId: '0411111111', type: 'mobile', registeredName: 'Margaret Johnson', financialInstitution: 'IMB Bank' },
  { payId: 'sarah.johnson@gmail.com', type: 'email', registeredName: 'Sarah Johnson', financialInstitution: 'CommBank' },
  { payId: '0411234567', type: 'mobile', registeredName: 'Sarah Johnson', financialInstitution: 'CommBank' },
  { payId: 'tom.williams@outlook.com', type: 'email', registeredName: 'Tom Williams', financialInstitution: 'Westpac' },
  { payId: '0423456789', type: 'mobile', registeredName: 'Tom Williams', financialInstitution: 'Westpac' },
  { payId: 'james.chen@icloud.com', type: 'email', registeredName: 'James Chen', financialInstitution: 'NAB' },
  { payId: '0434567890', type: 'mobile', registeredName: 'James Chen', financialInstitution: 'NAB' },
  { payId: 'emily.nguyen@hotmail.com', type: 'email', registeredName: 'Emily Nguyen', financialInstitution: 'ANZ' },
  { payId: '0445678901', type: 'mobile', registeredName: 'Emily Nguyen', financialInstitution: 'ANZ' },
  { payId: 'michael.brown@me.com', type: 'email', registeredName: 'Michael Brown', financialInstitution: 'Westpac' },
  { payId: '0456789012', type: 'mobile', registeredName: 'Michael Brown', financialInstitution: 'Westpac' },
  { payId: 'jessica.smith@yahoo.com', type: 'email', registeredName: 'Jessica Smith', financialInstitution: 'CommBank' },
  { payId: '0467890123', type: 'mobile', registeredName: 'Jessica Smith', financialInstitution: 'CommBank' },
  { payId: 'david.wilson@gmail.com', type: 'email', registeredName: 'David Wilson', financialInstitution: 'ING' },
  { payId: '0478901234', type: 'mobile', registeredName: 'David Wilson', financialInstitution: 'ING' },

  // ── Common test patterns ─────────────────────────────────────────────────────
  { payId: '0400000000', type: 'mobile', registeredName: 'Test User', financialInstitution: 'CommBank' },
  { payId: '0400123456', type: 'mobile', registeredName: 'Jane Doe', financialInstitution: 'ANZ' },
  { payId: '0400555555', type: 'mobile', registeredName: 'Bob Smith', financialInstitution: 'Westpac' },
  { payId: 'test@test.com', type: 'email', registeredName: 'Test Account', financialInstitution: 'NAB' },
  { payId: 'demo@demo.com', type: 'email', registeredName: 'Demo User', financialInstitution: 'IMB Bank' },
  { payId: 'pay@imb.com.au', type: 'email', registeredName: 'IMB Bank Payments', financialInstitution: 'IMB Bank' },

  // ── Services / merchants ─────────────────────────────────────────────────────
  { payId: 'billing@spotify.com.au', type: 'email', registeredName: 'Spotify Australia Pty Ltd', financialInstitution: 'NAB' },
  { payId: 'payments@nrma.com.au', type: 'email', registeredName: 'NRMA Insurance', financialInstitution: 'ANZ' },
  { payId: 'gym@goldswollongong.com.au', type: 'email', registeredName: "Gold's Gym Wollongong", financialInstitution: 'NAB' },
  { payId: '0281234567', type: 'mobile', registeredName: "Gold's Gym Wollongong", financialInstitution: 'NAB' },
  { payId: 'rentals@realestate.com.au', type: 'email', registeredName: 'REA Group Ltd', financialInstitution: 'CommBank' },
  { payId: 'pay@ausgrid.com.au', type: 'email', registeredName: 'Ausgrid', financialInstitution: 'ANZ' },
  { payId: 'accounts@bodycorp.com.au', type: 'email', registeredName: 'Body Corp Manager', financialInstitution: 'Westpac' },
  { payId: 'info@imb.com.au', type: 'email', registeredName: 'IMB Bank Ltd', financialInstitution: 'IMB Bank' },

  // ── ABN-registered businesses ────────────────────────────────────────────────
  { payId: '51824753556', type: 'abn', registeredName: 'Woolworths Group Ltd', financialInstitution: 'CommBank' },
  { payId: '43004028077', type: 'abn', registeredName: 'Telstra Corporation Ltd', financialInstitution: 'NAB' },
  { payId: '33007457141', type: 'abn', registeredName: 'Wesfarmers Ltd (Bunnings)', financialInstitution: 'ANZ' },
  { payId: '21005557956', type: 'abn', registeredName: 'BHP Group Ltd', financialInstitution: 'ANZ' },
  { payId: '12004044937', type: 'abn', registeredName: 'Coles Group Ltd', financialInstitution: 'CommBank' },
  { payId: '99125035734', type: 'abn', registeredName: 'Officeworks Pty Ltd', financialInstitution: 'NAB' },

  // ── Organisation IDs ─────────────────────────────────────────────────────────
  { payId: 'ORG001234', type: 'organisation-id', registeredName: 'Wollongong City Council', financialInstitution: 'Westpac' },
  { payId: 'ORG005678', type: 'organisation-id', registeredName: 'NSW Health', financialInstitution: 'Commonwealth' },
  { payId: 'ORG009012', type: 'organisation-id', registeredName: 'Australian Taxation Office', financialInstitution: 'Reserve Bank of Australia' },
  { payId: 'ORG003456', type: 'organisation-id', registeredName: 'Transport for NSW', financialInstitution: 'Commonwealth' },
  { payId: 'ORG007890', type: 'organisation-id', registeredName: 'Services Australia (Centrelink)', financialInstitution: 'Reserve Bank of Australia' },
];

// Demo names for smart simulation (used when mobile starts with 04xx)
const DEMO_FIRST_NAMES = ['Emma', 'Liam', 'Olivia', 'Noah', 'Charlotte', 'Jack', 'Mia', 'Oliver', 'Ava', 'William', 'Isabella', 'James', 'Sophia', 'Lucas', 'Chloe'];
const DEMO_LAST_NAMES = ['Smith', 'Jones', 'Williams', 'Taylor', 'Brown', 'Davis', 'Wilson', 'Anderson', 'Thomas', 'Jackson', 'Harris', 'Martin', 'Thompson', 'Garcia', 'Robinson'];
const DEMO_BANKS = ['CommBank', 'Westpac', 'ANZ', 'NAB', 'ING', 'Bendigo Bank', 'Macquarie Bank', 'Suncorp Bank', 'IMB Bank', 'Bank Australia'];

/** Generate a deterministic but realistic-looking name from a mobile number */
function generateDemoName(mobile: string): { name: string; bank: string } {
  const digits = mobile.replace(/\D/g, '');
  // Use last few digits to pick names deterministically
  const seed = parseInt(digits.slice(-4), 10) || 0;
  const firstName = DEMO_FIRST_NAMES[seed % DEMO_FIRST_NAMES.length];
  const lastName = DEMO_LAST_NAMES[Math.floor(seed / 10) % DEMO_LAST_NAMES.length];
  const bank = DEMO_BANKS[Math.floor(seed / 100) % DEMO_BANKS.length];
  return { name: `${firstName} ${lastName}`, bank };
}

/** Generate a demo name from email domain */
function generateDemoNameFromEmail(email: string): { name: string; bank: string } | null {
  const lower = email.toLowerCase();
  // Well-known Australian domains
  if (lower.includes('@imb.')) return { name: 'IMB Bank Customer', bank: 'IMB Bank' };
  if (lower.includes('@anz.')) return { name: 'ANZ Customer', bank: 'ANZ' };
  if (lower.includes('@commbank.') || lower.includes('@cba.')) return { name: 'CBA Customer', bank: 'CommBank' };
  if (lower.includes('@westpac.')) return { name: 'Westpac Customer', bank: 'Westpac' };
  if (lower.includes('@nab.')) return { name: 'NAB Customer', bank: 'NAB' };
  // Extract name from email local part
  const [local] = email.split('@');
  const parts = local.split(/[._-]/).filter((p) => p.length > 1 && !/^\d+$/.test(p));
  if (parts.length >= 2) {
    const firstName = parts[0].charAt(0).toUpperCase() + parts[0].slice(1).toLowerCase();
    const lastName = parts[1].charAt(0).toUpperCase() + parts[1].slice(1).toLowerCase();
    const seed = email.charCodeAt(0) + email.charCodeAt(email.length - 1);
    const bank = DEMO_BANKS[seed % DEMO_BANKS.length];
    return { name: `${firstName} ${lastName}`, bank };
  }
  return null;
}

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
 * For demo mode, mobile numbers starting with 04 and emails with name patterns
 * return realistic simulated results instead of "not found".
 *
 * @param payId         The PayID string entered by the user (any format).
 * @param extraEntries  Optional additional records to check (e.g. the current user's
 *                      own registered PayIDs from their profile). Checked AFTER the
 *                      static registry so static entries take priority for deduplication.
 */
export async function lookupPayId(
  payId: string,
  extraEntries: PayIdRecord[] = []
): Promise<PayIdRecord | null> {
  // Simulate NPP network latency (400–800ms)
  await new Promise((r) => setTimeout(r, 400 + Math.random() * 400));
  const norm = normalise(payId);
  // Search static registry first, then any caller-supplied dynamic entries
  const allEntries = [...REGISTRY, ...extraEntries];
  const found = allEntries.find((r) => normalise(r.payId) === norm);
  if (found) return found;

  // Smart demo simulation for Australian mobile numbers (04xx or +614xx)
  const mobileDigits = norm.replace(/\+/g, '').replace(/\D/g, '');
  if (/^04\d{8}$/.test(mobileDigits) || /^614\d{8}$/.test(mobileDigits)) {
    const { name, bank } = generateDemoName(mobileDigits);
    return {
      payId: payId.trim(),
      type: 'mobile',
      registeredName: name,
      financialInstitution: bank,
    };
  }

  // Smart demo simulation for email addresses
  if (isValidEmail(payId.trim())) {
    const demo = generateDemoNameFromEmail(payId.trim());
    if (demo) {
      return {
        payId: payId.trim(),
        type: 'email',
        registeredName: demo.name,
        financialInstitution: demo.bank,
      };
    }
  }

  return null;
}

/**
 * Synchronous registry check (no latency simulation). Used for form validation.
 */
export function lookupPayIdSync(
  payId: string,
  extraEntries: PayIdRecord[] = []
): PayIdRecord | null {
  const norm = normalise(payId);
  const allEntries = [...REGISTRY, ...extraEntries];
  return allEntries.find((r) => normalise(r.payId) === norm) ?? null;
}

/** Format mobile number to standard Australian 04XX XXX XXX format */
export function formatMobile(mobile: string): string {
  const digits = mobile.replace(/\D/g, '');
  if (digits.startsWith('61') && digits.length === 11) {
    return '0' + digits.slice(2);
  }
  return digits;
}

/**
 * Validate ABN using the official Australian ABN algorithm.
 * - Must be exactly 11 digits
 * - Weighted checksum must equal 0 mod 89
 */
export function isValidABN(abn: string): boolean {
  const digits = abn.replace(/\s+/g, '');
  if (!/^\d{11}$/.test(digits)) return false;
  const weights = [10, 1, 3, 5, 7, 9, 11, 13, 15, 17, 19];
  const d = digits.split('').map(Number);
  d[0] -= 1; // subtract 1 from first digit per ABN algorithm
  const sum = d.reduce((acc, val, idx) => acc + val * weights[idx], 0);
  return sum % 89 === 0;
}

/** Validate Australian mobile number (04XX, 05XX, or +61 variants) */
export function isValidMobile(mobile: string): boolean {
  // Strip + prefix before extracting digits
  const cleaned = mobile.replace(/^\+/, '');
  const digits = cleaned.replace(/\D/g, '');
  // Accept 04xxxxxxxx (10 digits) or 614xxxxxxxx (11 digits with country code)
  return /^04\d{8}$/.test(digits) || /^614\d{8}$/.test(digits);
}

/** Validate email address format */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

/** Detect PayID type from the value entered */
export function detectPayIdType(value: string): PayIdType | null {
  const v = value.trim();
  if (!v) return null;
  if (isValidEmail(v)) return 'email';
  if (isValidMobile(v.replace(/\s/g, ''))) return 'mobile';
  if (/^\d{11}$/.test(v.replace(/\s/g, ''))) return 'abn';
  if (/^ORG\d+$/i.test(v)) return 'organisation-id';
  return null;
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
