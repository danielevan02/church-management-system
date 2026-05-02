import { ArrowRight, ShieldCheck } from "lucide-react";
import { getTranslations } from "next-intl/server";
import Image from "next/image";

import { LocaleSwitcherStatic } from "@/components/shared/locale-switcher-static";
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
          <Image
            src="/icon-ui-192.png"
            alt=""
            aria-hidden
            width={32}
            height={32}
            priority
            className="h-8 w-8 object-contain"
          />
          <span className="text-sm font-medium text-foreground">
            {church.shortName}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <LocaleSwitcherStatic />
          <Link
            href="/auth/sign-in"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
            <span>{t("hero.staffSignIn")}</span>
          </Link>
        </div>
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

          <Button asChild size="lg" className="px-8">
            <Link href="/auth/member">
              {t("hero.primaryCta")}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      <footer className="px-6 py-5 text-center text-xs text-muted-foreground sm:px-10">
        © {new Date().getFullYear()} {church.name}
      </footer>
    </main>
  );
}
