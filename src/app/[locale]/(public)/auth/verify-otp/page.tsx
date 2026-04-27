import { getTranslations } from "next-intl/server";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { OtpFlow } from "./otp-flow";

export default async function VerifyOtpPage() {
  const t = await getTranslations("auth.otp");

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-12">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>{t("requestTitle")}</CardTitle>
          <CardDescription>{t("requestSubtitle")}</CardDescription>
        </CardHeader>
        <CardContent>
          <OtpFlow />
        </CardContent>
      </Card>
    </main>
  );
}
