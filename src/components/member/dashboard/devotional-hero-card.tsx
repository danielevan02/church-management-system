"use client";

import * as React from "react";
import { ArrowRight, BookOpen } from "lucide-react";
import { useTranslations } from "next-intl";

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

  return (
    <Link
      href={`/me/devotionals/${devotional.id}`}
      className="group relative block overflow-hidden rounded-3xl bg-surface-container-low p-5 sm:p-6 transition-all duration-200 hover:bg-surface-container hover:shadow-level-1 active:scale-[0.99] shadow-level-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      aria-label={`${t("devotionalToday.label")}: ${devotional.title}`}
    >
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
          <h3 className="text-lg sm:text-xl font-bold tracking-tight text-on-surface leading-snug group-hover:text-primary transition-colors">
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
    </Link>
  );
}
