"use client";

import * as React from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import { useLenis } from "lenis/react";
import { useLocale, useTranslations } from "next-intl";
import { ArrowUpRight, X } from "lucide-react";

import { Link, usePathname } from "@/lib/i18n/navigation";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { church } from "@/config/church";
import { campus } from "@/config/campus";

import { scrollToId } from "./scroll-stage";

const SECTIONS = [
  { id: "ibadah", key: "gatherings" },
  { id: "cerita", key: "stories" },
  { id: "kunjungan-pertama", key: "expect" },
  { id: "persembahan", key: "generosity" },
] as const;

function YoutubeIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

function FacebookIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function InstagramIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

const NAV_LINKS = [
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
  const [showCenterLinks, setShowCenterLinks] = React.useState(false);
  const barRef = React.useRef<HTMLElement>(null);
  const centerNavRef = React.useRef<HTMLElement>(null);
  const isLinksMounted = React.useRef(false);
  const panelRef = React.useRef<HTMLDivElement>(null);
  const triggerRef = React.useRef<HTMLButtonElement>(null);

  /* The bar condenses and center nav links emerge once the hero navlinks
   * scroll past the navbar. The navbar container leads first, followed by
   * the center nav links gracefully sliding in after a brief fraction of a second. */
  React.useEffect(() => {
    if (variant !== "landing") {
      setCondensed(true);
      setShowCenterLinks(true);
      return;
    }
    gsap.registerPlugin(ScrollTrigger);

    const heroNavEl =
      document.getElementById("hero-nav-primary") ||
      document.querySelector<HTMLElement>(".hero-stage-nav-primary");
    const heroTitleEl = document.querySelector<HTMLElement>(".hero-stage-row-title");

    const isHeroNavVisible =
      heroNavEl &&
      window.getComputedStyle(heroNavEl).display !== "none";

    const triggerTarget = isHeroNavVisible
      ? heroNavEl
      : heroTitleEl || ".hero-stage-content";

    const stNav = ScrollTrigger.create({
      trigger: triggerTarget,
      start: "bottom top",
      end: "max",
      onToggle: (self) => {
        setCondensed(self.isActive);
        setShowCenterLinks(self.isActive);
      },
    });

    return () => {
      stNav.kill();
    };
  }, [variant]);

  // Entrance and exit animation for center nav links
  React.useEffect(() => {
    if (!centerNavRef.current) return;
    const links = centerNavRef.current.querySelectorAll<HTMLElement>("[data-center-link]");
    if (!links.length) return;

    if (reduce) {
      gsap.set(links, {
        opacity: showCenterLinks ? 1 : 0,
        y: showCenterLinks ? 0 : 14,
        pointerEvents: showCenterLinks ? "auto" : "none",
      });
      return;
    }

    if (!isLinksMounted.current) {
      isLinksMounted.current = true;
      if (!showCenterLinks) {
        gsap.set(links, { opacity: 0, y: 14, pointerEvents: "none" });
        return;
      }
    }

    if (showCenterLinks) {
      gsap.fromTo(
        links,
        { opacity: 0, y: 14 },
        {
          opacity: 1,
          y: 0,
          duration: 0.42,
          delay: 0.18, // Navbar animation leads first by ~0.18s, then nav links emerge inside
          stagger: 0.05,
          ease: "power3.out",
          pointerEvents: "auto",
          overwrite: true,
        },
      );
    } else {
      gsap.to(links, {
        opacity: 0,
        y: -8,
        duration: 0.2,
        stagger: 0.02,
        ease: "power2.in",
        pointerEvents: "none",
        overwrite: true,
      });
    }
  }, [showCenterLinks, reduce]);

  const handleClose = React.useCallback(
    (onClosed?: () => void) => {
      if (reduce || !panelRef.current) {
        setOpen(false);
        onClosed?.();
        return;
      }
      const panel = panelRef.current;
      const elements = panel.querySelectorAll(
        "[data-menu-link], [data-menu-footer], [data-menu-header]",
      );

      const tl = gsap.timeline({
        onComplete: () => {
          setOpen(false);
          gsap.set(panel, { clearProps: "all" });
          onClosed?.();
        },
      });

      tl.to(elements, {
        opacity: 0,
        y: -12,
        duration: 0.18,
        stagger: 0.015,
        ease: "power2.in",
      }).to(
        panel,
        {
          opacity: 0,
          y: -16,
          duration: 0.22,
          ease: "power2.in",
        },
        "-=0.08",
      );
    },
    [reduce],
  );

  const go = React.useCallback(
    (id: string): boolean => {
      if (open) {
        handleClose(() => {
          if (variant === "landing") {
            scrollToId(id, lenis, reduce);
          }
        });
        return true;
      }
      if (variant !== "landing") return false;
      return scrollToId(id, lenis, reduce);
    },
    [lenis, reduce, variant, open, handleClose],
  );

  const onAnchor = React.useCallback(
    (id: string) => (e: React.MouseEvent) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) {
        return;
      }
      if (go(id)) e.preventDefault();
    },
    [go],
  );

  React.useEffect(() => {
    if (!lenis) return;
    if (open) lenis.stop();
    else lenis.start();
    return () => lenis.start();
  }, [open, lenis]);

  // Entrance animation for full-screen menu drawer
  React.useEffect(() => {
    if (!open || !panelRef.current) return;

    if (reduce) {
      gsap.set(panelRef.current, { opacity: 1, y: 0 });
      gsap.set(
        panelRef.current.querySelectorAll(
          "[data-menu-header], [data-menu-link], [data-menu-social], [data-menu-footer]",
        ),
        { opacity: 1, y: 0 },
      );
      return;
    }

    const panel = panelRef.current;
    const header = panel.querySelector("[data-menu-header]");
    const links = panel.querySelectorAll("[data-menu-link]");
    const footer = panel.querySelector("[data-menu-footer]");

    // Prepare initial hidden states
    gsap.set(panel, { opacity: 0, y: -24 });
    if (header) gsap.set(header, { opacity: 0, y: -12 });
    if (links.length) gsap.set(links, { opacity: 0, y: 35 });
    if (footer) gsap.set(footer, { opacity: 0, y: 22 });

    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

    tl.to(panel, {
      opacity: 1,
      y: 0,
      duration: 0.4,
      ease: "power3.out",
    })
      .to(
        header,
        {
          opacity: 1,
          y: 0,
          duration: 0.35,
        },
        "-=0.25",
      )
      .to(
        links,
        {
          opacity: 1,
          y: 0,
          duration: 0.45,
          stagger: 0.065,
          ease: "power3.out",
        },
        "-=0.22",
      )
      .to(
        footer,
        {
          opacity: 1,
          y: 0,
          duration: 0.45,
          ease: "power3.out",
        },
        "-=0.25",
      );

    return () => {
      tl.kill();
    };
  }, [open, reduce]);

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose(() => {
          triggerRef.current?.focus();
        });
        return;
      }
      if (e.key !== "Tab") return;
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
  }, [open, handleClose]);

  return (
    <>
      <header
        ref={barRef}
        data-condensed={condensed || undefined}
        className="sm-nav-bar"
      >
        <div className="sm-nav-backdrop" aria-hidden="true" />
        <div className="sm-shell-wide relative flex items-center justify-between gap-6">
          {/* Institutional Church Lockup (Logo + GKJ Tangerang) */}
          <Lockup onHome={onAnchor("atas")} variant={variant} />

          {/* Center Navigation Links (Appears when hero nav links scroll out of view) */}
          <nav
            ref={centerNavRef}
            aria-label={t("navLabel")}
            className="sm-nav-center"
            data-visible={showCenterLinks || undefined}
          >
            {NAV_LINKS.map((s) => (
              <a
                key={s.id}
                href={`/#${s.id}`}
                onClick={onAnchor(s.id)}
                className="sm-nav-center-link group"
                data-center-link
              >
                <span>{t(s.key)}</span>
              </a>
            ))}
          </nav>

          {/* Right Side: Language Switcher + Social Circles (desktop only) + Mobile Menu Trigger */}
          <div className="flex items-center gap-2 sm:gap-3">
            <LocaleToggle inBar />

            <div className="hero-social-row sm-nav-social">
              <a
                href={campus.youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hero-social-circle"
                aria-label="YouTube GKJ Tangerang"
              >
                <YoutubeIcon className="w-3.5 h-3.5" />
              </a>
              <a
                href={campus.facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hero-social-circle"
                aria-label="Facebook GKJ Tangerang"
              >
                <FacebookIcon className="w-3.5 h-3.5" />
              </a>
              <a
                href={campus.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hero-social-circle"
                aria-label="Instagram GKJ Tangerang"
              >
                <InstagramIcon className="w-3.5 h-3.5" />
              </a>
            </div>

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
        <div className="sm-shell flex h-full min-h-dvh flex-col justify-between py-6">
          <div data-menu-header className="flex items-center justify-between">
            <Lockup onHome={onAnchor("atas")} variant={variant} />
            <button
              type="button"
              onClick={() => handleClose()}
              className="sm-nav sm-menu-trigger inline-flex items-center gap-2"
            >
              {t("close")}
              <X className="h-3.5 w-3.5" aria-hidden />
            </button>
          </div>

          <nav className="flex flex-col gap-1 py-8" aria-label={t("menu")}>
            {SECTIONS.map((s) => (
              <Link
                key={s.id}
                href={`/#${s.id}`}
                onClick={onAnchor(s.id)}
                className="sm-menu-item sm-h2 group"
                data-menu-link
              >
                {t(s.key)}
              </Link>
            ))}
            <Link
              href="/#rencanakan"
              onClick={onAnchor("rencanakan")}
              className="sm-menu-item sm-h2 inline-flex items-center gap-2"
              style={{ color: "var(--sm-accent)" }}
              data-menu-link
            >
              <span>{t("visit")}</span>
              <ArrowUpRight className="h-5 w-5" aria-hidden />
            </Link>
          </nav>

          {/* Menu Drawer Footer (Unified single footer area without double divider lines or redundant label) */}
          <div
            data-menu-footer
            className="sm-rule-t flex flex-col gap-6 pt-6"
          >
            {/* Secondary navigation links */}
            <div className="flex items-center gap-6">
              <Link href="/auth/member" className="sm-nav sm-link-muted">
                {t("portal")}
              </Link>
              <Link href="/auth/sign-in" className="sm-nav sm-link-muted">
                {t("staff")}
              </Link>
            </div>

            {/* Bottom utility controls: Social channels on left, Language switcher on right */}
            <div className="flex items-center justify-between gap-4">
              <div className="hero-social-row">
                <a
                  href={campus.youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hero-social-circle"
                  aria-label="YouTube GKJ Tangerang"
                >
                  <YoutubeIcon className="w-3.5 h-3.5" />
                </a>
                <a
                  href={campus.facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hero-social-circle"
                  aria-label="Facebook GKJ Tangerang"
                >
                  <FacebookIcon className="w-3.5 h-3.5" />
                </a>
                <a
                  href={campus.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hero-social-circle"
                  aria-label="Instagram GKJ Tangerang"
                >
                  <InstagramIcon className="w-3.5 h-3.5" />
                </a>
              </div>

              <LocaleToggle />
            </div>
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
  const pathname = usePathname();
  return (
    <div
      className={`sm-locale ${inBar ? "sm-nav-locale" : ""}`}
      role="group"
      aria-label="Pilih Bahasa / Select Language"
    >
      {(["id", "en"] as const).map((l) => (
        <Link
          key={l}
          href={pathname}
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
