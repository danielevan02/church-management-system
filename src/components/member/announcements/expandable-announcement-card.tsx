"use client";

import * as React from "react";
import { ArrowRight, Clock, Megaphone } from "lucide-react";
import { useTranslations } from "next-intl";

import { formatJakarta } from "@/lib/datetime";
import { Link } from "@/lib/i18n/navigation";
import { excerpt } from "@/lib/markdown";

export type ExpandableAnnouncementCardProps = {
  announcement: {
    id: string;
    title: string;
    body: string;
    publishedAt: Date;
  };
  isFresh?: boolean;
};

export function ExpandableAnnouncementCard({
  announcement,
  isFresh = false,
}: ExpandableAnnouncementCardProps) {
  const t = useTranslations("memberPortal.announcements");
  const isCurrentYear =
    new Date().getFullYear() === new Date(announcement.publishedAt).getFullYear();
  const dateStr = `${formatJakarta(
    announcement.publishedAt,
    isCurrentYear ? "d MMM · HH:mm" : "d MMM yyyy · HH:mm"
  )} WIB`;

  return (
    <Link
      href={`/me/announcements/${announcement.id}`}
      className="group block rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-primary"
      aria-label={announcement.title}
    >
      <article className="flex flex-col gap-2 rounded-2xl border border-outline-variant/35 bg-surface-container-low p-4 sm:p-4.5 shadow-level-0 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:bg-surface-container hover:shadow-level-1 active:translate-y-0 active:scale-[0.995]">
        {/* Meta Bar: Category Badge & Timestamp */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold text-primary">
              <Megaphone className="h-3 w-3" />
              <span>{t("badge")}</span>
            </span>
            {isFresh ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-700 dark:text-emerald-400">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                {t("new")}
              </span>
            ) : null}
          </div>

          <div className="flex items-center gap-1 text-[11px] sm:text-xs text-on-surface-variant font-medium tabular-nums">
            <Clock className="h-3 w-3 text-on-surface-variant/70" />
            <span>{dateStr}</span>
          </div>
        </div>

        {/* Title & Action Indicator */}
        <div className="flex items-start justify-between gap-3 mt-0.5">
          <h3 className="font-bold text-[15px] sm:text-base text-on-surface group-hover:text-primary transition-colors leading-snug line-clamp-2 sm:line-clamp-1">
            {announcement.title}
          </h3>
          <div className="flex h-6 w-6 sm:h-7 sm:w-7 shrink-0 items-center justify-center rounded-full bg-surface-container-high/60 text-on-surface-variant transition-all duration-200 group-hover:bg-primary group-hover:text-on-primary group-hover:shadow-xs">
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </div>
        </div>

        {/* Excerpt Body */}
        <p className="line-clamp-2 text-xs sm:text-sm text-on-surface-variant/90 leading-relaxed">
          {excerpt(announcement.body)}
        </p>
      </article>
    </Link>
  );
}
