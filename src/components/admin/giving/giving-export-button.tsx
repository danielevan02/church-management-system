"use client";

import { ChevronDown, Download } from "lucide-react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function GivingExportButton() {
  const t = useTranslations("giving.list");
  const sp = useSearchParams();

  function buildHref(format: "csv" | "xlsx") {
    const params = new URLSearchParams(sp.toString());
    params.set("format", format);
    // We don't paginate the export — drop any page param.
    params.delete("page");
    return `/api/admin/giving/export?${params.toString()}`;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button type="button" variant="outline">
          <Download className="h-4 w-4" />
          {t("export")}
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <a href={buildHref("csv")} download>
            {t("exportCsv")}
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <a href={buildHref("xlsx")} download>
            {t("exportXlsx")}
          </a>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
