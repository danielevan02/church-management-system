import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/**
 * M3 type-scale roles registered as font sizes.
 *
 * Without this, tailwind-merge silently deletes them. It resolves conflicts by
 * bucketing each class into a group, and it only knows Tailwind's *default*
 * size scale (`text-sm`, `text-lg`, …). A custom `--text-*` key like
 * `text-title-lg` is unrecognised, so it falls through to the `text-color`
 * group — the same group as `text-on-surface` — and `cn("text-title-lg
 * text-on-surface")` returns just the colour. Every card title, dialog
 * headline and badge label in this codebase lost its size that way, and
 * nothing failed: 53 of the 105 type-role call sites pair a role with a colour
 * in one string.
 *
 * The lesson generalises. A design system that adds `@theme` keys owes
 * tailwind-merge a matching class group, or `cn()` quietly eats them.
 */
const M3_FONT_SIZES = [
  "display-lg",
  "display-md",
  "display-sm",
  "headline-lg",
  "headline-md",
  "headline-sm",
  "title-lg",
  "title-md",
  "title-sm",
  "body-lg",
  "body-md",
  "body-sm",
  "label-lg",
  "label-md",
  "label-sm",
] as const;

/** M3 elevation levels, so `shadow-level-2` and `shadow-level-0` conflict. */
const M3_SHADOWS = ["level-0", "level-1", "level-2", "level-3", "level-4", "level-5"] as const;

const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [{ text: [...M3_FONT_SIZES] }],
      shadow: [{ shadow: [...M3_SHADOWS] }],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
