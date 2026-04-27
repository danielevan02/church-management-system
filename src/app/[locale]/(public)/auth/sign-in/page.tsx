import { getTranslations } from "next-intl/server";

import { AuthShell } from "@/components/auth/auth-shell";

import { SignInForm } from "./sign-in-form";

export default async function SignInPage() {
  const t = await getTranslations("auth.signIn");

  return (
    <AuthShell title={t("title")} subtitle={t("subtitle")}>
      <SignInForm />
    </AuthShell>
  );
}
