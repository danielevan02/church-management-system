"use client";

import * as React from "react";
import gsap from "gsap";
import Image from "next/image";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLenis } from "lenis/react";
import { useTranslations } from "next-intl";

import { FirstTimeDrawer } from "./first-time-drawer";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

type Chapter = {
  key: string;
  image: string;
  /** Focal point for the crop, so faces survive a 3:4 cut. */
  position: string;
};

const CHAPTERS: readonly Chapter[] = [
  { key: "arrival", image: "/landing-page/visit.jpeg", position: "42% 50%" },
  { key: "worship", image: "/landing-page/gathering.jpeg", position: "50% 62%" },
  { key: "word", image: "/landing-page/hero-poster.jpg", position: "50% 46%" },
  { key: "table", image: "/landing-page/detail.jpeg", position: "50% 50%" },
  {
    key: "life",
    image: "/landing-page/fellowship.jpeg",
    position: "52% 55%",
  },
];

/** Scroll distance, in viewport heights, spent on each chapter after the first. */
const PACE = 1.15;

/**
 * Fraction of the pin spent accelerating the horizontal travel at each end.
 *
 * Small on purpose: it is a pick-up, not a run-up. At `PACE` this is a little
 * under a quarter-screen of scrolling.
 */
const RAMP = 0.05;

/**
 * Fraction of the *travel* one ramp covers, for `power2.in` whose exit slope
 * has to equal the linear middle's.
 *
 * Over a span `r` covering distance `d`, a quadratic ease leaves at slope
 * `2d/r`. Setting that equal to the middle's slope `S` gives `d = S·r/2`, and
 * conserving total distance across both ramps plus the middle gives
 * `S = D/(1 - r)` — so one ramp covers `r / 2(1 - r)` of `D`.
 */
const LEAD = RAMP / (2 * (1 - RAMP));

/**
 * Where in the pin's scroll range chapter `i` sits flush on screen.
 *
 * The inverse of the travel profile above. A linear `i / (n - 1)` was right
 * while the travel was linear; with the ramps it drifts by ~5% of a panel at
 * the second and fourth chapters, which is enough to leave a dot-click
 * visibly off-register.
 */
function progressForChapter(i: number, count: number): number {
  const f = i / (count - 1);
  if (f <= LEAD) return RAMP * Math.sqrt(f / LEAD);
  if (f >= 1 - LEAD) return 1 - RAMP * Math.sqrt((1 - f) / LEAD);
  return RAMP + (f - LEAD) * (1 - RAMP);
}

