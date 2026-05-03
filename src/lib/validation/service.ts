import { z } from "zod";

import { parseJakartaInput } from "@/lib/datetime";

/**
 * Datetime field from a form. The form sends a wall-clock string like
 * "2026-05-03T15:00" — we treat that as Jakarta time and store as UTC.
 * Using raw `new Date(v)` here would interpret the string in the server's
 * local timezone (UTC on Vercel), shifting every saved time by 7 hours.
 */
const requiredDateTime = z
  .union([z.string(), z.date()])
  .transform((v) => {
    if (v instanceof Date) return v;
    return parseJakartaInput(v);
  })
  .refine((v): v is Date => v instanceof Date, { message: "Tanggal tidak valid" });

/**
 * Date-only field from a form (e.g. `<input type="date">` emits "yyyy-MM-dd").
 * `new Date("yyyy-MM-dd")` is spec'd to parse as UTC midnight regardless of
 * server timezone, which is what we want — callers read the calendar date
 * via UTC accessors. Do NOT use parseJakartaInput here: it treats date-only
 * input as Jakarta midnight, which is the previous day in UTC and shifts
 * the picked date by one.
 */
const requiredDateOnly = z
  .union([z.string(), z.date()])
  .transform((v) => {
    if (v instanceof Date) return v;
    const d = new Date(v);
    return Number.isNaN(d.getTime()) ? null : d;
  })
  .refine((v): v is Date => v instanceof Date, { message: "Tanggal tidak valid" });

const empty = z
  .string()
  .optional()
  .transform((v) => (v == null || v.trim() === "" ? null : v.trim()));

export const serviceTypeEnum = z.enum([
  "SUNDAY_MORNING",
  "SUNDAY_EVENING",
  "MIDWEEK",
  "YOUTH",
  "CHILDREN",
  "SPECIAL",
  "OTHER",
]);

export const serviceInputSchema = z.object({
  name: z.string().min(1, "Wajib").max(120),
  type: serviceTypeEnum,
  startsAt: requiredDateTime,
  durationMin: z.coerce
    .number()
    .int()
    .min(5, "Minimal 5 menit")
    .max(600, "Maksimal 600 menit")
    .default(90),
  location: empty,
  notes: empty,
  isActive: z.boolean().default(true),
});

export type ServiceInput = z.input<typeof serviceInputSchema>;
export type ServiceData = z.output<typeof serviceInputSchema>;

export const recurringServiceSchema = z.object({
  name: z.string().min(1, "Wajib").max(120),
  type: serviceTypeEnum,
  /** Date of the FIRST occurrence; subsequent are computed from it. */
  firstDate: requiredDateOnly,
  /** Time of day in HH:mm (24-hour). */
  time: z
    .string()
    .regex(/^\d{2}:\d{2}$/, "Format jam: HH:MM")
    .default("09:00"),
  /** How many occurrences to generate (inclusive). */
  count: z.coerce.number().int().min(1).max(52),
  /** Step in days between occurrences. 7 = weekly. */
  intervalDays: z.coerce.number().int().min(1).max(60).default(7),
  durationMin: z.coerce.number().int().min(5).max(600).default(90),
  location: empty,
  notes: empty,
});

export type RecurringServiceInput = z.input<typeof recurringServiceSchema>;
export type RecurringServiceData = z.output<typeof recurringServiceSchema>;
