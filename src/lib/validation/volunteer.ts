import { z } from "zod";

const empty = z
  .string()
  .optional()
  .transform((v) => (v == null || v.trim() === "" ? null : v.trim()));

const requiredDate = z
  .union([z.string(), z.date()])
  .transform((v) => {
    if (v instanceof Date) return v;
    const d = new Date(v);
    return Number.isNaN(d.getTime()) ? null : d;
  })
  .refine((v): v is Date => v instanceof Date, { message: "Tanggal tidak valid" });

export const teamInputSchema = z.object({
  name: z.string().min(1, "Wajib").max(120),
  description: empty,
  isActive: z.boolean().default(true),
});

export type TeamInput = z.input<typeof teamInputSchema>;

export const positionInputSchema = z.object({
  name: z.string().min(1, "Wajib").max(120),
  isActive: z.boolean().default(true),
});

export type PositionInput = z.input<typeof positionInputSchema>;

export const assignmentStatusEnum = z.enum([
  "PENDING",
  "CONFIRMED",
  "DECLINED",
  "COMPLETED",
]);

export const assignmentInputSchema = z.object({
  teamId: z.string().min(1),
  positionId: empty,
  memberId: z.string().min(1),
  serviceDate: requiredDate,
  status: assignmentStatusEnum.default("PENDING"),
  notes: empty,
});

export type AssignmentInput = z.input<typeof assignmentInputSchema>;
