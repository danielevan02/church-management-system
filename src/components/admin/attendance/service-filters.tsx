"use client";

import { Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ANY = "_any";

const TYPE_VALUES = [
  "SUNDAY_SERVICE",
  "PRAYER_MEETING",
  "YOUTH",
  "CHILDREN",
  "SPECIAL",
  "OTHER",
] as const;

const typeKey: Record<(typeof TYPE_VALUES)[number], string> = {
  SUNDAY_SERVICE: "sundayService",
  PRAYER_MEETING: "prayerMeeting",
  YOUTH: "youth",
  CHILDREN: "children",
  SPECIAL: "special",
  OTHER: "other",
};

export function ServiceFilters() {
  const t = useTranslations("services.list.filters");
  const tType = useTranslations("services.type");
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [q, setQ] = useState(sp.get("q") ?? "");

  function pushParams(patch: Record<string, string | null>) {
    const params = new URLSearchParams(sp.toString());
    Object.entries(patch).forEach(([k, v]) => {
      if (v === null || v === "" || v === ANY) params.delete(k);
      else params.set(k, v);
    });
    params.delete("page");
    startTransition(() => {
      const qs = params.toString();
      router.push(qs ? `${pathname}?${qs}` : pathname);
    });
  }

  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          pushParams({ q });
        }}
        className="flex flex-1 items-center gap-2"
      >
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t("searchPlaceholder")}
            className="pl-9"
          />
        </div>
        <Button type="submit" variant="secondary" disabled={pending}>
          {t("search")}
        </Button>
      </form>

      <Select
        value={sp.get("type") ?? ANY}
        onValueChange={(v) => pushParams({ type: v })}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder={t("type")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ANY}>{t("anyType")}</SelectItem>
          {TYPE_VALUES.map((v) => (
            <SelectItem key={v} value={v}>
              {tType(typeKey[v])}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={sp.get("status") ?? ANY}
        onValueChange={(v) => pushParams({ status: v })}
      >
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder={t("status")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ANY}>{t("anyStatus")}</SelectItem>
          <SelectItem value="active">{t("statusActive")}</SelectItem>
          <SelectItem value="inactive">{t("statusInactive")}</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
