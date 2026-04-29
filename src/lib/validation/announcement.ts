import { z } from "zod";

export const announcementInputSchema = z.object({
  title: z.string().trim().min(1, "Judul wajib diisi").max(200),
  body: z.string().trim().min(1, "Isi wajib diisi"),
  publishedAt: z
    .string()
    .optional()
    .transform((v) => {
      if (v == null || v.trim() === "") return null;
      const d = new Date(v);
      return Number.isNaN(d.getTime()) ? null : d;
    }),
});

export type AnnouncementInput = z.input<typeof announcementInputSchema>;
export type AnnouncementData = z.output<typeof announcementInputSchema>;
