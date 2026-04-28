import { format } from "date-fns";
import { Calendar, Home, Users, UsersRound } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { notFound, redirect } from "next/navigation";

import { SearchForm } from "./search-form";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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

  const results = q.trim().length >= 2 ? await searchAll(q) : null;
  const totalHits = results
    ? results.members.length +
      results.households.length +
      results.cellGroups.length +
      results.events.length
    : 0;

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground">{t("subtitle")}</p>
      </header>

      <SearchForm initialQuery={q} />

      {q.trim().length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            {t("hintEmpty")}
          </CardContent>
        </Card>
      ) : q.trim().length < 2 ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            {t("hintShort")}
          </CardContent>
        </Card>
      ) : results && totalHits === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            {t("noResults", { query: q })}
          </CardContent>
        </Card>
      ) : results ? (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground">
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
                  className="flex items-center gap-3 rounded-md border p-3 hover:bg-muted/50"
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
                    <span className="text-xs text-muted-foreground">
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
                  className="flex items-center justify-between rounded-md border p-3 hover:bg-muted/50"
                >
                  <span className="text-sm font-medium">{h.name}</span>
                  <span className="text-xs text-muted-foreground">
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
                  className="flex items-center justify-between rounded-md border p-3 hover:bg-muted/50"
                >
                  <span className="text-sm font-medium">{g.name}</span>
                  <span className="text-xs text-muted-foreground">
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
                  className="flex items-center justify-between rounded-md border p-3 hover:bg-muted/50"
                >
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{e.title}</span>
                    {e.location ? (
                      <span className="text-xs text-muted-foreground">
                        {e.location}
                      </span>
                    ) : null}
                  </div>
                  <span className="text-xs tabular-nums text-muted-foreground">
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Icon className="h-5 w-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">{children}</CardContent>
    </Card>
  );
}

