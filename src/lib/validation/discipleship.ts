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

export const milestoneTypeEnum = z.enum([
  "DECISION_TO_FOLLOW",
  "BAPTISM",
  "MEMBERSHIP",
  "FOUNDATIONS_CLASS",
  "DISCIPLESHIP_CLASS",
  "LEADERSHIP_TRAINING",
  "CELL_GROUP_LEADER",
  "MISSION_TRIP",
  "OTHER",
]);

export type MilestoneType = z.infer<typeof milestoneTypeEnum>;

export const milestoneInputSchema = z.object({
  memberId: z.string().min(1, "Wajib"),
  type: milestoneTypeEnum,
  achievedAt: requiredDate,
  notes: empty,
});

export type MilestoneInput = z.input<typeof milestoneInputSchema>;
