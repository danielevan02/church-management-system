import { z } from "zod";

const optionalString = z
  .string()
  .optional()
  .transform((v) => (v == null || v.trim() === "" ? null : v.trim()));

export const prayerStatusEnum = z.enum([
  "OPEN",
  "PRAYING",
  "ANSWERED",
  "ARCHIVED",
]);

export type PrayerStatusInput = z.infer<typeof prayerStatusEnum>;

export const prayerRequestInputSchema = z.object({
  title: optionalString,
  body: z.string().min(1, "Wajib"),
  isAnonymous: z.boolean().optional().transform((v) => v ?? false),
  isPublic: z.boolean().optional().transform((v) => v ?? false),
});

export type PrayerRequestInput = z.input<typeof prayerRequestInputSchema>;

export const prayerStatusInputSchema = z.object({
  status: prayerStatusEnum,
});

export type PrayerStatusUpdate = z.input<typeof prayerStatusInputSchema>;

// admin/staff version that accepts a full edit (used in admin edit page)
export const prayerRequestAdminInputSchema = prayerRequestInputSchema.extend({
  status: prayerStatusEnum,
});

export type PrayerRequestAdminInput = z.input<typeof prayerRequestAdminInputSchema>;
