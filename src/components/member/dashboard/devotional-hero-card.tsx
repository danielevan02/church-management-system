"use client";

import * as React from "react";
import { ArrowRight, BookOpen, ExternalLink, X } from "lucide-react";
import { useTranslations } from "next-intl";

import { ContainerTransform } from "@/components/m3/container-transform";
import { MarkdownContent } from "@/components/shared/markdown-content";
import { Button } from "@/components/ui/button";
import { formatJakarta } from "@/lib/datetime";
import { Link } from "@/lib/i18n/navigation";
import { excerpt } from "@/lib/markdown";

export type DevotionalHeroCardProps = {
  devotional: {
    id: string;
    title: string;
    verseRef: string | null;
    body: string;
    authorName: string | null;
    publishedAt: Date;
  };
};

export function DevotionalHeroCard({ devotional }: DevotionalHeroCardProps) {
  const t = useTranslations("dashboard.member");

  const cardPreview = (
    <div className="group relative overflow-hidden rounded-3xl bg-surface-container-low p-5 sm:p-6 transition-all duration-200 hover:bg-surface-container active:scale-[0.99] shadow-level-0">
      <BookOpen
        aria-hidden
        className="pointer-events-none absolute -right-4 -bottom-4 h-32 w-32 text-primary/[0.04] transition-transform duration-300 group-hover:scale-110 select-none"
      />
      <div className="relative flex flex-col gap-2.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary-container px-3 py-1 text-xs font-semibold text-on-secondary-container">
              <BookOpen className="h-3.5 w-3.5" />
              {t("devotionalToday.label")}
            </span>
          </div>
          <span className="text-xs font-medium text-on-surface-variant">
            {formatJakarta(devotional.publishedAt, "dd MMM yyyy")}
          </span>
        </div>

        <div className="space-y-1">
          <h3 className="text-lg sm:text-xl font-bold tracking-tight text-on-surface leading-snug">
            {devotional.title}
          </h3>
          {devotional.verseRef || devotional.authorName ? (
            <div className="flex flex-wrap items-center gap-2 text-xs">
              {devotional.verseRef ? (
                <span className="inline-flex items-center rounded-md bg-surface-container px-2 py-0.5 font-semibold text-primary">
                  {devotional.verseRef}
                </span>
              ) : null}
              {devotional.authorName ? (
                <span className="text-on-surface-variant">
                  — {devotional.authorName}
                </span>
              ) : null}
            </div>
          ) : null}
        </div>

        <p className="line-clamp-2 sm:line-clamp-3 text-xs sm:text-sm leading-relaxed text-on-surface-variant">
          {excerpt(devotional.body, 180)}
        </p>

        <div className="pt-1">
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary transition-transform group-hover:translate-x-1">
            {t("devotionalToday.read")}
            <ArrowRight className="h-3.5 w-3.5" />
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <ContainerTransform
      title={devotional.title}
      triggerContent={cardPreview}
      maxWidth={720}
      trigger={({ open, isOpen, ref }) => (
        <div
          ref={ref}
          onClick={open}
          tabIndex={0}
          role="button"
          aria-haspopup="dialog"
          data-m3-origin-hidden={isOpen ? "true" : undefined}
          style={
            isOpen
              ? {
                  visibility: "hidden",
                  opacity: 0,
                  transition: "none",
                  pointerEvents: "none",
                }
              : undefined
          }
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              open();
            }
          }}
          className="group block cursor-pointer rounded-3xl outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          {cardPreview}
        </div>
      )}
    >
      {({ close }) => (
        <div className="flex max-h-[88vh] flex-col p-6 sm:p-8">
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary-container px-3 py-1 text-xs font-semibold text-on-secondary-container">
                  <BookOpen className="h-3.5 w-3.5" />
                  {t("devotionalToday.label")}
                </span>
                <span className="text-xs text-on-surface-variant">
                  {formatJakarta(
                    devotional.publishedAt,
                    "EEEE, dd MMMM yyyy"
                  )}
                </span>
              </div>
              <h2 className="text-2xl font-bold leading-tight text-on-surface sm:text-3xl">
                {devotional.title}
              </h2>
              {devotional.verseRef || devotional.authorName ? (
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pt-1 text-xs">
                  {devotional.verseRef ? (
                    <span className="inline-flex items-center rounded-md bg-surface-container px-2 py-0.5 font-semibold text-primary">
                      {devotional.verseRef}
                    </span>
                  ) : null}
                  {devotional.authorName ? (
                    <span className="text-on-surface-variant">
                      — {devotional.authorName}
                    </span>
                  ) : null}
                </div>
              ) : null}
            </div>
            <Button
              variant="text"
              size="icon"
              onClick={close}
              aria-label="Tutup renungan"
              className="rounded-full"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="my-4 h-px bg-outline-variant/30" />

          {/* Devotional Body */}
          <div className="overflow-y-auto pr-1">
            <MarkdownContent source={devotional.body} />
          </div>

          {/* Footer */}
          <div className="mt-6 flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-outline-variant/30">
            <Button asChild variant="ghost" size="sm" className="rounded-full text-xs">
              <Link href={`/me/devotionals/${devotional.id}`}>
                <ExternalLink className="h-4 w-4" />
                <span>Buka Halaman Lengkap</span>
              </Link>
            </Button>
            <Button variant="tonal" onClick={close} className="rounded-full px-5 text-xs">
              Tutup
            </Button>
          </div>
        </div>
      )}
    </ContainerTransform>
  );
}
