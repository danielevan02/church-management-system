/* eslint-disable */
/**
 * Generate public/sw.js from public/sw.template.js by substituting
 * __BUILD_VERSION__ with the current git SHA. Runs automatically via the
 * `predev` and `prebuild` hooks in package.json.
 *
 * Version source priority:
 *   1. VERCEL_GIT_COMMIT_SHA  (set during Vercel builds)
 *   2. `git rev-parse --short HEAD`  (local dev / CI)
 *   3. `dev-<timestamp>`  (fallback when not in a git checkout)
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const TEMPLATE = path.join(__dirname, "..", "public", "sw.template.js");
const OUTPUT = path.join(__dirname, "..", "public", "sw.js");

function getVersion() {
  const sha = process.env.VERCEL_GIT_COMMIT_SHA;
  if (sha) return sha.slice(0, 7);
  try {
    return execSync("git rev-parse --short HEAD", { stdio: ["ignore", "pipe", "ignore"] })
      .toString()
      .trim();
  } catch {
    return `dev-${Date.now()}`;
  }
}

const version = getVersion();
const template = fs.readFileSync(TEMPLATE, "utf-8");
const stamped = template.replace(/__BUILD_VERSION__/g, version);
fs.writeFileSync(OUTPUT, stamped);
console.log(`[build-sw] Generated public/sw.js (CACHE_VERSION=${version})`);
