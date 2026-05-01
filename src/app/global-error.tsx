"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

/**
 * Global error boundary for the App Router. Reports the error to Sentry
 * (no-op when DSN unset) and renders a minimal fallback. Per-route
 * `error.tsx` files override this for narrower scopes.
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
    <html lang="id">
      <body className="flex min-h-dvh items-center justify-center bg-background p-6">
        <div className="flex max-w-md flex-col items-center gap-4 text-center">
          <h1 className="text-2xl font-semibold">Terjadi kesalahan</h1>
          <p className="text-sm text-muted-foreground">
            Maaf, ada masalah teknis. Tim kami sudah mendapat notifikasi. Coba
            muat ulang halaman.
          </p>
          <button
            type="button"
            onClick={reset}
            className="rounded-md border bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-90"
          >
            Muat Ulang
          </button>
        </div>
      </body>
    </html>
  );
}
