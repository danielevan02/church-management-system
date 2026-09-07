/* eslint-disable */
/**
 * Generates the Material 3 *reference* tonal palettes from the single source
 * colour configured for this deployment (NEXT_PUBLIC_PRIMARY_COLOR) and writes
 * them to src/styles/m3/palette.generated.css.
 *
 * Why generated instead of hand-authored: M3 colour is not a set of hex values,
 * it is an algorithm. Five tonal palettes (primary / secondary / tertiary /
 * neutral / neutral-variant) plus a fixed error palette are derived from one
 * seed hue, and every system role is a *tone* of one of those palettes. Deriving
 * them means a per-church rebrand is one env var, and it is the same code path
 * dynamic colour would use later.
 *
 * Two independent knobs, because the two things they control pull in opposite
 * directions:
 *
 *   NEXT_PUBLIC_M3_SCHEME        accents  (primary / secondary / tertiary)
 *   NEXT_PUBLIC_M3_SURFACE_TINT  neutrals (every surface in the app)
 *
 * They were one knob first, and that was wrong. Picking `vibrant` to get
 * visibly brand-tinted surfaces also maxes the *primary* palette's chroma
 * (200), which turns `primary-container` — a large, quiet fill behind text —
 * into near-neon cyan on a teal seed. Picking `tonalspot` for calm accents
 * leaves every surface reading as grey.
 *
 * So accents come from an M3 named scheme (default `tonalspot`, the M3
 * default) and the neutrals are built directly at an explicit chroma. Surfaces
 * are tones of the neutral palette, so its chroma *is* the tint strength:
 *
 *   subtle   neutral  6 / variant  8   M3 default; surfaces read near-grey
 *   tinted   neutral 10 / variant 12   surfaces visibly carry the brand hue  <-- default
 *   vivid    neutral 16 / variant 24   unmistakably coloured surfaces
 *
 * Two engines, same output shape:
 *   1. @material/material-color-utilities — spec-exact HCT. Used when
 *      resolvable. PINNED TO 0.3.0: 0.4.0 ships extensionless internal ESM
 *      specifiers ("./dynamiccolor/dynamic_color") which Node's ESM resolver
 *      rejects, so it only loads inside a bundler.
 *   2. Built-in CIELCh fallback — zero dependencies, kept so a fresh clone
 *      always builds. Tone is CIE L*, identical to HCT tone, so contrast holds
 *      exactly. Chroma is approximated, and the approximation is *not* always
 *      cosmetic: CAM16 M and Lab C diverge most at high lightness on cyan-ish
 *      hues, where sRGB allows huge Lab chroma. On this deployment's teal seed
 *      the fallback turns primary-90 into near-neon (#00fdec vs the correct
 *      #72f7ea), which is unusable as a container role. Treat engine 2 as a
 *      build-doesn't-break measure, not as a shipping palette.
 *
 * Mirrors the codegen pattern already used by scripts/build-sw.cjs.
 */

const fs = require("node:fs");
const path = require("node:path");

const OUT = path.join(__dirname, "..", "src", "styles", "m3", "palette.generated.css");
const FALLBACK_SEED = "#1e3a8a";
const DEFAULT_SCHEME = "tonalspot";

const SCHEME_CLASSES = {
  tonalspot: "SchemeTonalSpot",
  vibrant: "SchemeVibrant",
  expressive: "SchemeExpressive",
  content: "SchemeContent",
  fidelity: "SchemeFidelity",
  neutral: "SchemeNeutral",
  monochrome: "SchemeMonochrome",
  rainbow: "SchemeRainbow",
  fruitsalad: "SchemeFruitSalad",
};

const DEFAULT_TINT = "tinted";

/** Neutral chroma per tint level. Surfaces are tones of these. */
const SURFACE_TINT = {
  subtle: { neutral: 6, neutralVariant: 8 },
  tinted: { neutral: 10, neutralVariant: 12 },
  vivid: { neutral: 16, neutralVariant: 24 },
};

