"use client";

import * as React from "react";
import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";

import { Card, CardContent } from "@/components/ui/card";
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

  return (
    <Link
      href={`/me/announcements/${announcement.id}`}
      className="group block rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-primary"
      aria-label={announcement.title}
    >
      <Card className="overflow-hidden transition-all hover:border-primary/40 hover:shadow-md">
        <CardContent className="flex items-stretch gap-0 p-0">
          <div className="flex w-20 shrink-0 flex-col items-center justify-center gap-0.5 border-r bg-surface-container-high/40 p-3">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-on-surface-variant">
              {formatJakarta(announcement.publishedAt, "EEE")}
            </span>
            <span className="text-2xl font-bold leading-none tabular-nums text-on-surface">
              {formatJakarta(announcement.publishedAt, "dd")}
            </span>
            <span className="text-[10px] font-medium uppercase tracking-wider text-on-surface-variant">
              {formatJakarta(announcement.publishedAt, "MMM")}
            </span>
          </div>
          <div className="flex min-w-0 flex-1 items-center gap-3 p-4">
            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold leading-tight line-clamp-1 group-hover:text-primary transition-colors">
                  {announcement.title}
                </h3>
                {isFresh ? (
                  <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
                    {t("new")}
                  </span>
                ) : null}
              </div>
              <p className="text-xs text-on-surface-variant">
                {formatJakarta(announcement.publishedAt, "HH:mm")} WIB
              </p>
              <p className="line-clamp-2 text-sm text-on-surface-variant">
                {excerpt(announcement.body)}
              </p>
            </div>
            <ArrowRight className="h-5 w-5 shrink-0 text-on-surface-variant transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
