import { z } from "zod";

/**
 * Optional enum that gracefully accepts the empty string `""` (the default
 * "no selection" value emitted by HTML `<select>` elements) and treats it
 * as `null`. Without this preprocess, Zod 4 rejects `""` with the literal
 * message:
 *
 *   "Invalid option: expected one of \"X\"|\"Y\"|..."
 *
 * which leaks raw enum identifiers into the user-facing form error.
 *
 * Use for any enum field where the form's FormValues type allows `""` as
 * the "unset" state (typical for shadcn/Radix Select with a placeholder).
 *
 * Output: `T[number] | null`.
 */
export function optionalEnum<const T extends readonly [string, ...string[]]>(
  values: T,
) {
  return z
    .preprocess(
      (v) => (v === "" || v == null ? undefined : v),
      z.enum(values).optional(),
    )
    .transform((v): T[number] | null => v ?? null);
}
