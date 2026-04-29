import { z } from "zod";

import { parseJakartaInput } from "@/lib/datetime";

export const announcementInputSchema = z.object({
  title: z.string().trim().min(1, "Judul wajib diisi").max(200),
  body: z.string().trim().min(1, "Isi wajib diisi"),
  publishedAt: z
    .string()
    .optional()
    .transform((v) => parseJakartaInput(v ?? "")),
});

export type AnnouncementInput = z.input<typeof announcementInputSchema>;
export type AnnouncementData = z.output<typeof announcementInputSchema>;
