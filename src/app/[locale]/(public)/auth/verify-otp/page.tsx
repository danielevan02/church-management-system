import { getTranslations } from "next-intl/server";

import { AuthShell } from "@/components/auth/auth-shell";

import { OtpFlow } from "./otp-flow";

export default async function VerifyOtpPage() {
  const t = await getTranslations("auth.otp");

  return (
    <AuthShell title={t("requestTitle")} subtitle={t("requestSubtitle")}>
      <OtpFlow />
    </AuthShell>
  );
}
