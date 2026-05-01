/**
 * Sentry browser-runtime init. Newer Next.js 15 pattern (replaces the legacy
 * sentry.client.config.ts). Silent no-op when NEXT_PUBLIC_SENTRY_DSN is unset
 * — keeps staging / preview / local dev free of Sentry chatter without a
 * separate code path.
 */

import * as Sentry from "@sentry/nextjs";

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    sendDefaultPii: true,
    tracesSampleRate: process.env.NODE_ENV === "development" ? 1.0 : 0.1,

    // Session Replay: 10% of all sessions, 100% of error sessions
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,

    enableLogs: true,

    integrations: [Sentry.replayIntegration()],

    environment: process.env.NEXT_PUBLIC_VERCEL_ENV ?? "development",
  });
}

// Hook into App Router navigation transitions so client-side route changes
// produce trace spans. Required when using App Router.
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
