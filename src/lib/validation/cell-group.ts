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

const optionalDateTime = z
  .union([z.string(), z.date(), z.null()])
  .optional()
  .transform((v) => {
    if (v == null || v === "") return null;
    if (v instanceof Date) return v;
    const d = new Date(v);
    return Number.isNaN(d.getTime()) ? null : d;
  });

export const cellGroupInputSchema = z.object({
  name: z.string().min(1, "Wajib").max(120),
  description: empty,
  leaderId: z.string().min(1, "Wajib"),
  parentGroupId: empty,
  nextMeetingAt: optionalDateTime,
  nextMeetingLocation: empty,
  nextMeetingNotes: empty,
  isActive: z.boolean().default(true),
});

export type CellGroupInput = z.input<typeof cellGroupInputSchema>;

export const nextMeetingInputSchema = z.object({
  nextMeetingAt: optionalDateTime,
  nextMeetingLocation: empty,
  nextMeetingNotes: empty,
});

export type NextMeetingInput = z.input<typeof nextMeetingInputSchema>;

export const cellGroupReportInputSchema = z.object({
  meetingDate: requiredDate,
  attendeeCount: z.coerce.number().int().min(0).max(500),
  visitorCount: z.coerce.number().int().min(0).max(500).default(0),
  topic: empty,
  notes: empty,
});

export type CellGroupReportInput = z.input<typeof cellGroupReportInputSchema>;

export const memberRoleEnum = z.enum(["MEMBER", "LEADER", "CO_LEADER"]);
