import { getTranslations } from "next-intl/server";
import Image from "next/image";

import { church } from "@/config/church";

import type { ReactNode } from "react";

type AuthShellProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
};

export async function AuthShell({ title, subtitle, children }: AuthShellProps) {
  const t = await getTranslations("auth.shell");

  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      <section className="flex flex-col px-6 py-10 sm:px-10 lg:px-16">
        <header className="flex items-center gap-2 text-sm font-medium">
          <Image
            src="/icon-ui-192.png"
            alt=""
            aria-hidden
            width={32}
            height={32}
            priority
            className="h-8 w-8 object-contain"
          />
          <span className="text-foreground">{church.name}</span>
        </header>

        <div className="flex flex-1 items-center">
          <div className="mx-auto w-full max-w-sm">
            <div className="mb-8 space-y-2">
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                {title}
              </h1>
              <p className="text-sm text-muted-foreground">{subtitle}</p>
            </div>
            {children}
          </div>
        </div>

        <footer className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} {church.name}
        </footer>
      </section>

      <aside
        className="relative hidden overflow-hidden lg:block"
        style={{
          background: `linear-gradient(135deg, ${church.primaryColor} 0%, ${church.primaryColor}dd 50%, ${church.primaryColor}99 100%)`,
        }}
      >
        <div
          aria-hidden
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.4) 0%, transparent 40%), radial-gradient(circle at 80% 80%, rgba(255,255,255,0.3) 0%, transparent 40%)",
          }}
        />

        <div className="relative flex h-full flex-col justify-between p-12 text-white">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/95 p-1 shadow-sm backdrop-blur">
              <Image
                src="/icon-ui-192.png"
                alt=""
                aria-hidden
                width={32}
                height={32}
                priority
                className="h-full w-full object-contain"
              />
            </span>
            <span className="text-sm font-medium uppercase tracking-widest opacity-90">
              {church.shortName}
            </span>
          </div>

          <div className="space-y-6">
            <blockquote className="text-2xl font-medium leading-snug">
              &ldquo;{t("verse")}&rdquo;
            </blockquote>
            <cite className="block text-sm uppercase tracking-widest opacity-80 not-italic">
              {t("verseRef")}
            </cite>
          </div>

          <p className="text-sm opacity-80">{t("tagline")}</p>
        </div>
      </aside>
    </main>
  );
}
