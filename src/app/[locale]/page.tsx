import { getTranslations } from "next-intl/server";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { church } from "@/config/church";
import { Link } from "@/lib/i18n/navigation";

export default async function Home() {
  const t = await getTranslations("auth");

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex max-w-3xl flex-col gap-8 px-6 py-16">
        <header className="flex flex-col gap-2">
          <Badge variant="secondary" className="w-fit">
            Phase 1 — Auth & DB
          </Badge>
          <h1 className="text-4xl font-bold tracking-tight">{church.name}</h1>
          <p className="text-muted-foreground">
            Database migrated. Authentication wired (Email + password for
            staff, WhatsApp OTP for jemaat).
          </p>
        </header>

        <Card>
          <CardHeader>
            <CardTitle>Sign in</CardTitle>
            <CardDescription>
              Pilih sesuai peran Anda.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 sm:flex-row">
            <Button asChild>
              <Link href="/auth/sign-in">{t("signIn.title")}</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/auth/verify-otp">{t("otp.requestTitle")}</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
