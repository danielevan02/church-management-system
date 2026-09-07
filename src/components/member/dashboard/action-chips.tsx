"use client";

import * as React from "react";
import {
  Baby,
  BookOpen,
  Calendar,
  HandCoins,
  Heart,
  UsersRound,
  type LucideIcon,
} from "lucide-react";

import { Link } from "@/lib/i18n/navigation";

export type ActionChipsProps = {
  hasGiving?: boolean;
  hasDevotionals?: boolean;
  hasChildren?: boolean;
  hasCellGroup?: boolean;
};

type ChipItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

export function ActionChips({
  hasGiving = true,
  hasDevotionals = true,
  hasChildren = false,
  hasCellGroup = true,
}: ActionChipsProps) {
  const chips: ChipItem[] = [
    ...(hasGiving
      ? [{ label: "Persembahan", href: "/me/giving", icon: HandCoins }]
      : []),
    { label: "Pokok Doa", href: "/me/prayer-requests", icon: Heart },
    ...(hasCellGroup
      ? [{ label: "Komsel", href: "/me/cell-group", icon: UsersRound }]
      : []),
    { label: "Acara & Kalender", href: "/me/events", icon: Calendar },
    ...(hasDevotionals
      ? [{ label: "Renungan", href: "/me/devotionals", icon: BookOpen }]
      : []),
    ...(hasChildren
      ? [{ label: "Check-in Anak", href: "/me/children", icon: Baby }]
      : []),
  ];

  return (
    <div
      role="toolbar"
      aria-label="Aksi Cepat Jemaat"
      className="flex items-center gap-2 overflow-x-auto pb-1 pt-0.5 sm:flex-wrap [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      {chips.map((chip) => {
        const Icon = chip.icon;
        return (
          <Link
            key={chip.href}
            href={chip.href}
            className="inline-flex shrink-0 items-center gap-2 rounded-full bg-surface-container px-3.5 py-2 text-xs font-semibold text-on-surface transition-all duration-200 hover:bg-surface-container-high hover:text-primary active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary shadow-level-0"
          >
            <Icon className="h-3.5 w-3.5 text-primary" />
            <span>{chip.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
