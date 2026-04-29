import { z } from "zod";

import { normalizePhone } from "@/lib/phone";

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

export const memberCheckInSchema = z.object({
  serviceId: z.string().min(1),
  memberId: z.string().min(1),
  source: z.enum(["qr_usher", "manual_usher", "self"]).default("manual_usher"),
});

export const visitorCheckInSchema = z.object({
  serviceId: z.string().min(1),
  visitorName: z.string().min(1, "Nama wajib").max(120),
  visitorPhone: optionalPhone,
});

export const qrCheckInSchema = z.object({
  serviceId: z.string().min(1),
  token: z.string().min(8),
});

export type MemberCheckInInput = z.input<typeof memberCheckInSchema>;
export type VisitorCheckInInput = z.input<typeof visitorCheckInSchema>;
export type QrCheckInInput = z.input<typeof qrCheckInSchema>;
