"use client";

import { Check, Copy } from "lucide-react";
import { useEffect, useRef, useState } from "react";

/**
 * Copy-to-clipboard, in the landing page's own palette.
 *
 * `components/giving/copy-button.tsx` does the same job but renders the M3
 * `Button`, whose colours are redefined under `.dark` — so on a visitor whose
 * OS is in dark mode it would paint a dark tonal button onto this page's sand
 * ground. The landing page is deliberately theme-independent (see
 * `styles/landing.css`), so it carries its own control.
 *
 * The timeout is cleared on unmount: without it, a visitor who copies the
 * account number and immediately navigates to sign-in gets a setState on an
 * unmounted component.
 */
export function LandingCopyButton({
  value,
  label,
  copiedLabel,
}: {
  value: string;
  label: string;
  copiedLabel: string;
}) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  async function onClick() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard is unavailable on insecure origins and in some in-app
      // browsers. The number is selectable text either way, so there is
      // nothing useful to say here.
    }
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="lp-action inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border border-lp-rule-firm bg-lp-paper px-4 text-lp-ink transition-colors hover:border-lp-ink hover:bg-lp-ink hover:text-lp-paper"
    >
      {copied ? (
        <Check className="h-3.5 w-3.5" aria-hidden />
      ) : (
        <Copy className="h-3.5 w-3.5" aria-hidden />
      )}
      <span>{copied ? copiedLabel : label}</span>
    </button>
  );
}
