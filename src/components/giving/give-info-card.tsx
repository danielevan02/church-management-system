import * as React from "react";
import { Landmark, QrCode } from "lucide-react";

import { BlockSection } from "@/components/m3/block-section";
import { EmptyState } from "@/components/m3/empty-state";
import { ExpressiveCard } from "@/components/m3/expressive-card";
import { CopyButton } from "@/components/giving/copy-button";
import { QrisImage } from "@/components/giving/qris-image";

type Props = {
  title: string;
  description: string;
  /** Defaults to a QR mark; the giving pages pass their own module icon. */
  icon?: React.ComponentType<{ className?: string }>;
  bank: {
    name: string;
    accountNumber: string;
    accountHolder: string;
    qrisImagePath: string;
  };
  labels: {
    qrisLabel: string;
    qrisAlt: string;
    bankAccount: string;
    accountHolder: string;
    accountNumberCopy: string;
    notConfigured: string;
  };
};

export function GiveInfoCard({
  title,
  description,
  icon = QrCode,
  bank,
  labels,
}: Props) {
  const hasBank = bank.accountNumber && bank.accountHolder;

  return (
    <BlockSection
      icon={icon}
      title={title}
      description={description}
      bodyClassName="grid grid-cols-1 gap-4 md:grid-cols-2"
    >
      <div className="flex flex-col items-center gap-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-primary">
          {labels.qrisLabel}
        </span>
        {/* White, not a surface token: a payment QR is scanned by strangers'
            cameras and needs its full quiet-zone contrast. */}
        <div className="overflow-hidden rounded-2xl bg-white p-3 shadow-level-1">
          <QrisImage src={bank.qrisImagePath} alt={labels.qrisAlt} />
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
          {labels.bankAccount}
        </span>
        {hasBank ? (
          <ExpressiveCard tone="nested" padding="compact" className="gap-2">
            <div className="flex items-center gap-2">
              <Landmark className="h-4 w-4 shrink-0 text-primary" />
              <span className="text-lg font-bold text-on-surface">
                {bank.name}
              </span>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-mono text-lg font-bold tabular-nums text-on-surface">
                {bank.accountNumber}
              </span>
              <CopyButton
                value={bank.accountNumber}
                label={labels.accountNumberCopy}
              />
            </div>
            <div className="text-sm text-on-surface-variant">
              {labels.accountHolder}: {bank.accountHolder}
            </div>
          </ExpressiveCard>
        ) : (
          <EmptyState
            icon={Landmark}
            tone="quiet"
            title={labels.notConfigured}
            className="rounded-2xl bg-surface-container-high px-4 py-8"
          />
        )}
      </div>
    </BlockSection>
  );
}
