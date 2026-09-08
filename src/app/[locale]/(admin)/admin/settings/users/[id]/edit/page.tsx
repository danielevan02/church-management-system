
import { getTranslations } from "next-intl/server";
import { notFound, redirect } from "next/navigation";

import { BlockSection } from "@/components/m3/block-section";
import { PageHeader } from "@/components/m3/page-header";
import { PasswordResetForm } from "@/components/admin/settings/password-reset-form";
import { UserEditForm } from "@/components/admin/settings/user-edit-form";

import { auth } from "@/lib/auth";

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
    <div suppressHydrationWarning data-stagger="sections" className="flex flex-col gap-6">
      <PageHeader
        backHref="/admin/settings/users"
        backLabel={t("back")}
        title={
          <span className={user.username ? "uppercase" : undefined}>
            {user.username ?? user.member?.fullName ?? t("editTitle")}
          </span>
        }
        subtitle={t("editSubtitle")}
      />

      <BlockSection
        title={t("editFormTitle")}
        description={t("editFormDescription")}
      >
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
      </BlockSection>

      <BlockSection
        title={t("passwordReset.title")}
        description={t("passwordReset.description")}
      >
        <PasswordResetForm id={user.id} />
      </BlockSection>
    </div>
  );
}
