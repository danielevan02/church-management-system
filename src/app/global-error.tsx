"use client";

import * as Sentry from "@sentry/nextjs";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Geist, Geist_Mono } from "next/font/google";
import { useEffect } from "react";

import "./globals.css";

const geistSans = Geist({ variable: "--font-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-mono", subsets: ["latin"] });

/**
 * Global error boundary for the App Router. Reports the error to Sentry
 * (no-op when DSN unset) and renders a minimal fallback. Per-route
 * `error.tsx` files override this for narrower scopes.
 *
 * Renders its own <html>/<body> because it replaces the root layout when
 * the layout itself fails to render — so we re-import globals.css and the
 * Geist fonts here to keep the styling consistent.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable}`}
    >
      <body className="antialiased font-sans bg-background text-foreground">
        <main className="flex min-h-dvh items-center justify-center p-6">
          <div className="flex w-full max-w-md flex-col items-center gap-5 rounded-xl border bg-card p-8 text-center shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <AlertTriangle className="h-6 w-6" aria-hidden />
            </div>
            <div className="flex flex-col gap-2">
              <h1 className="text-xl font-semibold tracking-tight">
                Terjadi kesalahan
              </h1>
              <p className="text-sm text-muted-foreground">
                Maaf, ada masalah teknis. Tim kami sudah mendapat notifikasi.
                Coba muat ulang halaman.
              </p>
            </div>
            <button
              type="button"
              onClick={reset}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <RefreshCw className="h-4 w-4" aria-hidden />
              Muat Ulang
            </button>
            {error.digest ? (
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Ref: {error.digest}
              </p>
            ) : null}
          </div>
        </main>
      </body>
    </html>
  );
}
