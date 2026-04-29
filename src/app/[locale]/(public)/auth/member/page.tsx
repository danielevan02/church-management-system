import { getTranslations } from "next-intl/server";

import { AuthShell } from "@/components/auth/auth-shell";

import { MemberSignInForm } from "./member-sign-in-form";

export default async function MemberSignInPage() {
  const t = await getTranslations("auth.pin");

  return (
    <AuthShell title={t("title")} subtitle={t("subtitle")}>
      <MemberSignInForm />
    </AuthShell>
  );
}
