"use client";

import Image from "next/image";
import * as React from "react";
import { useTranslations } from "next-intl";
import { church } from "@/config/church";
import { usePathname } from "@/lib/i18n/navigation";
import { cn } from "@/lib/utils";

/**
 * Custom event triggers for imperative navigation feedback (e.g., buttons, form redirects)
 */
export function triggerNavigationStart() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("app:navigation-start"));
  }
}

export function triggerNavigationStop() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("app:navigation-stop"));
  }
}

/**
 * Global Navigation Progress & Centered Church Brand Indicator.
 *
 * Provides immediate (0ms) feedback when navigating between routes:
 * 1. Top Material 3 linear progress bar across viewport.
 * 2. Centered glassmorphic brand badge displaying the church logo and name.
 */
export function NavigationProgress() {
  const t = useTranslations("common");
  const pathname = usePathname();
  const [isNavigating, setIsNavigating] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const timerRef = React.useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = React.useRef<NodeJS.Timeout | null>(null);

  const stopNavigation = React.useCallback(() => {
    setProgress(100);
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    const timeout = setTimeout(() => {
      setIsNavigating(false);
      setProgress(0);
    }, 220);
    return () => clearTimeout(timeout);
  }, []);

  const startNavigation = React.useCallback(() => {
    setIsNavigating(true);
    setProgress(20);

    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    progressIntervalRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev < 60) return prev + Math.random() * 12 + 4;
        if (prev < 85) return prev + Math.random() * 4 + 1;
        return prev;
      });
    }, 120);

    // Safety timeout in case navigation takes unusually long or fails
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      stopNavigation();
    }, 8000);
  }, [stopNavigation]);

  // When pathname changes, route navigation has finished
  React.useEffect(() => {
    stopNavigation();
  }, [pathname, stopNavigation]);

  // Intercept internal link clicks and popstate events for instant 0ms latency feedback
  React.useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      // Ignore modified clicks (new tab, cmd+click, etc.)
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.defaultPrevented) {
        return;
      }

      const target = (e.target as HTMLElement).closest<HTMLAnchorElement>("a[href]");
      if (!target) return;

      const href = target.getAttribute("href");
      if (!href) return;

      // Ignore external, download, anchor hash, or target="_blank"
      if (
        target.target === "_blank" ||
        target.hasAttribute("download") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:") ||
        href.startsWith("#")
      ) {
        return;
      }

      try {
        const url = new URL(target.href, window.location.href);
        const currentUrl = new URL(window.location.href);

        // Ignore different origins
        if (url.origin !== currentUrl.origin) return;

        // Ignore same exact route and hash
        if (
          url.pathname === currentUrl.pathname &&
          url.search === currentUrl.search
        ) {
          return;
        }

        startNavigation();
      } catch {
        // invalid URL, ignore
      }
    };

    const handlePopState = () => {
      startNavigation();
    };

    const handleCustomStart = () => startNavigation();
    const handleCustomStop = () => stopNavigation();

    document.addEventListener("click", handleDocumentClick, { capture: true });
    window.addEventListener("popstate", handlePopState);
    window.addEventListener("app:navigation-start", handleCustomStart);
    window.addEventListener("app:navigation-stop", handleCustomStop);

    return () => {
      document.removeEventListener("click", handleDocumentClick, { capture: true });
      window.removeEventListener("popstate", handlePopState);
      window.removeEventListener("app:navigation-start", handleCustomStart);
      window.removeEventListener("app:navigation-stop", handleCustomStop);
    };
  }, [startNavigation, stopNavigation]);

  if (!isNavigating && progress === 0) return null;

  return (
    <aside
      aria-live="polite"
      aria-label={t("loading")}
      className="fixed inset-0 z-[9999] select-none pointer-events-none"
    >
      {/* 1. M3 Top Linear Progress Bar */}
      <div className="fixed top-0 left-0 right-0 z-[9999] h-1 bg-primary/20 overflow-hidden">
        <div
          className="h-full bg-primary transition-all duration-200 ease-out shadow-[0_0_8px_var(--color-primary)]"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* 2. Frosted Glass Backdrop ("kaca-kaca") & Centered Brand Card */}
      <div
        className={cn(
          "fixed inset-0 z-[9999] flex items-center justify-center bg-background/40 dark:bg-background/50 backdrop-blur-md transition-opacity duration-200",
          isNavigating ? "opacity-100" : "opacity-0"
        )}
      >
        <div className="flex flex-col items-center gap-4 rounded-2xl bg-surface-container-high/80 dark:bg-surface-container-high/70 px-10 py-7 shadow-level-3 backdrop-blur-xl animate-in zoom-in-95 duration-150">
          {/* Church Logo */}
          <Image
            src="/icon-ui-192.png"
            alt={church.name}
            width={44}
            height={44}
            priority
            className="size-11 rounded-lg object-contain drop-shadow-xs"
          />

          {/* Church Name & Status */}
          <div className="flex flex-col items-center gap-1 text-center">
            <span className="text-sm font-semibold tracking-tight text-on-surface text-center max-w-[240px] leading-snug break-words">
              {church.name}
            </span>
            <span className="text-xs text-on-surface-variant">
              {t("loading")}
            </span>
          </div>

          {/* Linear Progress Bar ("batang biasa") */}
          <div className="w-44 h-1 bg-surface-container-highest/60 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-200 ease-out"
              style={{ width: `${Math.max(progress, 15)}%` }}
            />
          </div>
        </div>
      </div>
    </aside>
  );
}

