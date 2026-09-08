import { Baby, CheckCircle2, Clock, Heart } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { notFound, redirect } from "next/navigation";

import { BlockRow } from "@/components/m3/block-section";
import { EmptyState } from "@/components/m3/empty-state";
import { ExpressiveCard } from "@/components/m3/expressive-card";
import { PageHeader } from "@/components/m3/page-header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
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
    <div suppressHydrationWarning data-stagger="sections" className="flex flex-col gap-6 pb-28 sm:pb-12">
      <PageHeader
        eyebrow={t("eyebrow")}
        title={t("title")}
        subtitle={t("subtitle")}
      />

      {children.length === 0 ? (
        <EmptyState
          icon={Heart}
          title={t("empty")}
          description={t("emptyHint")}
        />
      ) : (
        <div suppressHydrationWarning data-stagger="cards" className="flex flex-col gap-4">
          {children.map((child, i) => {
            const history = histories[i] ?? [];
            const age = child.birthDate ? computeAge(child.birthDate) : null;
            return (
              <ExpressiveCard key={child.id} className="gap-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    {child.photoUrl ? (
                      <AvatarImage src={child.photoUrl} alt={child.fullName} />
                    ) : null}
                    <AvatarFallback className="text-sm">
                      {child.fullName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <h2 className="truncate text-base font-bold text-on-surface">
                      {child.fullName}
                    </h2>
                    <p className="text-xs text-on-surface-variant">
                      {age != null ? t("age", { age }) : t("noAge")}
                    </p>
                  </div>
                </div>

                {history.length === 0 ? (
                  <EmptyState
                    icon={Baby}
                    tone="quiet"
                    title={t("noHistory")}
                    className="py-6"
                  />
                ) : (
                  <div className="space-y-2">
                    {history.map((h) => (
                      <BlockRow key={h.id}>
                        <div className="flex min-w-0 flex-col">
                          <span className="truncate text-sm font-bold text-on-surface">
                            {h.childClass.name}
                          </span>
                          <span className="text-xs tabular-nums text-on-surface-variant">
                            {formatJakarta(
                              h.checkedInAt,
                              "EEE dd MMM yyyy, HH:mm",
                            )}
                          </span>
                        </div>
                        {h.checkedOutAt ? (
                          <Badge variant="default" className="shrink-0">
                            <CheckCircle2 className="h-3 w-3" />
                            {formatJakarta(h.checkedOutAt, "HH:mm")}
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="shrink-0">
                            <Clock className="h-3 w-3" />
                            {t("active")}
                          </Badge>
                        )}
                      </BlockRow>
                    ))}
                  </div>
                )}
              </ExpressiveCard>
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
