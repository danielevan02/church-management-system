/* eslint-disable */
// One-shot icon generator. Reads scripts/source-logo.png (or arg), emits the
// icon set referenced by the manifest + sw.js into public/.
//
// Re-run after replacing scripts/source-logo.png with a different church's logo:
//   pnpm icons
//
// Source logo should be ≥512×512 PNG with a transparent background. The badge
// silhouette is derived from the alpha channel — opaque pixels become white,
// transparent stays transparent. Logos with opaque (white) backgrounds will
// produce a square badge; either re-export with transparent bg or replace
// the badge step with a hand-drawn monochrome icon.

const path = require("path");
const fs = require("fs");

const sharp = require("sharp");

const ROOT = path.resolve(__dirname, "..");
const PUBLIC = path.join(ROOT, "public");
const SOURCE = process.argv[2]
  ? path.resolve(process.cwd(), process.argv[2])
  : path.join(__dirname, "source-logo.png");

if (!fs.existsSync(SOURCE)) {
  console.error(`source not found: ${SOURCE}`);
  process.exit(1);
}
console.log(`source: ${path.relative(ROOT, SOURCE)}`);

async function fitTransparent(size, dest) {
  await sharp(SOURCE)
    .resize(size, size, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(path.join(PUBLIC, dest));
  console.log(`  ${dest} (${size}x${size}, transparent)`);
}

async function maskable(size, dest) {
  // Android maskable: 80% safe zone in the center, white padding around.
  const inner = Math.round(size * 0.8);
  const buf = await sharp(SOURCE)
    .resize(inner, inner, { fit: "contain", background: { r: 255, g: 255, b: 255, alpha: 0 } })
    .png()
    .toBuffer();
  await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    },
  })
    .composite([{ input: buf, gravity: "center" }])
    .png()
    .toFile(path.join(PUBLIC, dest));
  console.log(`  ${dest} (${size}x${size}, maskable, 80% safe zone)`);
}

async function badge(size, dest) {
  // Status-bar badge: silhouette in solid white, alpha taken from source.
  const resized = await sharp(SOURCE)
    .resize(size, size, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { data, info } = resized;
  // Replace RGB with white, keep alpha as-is.
  for (let i = 0; i < data.length; i += 4) {
    data[i] = 255;
    data[i + 1] = 255;
    data[i + 2] = 255;
  }
  await sharp(data, {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .png()
    .toFile(path.join(PUBLIC, dest));
  console.log(`  ${dest} (${size}x${size}, monochrome white)`);
}

async function favicon() {
  await sharp(SOURCE)
    .resize(32, 32, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(path.join(PUBLIC, "favicon-32.png"));
  // Browsers happily accept .png at /favicon.ico when served with the right
  // content-type, but for max compat we'll just write favicon-32.png — Next.js
  // app/icon.* handles the proper favicon if needed.
  console.log("  favicon-32.png (32x32)");
}

(async () => {
  console.log("generating...");
  await fitTransparent(192, "icon-192.png");
  await fitTransparent(512, "icon-512.png");
  await maskable(512, "icon-maskable.png");
  await badge(72, "badge-72.png");
  await badge(96, "badge-96.png");
  await favicon();
  console.log("done.");
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
