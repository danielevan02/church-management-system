"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";

type Props = {
  page: number;
  totalPages: number;
  total: number;
  /**
   * Search-param key to read/write. Default is "page". Use a different key
   * (e.g. "txnPage") when a page hosts multiple paginated tables.
   */
  paramKey?: string;
};

export function Pagination({
  page,
  totalPages,
  total,
  paramKey = "page",
}: Props) {
  const t = useTranslations("common.pagination");
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  function go(target: number) {
    const params = new URLSearchParams(sp.toString());
    if (target <= 1) params.delete(paramKey);
    else params.set(paramKey, String(target));
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }

  if (totalPages <= 1) {
    return (
      <div className="flex items-center justify-end">
        <span className="text-sm text-muted-foreground">
          {t("count", { total })}
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-sm text-muted-foreground">
        {t("summary", { page, totalPages, total })}
      </span>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => go(page - 1)}
        >
          <ChevronLeft className="h-4 w-4" />
          {t("prev")}
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={page >= totalPages}
          onClick={() => go(page + 1)}
        >
          {t("next")}
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
