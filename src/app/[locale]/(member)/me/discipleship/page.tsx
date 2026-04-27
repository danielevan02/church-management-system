import { format } from "date-fns";
import { Sprout } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { auth } from "@/lib/auth";
import { getMilestonesForMember } from "@/server/queries/discipleship";

export default async function MemberDiscipleshipPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/sign-in");
  const memberId = session.user.memberId;
  if (!memberId) redirect("/me/dashboard");

  const t = await getTranslations("memberPortal.discipleship");
  const tType = await getTranslations("discipleship.type");

  const items = await getMilestonesForMember(memberId);

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground">{t("subtitle")}</p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>{t("journeyTitle")}</CardTitle>
          <CardDescription>{t("journeyDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-6 text-center text-sm text-muted-foreground">
              <Sprout className="h-8 w-8" />
              {t("empty")}
            </div>
          ) : (
            <ol className="relative ml-3 flex flex-col gap-4 border-l border-muted pl-6">
              {items.map((m) => (
                <li key={m.id} className="relative">
                  <span className="absolute -left-[31px] flex h-5 w-5 items-center justify-center rounded-full border bg-background">
                    <Sprout className="h-3 w-3" />
                  </span>
                  <div className="flex flex-col gap-1">
                    <Badge variant="outline" className="w-fit">
                      {format(m.achievedAt, "dd MMM yyyy")}
                    </Badge>
                    <span className="font-medium">
                      {tType(typeKey(m.type))}
                    </span>
                    {m.notes ? (
                      <p className="text-sm text-muted-foreground">{m.notes}</p>
                    ) : null}
                  </div>
                </li>
              ))}
            </ol>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function typeKey(type: string): string {
  switch (type) {
    case "DECISION_TO_FOLLOW":
      return "decisionToFollow";
    case "BAPTISM":
      return "baptism";
    case "MEMBERSHIP":
      return "membership";
    case "FOUNDATIONS_CLASS":
      return "foundationsClass";
    case "DISCIPLESHIP_CLASS":
      return "discipleshipClass";
    case "LEADERSHIP_TRAINING":
      return "leadershipTraining";
    case "CELL_GROUP_LEADER":
      return "cellGroupLeader";
    case "MISSION_TRIP":
      return "missionTrip";
    default:
      return "other";
  }
}
