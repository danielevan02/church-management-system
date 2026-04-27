import { z } from "zod";

const empty = z
  .string()
  .optional()
  .transform((v) => (v == null || v.trim() === "" ? null : v.trim()));

export const fundCategoryEnum = z.enum([
  "GENERAL",
  "TITHE",
  "MISSIONS",
  "BUILDING",
  "CHARITY",
  "THANKSGIVING",
  "OTHER",
]);

export const fundInputSchema = z.object({
  name: z.string().min(1, "Wajib").max(120),
  category: fundCategoryEnum.default("GENERAL"),
  description: empty,
  isActive: z.boolean().default(true),
});

export type FundInput = z.input<typeof fundInputSchema>;
