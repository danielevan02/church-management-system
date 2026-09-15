import "server-only";

import { tool } from "ai";
import { z } from "zod";

import { SERVICE_SLOTS, fullSchedule } from "@/config/campus";
import { church } from "@/config/church";
import { formatJakarta } from "@/lib/datetime";
import { excerpt } from "@/lib/markdown";
import { listPublicDevotionals } from "@/server/queries/devotionals";

import type { getTranslations } from "next-intl/server";

type Translator = Awaited<ReturnType<typeof getTranslations>>;

/**
 * What the public assistant is allowed to read.
 *
 * The static brief in `church-assistant-prompt.ts` covers what never changes —
 * the address, the weekly rhythm, the giving details. These two tools cover
 * what a prompt cannot know: today's date, and content the church has actually
 * published since the deployment went out.
 *
 * DELIBERATELY ABSENT: announcements and events. `Announcement` has no public
 * flag at all — it is the members' in-app inbox — and `Event.isPublished`
 * governs the member portal rather than the anonymous web. Exposing either
 * through an unauthenticated endpoint is a decision for the church, not a
 * default. Devotionals are safe because the landing page already publishes
 * them to the open internet through the same query used here.
 */
export function buildAssistantTools(t: Translator) {
  return {
    jadwalIbadahBerikutnya: tool({
      description:
        "Kapan ibadah berikutnya berlangsung, dihitung dari waktu saat ini. " +
        "Gunakan untuk pertanyaan seperti 'ibadah berikutnya kapan', 'minggu ini jam berapa', " +
        "'apakah hari ini ada ibadah', atau pertanyaan apa pun yang bergantung pada tanggal hari ini.",
      inputSchema: z.object({}),
      execute: async () => {
        const now = new Date();
        return {
          sekarang: formatJakarta(now, "EEEE, d MMMM yyyy HH:mm") + " WIB",
          ibadah: fullSchedule(now)
            .slice()
            .sort((a, b) => a.startsAtIso.localeCompare(b.startsAtIso))
            .map((next) => {
              const slot = SERVICE_SLOTS.find((s) => s.key === next.slotKey);
              const startsAt = new Date(next.startsAtIso);
              return {
                nama: t(`schedule.services.${next.slotKey}.name`),
                ruang: t(`schedule.services.${next.slotKey}.room`),
                untuk: t(`schedule.services.${next.slotKey}.audience`),
                mulai:
                  formatJakarta(startsAt, "EEEE, d MMMM yyyy HH:mm") + " WIB",
                durasiMenit: slot?.durationMin ?? null,
              };
            }),
        };
      },
    }),

    renunganTerbaru: tool({
      description:
        "Renungan harian terbaru yang sudah diterbitkan gereja. Gunakan bila " +
        "pengunjung menanyakan renungan, saat teduh, bacaan firman hari ini, " +
        "atau meminta penguatan rohani.",
      inputSchema: z.object({
        jumlah: z
          .number()
          .int()
          .min(1)
          .max(5)
          .default(3)
          .describe("Berapa renungan terbaru yang diambil."),
      }),
      execute: async ({ jumlah }) => {
        const items = await listPublicDevotionals(jumlah);
        if (items.length === 0) {
          return { renungan: [], catatan: "Belum ada renungan yang terbit." };
        }
        return {
          renungan: items.map((d) => ({
            judul: d.title,
            ayat: d.verseRef,
            terbit: formatJakarta(d.publishedAt, "d MMMM yyyy"),
            ringkasan: excerpt(d.body, 240),
            tautan: `${church.siteUrl}/renungan/${d.slug}`,
          })),
        };
      },
    }),
  };
}