/** Chroma the zero-dependency engine uses to approximate each variant. */
const SCHEME_FALLBACK_CHROMA = {
  tonalspot: { primary: 36, secondary: 16, tertiary: 24, neutral: 6, neutralVariant: 8, tertiaryHueShift: 60 },
  vibrant: { primary: 64, secondary: 24, tertiary: 32, neutral: 10, neutralVariant: 12, tertiaryHueShift: 45 },
  expressive: { primary: 40, secondary: 24, tertiary: 32, neutral: 8, neutralVariant: 12, tertiaryHueShift: 120 },
  content: { primary: 48, secondary: 24, tertiary: 24, neutral: 5, neutralVariant: 9, tertiaryHueShift: 60 },
  fidelity: { primary: 48, secondary: 24, tertiary: 24, neutral: 5, neutralVariant: 9, tertiaryHueShift: 60 },
  neutral: { primary: 12, secondary: 8, tertiary: 16, neutral: 2, neutralVariant: 2, tertiaryHueShift: 60 },
  monochrome: { primary: 0, secondary: 0, tertiary: 0, neutral: 0, neutralVariant: 0, tertiaryHueShift: 0 },
  rainbow: { primary: 48, secondary: 16, tertiary: 24, neutral: 0, neutralVariant: 0, tertiaryHueShift: 60 },
  fruitsalad: { primary: 48, secondary: 36, tertiary: 36, neutral: 10, neutralVariant: 16, tertiaryHueShift: 60 },
};

/** Tones M3 system roles actually reference, plus the endpoints. */
const TONES = [0, 4, 5, 6, 10, 12, 15, 17, 20, 22, 24, 25, 30, 35, 40, 50, 60, 70, 80, 87, 90, 92, 94, 95, 96, 98, 99, 100];

/* ------------------------------------------------------------------ colour math */

const clamp01 = (v) => Math.min(1, Math.max(0, v));

function parseHex(input) {
  const hex = String(input).trim().replace(/^#/, "");
  const full = hex.length === 3 ? hex.split("").map((c) => c + c).join("") : hex;
  if (!/^[0-9a-fA-F]{6}$/.test(full)) return null;
  return [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16));
}

