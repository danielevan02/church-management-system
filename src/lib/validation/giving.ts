import { z } from "zod";

import { normalizePhone } from "@/lib/phone";

const empty = z
  .string()
  .optional()
  .transform((v) => (v == null || v.trim() === "" ? null : v.trim()));

const optionalEmail = z
  .string()
  .optional()
  .transform((v) => {
    if (v == null || v.trim() === "") return null;
    return v.trim();
  })
  .refine(
    (v) => v == null || z.email().safeParse(v).success,
    { message: "Email tidak valid" },
  );

const optionalPhone = z
  .string()
  .optional()
  .transform((v) => {
    if (v == null || v.trim() === "") return null;
    return normalizePhone(v);
  })
  .refine(
    (v) => v == null || /^\+[1-9]\d{6,14}$/.test(v),
    { message: "Nomor telepon tidak valid" },
  );

const requiredDate = z
  .union([z.string(), z.date()])
  .transform((v) => {
    if (v instanceof Date) return v;
    const d = new Date(v);
    return Number.isNaN(d.getTime()) ? null : d;
  })
  .refine((v): v is Date => v instanceof Date, { message: "Tanggal tidak valid" });

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

export const givingMethodEnum = z.enum([
  "QRIS",
  "BANK_TRANSFER",
  "EWALLET",
  "CASH",
  "CARD",
  "OTHER",
]);

export const givingStatusEnum = z.enum([
  "PENDING",
  "COMPLETED",
  "FAILED",
  "REFUNDED",
]);

export const givingInputSchema = z
  .object({
    fundId: z.string().min(1, "Wajib"),
    memberId: empty,
    giverName: empty,
    giverPhone: optionalPhone,
    giverEmail: optionalEmail,
    amount,
    method: givingMethodEnum,
    status: givingStatusEnum.default("COMPLETED"),
    receivedAt: requiredDate,
    externalRef: empty,
    notes: empty,
  })
  .refine(
    (v) => v.memberId != null || v.giverName != null,
    {
      message: "Pilih jemaat atau isi nama pemberi",
      path: ["memberId"],
    },
  );

export type GivingInput = z.input<typeof givingInputSchema>;
