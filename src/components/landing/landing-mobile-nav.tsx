"use client";

import { Menu, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Link, useRouter } from "@/lib/i18n/navigation";

/**
 * The mobile navigation panel.
 *
 * This started as a `<details>` element, which is the right instinct — zero
 * JavaScript for a disclosure — and the wrong component for this particular
 * disclosure. Every link in it is an in-page anchor, and a `<details>` does
 * not close when something inside it is activated: tapping "Persembahan"
 * scrolled the page behind a panel that stayed open over it. The menu has to
 * know it has been used, and that is state.
 *
 * So it closes on: a link, Escape, a tap outside, and a resize up to the
 * desktop breakpoint (otherwise rotating a phone leaves an orphaned panel
 * floating beside a nav bar that has already reappeared).
 */
export function LandingMobileNav({
  links,
  actions,
  menuLabel,
}: {
  links: { href: string; label: string }[];
  actions: { href: string; label: string; strong?: boolean }[];
  menuLabel: string;
}) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (!open) return;

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    function onPointer(e: PointerEvent) {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    }
    const desktop = window.matchMedia("(min-width: 1024px)");
    function onDesktop(e: MediaQueryListEvent) {
      if (e.matches) setOpen(false);
    }

    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    desktop.addEventListener("change", onDesktop);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
      desktop.removeEventListener("change", onDesktop);
    };
  }, [open]);

  return (
    <div ref={root} className="relative lg:hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-label={menuLabel}
        onClick={() => setOpen((v) => !v)}
        className="flex h-9 w-9 items-center justify-center rounded-full border border-lp-rule-firm text-lp-ink transition-colors hover:bg-lp-sand"
      >
        {open ? (
          <X className="h-4 w-4" aria-hidden />
        ) : (
          <Menu className="h-4 w-4" aria-hidden />
        )}
      </button>

      {open ? (
        <div className="absolute right-0 top-12 w-60 rounded-2xl border border-lp-rule-firm bg-lp-paper p-2 shadow-[0_18px_48px_-16px_rgba(26,25,23,0.28)]">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="lp-nav block rounded-xl px-3.5 py-2.5 text-lp-ink-soft transition-colors hover:bg-lp-sand hover:text-lp-ink"
            >
              {link.label}
            </Link>
          ))}

          <div className="my-2 h-px bg-lp-rule" aria-hidden />

          {actions.map((action) => (
            <button
              key={action.href}
              type="button"
              onClick={() => {
                setOpen(false);
                router.push(action.href);
              }}
              className={`lp-nav block w-full rounded-xl px-3.5 py-2.5 text-left transition-colors hover:bg-lp-sand ${
                action.strong
                  ? "font-medium text-lp-ink"
                  : "text-lp-ink-soft hover:text-lp-ink"
              }`}
            >
              {action.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
