import { ArrowRight, Quote, ShieldCheck } from "lucide-react";
import { getTranslations } from "next-intl/server";
import Image from "next/image";

import { LoadingLink } from "@/components/shared/loading-link";
import { LoadingLinkButton } from "@/components/shared/loading-link-button";
import { LocaleSwitcherStatic } from "@/components/shared/locale-switcher-static";
import { church } from "@/config/church";

export default async function Home() {
  const t = await getTranslations("landing");
  const primary = church.primaryColor;

  const misiItems = [1, 2, 3, 4, 5, 6].map((n) => t(`misi.item${n}`));

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
          <LoadingLink
            href="/auth/sign-in"
            icon={<ShieldCheck className="h-3.5 w-3.5" aria-hidden />}
            className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            {t("hero.staffSignIn")}
          </LoadingLink>
        </div>
      </header>

      <section className="flex items-center justify-center px-6 py-16 sm:py-20">
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

          <LoadingLinkButton href="/auth/member" size="lg" className="px-8">
            {t("hero.primaryCta")}
            <ArrowRight className="h-4 w-4" />
          </LoadingLinkButton>
        </div>
      </section>

      {/* Visi */}
      <section
        className="border-t px-6 py-16 sm:py-20"
        style={{ borderColor: `${primary}1a` }}
      >
        <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-6 text-center">
          <span
            className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium uppercase tracking-widest text-muted-foreground"
            style={{ borderColor: `${primary}33` }}
          >
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: primary }}
            />
            {t("visi.label")}
          </span>
          <Quote
            className="h-6 w-6 opacity-60"
            style={{ color: primary }}
            aria-hidden
          />
          <p className="text-balance text-2xl font-medium leading-snug text-foreground sm:text-3xl lg:text-4xl">
            {t("visi.text")}
          </p>
        </div>
      </section>

      {/* Misi */}
      <section
        className="border-t px-6 py-16 sm:py-20"
        style={{ borderColor: `${primary}1a` }}
      >
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-10">
          <div className="flex flex-col items-center gap-4 text-center">
            <span
              className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium uppercase tracking-widest text-muted-foreground"
              style={{ borderColor: `${primary}33` }}
            >
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: primary }}
              />
              {t("misi.label")}
            </span>
            <h2
              className="text-3xl font-bold tracking-[0.15em] sm:text-4xl"
              style={{ color: primary }}
            >
              {t("misi.acronym")}
            </h2>
            <p className="max-w-2xl text-balance text-sm text-muted-foreground sm:text-base">
              {t("misi.expansion")}
            </p>
          </div>

          <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {misiItems.map((item, i) => (
              <li
                key={i}
                className="group relative flex flex-col gap-3 rounded-xl border bg-card/40 p-6 transition-colors hover:border-foreground/20"
                style={{ borderColor: `${primary}1f` }}
              >
                <span
                  className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold"
                  style={{
                    backgroundColor: `${primary}14`,
                    color: primary,
                  }}
                >
                  {i + 1}
                </span>
                <p className="text-sm leading-relaxed text-foreground sm:text-base">
                  {item}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <footer
        className="border-t px-6 py-6 text-center text-xs text-muted-foreground sm:px-10"
        style={{ borderColor: `${primary}1a` }}
      >
        © {new Date().getFullYear()} {church.name}
      </footer>
    </main>
  );
}
