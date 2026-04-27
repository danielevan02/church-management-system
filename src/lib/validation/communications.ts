import { z } from "zod";

const empty = z
  .string()
  .optional()
  .transform((v) => (v == null || v.trim() === "" ? null : v.trim()));

export const messageChannelEnum = z.enum(["WHATSAPP", "EMAIL", "SMS", "PUSH"]);

export const templateInputSchema = z.object({
  name: z.string().min(1, "Wajib").max(120),
  channel: messageChannelEnum,
  subject: empty,
  body: z.string().min(1, "Body wajib").max(4000),
  isActive: z.boolean().default(true),
});

export type TemplateInput = z.input<typeof templateInputSchema>;

export const audienceSchema = z.object({
  kind: z.enum(["ALL", "FILTER"]).default("ALL"),
  status: z
    .enum(["ACTIVE", "VISITOR", "INACTIVE", "TRANSFERRED", "DECEASED"])
    .nullable()
    .optional()
    .transform((v) => v ?? null),
  gender: z
    .enum(["MALE", "FEMALE"])
    .nullable()
    .optional()
    .transform((v) => v ?? null),
  cellGroupId: empty,
  householdId: empty,
});

export type AudienceFilter = z.output<typeof audienceSchema>;

export const campaignInputSchema = z.object({
  name: z.string().min(1, "Wajib").max(120),
  channel: messageChannelEnum,
  subject: empty,
  body: z.string().min(1, "Pesan wajib").max(4000),
  audience: audienceSchema,
});

export type CampaignInput = z.input<typeof campaignInputSchema>;
