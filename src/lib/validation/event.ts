import { z } from "zod";

import { normalizePhone } from "@/lib/whatsapp";

const empty = z
  .string()
  .optional()
  .transform((v) => (v == null || v.trim() === "" ? null : v.trim()));

const requiredDateTime = z
  .union([z.string(), z.date()])
  .transform((v) => {
    if (v instanceof Date) return v;
    const d = new Date(v);
    return Number.isNaN(d.getTime()) ? null : d;
  })
  .refine((v): v is Date => v instanceof Date, { message: "Tanggal tidak valid" });

const optionalAmount = z
  .union([z.string(), z.number(), z.null()])
  .optional()
  .transform((v) => {
    if (v == null || v === "") return null;
    const cleaned =
      typeof v === "number"
        ? v.toString()
        : v.replace(/[^\d.,-]/g, "").replace(/,/g, "");
    const n = Number(cleaned);
    return Number.isFinite(n) && n >= 0 ? cleaned : null;
  });

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

export const eventInputSchema = z
  .object({
    title: z.string().min(1, "Wajib").max(200),
    description: empty,
    startsAt: requiredDateTime,
    endsAt: requiredDateTime,
    location: empty,
    capacity: z.coerce.number().int().min(0).max(100000).nullable().optional()
      .transform((v) => (v == null || v === 0 ? null : v)),
    registrationOpen: z.boolean().default(true),
    requiresRsvp: z.boolean().default(true),
    fee: optionalAmount,
    isPublished: z.boolean().default(false),
    coverImageUrl: empty,
  })
  .refine((v) => v.endsAt >= v.startsAt, {
    message: "Waktu selesai harus setelah mulai",
    path: ["endsAt"],
  });

export type EventInput = z.input<typeof eventInputSchema>;

export const rsvpStatusEnum = z.enum(["GOING", "MAYBE", "NOT_GOING", "WAITLIST"]);

export const memberRsvpInputSchema = z.object({
  status: rsvpStatusEnum.default("GOING"),
  notes: empty,
});

export type MemberRsvpInput = z.input<typeof memberRsvpInputSchema>;

export const guestRsvpInputSchema = z.object({
  guestName: z.string().min(1, "Nama wajib").max(120),
  guestPhone: optionalPhone,
  guestCount: z.coerce.number().int().min(1).max(50).default(1),
  status: rsvpStatusEnum.default("GOING"),
  notes: empty,
});

export type GuestRsvpInput = z.input<typeof guestRsvpInputSchema>;
