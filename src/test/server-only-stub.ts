/**
 * Stand-in for Next.js's `server-only` marker package under vitest.
 *
 * The real thing exists only as a bundler resolution in Next; importing it in
 * a plain Node test run fails outright. The guarantee it encodes — this module
 * must never reach the client — is enforced at build time, so the test-time
 * stub can be empty.
 */
export {};
