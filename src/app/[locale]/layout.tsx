import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { Inter, Manrope, Roboto_Mono } from "next/font/google";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { NavigationProgress } from "@/components/shared/navigation-progress";
import { ScrollRevealProvider } from "@/components/m3/scroll-reveal";
import { ThemeProvider } from "@/components/shared/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { church } from "@/config/church";
import { routing } from "@/lib/i18n/routing";

import "../globals.css";

// Common body font
const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

// Accent & heading font
const manrope = Manrope({
  variable: "--font-heading",
  subsets: ["latin"],
  display: "swap",
});

const robotoMono = Roboto_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: church.name,
    template: `%s · ${church.shortName}`,
  },
  description: `Church Management System for ${church.name}.`,
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  const messages = await getMessages();

  return (
    <html
      lang={locale}
      className={`${inter.variable} ${manrope.variable} ${robotoMono.variable}`}
      suppressHydrationWarning
    >
      <body className="antialiased font-sans" suppressHydrationWarning>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ThemeProvider>
            <TooltipProvider delayDuration={200}>
              <NavigationProgress />
              <ScrollRevealProvider>{children}</ScrollRevealProvider>
            </TooltipProvider>
            <Toaster richColors position="top-right" />
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
