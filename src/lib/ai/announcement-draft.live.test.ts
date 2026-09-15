import { describe, expect, it, vi } from "vitest";
import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { z } from "zod";

import messages from "../../../messages/id.json";

import { getAnnouncementDraftPrompt } from "./announcement-draft-prompt";

/**
 * The seed of a regression suite for the drafting prompt.
 *
 * It calls the real model, so it costs money and is skipped unless you ask for
 * it explicitly:
 *
 *   RUN_AI_LIVE_TESTS=1 GOOGLE_GENERATIVE_AI_API_KEY=... pnpm test
 *
 * Run it after ANY edit to `announcement-draft-prompt.ts`. A prompt is code
 * whose behaviour no type-checker can verify; this is the only thing standing
 * between a reworded rule and a warta that quietly invents a speaker's name.
 */
const live = process.env.RUN_AI_LIVE_TESTS === "1";

// `getTranslations` is a Next server binding and throws outside a request;
// the catalogue it reads is a plain JSON file, so serve it directly.
vi.mock("next-intl/server", () => ({
  getTranslations: async ({ namespace }: { namespace: string }) => {
    const root = (messages as Record<string, unknown>)[namespace];
    return (key: string) =>
      key
        .split(".")
        .reduce<unknown>(
          (acc, part) => (acc as Record<string, unknown>)?.[part],
          root,
        ) as string;
  },
}));

const schema = z.object({
  title: z.string(),
  body: z.string(),
  whatsapp: z.string(),
  missingDetails: z.array(z.string()),
});

async function draft(kind: "warta" | "undangan" | "singkat", notes: string) {
  const { object } = await generateObject({
    model: google("gemini-3.6-flash"),
    system: await getAnnouncementDraftPrompt("id", kind),
    schema,
    temperature: 0.3,
    maxOutputTokens: 6_000,
    prompt: `Catatan staf:\n\n${notes}`,
  });
  return object;
}

describe.skipIf(!live)("announcement draft (live model)", () => {
  it("leaves a gap visible instead of filling it in", async () => {
    const object = await draft(
      "warta",
      [
        "- minggu depan ibadah kedua pelayan firman pdt budi",
        "- persekutuan doa rabu pindah ke ruang serbaguna",
        "- retret pemuda bulan depan, pendaftaran ke sekretariat, biaya menyusul",
        "- ada seminar pranikah, pembicaranya belum fix",
      ].join("\n"),
    );

    // The unresolved speaker and the unquoted fee must be reported, not filled.
    expect(object.missingDetails.length).toBeGreaterThan(0);
    expect(object.body).toMatch(/\[/);
    // A rupiah figure appearing anywhere is an invention: the notes name none.
    expect(object.body).not.toMatch(/Rp\s?\d/i);
  }, 60_000);

  it("writes WhatsApp in WhatsApp's own formatting, not markdown", async () => {
    const object = await draft(
      "undangan",
      "seminar keluarga sabtu 4 oktober pukul 9 pagi di aula, terbuka untuk pasutri, daftar ke sekretariat",
    );

    expect(object.whatsapp).toContain("Syalom");
    expect(object.whatsapp).not.toMatch(/^#{1,3}\s/m);
    expect(object.whatsapp.length).toBeLessThanOrEqual(1_400);
  }, 60_000);

  it("keeps a short notice short and unheaded", async () => {
    const object = await draft(
      "singkat",
      "ibadah doa rabu ini ditiadakan karena gedung dipakai untuk pernikahan",
    );

    expect(object.body).not.toMatch(/^#{1,3}\s/m);
    expect(object.body.length).toBeLessThan(600);
  }, 60_000);
});
