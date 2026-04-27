/**
 * Format an amount as Indonesian Rupiah without decimals.
 * Accepts Prisma Decimal (anything with toString), string, or number.
 */
export function formatRupiah(
  amount: number | string | { toString: () => string },
  options?: { withSymbol?: boolean },
): string {
  const n =
    typeof amount === "number"
      ? amount
      : Number((amount as { toString: () => string }).toString());
  if (!Number.isFinite(n)) return options?.withSymbol === false ? "0" : "Rp 0";
  const formatter = new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: 0,
  });
  const formatted = formatter.format(n);
  return options?.withSymbol === false ? formatted : `Rp ${formatted}`;
}
