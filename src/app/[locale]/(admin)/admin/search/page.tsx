import { format } from "date-fns";
import { Calendar, Home, Users, UsersRound } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { notFound, redirect } from "next/navigation";

import { BlockSection } from "@/components/m3/block-section";
import { ExpressiveCard } from "@/components/m3/expressive-card";
import { SearchForm } from "./search-form";
import { PageHeader } from "@/components/m3/page-header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { auth } from "@/lib/auth";
import { Link } from "@/lib/i18n/navigation";
import { hasAtLeastRole } from "@/lib/permissions";
import { searchAll } from "@/server/queries/search";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/auth/sign-in");
  if (!hasAtLeastRole(session.user.role, "LEADER")) notFound();

  const sp = await searchParams;
  const q = (Array.isArray(sp.q) ? sp.q[0] : sp.q) ?? "";

  const t = await getTranslations("search");

  const tEyebrow = await getTranslations("eyebrow");

  const results = q.trim().length >= 2 ? await searchAll(q) : null;
  const totalHits = results
    ? results.members.length +
      results.households.length +
      results.cellGroups.length +
      results.events.length
    : 0;

  return (
    <div suppressHydrationWarning data-stagger="sections" className="flex flex-col gap-6">
      <PageHeader
        eyebrow={tEyebrow("search")}
        title={t("title")}
        subtitle={t("subtitle")}
      />

      <SearchForm initialQuery={q} />

      {q.trim().length === 0 ? (
        <ExpressiveCard className="py-10 text-center text-sm text-on-surface-variant">
          {t("hintEmpty")}
        </ExpressiveCard>
      ) : q.trim().length < 2 ? (
        <ExpressiveCard className="py-10 text-center text-sm text-on-surface-variant">
          {t("hintShort")}
        </ExpressiveCard>
      ) : results && totalHits === 0 ? (
        <ExpressiveCard className="py-10 text-center text-sm text-on-surface-variant">
          {t("noResults", { query: q })}
        </ExpressiveCard>
      ) : results ? (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-on-surface-variant">
            {t("resultsSummary", { total: totalHits, query: q })}
          </p>

          {results.members.length > 0 ? (
            <ResultGroup
              icon={Users}
              title={t("groups.members", { count: results.members.length })}
            >
              {results.members.map((m) => (
                <Link
                  key={m.id}
                  href={`/admin/members/${m.id}`}
                  className="flex items-center gap-3 rounded-2xl p-3 hover:bg-surface-container-highest bg-surface-container-high"
                >
                  <Avatar className="h-8 w-8">
                    {m.photoUrl ? (
                      <AvatarImage src={m.photoUrl} alt={m.fullName} />
                    ) : null}
                    <AvatarFallback className="text-xs">
                      {m.fullName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{m.fullName}</span>
                    <span className="text-xs text-on-surface-variant">
                      {[m.phone, m.email].filter(Boolean).join(" · ") || "—"}
                    </span>
                  </div>
                </Link>
              ))}
            </ResultGroup>
          ) : null}

          {results.households.length > 0 ? (
            <ResultGroup
              icon={Home}
              title={t("groups.households", { count: results.households.length })}
            >
              {results.households.map((h) => (
                <Link
                  key={h.id}
                  href={`/admin/households/${h.id}`}
                  className="flex items-center justify-between rounded-2xl p-3 hover:bg-surface-container-highest bg-surface-container-high"
                >
                  <span className="text-sm font-medium">{h.name}</span>
                  <span className="text-xs text-on-surface-variant">
                    {t("memberCount", { count: h.memberCount })}
                  </span>
                </Link>
              ))}
            </ResultGroup>
          ) : null}

          {results.cellGroups.length > 0 ? (
            <ResultGroup
              icon={UsersRound}
              title={t("groups.cellGroups", { count: results.cellGroups.length })}
            >
              {results.cellGroups.map((g) => (
                <Link
                  key={g.id}
                  href={`/admin/cell-groups/${g.id}`}
                  className="flex items-center justify-between rounded-2xl p-3 hover:bg-surface-container-highest bg-surface-container-high"
                >
                  <span className="text-sm font-medium">{g.name}</span>
                  <span className="text-xs text-on-surface-variant">
                    {g.leaderName ?? t("noLeader")}
                  </span>
                </Link>
              ))}
            </ResultGroup>
          ) : null}

          {results.events.length > 0 ? (
            <ResultGroup
              icon={Calendar}
              title={t("groups.events", { count: results.events.length })}
            >
              {results.events.map((e) => (
                <Link
                  key={e.id}
                  href={`/admin/events/${e.id}`}
                  className="flex items-center justify-between rounded-2xl p-3 hover:bg-surface-container-highest bg-surface-container-high"
                >
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{e.title}</span>
                    {e.location ? (
                      <span className="text-xs text-on-surface-variant">
                        {e.location}
                      </span>
                    ) : null}
                  </div>
                  <span className="text-xs tabular-nums text-on-surface-variant">
                    {format(e.startsAt, "dd MMM yyyy")}
                  </span>
                </Link>
              ))}
            </ResultGroup>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function ResultGroup({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof Users;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <BlockSection
      icon={Icon}
      title={title}
      bodyClassName="flex flex-col gap-2"
      staggerChildren
    >
      {children}
    </BlockSection>
  );
}