export function SundayExperience({ whatsappHref }: { whatsappHref: string }) {
  const t = useTranslations("lp.liturgy");
  const reduce = useReducedMotion();
  const lenis = useLenis();

  const rootRef = React.useRef<HTMLDivElement>(null);
  const trackRef = React.useRef<HTMLDivElement>(null);
  const stRef = React.useRef<ScrollTrigger | null>(null);
  const [active, setActive] = React.useState(0);

  React.useEffect(() => {
    const root = rootRef.current;
    const track = trackRef.current;
    if (!root || !track) return;

    gsap.registerPlugin(ScrollTrigger);

    // `gsap.matchMedia` rather than a width check in an effect: it tears the
    // pin down and rebuilds it on a breakpoint cross, which a bare effect with
    // a resize listener does not, and a half-torn-down pin leaves the page
    // scrolled into a spacer that no longer has content.
    const mm = gsap.matchMedia();

    mm.add(
      {
        pinned: "(min-width: 62rem) and (prefers-reduced-motion: no-preference)",
      },
      (context) => {
        if (!context.conditions?.pinned) return;
        const panels = gsap.utils.toArray<HTMLElement>("[data-chapter]", track);
        const distance = () => window.innerHeight * PACE * (panels.length - 1);

        const tl = gsap.timeline({
          defaults: { ease: "none", duration: 1 },
          scrollTrigger: {
            trigger: root,
            start: "top top",
            end: () => `+=${distance()}`,
            pin: true,
            // One source of smoothing, not two. Lenis already eases the
            // *scroll position itself* (`lerp: 0.085` in ScrollStage), so the
            // track tracks that eased position 1:1 rather than easing an
            // already-eased signal a second time. Matches the page's other
            // three scrubbed triggers (hero release, reveal parallax).
            scrub: true,
            // NO `anticipatePin` — it is what made entering the pin jump.
            //
            // anticipatePin extrapolates the scroll position ~45ms ahead
            // (`anticipatePin * 45`, off a velocity sampled only every 50ms)
            // and, if the *prediction* clears `start`, pins on the spot. The
            // stage then renders as though scroll were already at `start`
            // while the intro above it and the sticky rail are still drawn
            // for the real position, so the section snaps up by one flick's
            // worth of travel — 60-130px at Lenis wheel velocities — a beat
            // before the horizontal travel takes over.
            //
            // It exists to cover browsers painting compositor-thread scroll
            // ahead of rAF, which cannot happen here: Lenis sets the scroll
            // position from `gsap.ticker` and ScrollTrigger.update() runs
            // synchronously in that same tick, before paint. Nothing to
            // anticipate, so the compensation is pure artefact.
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              // Nearest chapter by the travel's own profile rather than by a
              // linear slice of progress — the ramps make the two disagree
              // near the ends.
              let nearest = 0;
              for (let i = 1; i < panels.length; i++) {
                const d = Math.abs(
                  self.progress - progressForChapter(i, panels.length),
                );
                const best = Math.abs(
                  self.progress - progressForChapter(nearest, panels.length),
                );
                if (d < best) nearest = i;
              }
              setActive(nearest);
            },
            onRefreshInit: () => setActive(0),
          },
        });
        stRef.current = tl.scrollTrigger ?? null;

        // Measured travel, NOT `xPercent`.
        //
        // `xPercent` is a percentage of the *animated element's own* width, and
        // the track is five viewports wide — so `xPercent: -400` moves it
        // twenty viewports and every panel but the first flies past off-screen.
        // The distance wanted is simply the overflow, re-read on refresh so a
        // resize or a font swap cannot leave it stale.
        const travel = () => -(track.scrollWidth - track.offsetWidth);
        const lead = () => travel() * LEAD;

        // Three segments, not one linear sweep.
        //
        // `ease: "none"` across the whole pin means horizontal velocity steps
        // from nothing to full rate the instant the pin engages, and back to
        // nothing when it releases. Every frame lands on time, but a step in
        // velocity is what the eye reads as a wall. So each end accelerates
        // instead, at distances (`LEAD`) chosen so a ramp's exit slope matches
        // the middle's — the joins are smooth in the first derivative, not
        // merely continuous. The middle pays for it by running `1/(1 - RAMP)`
        // faster, 5%, which has nothing on screen to be measured against.
        tl.to(track, { x: lead, duration: RAMP, ease: "power2.in" }, 0)
          .to(
            track,
            { x: () => travel() - lead(), duration: 1 - RAMP * 2, ease: "none" },
            RAMP,
          )
          .to(track, { x: travel, duration: RAMP, ease: "power2.out" }, 1 - RAMP);

        // The seam itself: turn the motion vector rather than stopping it.
        //
        // Vertical scroll runs at full rate right up to `start`, where the pin
        // freezes it dead — so however smooth the horizontal ramp is, the
        // handoff is still *from* a standstill. The track instead carries a
        // small downward offset, and spends it rising across the same window
        // the travel ramps in: vertical motion decays from roughly 40% of the
        // incoming scroll rate to nothing while horizontal builds, so the
        // direction turns instead of restarting.
        //
        // `fromTo` renders its start value immediately, which is what keeps
        // this honest — the offset is on the track from load, long before the
        // pin engages, so nothing snaps into place at `start`. On a centred
        // full-height stage there is nothing to measure the offset against,
        // and `.sm-liturgy-stage` clips anyway.
        tl.fromTo(
          track,
          { y: () => window.innerHeight * 0.05 },
          { y: 0, duration: RAMP, ease: "power2.out" },
          0,
        );

        // Each photograph drifts against the horizontal travel, so the frames
        // read as apertures the room slides behind rather than as flat cards.
        // Nested in the same timeline instead of getting ScrollTriggers of
        // their own: a second trigger on a pinned element measures against the
        // pin spacer, and its start/end no longer mean what they say.
        const figures = panels
          .map((p) => p.querySelector<HTMLElement>("[data-chapter-figure]"))
          .filter((f): f is HTMLElement => Boolean(f));
        tl.fromTo(
          figures,
          { xPercent: 12, scale: 1.07 },
          { xPercent: -12, scale: 1, ease: "none", duration: 1 },
          0,
        );

        return () => {
          stRef.current = null;
        };
      },
    );

    return () => mm.revert();
  }, []);

  /** Jump to a chapter by mapping its index back onto the pinned scroll range. */
  const goTo = React.useCallback(
    (index: number) => {
      const st = stRef.current;
      if (!st) {
        // Unpinned layout (mobile, reduced motion): the chapters are a plain
        // vertical stack, so the same control scrolls to the element.
        const el = document.getElementById(`bagian-${index + 1}`);
        if (!el) return;
        if (lenis && !reduce) lenis.scrollTo(el, { duration: 1.2 });
        else el.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
        return;
      }
      const target =
        st.start +
        (st.end - st.start) * progressForChapter(index, CHAPTERS.length);
      if (lenis) lenis.scrollTo(target, { duration: 1.1 });
      else window.scrollTo({ top: target, behavior: "smooth" });
    },
    [lenis, reduce],
  );

  const onKeyDown = React.useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        goTo(Math.min(active + 1, CHAPTERS.length - 1));
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        goTo(Math.max(active - 1, 0));
      }
    },
    [active, goTo],
  );

  return (
    <section
      id="kunjungan-pertama"
      className="sm-tone-dark sm-liturgy"
      aria-labelledby="sm-liturgy-title"
    >
      <div className="sm-shell sm-liturgy-intro">
        <div className="sm-opener">
          <p className="sm-opener-kicker sm-label sm-eyebrow">{t("label")}</p>
          <h2
            id="sm-liturgy-title"
            className="sm-opener-title sm-h1"
            data-sm-split
          >
            {t("title")}
          </h2>
          <div className="sm-opener-lead flex flex-col items-start gap-6">
            <p className="sm-lead" style={{ color: "var(--sm-fg-muted)" }} data-sm-reveal="up">
              {t("lead")}
            </p>
            <div data-sm-reveal="up">
              <FirstTimeDrawer whatsappHref={whatsappHref} />
            </div>
          </div>
        </div>
      </div>

      <div ref={rootRef} className="sm-liturgy-stage">
        {/* tabIndex so the arrow keys have somewhere to land; the role and
            label tell a screen reader this is one navigable group rather than
            five unrelated regions. */}
        <div
          ref={trackRef}
          className="sm-liturgy-track"
          role="group"
          aria-label={t("label")}
          tabIndex={0}
          onKeyDown={onKeyDown}
        >
          {CHAPTERS.map((c, i) => (
            <article
              key={c.key}
              id={`bagian-${i + 1}`}
              data-chapter
              data-active={i === active || undefined}
              className="sm-chapter"
            >
              <div className="sm-chapter-inner sm-shell">
                <div className="sm-chapter-meta">
                  <p className="sm-numeral sm-chapter-numeral">
                    {String(i + 1).padStart(2, "0")}
                  </p>
                  <p className="sm-label sm-eyebrow">
                    {t(`chapters.${c.key}.when`)}
                  </p>
                </div>

                <div className="sm-chapter-copy">
                  <h3 className="sm-h2">{t(`chapters.${c.key}.title`)}</h3>
                  <p className="sm-lead" style={{ color: "var(--sm-fg-muted)" }}>
                    {t(`chapters.${c.key}.body`)}
                  </p>
                  <p className="sm-chapter-note sm-small">
                    {t(`chapters.${c.key}.note`)}
                  </p>
                </div>

                <figure className="sm-chapter-figure sm-figure sm-figure-warm">
                  <div data-chapter-figure className="sm-chapter-figure-inner">
                    <Image
                      src={c.image}
                      alt=""
                      aria-hidden
                      fill
                      sizes="(max-width: 62rem) 90vw, 34vw"
                      quality={78}
                      style={{ objectPosition: c.position }}
                    />
                  </div>
                </figure>
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* Progress rail. Sticky rather than pinned so it survives the unpinned
          mobile layout unchanged, where it becomes a plain chapter jump list. */}
      <div className="sm-liturgy-rail">
        <div className="sm-shell flex items-center justify-between gap-6">
          <ol className="sm-liturgy-dots" aria-label={t("progress")}>
            {CHAPTERS.map((c, i) => (
              <li key={c.key}>
                <button
                  type="button"
                  onClick={() => goTo(i)}
                  aria-current={i === active ? "true" : undefined}
                  className="sm-liturgy-dot sm-label"
                >
                  <span className="sm-liturgy-dot-num">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="sm-liturgy-dot-name">
                    {t(`chapters.${c.key}.title`)}
                  </span>
                </button>
              </li>
            ))}
          </ol>
          <p className="sm-label sm-eyebrow sm-liturgy-hint shrink-0">
            {t("hint")}
          </p>
        </div>
      </div>
    </section>
  );
}
