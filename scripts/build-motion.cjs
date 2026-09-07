/* eslint-disable */
/**
 * Generates CSS `linear()` easing functions from Material 3's spring tokens.
 *
 * M3's motion system is spring-physics based — the duration+cubic-bezier model
 * is the legacy one. A spring is defined by a damping ratio and a stiffness,
 * not by a duration, and no single cubic-bezier can express one because a
 * cubic-bezier cannot overshoot past its endpoint. `linear()` can: it takes a
 * list of sampled output values, and those values are allowed to exceed 1,
 * which is exactly what bounce is.
 *
 * Exact token values are from the Android source of truth:
 *   StandardMotionTokens.kt / ExpressiveMotionTokens.kt (androidx-main)
 *
 * The physics matches Compose's SpringSimulation with unit mass:
 *   w0  = sqrt(stiffness)                      natural frequency
 *   wd  = w0 * sqrt(1 - z^2)                   damped frequency (z < 1)
 *   x(t) = e^(-z*w0*t) * [cos(wd*t) + (z*w0/wd) * sin(wd*t)]
 *   progress(t) = 1 - x(t)
 *
 * Critically damped (z = 1) collapses to x(t) = e^(-w0*t) * (1 + w0*t).
 *
 * Output is committed rather than generated at build time: unlike the colour
 * palette these values are universal, not per-deployment. The script stays so
 * the numbers can be re-derived and audited instead of trusted.
 *
 * Expressive is the default scheme; `<html data-motion="standard">` opts into
 * the calmer one (spatial damping 0.9 instead of 0.6-0.8, so almost no
 * overshoot).
 */

const fs = require("node:fs");
const path = require("node:path");

const OUT = path.join(__dirname, "..", "src", "styles", "m3", "spring.css");

const SCHEMES = {
  standard: {
    "default-spatial": { damping: 0.9, stiffness: 700 },
    "fast-spatial": { damping: 0.9, stiffness: 1400 },
    "slow-spatial": { damping: 0.9, stiffness: 300 },
    "default-effects": { damping: 1.0, stiffness: 1600 },
    "fast-effects": { damping: 1.0, stiffness: 3800 },
    "slow-effects": { damping: 1.0, stiffness: 800 },
  },
  expressive: {
    "default-spatial": { damping: 0.8, stiffness: 380 },
    "fast-spatial": { damping: 0.6, stiffness: 800 },
    "slow-spatial": { damping: 0.8, stiffness: 200 },
    "default-effects": { damping: 1.0, stiffness: 1600 },
    "fast-effects": { damping: 1.0, stiffness: 3800 },
    "slow-effects": { damping: 1.0, stiffness: 800 },
  },
};

/** Normalised displacement from target: 1 at t=0, decaying to 0. */
function displacement(t, damping, stiffness) {
  const w0 = Math.sqrt(stiffness);
  const z = damping;
  if (z < 1) {
    const wd = w0 * Math.sqrt(1 - z * z);
    return (
      Math.exp(-z * w0 * t) *
      (Math.cos(wd * t) + ((z * w0) / wd) * Math.sin(wd * t))
    );
  }
  // z === 1; none of the M3 tokens are overdamped.
  return Math.exp(-w0 * t) * (1 + w0 * t);
}

/** Time (seconds) after which the spring is visually at rest. */
function settleTime(damping, stiffness) {
  const THRESHOLD = 0.001;
  const step = 0.001;
  let last = 0;
  for (let t = step; t < 4; t += step) {
    if (Math.abs(displacement(t, damping, stiffness)) > THRESHOLD) last = t;
  }
  return last + step;
}

function toLinear(damping, stiffness, samples) {
  const duration = settleTime(damping, stiffness);
  const points = [];
  for (let i = 0; i <= samples; i++) {
    const t = (i / samples) * duration;
    const progress = 1 - displacement(t, damping, stiffness);
    points.push(Number(progress.toFixed(4)));
  }
  points[0] = 0;
  points[points.length - 1] = 1;
  return { duration: Math.round(duration * 1000), easing: `linear(${points.join(", ")})` };
}

/** More samples where there is bounce to chase; fewer is smoother output. */
const SAMPLES = 28;

const lines = [
  "/*",
  " * GENERATED FILE — do not edit. Source: scripts/build-motion.cjs",
  " *",
  " * Material 3 spring motion, as CSS `linear()` easings plus the matching",
  " * settle durations. Each pair must be used together: the easing describes",
  " * the shape of the spring, the duration is how long that spring actually",
  " * takes to come to rest. Using one without the other gives you a curve",
  " * played at the wrong speed.",
  " *",
  " * Spatial springs (position, size, corner radius) overshoot past their",
  " * target — their `linear()` values go above 1. Effects springs (opacity,",
  " * colour) are critically damped and never overshoot, because a flickering",
  " * opacity reads as a bug rather than as liveliness.",
  " */",
  "",
];

// Expressive is the default and must be emitted FIRST, with the opt-in scoped
// to `:root[data-motion=...]` so it carries higher specificity. Emitting a bare
// `[data-motion="standard"]` block before `:root` was a real bug: both are
// (0,1,0), so `:root` won on source order and the switch did nothing.
const ORDER = ["expressive", "standard"];

for (const scheme of ORDER) {
  const tokens = SCHEMES[scheme];
  const selector =
    scheme === "expressive" ? ":root" : `:root[data-motion="${scheme}"]`;
  lines.push(
    `/* ---- ${scheme} scheme${scheme === "expressive" ? " (default)" : ""} ---- */`
  );
  lines.push(`${selector} {`);
  for (const [name, spec] of Object.entries(tokens)) {
    const { duration, easing } = toLinear(spec.damping, spec.stiffness, SAMPLES);
    const peak = (() => {
      let max = 0;
      for (let t = 0; t < 2; t += 0.002) {
        max = Math.max(max, 1 - displacement(t, spec.damping, spec.stiffness));
      }
      return max;
    })();
    lines.push(
      `  /* damping ${spec.damping}, stiffness ${spec.stiffness}` +
        `${peak > 1.001 ? `, overshoots to ${peak.toFixed(3)}` : ", no overshoot"} */`
    );
    lines.push(`  --md-sys-motion-spring-${name}-duration: ${duration}ms;`);
    lines.push(`  --md-sys-motion-spring-${name}: ${easing};`);
  }
  lines.push("}", "");
}

lines.push(
  "/* Springs are decorative. Under reduced-motion, collapse them to a short",
  " * linear fade so state changes stay legible without any travel or bounce. */",
  "@media (prefers-reduced-motion: reduce) {",
  "  :root {"
);
for (const name of Object.keys(SCHEMES.standard)) {
  lines.push(`    --md-sys-motion-spring-${name}-duration: 1ms;`);
  lines.push(`    --md-sys-motion-spring-${name}: linear;`);
}
lines.push("  }", "}", "");

fs.writeFileSync(OUT, lines.join("\n"), "utf8");
console.log(`[build-motion] ${path.relative(process.cwd(), OUT)}`);
for (const [scheme, tokens] of Object.entries(SCHEMES)) {
  for (const [name, spec] of Object.entries(tokens)) {
    const { duration } = toLinear(spec.damping, spec.stiffness, SAMPLES);
    let peak = 0;
    for (let t = 0; t < 2; t += 0.002) peak = Math.max(peak, 1 - displacement(t, spec.damping, spec.stiffness));
    console.log(
      `  ${scheme.padEnd(11)} ${name.padEnd(17)} ${String(duration).padStart(4)}ms  peak ${peak.toFixed(3)}`
    );
  }
}
