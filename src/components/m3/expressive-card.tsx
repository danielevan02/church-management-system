import * as React from "react";
import { Slot } from "radix-ui";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * The container of the expressive layout language.
 *
 * `ui/card.tsx` is still the right component for a titled, structured card with
 * a header/content/footer rhythm. This is the other thing the member dashboard
 * proved out: a *block* — a soft, borderless, tonal region at 24dp that holds
 * whatever composition the feature needs.
 *
 * Three deliberate departures from `ui/card.tsx`:
 *
 * 1. **24dp, not 16dp.** At `rounded-lg` a tonal block reads as a panel. The
 *    step to `rounded-3xl` is what makes the same colour read as soft, and it is
 *    the single change that most defines this language. Nested blocks step *down*
 *    to 16dp so the nesting is legible — see `tone="nested"`.
 *
 * 2. **`surface-container-low`, not `surface-container`.** One step of tone
 *    instead of two. The blocks in this language are large and repeat down the
 *    page, so two steps becomes the wall of grey that `ui/card.tsx`'s header
 *    comment warns about at `surface-container-highest`. One step still separates
 *    cleanly, and it leaves `surface-container` free as the *hover* state, which
 *    is how an interactive block signals itself without a shadow.
 *
 * 3. **No border, ever.** Tone carries the boundary. `tone="outline"` exists for
 *    the one case tone cannot serve — a block sitting directly on a
 *    `surface-container` region, where a tonal step would be invisible.
 *
 * Interactive blocks lift rather than just tint: `hover:shadow-level-1` plus a
 * 2px rise, and a press that scales to 0.99. Everything rides the *effects*
 * spring, including the transform. `Button` splits radius onto the spatial
 * spring because a corner morph is travel you can see overshoot in; a 2px lift
 * is not — at that amplitude the spatial spring's 1.095 overshoot is a fifth of
 * a pixel, and one transition list per element cannot carry two easings anyway.
 */
const expressiveCardVariants = cva(
  [
    "relative flex flex-col rounded-3xl",
    "motion-effects-fast transition-[background-color,box-shadow,border-color,transform]",
  ],
  {
    variants: {
      tone: {
        /** Default block. One tonal step off the page. */
        low: "bg-surface-container-low text-on-surface shadow-level-0",
        /** For a block that must out-rank its neighbours without accent colour. */
        high: "bg-surface-container-high text-on-surface shadow-level-0",
        /** Accent block. Use once per screen — it reads as the subject. */
        tonal: "bg-secondary-container text-on-secondary-container shadow-level-0",
        /** The hero gradient. Accent bleeding into surface, top-left to bottom-right. */
        gradient:
          "bg-linear-to-br from-primary/10 via-surface-container-high to-surface-container text-on-surface shadow-level-0",
        /** Inside another block or a tonal region: one step up, one step tighter. */
        nested: "rounded-2xl bg-surface-container-high text-on-surface shadow-level-0",
        /** Only when a tonal step would be invisible against the page. */
        outline: "border border-outline-variant/60 bg-surface text-on-surface shadow-level-0",
        /** Errors, overdue items, destructive confirmations. */
        error: "bg-error-container text-on-error-container shadow-level-0",
      },
      padding: {
        none: "",
        // `compact` is resolved against the tone's radius in compoundVariants
        // below, because the two scales are not independent — see the note.
        compact: "",
        default: "p-5 sm:p-6",
        spacious: "p-6 sm:p-8",
      },
      interactive: {
        true: [
          "cursor-pointer text-left m3-focus-ring",
          "hover:-translate-y-0.5 hover:shadow-level-1",
          "active:translate-y-0 active:scale-[0.99]",
        ],
        false: "",
      },
    },
    compoundVariants: [
      // `compact` means "one step tighter than default", and what that resolves
      // to depends on the corner it is insetting from. On a rounded shape the
      // clearance that reads is the *diagonal* one at the corner: content inset
      // by p from both edges clears the arc only while p > r(1 - 1/root2), or
      // ~0.29r, and below roughly half again that it looks wedged into the
      // curve rather than inset from it. Note these are the *M3* radii from
      // shape.css, not Tailwind's — `rounded-3xl` here is 48dp and
      // `rounded-2xl` is 36dp, so the numbers are much less forgiving than the
      // class names suggest. A 16dp inset inside the 48dp default corner leaves
      // 16dp at the sides and 2.7dp on the diagonal, which is what had the
      // `StatTile` icon chip sitting on the curve. So: 16dp against `nested`'s
      // 36dp corner (7.7dp diagonal) and 20dp against the 48dp ones (8.4dp) —
      // the pairing exists so the two scales cannot drift apart by hand.
      { padding: "compact", tone: "nested", class: "p-4" },
      {
        padding: "compact",
        tone: ["low", "high", "tonal", "gradient", "outline", "error"],
        class: "p-5",
      },

      // The hover tone has to know the resting tone, so it lives here rather
      // than in `interactive` — one step up from wherever the block started.
      { interactive: true, tone: "low", class: "hover:bg-surface-container" },
      { interactive: true, tone: "high", class: "hover:bg-surface-container-highest" },
      { interactive: true, tone: "nested", class: "hover:bg-surface-container-highest" },
      { interactive: true, tone: "outline", class: "hover:bg-surface-container-low" },
      { interactive: true, tone: "gradient", class: "hover:via-surface-container-highest" },
    ],
    defaultVariants: { tone: "low", padding: "default", interactive: false },
  },
);

export type ExpressiveCardProps = React.ComponentProps<"div"> &
  VariantProps<typeof expressiveCardVariants> & {
    asChild?: boolean;
  };

export function ExpressiveCard({
  className,
  tone,
  padding,
  interactive,
  asChild = false,
  ...props
}: ExpressiveCardProps) {
  const Comp = asChild ? Slot.Root : "div";

  return (
    <Comp
      data-slot="expressive-card"
      className={cn(
        expressiveCardVariants({ tone, padding, interactive }),
        className,
      )}
      {...props}
    />
  );
}

/**
 * A large, very low-opacity icon bled off the bottom-right corner of a block.
 *
 * The devotional hero card's trick, generalised. At 4% it is not decoration you
 * notice — it is what stops a big block of body text from reading as an empty
 * rectangle, and it grows slightly on hover so an interactive block has
 * something to respond with beyond its own shadow.
 */
export function CardWatermark({
  icon: Icon,
  className,
}: {
  icon: React.ComponentType<{ className?: string }>;
  className?: string;
}) {
  return (
    <Icon
      aria-hidden
      className={cn(
        "pointer-events-none absolute -right-4 -bottom-4 h-32 w-32 select-none text-primary/[0.04]",
        "transition-transform duration-300 group-hover:scale-110",
        className,
      )}
    />
  );
}

export { expressiveCardVariants };
