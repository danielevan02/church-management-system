import { z } from "zod";

import { parseJakartaInput } from "@/lib/datetime";

export const devotionalInputSchema = z.object({
  title: z.string().trim().min(1, "Judul wajib diisi").max(200),
  verseRef: z.string().trim().max(200).optional().or(z.literal("")),
  verseText: z.string().trim().max(2000).optional().or(z.literal("")),
  body: z.string().trim().min(1, "Isi renungan wajib diisi"),
  authorName: z.string().trim().max(120).optional().or(z.literal("")),
  publishedAt: z
    .string()
    .optional()
    .transform((v) => parseJakartaInput(v ?? "")),
});

export type DevotionalInput = z.input<typeof devotionalInputSchema>;
export type DevotionalData = z.output<typeof devotionalInputSchema>;
