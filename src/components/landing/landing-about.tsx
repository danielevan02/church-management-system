import Image from "next/image";
import { getTranslations } from "next-intl/server";

import { LandingSection } from "@/components/landing/landing-section";
import { church } from "@/config/church";

/**
 * Vision and mission.
 *
 * The vision statement *is* the section heading rather than a line of body
 * copy underneath one. It is a single sentence the congregation already knows
 * by heart, and setting it at display size in the serif is the cheapest way to
 * make the page feel like it belongs to this church rather than to a template
 * — no illustration or icon set can do the same work.
 *
 * The six mission points are numbered and rule-separated instead of being six
 * cards in a grid. They are a list, they were always a list, and the acronym
 * (PIKP3) that names them only reads as an acronym when the items sit in a
 * fixed order the eye can count.
 */
export async function LandingAbout({ index }: { index: string }) {
  const t = await getTranslations("landing");

  const items = [1, 2, 3, 4, 5, 6].map((n) => t(`misi.item${n}`));

  return (
    <LandingSection
      id="tentang"
      index={index}
      label={t("nav.about")}
      title={t("visi.text")}
      description={t("visi.description")}
      tone="sand"
    >
      <div className="lp-reveal grid gap-x-10 gap-y-12 lg:grid-cols-12">
        <figure className="lg:col-span-5">
          <div className="relative aspect-4/5 w-full overflow-clip rounded-3xl bg-lp-rule">
            <Image
              src="/images/worship-team.webp"
              alt={t("misi.photoAlt", { church: church.name })}
              fill
              sizes="(min-width: 1024px) 40vw, 100vw"
              className="m3-parallax object-cover"
            />
          </div>
          <figcaption className="mt-4 flex items-baseline justify-between gap-4">
            <span className="lp-small text-lp-ink-soft">
              {t("misi.photoCaption")}
            </span>
            <span className="lp-label shrink-0 text-lp-ink-faint">
              {church.shortName}
            </span>
          </figcaption>
        </figure>

        <div className="lg:col-span-6 lg:col-start-7">
          <div className="flex items-baseline justify-between gap-4 border-b border-lp-ink pb-3">
            <h3 className="lp-label text-lp-ink">{t("misi.label")}</h3>
            <span className="font-display text-xl font-extrabold leading-none tracking-[0.04em] text-lp-accent">
              {t("misi.acronym")}
            </span>
          </div>

          <ol>
            {items.map((item, i) => (
              <li
                key={item}
                className="flex gap-5 border-b border-lp-rule-firm py-5"
              >
                <span
                  className="lp-label mt-1 shrink-0 text-lp-ink-faint"
                  aria-hidden
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p className="lp-body text-pretty text-lp-ink">
                  {item}
                </p>
              </li>
            ))}
          </ol>

          <p className="lp-small mt-5 text-lp-ink-faint">
            {t("misi.expansion")}
          </p>
        </div>
      </div>
    </LandingSection>
  );
}
