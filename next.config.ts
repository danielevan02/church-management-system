import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/lib/i18n/request.ts");

const nextConfig: NextConfig = {};

const sentryEnabled = Boolean(
  process.env.SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN,
);

export default sentryEnabled
  ? withSentryConfig(withNextIntl(nextConfig), {
      // Suppress source-map upload logs unless verbose
      silent: !process.env.CI,
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,
      // Upload source maps so prod stack traces are readable
      widenClientFileUpload: true,
      // Tunnel through /monitoring to bypass ad-blockers (clients only)
      tunnelRoute: "/monitoring",
      // Hide Sentry SDK debug logs in production bundles
      disableLogger: true,
      // Auto-instrument Vercel's cron-monitor
      automaticVercelMonitors: true,
    })
  : withNextIntl(nextConfig);
