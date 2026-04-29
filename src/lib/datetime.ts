import { formatInTimeZone, fromZonedTime } from "date-fns-tz";

import type { Locale } from "date-fns";

/** App-wide timezone. Indonesia uses WIB (UTC+7), no DST. */
export const TZ = "Asia/Jakarta";

/**
 * Format a Date in Jakarta time using a date-fns format pattern.
 * Use this anywhere you'd otherwise call `format(date, ...)` with a pattern
 * that includes a time component. Pure date displays (yyyy-MM-dd) can stay
 * with `format()` since the day-boundary still aligns near enough for
 * Jakarta-only deployments.
 */
export function formatJakarta(
  date: Date,
  fmt: string,
  locale?: Locale,
): string {
  return formatInTimeZone(date, TZ, fmt, locale ? { locale } : undefined);
}

/**
 * Parse a "yyyy-MM-dd'T'HH:mm" string from a datetime-local input, treating
 * the wall-clock value as Jakarta time, and return the corresponding UTC
 * Date for storage.
 */
export function parseJakartaInput(value: string): Date | null {
  if (!value || value.trim() === "") return null;
  const trimmed = value.trim();
  // Accept "yyyy-MM-dd'T'HH:mm" or with seconds — normalize to ISO without zone.
  const isoLocal = trimmed.length === 16 ? `${trimmed}:00` : trimmed;
  const utc = fromZonedTime(isoLocal, TZ);
  return Number.isNaN(utc.getTime()) ? null : utc;
}

/**
 * Format a UTC Date to the "yyyy-MM-dd'T'HH:mm" string expected by
 * datetime-local inputs, in Jakarta time. Inverse of parseJakartaInput.
 */
export function toJakartaInput(date: Date): string {
  return formatInTimeZone(date, TZ, "yyyy-MM-dd'T'HH:mm");
}

/**
 * Format a UTC Date to "yyyy-MM-dd" in Jakarta time, for date inputs.
 */
export function toJakartaDateInput(date: Date): string {
  return formatInTimeZone(date, TZ, "yyyy-MM-dd");
}
