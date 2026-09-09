"use client";

import * as React from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { ArrowUpRight, Check, Copy, QrCode } from "lucide-react";

type Tab = "qris" | "bank";
const TABS: readonly Tab[] = ["qris", "bank"];

export function GivingPanel({
  bank,
  qrisSrc,
  confirmHref,
}: {
  bank: { name: string; accountNumber: string; accountHolder: string };
  /** Null when no QRIS image is present in `public/` for this deployment. */
  qrisSrc: string | null;
  confirmHref: string;
}) {
  const t = useTranslations("lp.giving");
  const [tab, setTab] = React.useState<Tab>(qrisSrc ? "qris" : "bank");
  const tabRefs = React.useRef<Record<Tab, HTMLButtonElement | null>>({
    qris: null,
    bank: null,
  });

  /* Roving arrow-key navigation, which is what makes a tablist a tablist
   * rather than two buttons with the right role attributes on them. */
  const onKeyDown = (e: React.KeyboardEvent) => {
    const i = TABS.indexOf(tab);
    let next: Tab | null = null;
    if (e.key === "ArrowRight") next = TABS[(i + 1) % TABS.length];
    if (e.key === "ArrowLeft") next = TABS[(i - 1 + TABS.length) % TABS.length];
    if (e.key === "Home") next = TABS[0];
    if (e.key === "End") next = TABS[TABS.length - 1];
    if (!next) return;
    e.preventDefault();
    setTab(next);
    tabRefs.current[next]?.focus();
  };

  return (
    <div className="sm-give">
      <div
        role="tablist"
        aria-label={t("open")}
        onKeyDown={onKeyDown}
        className="sm-give-tabs"
      >
        {TABS.map((key) => (
          <button
            key={key}
            ref={(el) => {
              tabRefs.current[key] = el;
            }}
            type="button"
            role="tab"
            id={`sm-give-tab-${key}`}
            aria-selected={tab === key}
            aria-controls={`sm-give-panel-${key}`}
            tabIndex={tab === key ? 0 : -1}
            onClick={() => setTab(key)}
            className="sm-give-tab sm-label-lg"
          >
            {t(key === "qris" ? "qrisTab" : "bankTab")}
          </button>
        ))}
      </div>

      <div
        role="tabpanel"
        id="sm-give-panel-qris"
        aria-labelledby="sm-give-tab-qris"
        hidden={tab !== "qris"}
        className="sm-give-panel"
      >
        {qrisSrc ? (
          <div className="sm-give-qris">
            <div className="sm-give-qris-plate">
              <Image
                src={qrisSrc}
                alt={t("qrisAlt")}
                width={420}
                height={420}
                sizes="(max-width: 48rem) 60vw, 20rem"
              />
            </div>
            <div className="flex flex-col gap-2">
              <h3 className="sm-h4">{t("qrisTitle")}</h3>
              <p className="sm-body" style={{ color: "var(--sm-ink-2)" }}>
                {t("qrisBody")}
              </p>
            </div>
          </div>
        ) : (
          /* Not a dead panel: it says what is missing and hands over to the
             method that does work, which is the only honest thing to render
             when a deployment has not uploaded its code yet. */
          <div className="sm-give-empty">
            <QrCode className="h-6 w-6" aria-hidden />
            <p className="sm-body">{t("qrisMissing")}</p>
            <button
              type="button"
              onClick={() => {
                setTab("bank");
                tabRefs.current.bank?.focus();
              }}
              className="sm-btn sm-btn-ghost sm-btn-sm sm-action self-start"
            >
              {t("bankTab")}
            </button>
          </div>
        )}
      </div>

      <div
        role="tabpanel"
        id="sm-give-panel-bank"
        aria-labelledby="sm-give-tab-bank"
        hidden={tab !== "bank"}
        className="sm-give-panel"
      >
        <dl className="sm-give-rows">
          <Row label={t("bankLabel")} value={bank.name} />
          <CopyRow
            label={t("accountLabel")}
            value={bank.accountNumber}
            display={bank.accountNumber.replace(/(\d{4})(?=\d)/g, "$1 ")}
            emphasis
          />
          <CopyRow label={t("holderLabel")} value={bank.accountHolder} />
        </dl>
        {confirmHref ? (
          <a
            href={confirmHref}
            target="_blank"
            rel="noopener noreferrer"
            className="sm-btn sm-btn-ghost sm-btn-sm sm-action self-start"
          >
            {t("confirm")}
            <ArrowUpRight className="h-4 w-4" aria-hidden />
          </a>
        ) : null}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="sm-give-row">
      <dt className="sm-label sm-eyebrow">{label}</dt>
      <dd className="sm-h4">{value}</dd>
    </div>
  );
}

function CopyRow({
  label,
  value,
  display,
  emphasis = false,
}: {
  label: string;
  value: string;
  display?: string;
  emphasis?: boolean;
}) {
  const t = useTranslations("lp.giving");
  const [state, setState] = React.useState<"idle" | "done" | "failed">("idle");

  React.useEffect(() => {
    if (state === "idle") return;
    const id = setTimeout(() => setState("idle"), 2400);
    return () => clearTimeout(id);
  }, [state]);

  const copy = async () => {
    try {
      // `writeText` rejects outside a secure context and when the permission
      // is refused, so the failure branch is a real state, not defensive
      // padding — the visitor is told to copy it by hand instead.
      await navigator.clipboard.writeText(value);
      setState("done");
    } catch {
      setState("failed");
    }
  };

  return (
    <div className="sm-give-row">
      <dt className="sm-label sm-eyebrow">{label}</dt>
      <dd className="sm-give-row-value">
        <span className={emphasis ? "sm-account" : "sm-h4"}>
          {display ?? value}
        </span>
        <button type="button" onClick={copy} className="sm-give-copy sm-label">
          {state === "done" ? (
            <Check className="h-3.5 w-3.5" aria-hidden />
          ) : (
            <Copy className="h-3.5 w-3.5" aria-hidden />
          )}
          {state === "done" ? t("copied") : t("copy")}
        </button>
        {/* Announced rather than only coloured, so the outcome of the copy is
            available to a screen reader too. */}
        <span role="status" aria-live="polite" className="sr-only">
          {state === "done" ? t("copied") : state === "failed" ? t("copyFailed") : ""}
        </span>
        {state === "failed" ? (
          <span className="sm-small sm-give-failed">{t("copyFailed")}</span>
        ) : null}
      </dd>
    </div>
  );
}
