import { format } from "date-fns";
import { HeartHandshake } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";

import { MemberAssignmentActions } from "@/components/member/volunteer/member-assignment-actions";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { auth } from "@/lib/auth";
import {
  getAssignmentHistoryForMember,
  getAssignmentsForMember,
} from "@/server/queries/volunteers";

export default async function MemberVolunteerPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/sign-in");
  const memberId = session.user.memberId;
  if (!memberId) redirect("/me/dashboard");

  const t = await getTranslations("memberPortal.volunteer");
  const tStatus = await getTranslations("volunteers.assignmentStatus");

  const [upcoming, history] = await Promise.all([
    getAssignmentsForMember(memberId, 25),
    getAssignmentHistoryForMember(memberId, 25),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground">{t("subtitle")}</p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>{t("upcomingTitle")}</CardTitle>
          <CardDescription>{t("upcomingDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          {upcoming.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-6 text-center text-sm text-muted-foreground">
              <HeartHandshake className="h-8 w-8" />
              {t("upcomingEmpty")}
            </div>
          ) : (
            <ul className="flex flex-col gap-3">
              {upcoming.map((a) => (
                <li
                  key={a.id}
                  className="flex flex-col gap-2 rounded-md border p-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex flex-col">
                    <span className="font-medium">{a.team.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {format(a.serviceDate, "EEE dd MMM yyyy")}
                      {a.position ? ` · ${a.position.name}` : ""}
                    </span>
                    {a.notes ? (
                      <span className="mt-1 text-xs">{a.notes}</span>
                    ) : null}
                  </div>
                  <div className="flex flex-col items-end gap-2 sm:items-center sm:gap-3">
                    <Badge>
                      {tStatus(a.status.toLowerCase() as never)}
                    </Badge>
                    <MemberAssignmentActions id={a.id} status={a.status as never} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {history.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>{t("historyTitle")}</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="flex flex-col gap-2 text-sm">
              {history.map((a) => (
                <li
                  key={a.id}
                  className="flex items-center justify-between gap-2 rounded-md border p-3"
                >
                  <div className="flex flex-col">
                    <span className="font-medium">{a.team.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {format(a.serviceDate, "EEE dd MMM yyyy")}
                      {a.position ? ` · ${a.position.name}` : ""}
                    </span>
                  </div>
                  <Badge variant="outline">
                    {tStatus(a.status.toLowerCase() as never)}
                  </Badge>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
