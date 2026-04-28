import { z } from "zod";

const empty = z
  .string()
  .optional()
  .transform((v) => (v == null || v.trim() === "" ? null : v.trim()));

const ageInt = z
  .union([z.number(), z.string()])
  .transform((v) => (typeof v === "number" ? v : Number.parseInt(v, 10)))
  .refine((v) => Number.isFinite(v) && v >= 0 && v <= 18, {
    message: "Usia 0–18",
  });

export const childClassInputSchema = z.object({
  name: z.string().min(1, "Wajib"),
  ageMin: ageInt,
  ageMax: ageInt,
  isActive: z.boolean().optional().transform((v) => v ?? true),
});

export type ChildClassInput = z.input<typeof childClassInputSchema>;

export const checkInInputSchema = z.object({
  childId: z.string().min(1, "Wajib"),
  guardianId: z.string().min(1, "Wajib"),
  classId: z.string().min(1, "Wajib"),
  notes: empty,
});

export type CheckInInput = z.input<typeof checkInInputSchema>;

export const checkOutInputSchema = z.object({
  /** 4-digit security code (case-insensitive). */
  securityCode: z
    .string()
    .min(4, "Kode 4 karakter")
    .max(8)
    .transform((v) => v.toUpperCase().trim()),
  pickupGuardianId: z.string().min(1, "Wajib"),
});

export type CheckOutInput = z.input<typeof checkOutInputSchema>;
