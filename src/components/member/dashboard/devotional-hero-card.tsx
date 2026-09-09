"use client";

import { useTranslations } from "next-intl";

import { DevotionalCard } from "@/components/devotionals/devotional-card";

import type { DevotionalCardProps } from "@/components/devotionals/devotional-card";

export type DevotionalHeroCardProps = {
  devotional: DevotionalCardProps["devotional"];
};

/**
 * The member dashboard's devotional slot.
 *
 * Nothing but wiring now — the card itself lives in
 * `@/components/devotionals/devotional-card` so the public landing page renders
 * the identical object. This wrapper only exists to supply the dashboard's
 * translation namespace and its link target.
 */
export function DevotionalHeroCard({ devotional }: DevotionalHeroCardProps) {
  const t = useTranslations("dashboard.member");

  return (
    <DevotionalCard
      devotional={devotional}
      href={`/me/devotionals/${devotional.id}`}
      labels={{
        badge: t("devotionalToday.label"),
        read: t("devotionalToday.read"),
      }}
    />
  );
}
