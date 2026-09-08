"use client";

import * as React from "react";
import { ExternalLink, HandCoins, X } from "lucide-react";

import { CopyButton } from "@/components/giving/copy-button";
import { QrisImage } from "@/components/giving/qris-image";
import { ContainerTransform } from "@/components/m3/container-transform";
import { Button } from "@/components/ui/button";
import { Link } from "@/lib/i18n/navigation";

export type QuickGivingActionProps = {
  label: string;
  bank: {
    name: string;
    accountNumber: string;
    accountHolder: string;
    qrisImagePath: string;
  };
};

export function QuickGivingAction({ label, bank }: QuickGivingActionProps) {
  const hasBank = bank.accountNumber && bank.accountHolder;

  const tileContent = (
    <div className="group flex h-24 sm:h-28 w-full flex-col items-center justify-center gap-2 rounded-2xl border border-outline-variant/40 bg-surface-container-low px-2 py-3 text-center transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:bg-surface-container hover:shadow-level-1 active:translate-y-0 active:scale-[0.98] shadow-level-0 cursor-pointer">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary transition-all duration-200 group-hover:scale-105 group-hover:bg-primary group-hover:text-on-primary group-hover:shadow-xs">
        <HandCoins className="h-5 w-5 transition-transform" />
      </div>
      <span className="truncate w-full px-1 text-center text-[11px] sm:text-xs font-semibold text-on-surface transition-colors group-hover:text-primary tracking-tight">
        {label}
      </span>
    </div>
  );

  return (
    <ContainerTransform
      title="Persembahan Digital"
      maxWidth={520}
      triggerContent={tileContent}
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
          className="rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-primary w-full"
        >
          {tileContent}
        </div>
      )}
    >
      {({ close }) => (
        <div className="flex flex-col p-5 sm:p-6">
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-lg sm:text-xl font-bold text-on-surface">
                Persembahan Digital
              </h2>
              <p className="text-xs text-on-surface-variant">
                Dukung pelayanan pekerjaan Tuhan dengan sukacita dan ketulusan.
              </p>
            </div>
            <Button
              variant="text"
              size="icon"
              onClick={close}
              aria-label="Tutup persembahan"
              className="rounded-full shrink-0 -mr-1 -mt-1"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="my-3.5 h-px bg-outline-variant/30" />

          {/* Giving Methods */}
          <div className="flex flex-col items-center gap-4">
            {/* QRIS Display */}
            <div className="flex flex-col items-center gap-2">
              <span className="text-[11px] font-semibold text-primary uppercase tracking-wider">
                Scan QRIS Semua Bank / E-Wallet
              </span>
              <div className="overflow-hidden rounded-2xl bg-white p-3 shadow-level-1">
                <QrisImage
                  src={bank.qrisImagePath}
                  alt="QRIS Persembahan"
                  className="h-48 w-48 sm:h-52 sm:w-52 object-contain"
                />
              </div>
            </div>

            {/* Bank Transfer Info */}
            {hasBank ? (
              <div className="w-full rounded-2xl bg-surface-container p-3.5 sm:p-4 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-on-surface-variant">
                    Transfer Bank: {bank.name}
                  </span>
                  <span className="text-on-surface-variant">
                    a.n. {bank.accountHolder}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-base font-bold tabular-nums text-on-surface">
                    {bank.accountNumber}
                  </span>
                  <CopyButton value={bank.accountNumber} label="Salin" />
                </div>
              </div>
            ) : null}
          </div>

          {/* Footer */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-outline-variant/30">
            <Button asChild variant="ghost" size="sm" className="rounded-full text-xs">
              <Link href="/me/giving">
                <ExternalLink className="h-4 w-4" />
                <span>Buka Halaman Lengkap</span>
              </Link>
            </Button>
            <Button
              variant="tonal"
              size="sm"
              onClick={close}
              className="rounded-full px-5 text-xs"
            >
              Tutup
            </Button>
          </div>
        </div>
      )}
    </ContainerTransform>
  );
}
