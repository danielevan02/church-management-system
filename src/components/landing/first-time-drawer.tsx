"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { ArrowUpRight, HelpCircle } from "lucide-react";

import { Sheet } from "./sheet";

const KEYS = ["dress", "kids", "parking", "facilities", "late", "language"] as const;

/**
 * The anxiety-relief drawer. Deliberately not an accordion of marketing copy:
 * every answer is a specific, checkable fact, because the questions it answers
 * are the ones that actually stop someone walking in.
 */
export function FirstTimeDrawer({ whatsappHref }: { whatsappHref: string }) {
  const t = useTranslations("lp.firstTime");
  const tn = useTranslations("lp.schedule");
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="sm-firsttime-trigger"
      >
        <HelpCircle className="h-4 w-4" aria-hidden />
        <span className="sm-action">{t("trigger")}</span>
      </button>

      <Sheet
        open={open}
        onClose={() => setOpen(false)}
        title={t("close")}
        labelledBy="sm-firsttime-title"
      >
        <div className="flex flex-col gap-8">
          <header className="flex flex-col gap-3 pr-12">
            <p className="sm-label sm-eyebrow">{t("trigger")}</p>
            <h2 id="sm-firsttime-title" className="sm-h2">
              {t("title")}
            </h2>
            <p className="sm-body" style={{ color: "var(--sm-ink-2)" }}>
              {t("lead")}
            </p>
          </header>

          <dl className="flex flex-col">
            {KEYS.map((k, i) => (
              <div key={k} className="sm-qa sm-rule-t">
                <dt className="sm-qa-q">
                  <span className="sm-label sm-qa-index">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="sm-h4">{t(`items.${k}.q`)}</span>
                </dt>
                <dd className="sm-body sm-qa-a">{t(`items.${k}.a`)}</dd>
              </div>
            ))}
          </dl>

          {whatsappHref ? (
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="sm-btn sm-btn-solid sm-action self-start"
            >
              {tn("askSecretariat")}
              <ArrowUpRight className="h-4 w-4" aria-hidden />
            </a>
          ) : null}
        </div>
      </Sheet>
    </>
  );
}
