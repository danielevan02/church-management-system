"use client";

import { useTranslations } from "next-intl";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { DatePicker } from "@/components/shared/date-picker";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ALL = "_all";

const SERVICE_TYPES: ReadonlyArray<{ value: string; key: string }> = [
  { value: "SUNDAY_MORNING", key: "sundayMorning" },
  { value: "SUNDAY_EVENING", key: "sundayEvening" },
  { value: "MIDWEEK", key: "midweek" },
  { value: "YOUTH", key: "youth" },
  { value: "CHILDREN", key: "children" },
  { value: "SPECIAL", key: "special" },
  { value: "OTHER", key: "other" },
];

type Props = {
  funds: Array<{ id: string; name: string }>;
  current: {
    fundId?: string;
    serviceType?: string;
    from?: string;
    to?: string;
  };
};

export function GivingFilters({ funds, current }: Props) {
  const t = useTranslations("giving.filters");
  const tServiceType = useTranslations("services.type");
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  function setParam(key: string, value: string | null) {
    const params = new URLSearchParams(sp.toString());
    if (value == null || value === "" || value === ALL) {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    params.delete("page");
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }

  return (
    <div className="grid grid-cols-1 gap-3 rounded-md border p-4 sm:grid-cols-2 lg:grid-cols-4">
      <div className="flex flex-col gap-1">
        <Label className="text-xs">{t("fund")}</Label>
        <Select
          value={current.fundId ?? ALL}
          onValueChange={(v) => setParam("fundId", v)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>{t("anyFund")}</SelectItem>
            {funds.map((f) => (
              <SelectItem key={f.id} value={f.id}>
                {f.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col gap-1">
        <Label className="text-xs">{t("serviceType")}</Label>
        <Select
          value={current.serviceType ?? ALL}
          onValueChange={(v) => setParam("serviceType", v)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>{t("anyServiceType")}</SelectItem>
            {SERVICE_TYPES.map((t) => (
              <SelectItem key={t.value} value={t.value}>
                {tServiceType(t.key as never)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col gap-1">
        <Label className="text-xs">{t("from")}</Label>
        <DatePicker
          value={current.from ?? ""}
          onChange={(v) => setParam("from", v || null)}
          clearable
        />
      </div>
      <div className="flex flex-col gap-1">
        <Label className="text-xs">{t("to")}</Label>
        <DatePicker
          value={current.to ?? ""}
          onChange={(v) => setParam("to", v || null)}
          clearable
        />
      </div>
    </div>
  );
}
