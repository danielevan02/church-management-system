"use client";

import { useTranslations } from "next-intl";

import { DatePicker } from "@/components/shared/date-picker";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter } from "@/lib/i18n/navigation";

const ALL = "_all";

type Props = {
  funds: Array<{ id: string; name: string }>;
  current: {
    fundId?: string;
    method?: string;
    status?: string;
    from?: string;
    to?: string;
  };
};

export function GivingFilters({ funds, current }: Props) {
  const t = useTranslations("giving.filters");
  const tMethod = useTranslations("giving.method");
  const tStatus = useTranslations("giving.status");
  const router = useRouter();

  function setParam(key: string, value: string | null) {
    const url = new URL(window.location.href);
    if (value == null || value === "" || value === ALL) {
      url.searchParams.delete(key);
    } else {
      url.searchParams.set(key, value);
    }
    url.searchParams.delete("page");
    router.push(`${url.pathname}${url.search}`);
  }

  return (
    <div className="grid grid-cols-1 gap-3 rounded-md border p-4 sm:grid-cols-2 lg:grid-cols-5">
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
        <Label className="text-xs">{t("method")}</Label>
        <Select
          value={current.method ?? ALL}
          onValueChange={(v) => setParam("method", v)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>{t("anyMethod")}</SelectItem>
            <SelectItem value="BANK_TRANSFER">{tMethod("bankTransfer")}</SelectItem>
            <SelectItem value="QRIS">{tMethod("qris")}</SelectItem>
            <SelectItem value="EWALLET">{tMethod("ewallet")}</SelectItem>
            <SelectItem value="CASH">{tMethod("cash")}</SelectItem>
            <SelectItem value="CARD">{tMethod("card")}</SelectItem>
            <SelectItem value="OTHER">{tMethod("other")}</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col gap-1">
        <Label className="text-xs">{t("status")}</Label>
        <Select
          value={current.status ?? ALL}
          onValueChange={(v) => setParam("status", v)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>{t("anyStatus")}</SelectItem>
            <SelectItem value="COMPLETED">{tStatus("completed")}</SelectItem>
            <SelectItem value="PENDING">{tStatus("pending")}</SelectItem>
            <SelectItem value="FAILED">{tStatus("failed")}</SelectItem>
            <SelectItem value="REFUNDED">{tStatus("refunded")}</SelectItem>
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
