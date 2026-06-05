/**
 * Comprehensive Australian BSB (Bank-State-Branch) prefix lookup database.
 * BSB format: XXX-XXX (6 digits, dash-separated after first 3).
 * Lookup is based on the first 3 digits of the BSB number.
 */

export interface BsbBankInfo {
  name: string;       // Full bank name
  shortCode: string;  // Short code/abbreviation for icon display
  color: string;      // Brand color (hex)
}

// Maps 3-digit BSB prefix → bank info
const BSB_PREFIX_MAP: Record<string, BsbBankInfo> = {
  // ── ANZ ─────────────────────────────────────────────────────────────────────
  '010': { name: 'ANZ', shortCode: 'ANZ', color: '#007DBA' },
  '011': { name: 'ANZ', shortCode: 'ANZ', color: '#007DBA' },
  '012': { name: 'ANZ', shortCode: 'ANZ', color: '#007DBA' },
  '013': { name: 'ANZ', shortCode: 'ANZ', color: '#007DBA' },
  '014': { name: 'ANZ', shortCode: 'ANZ', color: '#007DBA' },
  '015': { name: 'ANZ', shortCode: 'ANZ', color: '#007DBA' },
  '016': { name: 'ANZ', shortCode: 'ANZ', color: '#007DBA' },
  '017': { name: 'ANZ', shortCode: 'ANZ', color: '#007DBA' },
  '018': { name: 'ANZ', shortCode: 'ANZ', color: '#007DBA' },
  '019': { name: 'ANZ', shortCode: 'ANZ', color: '#007DBA' },

  // ── Westpac ──────────────────────────────────────────────────────────────────
  '030': { name: 'Westpac', shortCode: 'WBC', color: '#D5002B' },
  '031': { name: 'Westpac', shortCode: 'WBC', color: '#D5002B' },
  '032': { name: 'Westpac', shortCode: 'WBC', color: '#D5002B' },
  '033': { name: 'Westpac', shortCode: 'WBC', color: '#D5002B' },
  '034': { name: 'Westpac', shortCode: 'WBC', color: '#D5002B' },
  '035': { name: 'Westpac', shortCode: 'WBC', color: '#D5002B' },
  '036': { name: 'Westpac', shortCode: 'WBC', color: '#D5002B' },
  '037': { name: 'Westpac', shortCode: 'WBC', color: '#D5002B' },
  '038': { name: 'Westpac', shortCode: 'WBC', color: '#D5002B' },
  '039': { name: 'Westpac', shortCode: 'WBC', color: '#D5002B' },
  // Westpac regional (73x series)
  '730': { name: 'Westpac', shortCode: 'WBC', color: '#D5002B' },
  '731': { name: 'Westpac', shortCode: 'WBC', color: '#D5002B' },
  '732': { name: 'Westpac', shortCode: 'WBC', color: '#D5002B' },
  '733': { name: 'Westpac', shortCode: 'WBC', color: '#D5002B' },
  '734': { name: 'Westpac', shortCode: 'WBC', color: '#D5002B' },
  '735': { name: 'Westpac', shortCode: 'WBC', color: '#D5002B' },
  '736': { name: 'Westpac', shortCode: 'WBC', color: '#D5002B' },
  '737': { name: 'Westpac', shortCode: 'WBC', color: '#D5002B' },
  '738': { name: 'Westpac', shortCode: 'WBC', color: '#D5002B' },
  '739': { name: 'Westpac', shortCode: 'WBC', color: '#D5002B' },

  // ── Commonwealth Bank (CBA) ──────────────────────────────────────────────────
  '060': { name: 'Commonwealth Bank', shortCode: 'CBA', color: '#FFCC00' },
  '061': { name: 'Commonwealth Bank', shortCode: 'CBA', color: '#FFCC00' },
  '062': { name: 'Commonwealth Bank', shortCode: 'CBA', color: '#FFCC00' },
  '063': { name: 'Commonwealth Bank', shortCode: 'CBA', color: '#FFCC00' },
  '064': { name: 'Commonwealth Bank', shortCode: 'CBA', color: '#FFCC00' },
  '065': { name: 'Commonwealth Bank', shortCode: 'CBA', color: '#FFCC00' },
  '066': { name: 'Commonwealth Bank', shortCode: 'CBA', color: '#FFCC00' },
  '067': { name: 'Commonwealth Bank', shortCode: 'CBA', color: '#FFCC00' },
  '068': { name: 'Commonwealth Bank', shortCode: 'CBA', color: '#FFCC00' },
  '069': { name: 'Commonwealth Bank', shortCode: 'CBA', color: '#FFCC00' },
  // CBA regional (76x series)
  '760': { name: 'Commonwealth Bank', shortCode: 'CBA', color: '#FFCC00' },
  '761': { name: 'Commonwealth Bank', shortCode: 'CBA', color: '#FFCC00' },
  '762': { name: 'Commonwealth Bank', shortCode: 'CBA', color: '#FFCC00' },
  '763': { name: 'Commonwealth Bank', shortCode: 'CBA', color: '#FFCC00' },
  '764': { name: 'Commonwealth Bank', shortCode: 'CBA', color: '#FFCC00' },
  '765': { name: 'Commonwealth Bank', shortCode: 'CBA', color: '#FFCC00' },
  '766': { name: 'Commonwealth Bank', shortCode: 'CBA', color: '#FFCC00' },
  '767': { name: 'Commonwealth Bank', shortCode: 'CBA', color: '#FFCC00' },
  '768': { name: 'Commonwealth Bank', shortCode: 'CBA', color: '#FFCC00' },
  '769': { name: 'Commonwealth Bank', shortCode: 'CBA', color: '#FFCC00' },

  // ── NAB ─────────────────────────────────────────────────────────────────────
  '080': { name: 'NAB', shortCode: 'NAB', color: '#E21836' },
  '081': { name: 'NAB', shortCode: 'NAB', color: '#E21836' },
  '082': { name: 'NAB', shortCode: 'NAB', color: '#E21836' },
  '083': { name: 'NAB', shortCode: 'NAB', color: '#E21836' },
  '084': { name: 'NAB', shortCode: 'NAB', color: '#E21836' },
  '085': { name: 'NAB', shortCode: 'NAB', color: '#E21836' },
  '086': { name: 'NAB', shortCode: 'NAB', color: '#E21836' },
  '087': { name: 'NAB', shortCode: 'NAB', color: '#E21836' },
  '088': { name: 'NAB', shortCode: 'NAB', color: '#E21836' },
  '089': { name: 'NAB', shortCode: 'NAB', color: '#E21836' },

  // ── Ubank / 86 400 ──────────────────────────────────────────────────────────
  '100': { name: 'Ubank (86 400)', shortCode: 'UBK', color: '#00B274' },

  // ── BankSA ──────────────────────────────────────────────────────────────────
  '105': { name: 'BankSA', shortCode: 'BSA', color: '#ED1B24' },
  '106': { name: 'BankSA', shortCode: 'BSA', color: '#ED1B24' },
  '107': { name: 'BankSA', shortCode: 'BSA', color: '#ED1B24' },
  '108': { name: 'BankSA', shortCode: 'BSA', color: '#ED1B24' },
  '109': { name: 'BankSA', shortCode: 'BSA', color: '#ED1B24' },

  // ── St.George Bank ──────────────────────────────────────────────────────────
  '112': { name: 'St.George Bank', shortCode: 'STG', color: '#007B5E' },
  '113': { name: 'St.George Bank', shortCode: 'STG', color: '#007B5E' },
  '114': { name: 'St.George Bank', shortCode: 'STG', color: '#007B5E' },
  '115': { name: 'St.George Bank', shortCode: 'STG', color: '#007B5E' },
  '116': { name: 'St.George Bank', shortCode: 'STG', color: '#007B5E' },
  '117': { name: 'St.George Bank', shortCode: 'STG', color: '#007B5E' },
  '118': { name: 'St.George Bank', shortCode: 'STG', color: '#007B5E' },
  '119': { name: 'St.George Bank', shortCode: 'STG', color: '#007B5E' },

  // ── Bank of Queensland (BOQ) ─────────────────────────────────────────────────
  '124': { name: 'Bank of Queensland', shortCode: 'BOQ', color: '#E31837' },
  '125': { name: 'Bank of Queensland', shortCode: 'BOQ', color: '#E31837' },
  '126': { name: 'Bank of Queensland', shortCode: 'BOQ', color: '#E31837' },

  // ── Macquarie Bank ──────────────────────────────────────────────────────────
  '182': { name: 'Macquarie Bank', shortCode: 'MQG', color: '#002D62' },
  '183': { name: 'Macquarie Bank', shortCode: 'MQG', color: '#002D62' },
  '184': { name: 'Macquarie Bank', shortCode: 'MQG', color: '#002D62' },

  // ── Tyro Payments ───────────────────────────────────────────────────────────
  '185': { name: 'Tyro Payments', shortCode: 'TYR', color: '#00A3E0' },

  // ── Bank of Melbourne ────────────────────────────────────────────────────────
  '190': { name: 'Bank of Melbourne', shortCode: 'BOM', color: '#004B93' },
  '191': { name: 'Bank of Melbourne', shortCode: 'BOM', color: '#004B93' },
  '192': { name: 'Bank of Melbourne', shortCode: 'BOM', color: '#004B93' },
  '193': { name: 'Bank of Melbourne', shortCode: 'BOM', color: '#004B93' },
  '194': { name: 'Bank of Melbourne', shortCode: 'BOM', color: '#004B93' },
  '195': { name: 'Bank of Melbourne', shortCode: 'BOM', color: '#004B93' },
  '196': { name: 'Bank of Melbourne', shortCode: 'BOM', color: '#004B93' },

  // ── Citibank Australia ──────────────────────────────────────────────────────
  '242': { name: 'Citibank Australia', shortCode: 'CIT', color: '#003B70' },
  '243': { name: 'Citibank Australia', shortCode: 'CIT', color: '#003B70' },

  // ── BankWest ─────────────────────────────────────────────────────────────────
  '302': { name: 'BankWest', shortCode: 'BWA', color: '#007BC4' },
  '303': { name: 'BankWest', shortCode: 'BWA', color: '#007BC4' },
  '306': { name: 'BankWest', shortCode: 'BWA', color: '#007BC4' },
  '309': { name: 'BankWest', shortCode: 'BWA', color: '#007BC4' },

  // ── Bank Australia ──────────────────────────────────────────────────────────
  '313': { name: 'Bank Australia', shortCode: 'BAU', color: '#008A61' },
  '315': { name: 'Bank Australia', shortCode: 'BAU', color: '#008A61' },

  // ── Rabobank ─────────────────────────────────────────────────────────────────
  '325': { name: 'Rabobank', shortCode: 'RAB', color: '#FF6600' },

  // ── HSBC Australia ──────────────────────────────────────────────────────────
  '342': { name: 'HSBC Australia', shortCode: 'HSB', color: '#DB0011' },

  // ── Suncorp ──────────────────────────────────────────────────────────────────
  '484': { name: 'Suncorp Bank', shortCode: 'SUN', color: '#006EA7' },
  '486': { name: 'Suncorp Bank', shortCode: 'SUN', color: '#006EA7' },

  // ── Bendigo Bank / Up Bank ───────────────────────────────────────────────────
  '633': { name: 'Bendigo Bank', shortCode: 'BEN', color: '#FF3300' },
  '634': { name: 'Bendigo Bank', shortCode: 'BEN', color: '#FF3300' },
  '635': { name: 'Bendigo Bank', shortCode: 'BEN', color: '#FF3300' },
  '804': { name: 'Bendigo Bank', shortCode: 'BEN', color: '#FF3300' },
  '809': { name: 'Bendigo Bank', shortCode: 'BEN', color: '#FF3300' },

  // ── Greater Bank ─────────────────────────────────────────────────────────────
  '637': { name: 'Greater Bank', shortCode: 'GRT', color: '#0066B3' },

  // ── Heritage Bank ────────────────────────────────────────────────────────────
  '638': { name: 'Heritage Bank', shortCode: 'HBS', color: '#005BAC' },

  // ── IMB Bank ──────────────────────────────────────────────────────────────────
  '640': { name: 'IMB Bank', shortCode: 'IMB', color: '#004B5A' },
  '641': { name: 'IMB Bank', shortCode: 'IMB', color: '#004B5A' },
  '642': { name: 'IMB Bank', shortCode: 'IMB', color: '#004B5A' },

  // ── Teachers Mutual Bank ─────────────────────────────────────────────────────
  '649': { name: 'Teachers Mutual Bank', shortCode: 'TMB', color: '#0066CC' },

  // ── Newcastle Permanent ──────────────────────────────────────────────────────
  '650': { name: 'Newcastle Permanent', shortCode: 'NPB', color: '#003B7C' },
  '651': { name: 'Newcastle Permanent', shortCode: 'NPB', color: '#003B7C' },

  // ── Police Bank ──────────────────────────────────────────────────────────────
  '815': { name: 'Police Bank', shortCode: 'POL', color: '#003087' },

  // ── Revolut Australia ────────────────────────────────────────────────────────
  '802': { name: 'Revolut Australia', shortCode: 'REV', color: '#191C1F' },

  // ── Great Southern Bank (CUA) ────────────────────────────────────────────────
  '814': { name: 'Great Southern Bank', shortCode: 'GSB', color: '#005587' },

  // ── ING ───────────────────────────────────────────────────────────────────────
  '923': { name: 'ING', shortCode: 'ING', color: '#FF6200' },

  // ── AMP Bank ──────────────────────────────────────────────────────────────────
  '939': { name: 'AMP Bank', shortCode: 'AMP', color: '#003087' },

  // ── ME Bank ──────────────────────────────────────────────────────────────────
  '950': { name: 'ME Bank', shortCode: 'ME', color: '#00A8E1' },

  // ── P&N Bank ─────────────────────────────────────────────────────────────────
  '090': { name: 'P&N Bank', shortCode: 'PNB', color: '#0070C0' },

  // ── Volt Bank ────────────────────────────────────────────────────────────────
  '801': { name: 'Volt Bank', shortCode: 'VLT', color: '#6C35DE' },

  // ── Australian Military Bank ──────────────────────────────────────────────────
  '817': { name: 'Australian Military Bank', shortCode: 'AMB', color: '#003B5C' },

  // ── myState Bank ─────────────────────────────────────────────────────────────
  '807': { name: 'myState Bank', shortCode: 'MSB', color: '#00518A' },
};

/**
 * Look up bank information from a BSB number (formatted or raw).
 * Returns null if the BSB prefix is not recognised.
 */
export function lookupBsb(bsb: string): BsbBankInfo | null {
  const digits = bsb.replace(/\D/g, '');
  if (digits.length < 3) return null;
  const prefix = digits.slice(0, 3);
  return BSB_PREFIX_MAP[prefix] ?? null;
}

/**
 * Returns true if the BSB (after stripping non-digits) is exactly 6 digits.
 */
export function isValidBsbFormat(bsb: string): boolean {
  return /^\d{6}$/.test(bsb.replace(/\D/g, ''));
}

/**
 * Auto-format a BSB string as the user types.
 * - Raw digits only, stripped of any non-digit characters
 * - Inserts a dash after the 3rd digit automatically
 * - Handles backspace correctly (stripping the dash)
 */
export function formatBsb(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 6);
  if (digits.length > 3) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return digits;
}
