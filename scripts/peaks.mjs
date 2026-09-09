#!/usr/bin/env node
/**
 * Reads raw 16-bit mono PCM on stdin and prints the JSON peak array used by
 * `src/components/landing/sanctuary-peaks.ts`.
 *
 * Usage:
 *   ffmpeg -i public/landing-page/sanctuary.m4a -ac 1 -ar 16000 -f s16le - \
 *     | node scripts/peaks.mjs
 *
 * Peak (max absolute sample) per bucket rather than RMS, with the observed
 * dynamic range stretched across the bar height: the source is quiet room tone
 * whose RMS barely moves, and plotting it unstretched plots a flat block.
 */
const BUCKETS = Number(process.argv[2] ?? 128);
const FLOOR = 0.14;

const chunks = [];
process.stdin.on("data", (c) => chunks.push(c));
process.stdin.on("end", () => {
  const buf = Buffer.concat(chunks);
  const samples = Math.floor(buf.length / 2);
  if (!samples) {
    console.error("no PCM on stdin");
    process.exit(1);
  }
  const per = Math.floor(samples / BUCKETS);
  const peaks = [];
  for (let b = 0; b < BUCKETS; b++) {
    let max = 0;
    for (let i = 0; i < per; i++) {
      const v = Math.abs(buf.readInt16LE((b * per + i) * 2)) / 32768;
      if (v > max) max = v;
    }
    peaks.push(max);
  }
  const lo = Math.min(...peaks);
  const hi = Math.max(...peaks);
  const span = hi - lo || 1;
  console.log(
    JSON.stringify(
      peaks.map((p) => Math.round((FLOOR + ((p - lo) / span) * (1 - FLOOR)) * 100) / 100),
    ),
  );
});
