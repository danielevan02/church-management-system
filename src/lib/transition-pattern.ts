/**
 * Chooses which M3 transition pattern applies between two routes.
 *
 * M3 picks a pattern from the *relationship* between two screens, not from
 * taste: a spatial or navigational relationship gets shared axis, destinations
 * with no strong relationship get fade through. Route depth is the only signal
 * available without annotating every link, and it happens to encode exactly
 * that distinction in this app's URL shape.
 *
 * Pure on purpose — this is the part of the page transition that can actually
 * be wrong, so it is testable without a DOM.
 */
export type TransitionPattern =
  | "m3-axis-forward"
  | "m3-axis-backward"
  | "m3-fade-through"
  | "m3-container-transform"
  | null;

/** Path segments, ignoring empty ones from leading/trailing slashes. */
function segments(path: string): string[] {
  return path.split("/").filter(Boolean);
}

/**
 * @param from previous pathname, or `null` on first load
 * @param to   current pathname
 * @returns the utility class to apply, or `null` for no animation
 */
export function pickTransitionPattern(
  from: string | null,
  to: string
): TransitionPattern {
  // Nothing navigated to get to the first screen, so nothing should animate.
  if (from === null) return null;

  const before = segments(from);
  const after = segments(to);

  // Compare normalised, not raw: "/me/events/" and "/me/events" are the same
  // route, and a raw string comparison would let a trailing slash fall through
  // to the depth check and animate a navigation that never happened.
  if (before.length === after.length && before.every((seg, i) => seg === after[i])) {
    return null;
  }

  if (after.length > before.length) return "m3-axis-forward";
  if (after.length < before.length) return "m3-axis-backward";
  return "m3-fade-through";
}
