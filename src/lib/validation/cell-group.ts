import { z } from "zod";

import { optionalEnum } from "@/lib/validation/_enum";

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

export const meetingDayEnum = optionalEnum([
  "MON",
  "TUE",
  "WED",
  "THU",
  "FRI",
  "SAT",
  "SUN",
]);

export const cellGroupInputSchema = z.object({
  name: z.string().min(1, "Wajib").max(120),
  description: empty,
  leaderId: z.string().min(1, "Wajib"),
  parentGroupId: empty,
  meetingDay: meetingDayEnum,
  meetingTime: empty,
  meetingLocation: empty,
  isActive: z.boolean().default(true),
});

export type CellGroupInput = z.input<typeof cellGroupInputSchema>;

export const cellGroupReportInputSchema = z.object({
  meetingDate: requiredDate,
  attendeeCount: z.coerce.number().int().min(0).max(500),
  visitorCount: z.coerce.number().int().min(0).max(500).default(0),
  topic: empty,
  notes: empty,
});

export type CellGroupReportInput = z.input<typeof cellGroupReportInputSchema>;

export const memberRoleEnum = z.enum(["MEMBER", "LEADER", "CO_LEADER"]);
