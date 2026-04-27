import { Plus } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { MemberFilters } from "@/components/admin/members/member-filters";
import { MemberPagination } from "@/components/admin/members/member-pagination";
import { MemberTable } from "@/components/admin/members/member-table";
import { Button } from "@/components/ui/button";
import { Link } from "@/lib/i18n/navigation";
import {
  type MemberFilters as Filters,
  type MemberSort,
  listMembers,
} from "@/server/queries/members";

import type { Gender, MemberStatus } from "@prisma/client";

const STATUS_VALUES: readonly MemberStatus[] = [
  "ACTIVE",
  "INACTIVE",
  "TRANSFERRED",
  "DECEASED",
  "VISITOR",
];

const GENDER_VALUES: readonly Gender[] = ["MALE", "FEMALE"];

const SORT_VALUES: readonly MemberSort[] = [
  "name_asc",
  "name_desc",
  "joined_desc",
  "joined_asc",
  "created_desc",
];

function parseStatus(v: string | null): MemberStatus | undefined {
  return v && (STATUS_VALUES as readonly string[]).includes(v)
    ? (v as MemberStatus)
    : undefined;
}

function parseGender(v: string | null): Gender | undefined {
  return v && (GENDER_VALUES as readonly string[]).includes(v)
    ? (v as Gender)
    : undefined;
}

function parseSort(v: string | null): MemberSort {
  return v && (SORT_VALUES as readonly string[]).includes(v)
    ? (v as MemberSort)
    : "name_asc";
}

export default async function MembersListPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const t = await getTranslations("members");

  const get = (key: string) => {
    const v = sp[key];
    return Array.isArray(v) ? v[0] : v ?? null;
  };

  const filters: Filters = {
    q: get("q") ?? undefined,
    status: parseStatus(get("status")),
    gender: parseGender(get("gender")),
  };
  const sort = parseSort(get("sort"));
  const pageNum = Number.parseInt(get("page") ?? "1", 10);
  const page = Number.isNaN(pageNum) || pageNum < 1 ? 1 : pageNum;

  const result = await listMembers({ filters, sort, page });

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight">
            {t("list.title")}
          </h1>
          <p className="text-muted-foreground">
            {t("list.subtitle", { total: result.total })}
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/members/new">
            <Plus className="h-4 w-4" />
            {t("list.newButton")}
          </Link>
        </Button>
      </header>

      <MemberFilters />

      <MemberTable items={result.items} />

      <MemberPagination
        page={result.page}
        totalPages={result.totalPages}
        total={result.total}
      />
    </div>
  );
}
