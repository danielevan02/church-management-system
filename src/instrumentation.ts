/**
 * Next.js 15 instrumentation entry point. Loads Sentry on the right runtime.
 * If SENTRY_DSN env vars are unset, the imported config files no-op.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("../sentry.server.config");
  }
  if (process.env.NEXT_RUNTIME === "edge") {
    await import("../sentry.edge.config");
  }
}

export { captureRequestError as onRequestError } from "@sentry/nextjs";
