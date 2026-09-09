import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import { getTranslations } from "next-intl/server";

import { LoadingLink } from "@/components/shared/loading-link";
import { church } from "@/config/church";

export type ServiceSlot = { name: string; time: string; note: string };

/**
 * The hero.
 *
 * It is asymmetric — a display headline against a bare timetable — because the
 * two things a visitor wants from a church's front page are in tension. One is
 * a feeling ("is this somewhere I would belong?"), the other is a fact ("what
 * time on Sunday?"). A centred hero can only serve them in sequence, which is
 * why the version this replaces pushed the times below three stacked CTAs and
 * a row of invented statistics. Side by side, both land in the first screen.
 *
 * The timetable is set as a printed table: hairlines, no card, no chips, times
 * in the accent face at a size that can be read across a room. There is no
 * bordered box around it because a border would make it a widget, and it is
 * not a widget — it is the single most load-bearing fact on the page.
 */
export async function LandingHero({ services }: { services: ServiceSlot[] }) {
  const t = await getTranslations("landing");
  const { address, city, mapsUrl } = church.contact;
  const place = [address, city].filter(Boolean).join(", ");

  return (
    <section id="top" className="bg-lp-paper">
      <div className="mx-auto w-full max-w-320 px-6 pt-16 pb-14 sm:px-10 sm:pt-24 sm:pb-20 lg:px-14 lg:pt-32 lg:pb-24">
        <div className="grid gap-x-10 gap-y-14 lg:grid-cols-12">
          {/* Headline column */}
          <div className="lg:col-span-7">
            <p className="lp-label text-lp-ink-faint">{church.name}</p>

            <h1 className="lp-display mt-7 text-balance text-lp-ink">
              {t.rich("hero.headline", {
                // Colour alone, and explicitly `not-italic`. Manrope ships a
                // weight axis and no italic cut, so an `<em>` left to the
                // browser gets a synthesised oblique — a mechanical slant of
                // the upright, which at 68px is unmistakable and looks broken.
                em: (chunks) => (
                  <em className="text-lp-accent not-italic">{chunks}</em>
                ),
              })}
            </h1>

            <p className="lp-lead mt-8 max-w-md text-pretty text-lp-ink-soft">
              {t("hero.lead")}
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
              <LoadingLink
                href="/auth/member"
                className="lp-action h-12 rounded-full bg-lp-ink px-7 text-lp-paper transition-colors hover:bg-lp-accent-deep"
              >
                {t("hero.primaryCta")}
              </LoadingLink>

              {mapsUrl ? (
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="lp-action group inline-flex items-center gap-1.5 text-lp-ink transition-colors hover:text-lp-accent"
                >
                  <span className="lp-link-on">{t("hero.directionsCta")}</span>
                  <ArrowUpRight
                    className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    aria-hidden
                  />
                </a>
              ) : (
                <a
                  href="#jadwal"
                  className="lp-action group inline-flex items-center gap-1.5 text-lp-ink transition-colors hover:text-lp-accent"
                >
                  <span className="lp-link-on">{t("hero.scheduleCta")}</span>
                  <ArrowUpRight
                    className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    aria-hidden
                  />
                </a>
              )}
            </div>
          </div>

          {/* Timetable column */}
          <div className="lg:col-span-5 lg:col-start-9">
            <div className="flex items-baseline justify-between border-b border-lp-ink pb-3">
              <span className="lp-label text-lp-ink">{t("schedule.day")}</span>
              <span className="lp-label text-lp-ink-faint">
                {t("schedule.tzLabel")}
              </span>
            </div>

            <dl>
              {services.map((service) => (
                <div
                  key={`${service.name}-${service.time}`}
                  className="flex items-baseline gap-5 border-b border-lp-rule py-5"
                >
                  <dt className="lp-num text-lp-ink">{service.time}</dt>
                  <dd className="flex-1 text-right">
                    <span className="lp-body block font-semibold text-lp-ink">
                      {service.name}
                    </span>
                    <span className="lp-small mt-0.5 block text-lp-ink-faint">
                      {service.note}
                    </span>
                  </dd>
                </div>
              ))}
            </dl>

            {place ? (
              <p className="lp-small mt-5 text-lp-ink-faint">{place}</p>
            ) : null}
          </div>
        </div>
      </div>

      {/* Full-bleed photograph carrying the opening verse. */}
      <figure className="relative isolate w-full overflow-clip">
        <div className="relative h-[58vh] max-h-180 min-h-100 w-full">
          <Image
            src="/images/congregation.webp"
            alt={t("hero.photoAlt", { church: church.name })}
            fill
            priority
            sizes="100vw"
            className="m3-parallax object-cover object-center"
          />
          {/*
            The scrim carries real weight because the photograph has no quiet
            corner to put text in — it is two hundred faces edge to edge, and
            a light wash left the second line of the verse competing with the
            eyes behind it. Opaque at the base, half at 38%, gone by 80%: the
            verse sits on solid ground and the top two-thirds of the picture
            stay untouched.
          */}
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-t from-lp-night from-0% via-lp-night/60 via-38% to-transparent to-80%"
          />
        </div>

        <figcaption className="absolute inset-x-0 bottom-0">
          <div className="mx-auto w-full max-w-320 px-6 pb-10 sm:px-10 sm:pb-14 lg:px-14 lg:pb-16">
            <blockquote className="max-w-3xl">
              <p className="lp-quote text-balance text-lp-on-night">
                &ldquo;{t("hero.verse")}&rdquo;
              </p>
              <cite className="lp-label mt-5 block text-lp-on-night-soft not-italic">
                {t("hero.verseRef")}
              </cite>
            </blockquote>
          </div>
        </figcaption>
      </figure>
    </section>
  );
}
