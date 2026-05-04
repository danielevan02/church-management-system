import { ArrowLeft } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { notFound, redirect } from "next/navigation";

import { PasswordResetForm } from "@/components/admin/settings/password-reset-form";
import { UserEditForm } from "@/components/admin/settings/user-edit-form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { auth } from "@/lib/auth";
import { Link } from "@/lib/i18n/navigation";
import { hasAtLeastRole } from "@/lib/permissions";
import { getUser } from "@/server/queries/users";

export default async function EditUserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/auth/sign-in");
  if (!hasAtLeastRole(session.user.role, "ADMIN")) notFound();

  const { id } = await params;
  const user = await getUser(id);
  if (!user) notFound();

  const t = await getTranslations("settings.users");

  const isSelf = user.id === session.user.id;

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <Button asChild variant="ghost" size="sm" className="w-fit">
          <Link href="/admin/settings/users">
            <ArrowLeft className="h-4 w-4" />
            {t("back")}
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">
          {user.username ?? user.member?.fullName ?? t("editTitle")}
        </h1>
        <p className="text-muted-foreground">{t("editSubtitle")}</p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("editFormTitle")}</CardTitle>
          <CardDescription>{t("editFormDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <UserEditForm
            id={user.id}
            submitLabel={t("submitUpdate")}
            initialValues={{
              role: user.role,
              isActive: user.isActive,
              memberId: user.memberId ?? "",
            }}
            initialMemberName={user.member?.fullName ?? null}
            isSelf={isSelf}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {t("passwordReset.title")}
          </CardTitle>
          <CardDescription>{t("passwordReset.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <PasswordResetForm id={user.id} />
        </CardContent>
      </Card>
    </div>
  );
}
