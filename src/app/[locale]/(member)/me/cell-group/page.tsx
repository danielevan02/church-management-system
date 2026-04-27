import { format } from "date-fns";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { auth } from "@/lib/auth";
import { getCellGroupsForMember } from "@/server/queries/cell-groups";

export default async function MemberCellGroupPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/sign-in");
  const memberId = session.user.memberId;
  if (!memberId) redirect("/me/dashboard");

  const t = await getTranslations("memberPortal.cellGroup");
  const tDay = await getTranslations("cellGroups.day");

  const memberships = await getCellGroupsForMember(memberId);

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground">{t("subtitle")}</p>
      </header>

      {memberships.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            {t("empty")}
          </CardContent>
        </Card>
      ) : (
        memberships.map(({ cellGroup, joinedAt }) => (
          <div key={cellGroup.id} className="flex flex-col gap-4">
            <Card>
              <CardHeader>
                <CardTitle>{cellGroup.name}</CardTitle>
                {cellGroup.description ? (
                  <CardDescription>{cellGroup.description}</CardDescription>
                ) : null}
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <Field
                    label={t("dayLabel")}
                    value={
                      cellGroup.meetingDay
                        ? tDay(cellGroup.meetingDay as never)
                        : "—"
                    }
                  />
                  <Field
                    label={t("timeLabel")}
                    value={cellGroup.meetingTime ?? "—"}
                  />
                  <Field
                    label={t("locationLabel")}
                    value={cellGroup.meetingLocation ?? "—"}
                  />
                </div>
                <div className="flex items-center gap-3 rounded-md border p-3">
                  <Avatar className="h-10 w-10">
                    {cellGroup.leader.photoUrl ? (
                      <AvatarImage
                        src={cellGroup.leader.photoUrl}
                        alt={cellGroup.leader.fullName}
                      />
                    ) : null}
                    <AvatarFallback>
                      {cellGroup.leader.fullName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="text-xs text-muted-foreground">
                      {t("leaderLabel")}
                    </span>
                    <span className="font-medium">{cellGroup.leader.fullName}</span>
                    {cellGroup.leader.phone ? (
                      <span className="text-xs text-muted-foreground">
                        {cellGroup.leader.phone}
                      </span>
                    ) : null}
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">
                  {t("memberSince", { date: format(joinedAt, "dd MMM yyyy") })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  {t("membersTitle", { count: cellGroup.members.length })}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="flex flex-col gap-2 text-sm">
                  {cellGroup.members.map((m) => (
                    <li
                      key={m.id}
                      className="flex items-center gap-3 rounded-md border p-2"
                    >
                      <Avatar className="h-8 w-8">
                        {m.member.photoUrl ? (
                          <AvatarImage
                            src={m.member.photoUrl}
                            alt={m.member.fullName}
                          />
                        ) : null}
                        <AvatarFallback className="text-xs">
                          {m.member.fullName.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{m.member.fullName}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        ))
      )}
    </div>
  );
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-md border p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="font-medium">{value}</div>
    </div>
  );
}
