import { z } from "zod";

const empty = z
  .string()
  .nullish()
  .transform((v) => (v == null || v.trim() === "" ? null : v.trim()));

const requiredDate = z
  .union([z.string(), z.date()])
  .transform((v) => {
    if (v instanceof Date) return v;
    const d = new Date(v);
    return Number.isNaN(d.getTime()) ? null : d;
  })
  .refine((v): v is Date => v instanceof Date, { message: "Tanggal tidak valid" });

const optionalDate = z
  .union([z.string(), z.date(), z.null()])
  .optional()
  .transform((v) => {
    if (v == null || v === "") return null;
    if (v instanceof Date) return v;
    const d = new Date(v);
    return Number.isNaN(d.getTime()) ? null : d;
  });

export const visitTypeEnum = z.enum([
  "HOSPITAL",
  "HOME",
  "OFFICE",
  "PHONE",
  "OTHER",
]);

export type VisitTypeInput = z.infer<typeof visitTypeEnum>;

export const pastoralVisitInputSchema = z.object({
  memberId: z.string().min(1, "Wajib"),
  visitType: visitTypeEnum,
  visitedAt: requiredDate,
  notes: z.string().min(1, "Wajib"),
  followUp: empty,
  followUpDate: optionalDate,
});

export type PastoralVisitInput = z.input<typeof pastoralVisitInputSchema>;
