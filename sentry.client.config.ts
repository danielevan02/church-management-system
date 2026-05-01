/**
 * Sentry client-side init. Silent no-op when NEXT_PUBLIC_SENTRY_DSN is unset
 * — keeps staging / preview / local dev free of Sentry chatter without
 * needing a separate code path.
 */

import * as Sentry from "@sentry/nextjs";

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    tracesSampleRate: 0.1,
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 1.0,
    environment: process.env.NEXT_PUBLIC_VERCEL_ENV ?? "development",
  });
}
