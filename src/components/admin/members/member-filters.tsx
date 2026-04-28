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

export function MemberFilters() {
  const t = useTranslations("members.filters");
  const tStatus = useTranslations("members.form.status");
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

      <div className="flex flex-wrap items-center gap-2">
        <Select
          value={sp.get("status") ?? ANY}
          onValueChange={(v) => pushParams({ status: v })}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder={t("status")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ANY}>{t("anyStatus")}</SelectItem>
            <SelectItem value="ACTIVE">{tStatus("active")}</SelectItem>
            <SelectItem value="VISITOR">{tStatus("visitor")}</SelectItem>
            <SelectItem value="INACTIVE">{tStatus("inactive")}</SelectItem>
            <SelectItem value="TRANSFERRED">{tStatus("transferred")}</SelectItem>
            <SelectItem value="DECEASED">{tStatus("deceased")}</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={sp.get("gender") ?? ANY}
          onValueChange={(v) => pushParams({ gender: v })}
        >
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder={t("gender")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ANY}>{t("anyGender")}</SelectItem>
            <SelectItem value="MALE">{t("male")}</SelectItem>
            <SelectItem value="FEMALE">{t("female")}</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={sp.get("sort") ?? "name_asc"}
          onValueChange={(v) => pushParams({ sort: v === "name_asc" ? null : v })}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name_asc">{t("sortNameAsc")}</SelectItem>
            <SelectItem value="name_desc">{t("sortNameDesc")}</SelectItem>
            <SelectItem value="joined_desc">{t("sortJoinedDesc")}</SelectItem>
            <SelectItem value="joined_asc">{t("sortJoinedAsc")}</SelectItem>
            <SelectItem value="created_desc">{t("sortNewest")}</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
