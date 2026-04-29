import { CheckCircle2, Clock, Heart } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { notFound, redirect } from "next/navigation";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { features } from "@/config/features";
import { auth } from "@/lib/auth";
import { formatJakarta } from "@/lib/datetime";
import {
  getCheckInsForChild,
  listChildrenForGuardian,
} from "@/server/queries/children";

export default async function MyChildrenPage() {
  if (!features.childrensCheckIn) notFound();

  const session = await auth();
  if (!session?.user) redirect("/auth/sign-in");
  const memberId = session.user.memberId;
  if (!memberId) redirect("/me/dashboard");

  const t = await getTranslations("memberPortal.children");

  const children = await listChildrenForGuardian(memberId);
  const histories = await Promise.all(
    children.map((c) => getCheckInsForChild(c.id, 10)),
  );

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground">{t("subtitle")}</p>
      </header>

      {children.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
            <Heart className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">{t("empty")}</p>
            <p className="text-xs text-muted-foreground">{t("emptyHint")}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-4">
          {children.map((child, i) => {
            const history = histories[i] ?? [];
            const age = child.birthDate ? computeAge(child.birthDate) : null;
            return (
              <Card key={child.id}>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      {child.photoUrl ? (
                        <AvatarImage src={child.photoUrl} alt={child.fullName} />
                      ) : null}
                      <AvatarFallback className="text-sm">
                        {child.fullName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <CardTitle className="text-base">
                        {child.fullName}
                      </CardTitle>
                      <CardDescription>
                        {age != null ? t("age", { age }) : t("noAge")}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {history.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      {t("noHistory")}
                    </p>
                  ) : (
                    <ul className="flex flex-col gap-2 text-sm">
                      {history.map((h) => (
                        <li
                          key={h.id}
                          className="flex items-center justify-between rounded-md border p-3"
                        >
                          <div className="flex flex-col">
                            <span className="font-medium">
                              {h.childClass.name}
                            </span>
                            <span className="text-xs text-muted-foreground tabular-nums">
                              {formatJakarta(h.checkedInAt, "EEE dd MMM yyyy, HH:mm")}
                            </span>
                          </div>
                          {h.checkedOutAt ? (
                            <Badge variant="default">
                              <CheckCircle2 className="h-3 w-3" />
                              {formatJakarta(h.checkedOutAt, "HH:mm")}
                            </Badge>
                          ) : (
                            <Badge variant="outline">
                              <Clock className="h-3 w-3" />
                              {t("active")}
                            </Badge>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

function computeAge(d: Date): number {
  const now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age -= 1;
  return age;
}
