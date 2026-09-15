"use server";

import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { z } from "zod";

import { features } from "@/config/features";
import {
  DRAFT_KINDS,
  getAnnouncementDraftPrompt,
} from "@/lib/ai/announcement-draft-prompt";
import { checkStaffDraftLimit } from "@/lib/ai/rate-limit";
import { auth } from "@/lib/auth";
import { routing } from "@/lib/i18n/routing";
import { requireRole } from "@/lib/permissions";

/**
 * A cap on what one staff member can put in front of the model in a single
 * call. Long enough for a whole week's worth of scribbled warta points, short
 * enough that a pasted sermon transcript is refused with a clear message
 * rather than silently costing ten times as much.
 */
const MAX_NOTES_CHARS = 6_000;

/** The DB column behind this is `title String` with a 200-char Zod guard. */
const MAX_TITLE_CHARS = 200;
const MAX_WHATSAPP_CHARS = 1_400;

const inputSchema = z.object({
  notes: z.string().trim().min(15).max(MAX_NOTES_CHARS),
  kind: z.enum(DRAFT_KINDS),
  locale: z.enum(routing.locales).optional(),
});

export type DraftAnnouncementInput = z.input<typeof inputSchema>;

/**
 * What the model must return. The descriptions are the contract the model
 * actually reads — the rules in the system prompt explain *why*, these say
 * *what*.
 */
const draftSchema = z.object({
  title: z.string().describe("Judul pengumuman, maksimal 80 karakter."),
  body: z
    .string()
    .describe("Isi pengumuman untuk inbox portal jemaat, markdown sederhana."),
  whatsapp: z
    .string()
    .describe("Versi siap tempel ke grup WhatsApp, format WhatsApp."),
  missingDetails: z
    .array(z.string())
    .describe(
      "Detail yang ditinggalkan sebagai placeholder karena tidak ada di catatan staf.",
    ),
});

export type AnnouncementDraft = z.infer<typeof draftSchema>;

export type DraftAnnouncementResult =
  | { ok: true; data: AnnouncementDraft }
  | { ok: false; error: string; retryAfter?: number };

function clamp(value: string, max: number): string {
  const trimmed = value.trim();
  return trimmed.length > max ? `${trimmed.slice(0, max - 1).trimEnd()}…` : trimmed;
}

/**
 * Turn a staff member's rough notes into a publishable announcement draft.
 *
 * This action WRITES NOTHING. It hands a draft back to the form, where a human
 * reads it, edits it, and presses the existing publish button — so every
 * guarantee of `createAnnouncementAction` (validation, RBAC, push fan-out)
 * still holds, and a model that misunderstands the notes costs an edit rather
 * than a wrong message in every member's inbox.
 */
export async function draftAnnouncementAction(
  input: DraftAnnouncementInput,
): Promise<DraftAnnouncementResult> {
  if (!features.aiStaffCopilot) return { ok: false, error: "FEATURE_DISABLED" };

  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "UNAUTHORIZED" };
  try {
    requireRole(session.user.role, ["ADMIN", "STAFF"]);
  } catch {
    return { ok: false, error: "FORBIDDEN" };
  }

  const apiKey =
    process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("[draftAnnouncement] missing GOOGLE_GENERATIVE_AI_API_KEY");
    return { ok: false, error: "ASSISTANT_UNCONFIGURED" };
  }

  const parsed = inputSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "VALIDATION_FAILED" };
  const { notes, kind } = parsed.data;

  const limit = checkStaffDraftLimit(session.user.id);
  if (!limit.ok) {
    return { ok: false, error: "RATE_LIMITED", retryAfter: limit.retryAfter };
  }

  try {
    const locale = parsed.data.locale ?? routing.defaultLocale;
    const { object } = await generateObject({
      model: google("gemini-3.6-flash"),
      system: await getAnnouncementDraftPrompt(locale, kind),
      schema: draftSchema,
      // Low, on purpose. This is a rewriting job with a hard "invent nothing"
      // rule; creative sampling is exactly the failure mode to avoid.
      temperature: 0.3,
      // Generous, and measured rather than guessed: at 2k a four-item warta
      // ran out mid-`whatsapp` and `generateObject` threw on the truncated
      // JSON — a hard failure with no partial result to show the staff member.
      // Three fields of prose plus the model's own reasoning need the room.
      maxOutputTokens: 6_000,
      prompt: `Catatan staf:\n\n${notes}`,
    });

    return {
      ok: true,
      data: {
        title: clamp(object.title, MAX_TITLE_CHARS),
        body: object.body.trim(),
        whatsapp: clamp(object.whatsapp, MAX_WHATSAPP_CHARS),
        // The model is asked for short phrases; anything longer is a sign it
        // started writing prose into the wrong field, so it is dropped.
        missingDetails: object.missingDetails
          .map((d) => d.trim())
          .filter((d) => d.length > 0 && d.length <= 120)
          .slice(0, 8),
      },
    };
  } catch (e) {
    console.error("[draftAnnouncement]", e);
    return { ok: false, error: "INTERNAL_ERROR" };
  }
}
