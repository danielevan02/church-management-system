/**
 * Waveform peaks for `public/landing-page/sanctuary.m4a`, precomputed from the
 * file's own PCM at build time rather than decoded in the browser.
 *
 * Decoding 115 KB of AAC through Web Audio to draw 128 bars costs a download,
 * a decode and a main-thread stall for a purely decorative result — and it
 * fails outright when autoplay policy leaves the AudioContext suspended. These
 * are real amplitudes (peak per bucket, dynamic range stretched across the bar
 * height because room tone is quiet and nearly constant), so the shape on
 * screen is the shape of the recording.
 *
 * Regenerate with:
 *   ffmpeg -i public/landing-page/sanctuary.m4a -ac 1 -ar 16000 -f s16le - \\
 *     | node scripts/peaks.mjs
 */
export const SANCTUARY_PEAKS: readonly number[] = [
  0.52, 0.75, 0.61, 0.57, 0.62, 0.71, 0.60, 0.59, 0.68, 0.74, 0.55, 0.53, 0.67, 0.71, 0.78, 0.62,
  0.70, 0.62, 0.56, 0.68, 0.48, 0.59, 0.58, 0.53, 0.50, 0.43, 0.60, 0.66, 0.62, 0.70, 0.66, 0.58,
  0.65, 0.80, 0.94, 0.85, 0.88, 1.00, 0.88, 0.90, 0.93, 0.82, 0.84, 0.54, 0.79, 0.75, 0.65, 0.47,
  0.38, 0.35, 0.26, 0.43, 0.41, 0.26, 0.19, 0.48, 0.40, 0.14, 0.44, 0.40, 0.28, 0.49, 0.47, 0.45,
  0.67, 0.44, 0.55, 0.40, 0.47, 0.64, 0.38, 0.51, 0.49, 0.55, 0.62, 0.47, 0.57, 0.57, 0.70, 0.51,
  0.53, 0.41, 0.42, 0.45, 0.40, 0.49, 0.37, 0.24, 0.15, 0.28, 0.21, 0.22, 0.28, 0.24, 0.42, 0.42,
  0.29, 0.29, 0.40, 0.45, 0.35, 0.23, 0.28, 0.28, 0.31, 0.23, 0.23, 0.19, 0.20, 0.36, 0.59, 0.71,
  0.46, 0.40, 0.38, 0.48, 0.37, 0.40, 0.48, 0.29, 0.36, 0.42, 0.30, 0.45, 0.59, 0.41, 0.32, 0.36,
] as const;

/** Seconds of audio. Kept beside the peaks so the two cannot drift apart. */
export const SANCTUARY_DURATION = 9.4;
