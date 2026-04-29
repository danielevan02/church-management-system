const E164_RE = /^\+[1-9]\d{6,14}$/;

/**
 * Normalize an Indonesian phone number to E.164 format.
 * Accepts inputs like "0812...", "62812...", "812...", "+62812..." and
 * returns "+62812...".
 */
export function normalizePhone(input: string): string {
  const trimmed = input.trim().replace(/\s|-/g, "");
  if (E164_RE.test(trimmed)) return trimmed;
  if (trimmed.startsWith("0")) return `+62${trimmed.slice(1)}`;
  if (/^62\d+$/.test(trimmed)) return `+${trimmed}`;
  if (/^8\d+$/.test(trimmed)) return `+62${trimmed}`;
  return trimmed.startsWith("+") ? trimmed : `+${trimmed}`;
}
