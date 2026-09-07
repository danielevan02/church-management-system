"use client";

import * as React from "react";
import { ArrowRight, BookOpen, ExternalLink, X } from "lucide-react";
import { useTranslations } from "next-intl";

import { ContainerTransform } from "@/components/m3/container-transform";
import { MarkdownContent } from "@/components/shared/markdown-content";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
    <Card className="relative overflow-hidden border-primary/20 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent transition-all hover:shadow-md">
      <BookOpen
        aria-hidden
        className="pointer-events-none absolute -right-4 -top-4 h-32 w-32 text-primary/5 transition-transform group-hover:scale-110"
      />
      <CardHeader className="relative space-y-2 pb-3">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-on-primary">
            <BookOpen className="h-3 w-3" />
            {t("devotionalToday.label")}
          </span>
          <span className="text-xs text-on-surface-variant">
            {formatJakarta(devotional.publishedAt, "EEE, dd MMM yyyy")}
          </span>
        </div>
        <CardTitle className="text-2xl leading-tight text-on-surface">
          {devotional.title}
        </CardTitle>
        {devotional.verseRef || devotional.authorName ? (
          <CardDescription className="flex flex-wrap items-center gap-x-3 gap-y-1">
            {devotional.verseRef ? (
              <span className="inline-flex items-center gap-1 rounded border border-primary/30 bg-surface/60 px-2 py-0.5 text-xs font-medium text-primary">
                {devotional.verseRef}
              </span>
            ) : null}
            {devotional.authorName ? (
              <span className="text-xs">— {devotional.authorName}</span>
            ) : null}
          </CardDescription>
        ) : null}
      </CardHeader>
      <CardContent className="relative">
        <p className="line-clamp-3 text-sm leading-relaxed text-on-surface/80">
          {excerpt(devotional.body, 220)}
        </p>
        <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary transition-transform group-hover:translate-x-0.5">
          {t("devotionalToday.read")}
          <ArrowRight className="h-4 w-4" />
        </span>
      </CardContent>
    </Card>
  );

  return (
    <ContainerTransform
      title={devotional.title}
      triggerContent={cardPreview}
      maxWidth={720}
      trigger={({ open, ref }) => (
        <div
          ref={ref}
          onClick={open}
          tabIndex={0}
          role="button"
          aria-haspopup="dialog"
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              open();
            }
          }}
          className="group block cursor-pointer rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          {cardPreview}
        </div>
      )}
    >
      {({ close }) => (
        <div className="flex max-h-[88vh] flex-col p-6">
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-primary px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-on-primary">
                  <BookOpen className="h-3 w-3" />
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
                    <span className="inline-flex items-center gap-1 rounded border border-primary/30 bg-surface/60 px-2 py-0.5 font-medium text-primary">
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
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="my-4 h-px bg-outline-variant/60" />

          {/* Devotional Body */}
          <div className="overflow-y-auto pr-1">
            <MarkdownContent source={devotional.body} />
          </div>

          {/* Footer */}
          <div className="mt-6 flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-outline-variant/40">
            <Button asChild variant="ghost" size="sm">
              <Link href={`/me/devotionals/${devotional.id}`}>
                <ExternalLink className="h-4 w-4" />
                <span>Buka Halaman Lengkap</span>
              </Link>
            </Button>
            <Button variant="outlined" onClick={close}>
              Tutup
            </Button>
          </div>
        </div>
      )}
    </ContainerTransform>
  );
}
