import { Plus } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { PageHeader } from "@/components/m3/page-header";
import { MemberFilters } from "@/components/admin/members/member-filters";
import { MemberTable } from "@/components/admin/members/member-table";
import { Pagination } from "@/components/shared/pagination";
import { Button } from "@/components/ui/button";
import { Link } from "@/lib/i18n/navigation";
import {
  type MemberFilters as Filters,
  type MemberSort,
  listMembers,
} from "@/server/queries/members";
import { parsePageParam } from "@/server/queries/_pagination";

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
  const tEyebrow = await getTranslations("eyebrow");

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
  const page = parsePageParam(sp.page);

  const result = await listMembers({ filters, sort, page });

  return (
    <div suppressHydrationWarning data-stagger="sections" className="flex flex-col gap-6">
      <PageHeader
        eyebrow={tEyebrow("members")}
        title={t("list.title")}
        subtitle={t("list.subtitle", { total: result.total })}
        action={
          <Button asChild>
            <Link href="/admin/members/new">
              <Plus className="h-4 w-4" />
              {t("list.newButton")}
            </Link>
          </Button>
        }
      />

      <MemberFilters />

      <MemberTable items={result.items} />

      <Pagination
        page={result.page}
        totalPages={result.totalPages}
        total={result.total}
      />
    </div>
  );
}
