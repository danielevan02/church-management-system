"use client";

import * as React from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import { useLenis } from "lenis/react";
import { useLocale, useTranslations } from "next-intl";
import { ArrowUpRight, X } from "lucide-react";

import { Link } from "@/lib/i18n/navigation";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { church } from "@/config/church";

const SECTIONS = [
  { id: "ibadah", key: "gatherings" },
  { id: "cerita", key: "stories" },
  { id: "kunjungan-pertama", key: "expect" },
  { id: "persembahan", key: "generosity" },
] as const;

/**
 * @param variant `landing` intercepts the section links and glides to them
 *   through Lenis; `page` leaves them as ordinary navigations, which is what
 *   the public devotional pages need — the sections are on another route.
 */
export function LandingNav({
  variant = "landing",
}: {
  variant?: "landing" | "page";
}) {
  const t = useTranslations("lp.nav");
  const lenis = useLenis();
  const reduce = useReducedMotion();
  const [open, setOpen] = React.useState(false);
  const [condensed, setCondensed] = React.useState(false);
  const barRef = React.useRef<HTMLElement>(null);
  const panelRef = React.useRef<HTMLDivElement>(null);
  const triggerRef = React.useRef<HTMLButtonElement>(null);

  /* The bar condenses once the hero is behind you. Driven by ScrollTrigger
   * rather than a scroll listener so it shares the one scroll pass the rest of
   * the page already runs on.
   *
   * On a content route there is nothing to condense *from*. The transparent
   * state exists to let the hero footage through, and its text is paper — over
   * the devotional pages' limestone ground that is white-on-cream and very
   * nearly invisible. So `page` starts condensed and stays there. */
  React.useEffect(() => {
    if (variant !== "landing") {
      setCondensed(true);
      return;
    }
    gsap.registerPlugin(ScrollTrigger);
    const st = ScrollTrigger.create({
      start: "top -70%",
      end: "max",
      onToggle: (self) => setCondensed(self.isActive),
    });
    return () => st.kill();
  }, [variant]);

  /**
   * Section links are real `<Link href="/#id">` anchors and this only
   * *enhances* them.
   *
   * They started as bare `<button>`s, which cost more than it looked: no
   * middle-click, no "open in new tab", nothing for a crawler to follow, and
   * no way for the devotional pages to reach the sections at all. Returning
   * false here means "I did not handle it", and the anchor navigates normally.
   */
  const go = React.useCallback(
    (id: string): boolean => {
      setOpen(false);
      if (variant !== "landing") return false;
      const el = document.getElementById(id);
      if (!el) return false;
      if (lenis && !reduce) {
        // `setOpen(false)` only queues the effect that restarts Lenis, so at
        // this point the instance is still stopped and a plain `scrollTo` is
        // discarded — tapping a link in the mobile menu closed the panel and
        // went nowhere. Restarting here and forcing the scroll makes the
        // navigation happen regardless of when the effect lands.
        lenis.start();
        lenis.scrollTo(el, { duration: 1.4, force: true });
      } else {
        el.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
      }
      return true;
    },
    [lenis, reduce, variant],
  );

  /** Click handler for an anchor: swallow the navigation only if we scrolled. */
  const onAnchor = React.useCallback(
    (id: string) => (e: React.MouseEvent) => {
      // Never hijack a modified click — that is the user asking for a new tab.
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) {
        return;
      }
      if (go(id)) e.preventDefault();
    },
    [go],
  );

  /* Lenis keeps scrolling the page behind a fixed overlay, so the panel has to
   * stop it explicitly — `overflow: hidden` on the body does nothing to a
   * virtual scroller. */
  React.useEffect(() => {
    if (!lenis) return;
    if (open) lenis.stop();
    else lenis.start();
    return () => lenis.start();
  }, [open, lenis]);

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
        return;
      }
      if (e.key !== "Tab") return;
      // Focus trap: without it, tabbing walks into the page under the panel,
      // which is still there and now unreachable by pointer.
      const focusables = panelRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled])',
      );
      if (!focusables?.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    panelRef.current?.querySelector<HTMLElement>("a, button")?.focus();
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <header
        ref={barRef}
        data-condensed={condensed || undefined}
        className="sm-nav-bar"
      >
        <div className="sm-shell-wide flex items-center justify-between gap-6">
          <Lockup onHome={onAnchor("atas")} variant={variant} />

          <nav aria-label={t("navLabel")}
            className="sm-nav-links items-center gap-8">
            {SECTIONS.map((s) => (
              <Link
                key={s.id}
                href={`/#${s.id}`}
                onClick={onAnchor(s.id)}
                className="sm-nav sm-link"
              >
                {t(s.key)}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3 sm:gap-5">
            <LocaleToggle inBar />
            <Link
              href="/auth/member"
              className="sm-nav sm-link-muted sm-nav-portal"
            >
              {t("portal")}
            </Link>
            <Link
              href="/#rencanakan"
              onClick={onAnchor("rencanakan")}
              className="sm-btn sm-btn-primary sm-btn-sm sm-action sm-nav-cta"
            >
              {t("visit")}
            </Link>
            <button
              ref={triggerRef}
              type="button"
              onClick={() => setOpen(true)}
              aria-expanded={open}
              aria-controls="sm-menu"
              className="sm-nav sm-menu-trigger sm-nav-menu"
            >
              {t("menu")}
            </button>
          </div>
        </div>
      </header>

      <div
        id="sm-menu"
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={t("menu")}
        hidden={!open}
        className="sm-menu-panel sm-tone-dark"
      >
        <div className="sm-shell flex h-full flex-col justify-between py-6">
          <div className="flex items-center justify-between">
            <Lockup onHome={onAnchor("atas")} variant={variant} />
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="sm-nav sm-menu-trigger inline-flex items-center gap-2"
            >
              {t("close")}
              <X className="h-3.5 w-3.5" aria-hidden />
            </button>
          </div>

          <nav className="flex flex-col gap-1 py-8" aria-label={t("menu")}>
            {SECTIONS.map((s, i) => (
              <Link
                key={s.id}
                href={`/#${s.id}`}
                onClick={onAnchor(s.id)}
                className="sm-menu-item sm-h2 group"
              >
                <span className="sm-label sm-menu-index">0{i + 1}</span>
                {t(s.key)}
              </Link>
            ))}
            <Link
              href="/#rencanakan"
              onClick={onAnchor("rencanakan")}
              className="sm-menu-item sm-h2"
              style={{ color: "var(--sm-accent)" }}
            >
              <span className="sm-label sm-menu-index">05</span>
              {t("visit")}
              <ArrowUpRight className="h-5 w-5" aria-hidden />
            </Link>
          </nav>

          <div className="sm-rule-t flex flex-wrap items-center justify-between gap-4 pt-5">
            <div className="flex items-center gap-5">
              <Link href="/auth/member" className="sm-nav sm-link-muted">
                {t("portal")}
              </Link>
              <Link href="/auth/sign-in" className="sm-nav sm-link-muted">
                {t("staff")}
              </Link>
            </div>
            <LocaleToggle />
          </div>
        </div>
      </div>
    </>
  );
}

/**
 * The institutional lockup: the Sinode GKJ crest beside a two-line wordmark.
 *
 * The crest keeps its own colours. It is a denominational seal, not a brand
 * asset to tint into the page palette, so the page carries it as-is and lets
 * the typography do the tonal work — which is also how it earns its authority
 * next to a warm, quiet palette instead of fighting it.
 */
function Lockup({
  onHome,
  variant,
}: {
  onHome: (e: React.MouseEvent) => void;
  variant: "landing" | "page";
}) {
  return (
    <Link
      href={variant === "landing" ? "/#atas" : "/"}
      onClick={onHome}
      className="sm-lockup group"
      aria-label={church.name}
    >
      <Image
        src="/landing-page/crest.png"
        alt=""
        aria-hidden
        width={182}
        height={256}
        priority
        className="sm-lockup-crest"
      />
      <span className="sm-lockup-text">
        <span className="sm-lockup-line1">Gereja Kristen Jakarta</span>
        <span className="sm-lockup-line2">Jemaat Tangerang</span>
      </span>
    </Link>
  );
}

function LocaleToggle({ inBar = false }: { inBar?: boolean }) {
  const locale = useLocale();
  return (
    <div className={`sm-locale ${inBar ? "sm-nav-locale" : ""}`} role="group">
      {(["id", "en"] as const).map((l) => (
        <Link
          key={l}
          href="/"
          locale={l}
          aria-current={locale === l ? "true" : undefined}
          className="sm-locale-item sm-label"
        >
          {l.toUpperCase()}
        </Link>
      ))}
    </div>
  );
}
