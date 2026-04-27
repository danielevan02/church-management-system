import { ArrowRight, Church } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { LocaleSwitcher } from "@/components/shared/locale-switcher";
import { Button } from "@/components/ui/button";
import { church } from "@/config/church";
import { Link } from "@/lib/i18n/navigation";

export default async function Home() {
  const t = await getTranslations("landing");
  const primary = church.primaryColor;

  return (
    <main className="relative flex min-h-dvh flex-col overflow-hidden bg-background">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background: `
            radial-gradient(ellipse 70% 50% at 50% 0%, ${primary}1f 0%, transparent 65%),
            radial-gradient(ellipse 60% 50% at 0% 100%, ${primary}14 0%, transparent 60%),
            radial-gradient(ellipse 60% 50% at 100% 100%, ${primary}14 0%, transparent 60%)
          `,
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-px"
        style={{
          background: `linear-gradient(90deg, transparent, ${primary}55, transparent)`,
        }}
      />

      <header className="flex items-center justify-between px-6 py-5 sm:px-10">
        <div className="flex items-center gap-2">
          <span
            className="flex h-8 w-8 items-center justify-center rounded-md text-white shadow-sm"
            style={{ backgroundColor: primary }}
          >
            <Church className="h-4 w-4" />
          </span>
          <span className="text-sm font-medium text-foreground">
            {church.shortName}
          </span>
        </div>
        <LocaleSwitcher />
      </header>

      <section className="flex flex-1 items-center justify-center px-6 py-12 sm:py-16">
        <div className="flex w-full max-w-2xl flex-col items-center gap-8 text-center">
          <span
            className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium uppercase tracking-widest text-muted-foreground"
            style={{ borderColor: `${primary}33` }}
          >
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: primary }}
            />
            {t("hero.badge")}
          </span>

          <h1 className="text-balance text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            {church.name}
          </h1>

          <blockquote className="max-w-xl text-balance text-base italic text-muted-foreground sm:text-lg">
            &ldquo;{t("hero.verse")}&rdquo;
            <cite className="mt-3 block text-xs uppercase tracking-[0.2em] not-italic opacity-70">
              {t("hero.verseRef")}
            </cite>
          </blockquote>

          <div
            aria-hidden
            className="h-px w-16"
            style={{
              background: `linear-gradient(90deg, transparent, ${primary}88, transparent)`,
            }}
          />

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" className="px-7">
              <Link href="/auth/verify-otp">
                {t("hero.primaryCta")}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="px-7">
              <Link href="/auth/sign-in">{t("hero.secondaryCta")}</Link>
            </Button>
          </div>
        </div>
      </section>

      <footer className="px-6 py-5 text-center text-xs text-muted-foreground sm:px-10">
        © {new Date().getFullYear()} {church.name}
      </footer>
    </main>
  );
}
