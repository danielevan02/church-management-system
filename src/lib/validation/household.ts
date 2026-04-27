import { z } from "zod";

const empty = z
  .string()
  .optional()
  .transform((v) => (v == null || v.trim() === "" ? null : v.trim()));

export const householdInputSchema = z.object({
  name: z.string().min(1, "Wajib").max(120),
  address: empty,
});

export const HOUSEHOLD_ROLES = ["HEAD", "SPOUSE", "CHILD", "OTHER"] as const;
export type HouseholdRole = (typeof HOUSEHOLD_ROLES)[number];

export const assignMemberSchema = z.object({
  memberId: z.string().min(1),
  householdRole: z.enum(HOUSEHOLD_ROLES).nullable().optional(),
});

export type HouseholdInput = z.infer<typeof householdInputSchema>;
export type AssignMemberInput = z.infer<typeof assignMemberSchema>;
