/**
 * Indian GSTIN (Goods and Services Tax Identification Number).
 * Format: 15 chars — SS + PAN(10) + entity + Z + checksum
 * Example: 29ABCDE1234F1ZW
 */

const GSTIN_CHARSET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";

/** Structural pattern before checksum (state + PAN + entity + Z + check). */
export const GSTIN_PATTERN =
  /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;

export function normalizeGstin(raw: string): string {
  return raw
    .toUpperCase()
    .replace(/[^0-9A-Z]/g, "")
    .slice(0, 15);
}

function gstinCharCode(ch: string): number {
  const idx = GSTIN_CHARSET.indexOf(ch);
  return idx;
}

/** Official GSTIN checksum for the 15th character. */
export function gstinChecksumChar(first14: string): string | null {
  if (first14.length !== 14) return null;
  let sum = 0;
  for (let i = 0; i < 14; i++) {
    const code = gstinCharCode(first14[i] ?? "");
    if (code < 0) return null;
    const product = code * (i % 2 === 0 ? 1 : 2);
    sum += Math.floor(product / 36) + (product % 36);
  }
  const check = (36 - (sum % 36)) % 36;
  return GSTIN_CHARSET[check] ?? null;
}

export function isValidGstin(raw: string): boolean {
  const gstin = normalizeGstin(raw);
  if (gstin.length !== 15) return false;
  if (!GSTIN_PATTERN.test(gstin)) return false;
  const expected = gstinChecksumChar(gstin.slice(0, 14));
  return expected !== null && expected === gstin[14];
}

/** Empty is allowed (optional field). Non-empty must be a valid GSTIN. */
export function gstinFieldError(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const gstin = normalizeGstin(trimmed);
  if (gstin.length < 15) {
    return "GSTIN must be exactly 15 characters (e.g. 29ABCDE1234F1ZW)";
  }
  if (!GSTIN_PATTERN.test(gstin)) {
    return "Enter a valid GSTIN: 2-digit state + 10-char PAN + entity + Z + check";
  }
  if (!isValidGstin(gstin)) {
    return "GSTIN checksum is invalid — check the last character";
  }
  return null;
}