const toLinear = (c) => (c /= 255, c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
const toSrgb = (c) => Math.round(clamp01(c <= 0.0031308 ? c * 12.92 : 1.055 * Math.pow(c, 1 / 2.4) - 0.055) * 255);

const WHITE = [0.95047, 1, 1.08883];

function rgbToLab([r, g, b]) {
  const [R, G, B] = [toLinear(r), toLinear(g), toLinear(b)];
  const xyz = [
    0.4124564 * R + 0.3575761 * G + 0.1804375 * B,
    0.2126729 * R + 0.7151522 * G + 0.072175 * B,
    0.0193339 * R + 0.119192 * G + 0.9503041 * B,
  ].map((v, i) => v / WHITE[i]);
  const f = xyz.map((t) => (t > 216 / 24389 ? Math.cbrt(t) : (24389 / 27 * t + 16) / 116));
  return [116 * f[1] - 16, 500 * (f[0] - f[1]), 200 * (f[1] - f[2])];
}

/** @returns {{rgb: number[], inGamut: boolean}} */
function labToRgb(L, a, b) {
  const fy = (L + 16) / 116;
  const fx = fy + a / 500;
  const fz = fy - b / 200;
  const inv = (t) => (t ** 3 > 216 / 24389 ? t ** 3 : (116 * t - 16) / (24389 / 27));
  const [X, Y, Z] = [inv(fx) * WHITE[0], L > 8 ? fy ** 3 * WHITE[1] : (L / (24389 / 27)) * WHITE[1], inv(fz) * WHITE[2]];
  const lin = [
    3.2404542 * X - 1.5371385 * Y - 0.4985314 * Z,
    -0.969266 * X + 1.8760108 * Y + 0.041556 * Z,
    0.0556434 * X - 0.2040259 * Y + 1.0572252 * Z,
  ];
  const eps = 1e-4;
  return { rgb: lin.map(toSrgb), inGamut: lin.every((v) => v >= -eps && v <= 1 + eps) };
}

const hex = (rgb) => "#" + rgb.map((v) => v.toString(16).padStart(2, "0")).join("");

/**
 * Highest-chroma in-gamut colour at a given tone (L*) and hue. Chroma is convex
 * in gamut at a fixed lightness and hue, so a binary search is safe and fast.
 */
function toneToHex(tone, hueDeg, chromaTarget) {
  if (tone <= 0) return "#000000";
  if (tone >= 100) return "#ffffff";
  const rad = (hueDeg * Math.PI) / 180;
  const at = (c) => labToRgb(tone, Math.cos(rad) * c, Math.sin(rad) * c);
  const full = at(chromaTarget);
  if (full.inGamut) return hex(full.rgb);
  let lo = 0;
  let hi = chromaTarget;
  for (let i = 0; i < 24; i++) {
    const mid = (lo + hi) / 2;
    if (at(mid).inGamut) lo = mid;
    else hi = mid;
  }
  return hex(at(lo).rgb);
}

/* ------------------------------------------------------------------ engines */

/**
 * M3 CorePalette derivation: primary keeps the seed hue at chroma >= 48,
 * secondary desaturates to 16, tertiary rotates +60deg at 24, and the two
 * neutrals hold just enough chroma (4 / 8) to tint every surface toward the
 * brand instead of going flat grey.
 */
function coreSpec(scheme, tint) {
  const c = SCHEME_FALLBACK_CHROMA[scheme] ?? SCHEME_FALLBACK_CHROMA[DEFAULT_SCHEME];
  const t = SURFACE_TINT[tint] ?? SURFACE_TINT[DEFAULT_TINT];
  return [
    { name: "primary", hueShift: 0, chroma: (seed) => Math.max(c.primary, seed) },
    { name: "secondary", hueShift: 0, chroma: () => c.secondary },
    { name: "tertiary", hueShift: c.tertiaryHueShift, chroma: () => c.tertiary },
    { name: "neutral", hueShift: 0, chroma: () => t.neutral },
    { name: "neutral-variant", hueShift: 0, chroma: () => t.neutralVariant },
  ];
}
const ERROR = { hue: 25, chroma: 84 };

/**
 * M3 "custom colors": semantics the baseline scheme has no role for. The spec
 * supports these explicitly — they get their own tonal palette and the same
 * container/on-container role pairs, so status colours stop being hardcoded
 * Tailwind palette values that ignore the theme and break in dark mode.
 *
 * Seeded from fixed hues rather than the church's colour: "this went well" and
 * "look at this" have to stay green and amber regardless of branding. Chroma
 * is set high, like error's, so status reads at a glance in a dense table.
 */
const EXTRA = {
  success: { source: "#2e7d32", chroma: 60 },
  warning: { source: "#f59e0b", chroma: 84 },
};

function buildWithFallback(seedRgb, scheme, tint) {
  const [, a, b] = rgbToLab(seedRgb);
  const hue = ((Math.atan2(b, a) * 180) / Math.PI + 360) % 360;
  const seedChroma = Math.hypot(a, b);
  // CAM16 M (HCT) and Lab C are on comparable but hue-dependent scales; nudge up
  // so mid-chroma targets do not read washed out against the spec.
  const CORRECTION = 1.15;
  const out = {};
  for (const p of coreSpec(scheme, tint)) {
    out[p.name] = TONES.map((t) => [t, toneToHex(t, hue + p.hueShift, p.chroma(seedChroma) * CORRECTION)]);
  }
  out.error = TONES.map((t) => [t, toneToHex(t, ERROR.hue, ERROR.chroma * CORRECTION)]);
  for (const [name, spec] of Object.entries(EXTRA)) {
    const [, ea, eb] = rgbToLab(parseHex(spec.source));
    const extraHue = ((Math.atan2(eb, ea) * 180) / Math.PI + 360) % 360;
    out[name] = TONES.map((t) => [t, toneToHex(t, extraHue, spec.chroma * CORRECTION)]);
  }
  return { palettes: out, engine: "builtin-cielch", hue };
}

async function buildWithMcu(seedRgb, scheme, tint) {
  let mcu;
  try {
    // Dynamic import, not require: the package is pure ESM.
    mcu = await import("@material/material-color-utilities");
  } catch {
    return null;
  }
  if (!mcu?.argbFromRgb || !mcu?.hexFromArgb || !mcu?.Hct?.fromInt) return null;

  const className = SCHEME_CLASSES[scheme] ?? SCHEME_CLASSES[DEFAULT_SCHEME];
  const SchemeClass = mcu[className];
  if (!SchemeClass) return null;

  // Second arg is isDark, third is contrast level. Tonal palettes are
  // scheme-wide, so one light instance yields every tone both modes need.
  const seedHct = mcu.Hct.fromInt(mcu.argbFromRgb(...seedRgb));
  const built = new SchemeClass(seedHct, false, 0);

  // Neutrals are rebuilt at the configured chroma rather than taken from the
  // scheme, so surface tint and accent character stay independent.
  const t = SURFACE_TINT[tint] ?? SURFACE_TINT[DEFAULT_TINT];
  const tinted = (chroma) =>
    mcu.TonalPalette?.fromHueAndChroma
      ? mcu.TonalPalette.fromHueAndChroma(seedHct.hue, chroma)
      : null;

  const map = {
    primary: built.primaryPalette,
    secondary: built.secondaryPalette,
    tertiary: built.tertiaryPalette,
    neutral: tinted(t.neutral) ?? built.neutralPalette,
    "neutral-variant": tinted(t.neutralVariant) ?? built.neutralVariantPalette,
    error: built.errorPalette,
  };
  if (Object.values(map).some((palette) => !palette?.tone)) return null;
  if (mcu.Hct?.fromInt && mcu.TonalPalette?.fromHueAndChroma) {
    for (const [name, spec] of Object.entries(EXTRA)) {
      const hue = mcu.Hct.fromInt(mcu.argbFromRgb(...parseHex(spec.source))).hue;
      map[name] = mcu.TonalPalette.fromHueAndChroma(hue, spec.chroma);
    }
  }
  const palettes = {};
  for (const [name, tonal] of Object.entries(map)) {
    palettes[name] = TONES.map((t) => [t, mcu.hexFromArgb(tonal.tone(t))]);
  }
  return { palettes, engine: `material-color-utilities (${className})` };
}

/* ------------------------------------------------------------------ env */

/**
 * Minimal .env reader. `@next/env` would be the right tool but pnpm's strict
 * node_modules does not expose it, and a dependency for one variable is not
 * worth it. Precedence matches Next.js: a real environment variable wins, then
 * .env.local, then .env — so Vercel (where the var is set for real) and local
 * dev (where it lives in .env.local) both resolve the same seed.
 */
function readEnvFiles(key) {
  if (process.env[key]) return process.env[key];
  for (const file of [".env.local", ".env"]) {
    const full = path.join(__dirname, "..", file);
    if (!fs.existsSync(full)) continue;
    for (const line of fs.readFileSync(full, "utf8").split("\n")) {
      const match = /^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/.exec(line);
      if (!match || match[1] !== key) continue;
      return match[2].trim().replace(/^["']|["']$/g, "");
    }
  }
  return undefined;
}

/* ------------------------------------------------------------------ emit */

async function main() {
  const raw = readEnvFiles("NEXT_PUBLIC_PRIMARY_COLOR") || FALLBACK_SEED;
  const seedRgb = parseHex(raw) ?? parseHex(FALLBACK_SEED);
  if (!parseHex(raw)) {
    console.warn(`[build-theme] NEXT_PUBLIC_PRIMARY_COLOR="${raw}" is not a hex colour; falling back to ${FALLBACK_SEED}`);
  }

  const rawScheme = (readEnvFiles("NEXT_PUBLIC_M3_SCHEME") || DEFAULT_SCHEME).toLowerCase();
  const scheme = SCHEME_CLASSES[rawScheme] ? rawScheme : DEFAULT_SCHEME;
  if (!SCHEME_CLASSES[rawScheme]) {
    console.warn(
      `[build-theme] unknown NEXT_PUBLIC_M3_SCHEME="${rawScheme}"; using "${DEFAULT_SCHEME}". ` +
        `Known: ${Object.keys(SCHEME_CLASSES).join(", ")}`
    );
  }

  const rawTint = (readEnvFiles("NEXT_PUBLIC_M3_SURFACE_TINT") || DEFAULT_TINT).toLowerCase();
  const tint = SURFACE_TINT[rawTint] ? rawTint : DEFAULT_TINT;
  if (!SURFACE_TINT[rawTint]) {
    console.warn(
      `[build-theme] unknown NEXT_PUBLIC_M3_SURFACE_TINT="${rawTint}"; using "${DEFAULT_TINT}". ` +
        `Known: ${Object.keys(SURFACE_TINT).join(", ")}`
    );
  }

  const built =
    (await buildWithMcu(seedRgb, scheme, tint)) ?? buildWithFallback(seedRgb, scheme, tint);
  if (!built.engine.startsWith("material-color-utilities")) {
    console.warn(
      "[build-theme] falling back to approximate colour maths — run `pnpm add -D @material/material-color-utilities@0.3.0`"
    );
  }

  const lines = [
    "/*",
    " * GENERATED FILE — do not edit.",
    " * Source: scripts/build-theme.cjs",
    ` * Seed:   ${hex(seedRgb)} (NEXT_PUBLIC_PRIMARY_COLOR)`,
    ` * Scheme: ${scheme} accents (NEXT_PUBLIC_M3_SCHEME)`,
    ` * Tint:   ${tint} surfaces (NEXT_PUBLIC_M3_SURFACE_TINT)`,
    ` * Engine: ${built.engine}`,
    " *",
    " * M3 reference tonal palettes. Nothing in the app should read these",
    " * directly — consume the system roles in roles.css instead.",
    " */",
    "",
    ":root {",
  ];
  for (const [name, tones] of Object.entries(built.palettes)) {
    for (const [tone, value] of tones) lines.push(`  --md-ref-${name}-${tone}: ${value};`);
    lines.push("");
  }
  lines.push("}", "");

  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, lines.join("\n"), "utf8");
  console.log(
    `[build-theme] ${path.relative(process.cwd(), OUT)} — seed ${hex(seedRgb)}, ` +
      `scheme ${scheme}, tint ${tint}, engine ${built.engine}`
  );
}

main().catch((err) => {
  console.error("[build-theme]", err);
  process.exit(1);
});
