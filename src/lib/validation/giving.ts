import { z } from "zod";

const empty = z
  .string()
  .nullish()
  .transform((v) => (v == null || v.trim() === "" ? null : v.trim()));

const optionalServiceId = z
  .string()
  .nullish()
  .transform((v) => (v == null || v.trim() === "" ? null : v.trim()));

/** Stored as Prisma Decimal(14,2). Accept positive numeric string. */
const amount = z
  .union([z.string(), z.number()])
  .transform((v) => {
    if (typeof v === "number") return Number.isFinite(v) ? v.toString() : "0";
    return v.replace(/[^\d.,-]/g, "").replace(/,/g, "");
  })
  .refine(
    (v) => {
      const n = Number(v);
      return !Number.isNaN(n) && n > 0 && n < 1e12;
    },
    { message: "Jumlah tidak valid" },
  );

const requiredDate = z
  .union([z.string(), z.date()])
  .transform((v) => {
    if (v instanceof Date) return v;
    const d = new Date(v);
    return Number.isNaN(d.getTime()) ? null : d;
  })
  .refine((v): v is Date => v instanceof Date, {
    message: "Tanggal tidak valid",
  });

export const givingEntryInputSchema = z.object({
  serviceId: optionalServiceId,
  fundId: z.string().min(1, "Wajib"),
  amount,
  receivedAt: requiredDate,
  notes: empty,
});

export type GivingEntryInput = z.input<typeof givingEntryInputSchema>;
