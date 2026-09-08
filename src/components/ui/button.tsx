import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

/**
 * Material 3 button.
 *
 * Variants are M3's five: elevated, filled, tonal, outlined, text. The shadcn
 * names (default / secondary / outline / ghost / destructive / link) are kept as
 * aliases so the 149 files already calling this component keep compiling and
 * render correctly; prefer the M3 names in new code.
 *
 * Three things differ structurally from the shadcn original:
 *
 * 1. Interaction is a state layer, not a container-colour swap. `hover:bg-primary/90`
 *    is replaced by the `state-layer` utility, which washes `currentColor` over
 *    the container at M3's 8/10/10% opacities. One rule covers every variant,
 *    including the transparent ones where darkening the container does nothing.
 *
 * 2. Disabled is per-element, not `opacity-50`. M3 specifies container at
 *    on-surface/12 and label at on-surface/38, so a disabled filled button and a
 *    disabled text button end up looking like the same *kind* of thing — which
 *    blanket opacity cannot achieve, because it also fades the container's own
 *    contrast against the page.
 *
 * 3. **No press shape morph.** M3 Expressive treats shape as a state — press a
 *    button and its corners tighten one step on the shape scale — and this
 *    component did that via `active:rounded-md` plus `shape-morph-interactive`.
 *    It has been removed on request: on a `rounded-full` control the morph is a
 *    pill snapping to a rounded rectangle and back on every single click, which
 *    across a form full of buttons reads as the UI glitching rather than as the
 *    button acknowledging the press. The state layer and the elevation change
 *    already carry the press, and they carry it without moving the geometry.
 *    The `shape-morph` utilities still exist in shape.css for the components
 *    that keep it (`ui/card.tsx`, `m3/quick-action.tsx`), so nothing else
 *    changed; only the transition list here lost `border-radius`, which is why
 *    it is now `motion-effects-fast` plus an explicit property list instead of
 *    the combined `shape-morph-interactive`.
 *
 * 4. No ripple. Adding one would force `"use client"` onto a component imported
 *    by ~150 files, most of them Server Components, and drag the client boundary
 *    up with it. The CSS state layer covers hover/focus/press; where the press
 *    ripple genuinely matters (nav items, list rows, FABs — all already client
 *    components) compose `<Ripple />` from @/components/m3/ripple.
 */
const buttonVariants = cva(
  [
    "state-layer m3-focus-ring motion-effects-fast",
    "transition-[background-color,box-shadow,border-color,color,transform]",
    "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap",
    "text-label-lg rounded-full",
    "disabled:pointer-events-none",
    // M3 buttons use 18dp icons, not 16dp.
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-[18px]",
  ],
  {
    variants: {
      variant: {
        /** Surface-tinted container with a resting shadow. Use when a button
         *  needs separation from a busy background without shouting. */
        elevated:
          "bg-surface-container-low text-primary shadow-level-1 hover:shadow-level-2 active:shadow-level-1 disabled:bg-on-surface/12 disabled:text-on-surface/38 disabled:shadow-level-0",
        /** The high-emphasis action. One per screen, ideally. */
        filled:
          "bg-primary text-on-primary shadow-level-0 hover:shadow-level-1 active:shadow-level-0 disabled:bg-on-surface/12 disabled:text-on-surface/38 disabled:shadow-level-0",
        /** Medium emphasis — M3's answer to "secondary button". */
        tonal:
          "bg-secondary-container text-on-secondary-container shadow-level-0 hover:shadow-level-1 active:shadow-level-0 disabled:bg-on-surface/12 disabled:text-on-surface/38 disabled:shadow-level-0",
        outlined:
          "border border-outline bg-transparent text-primary focus-visible:border-primary disabled:border-on-surface/12 disabled:text-on-surface/38",
        text: "bg-transparent text-primary disabled:text-on-surface/38",

        /** M3 has no destructive button; error-as-container is the accepted
         *  extension. Kept filled so a delete action stays high-emphasis. */
        destructive:
          "bg-error text-on-error shadow-level-0 hover:shadow-level-1 active:shadow-level-0 disabled:bg-on-surface/12 disabled:text-on-surface/38 disabled:shadow-level-0",
        /** M3 FAB. Pair with `size="fab"` (56dp) — the container colour and
         *  the geometry are separate axes because M3 has four FAB sizes and
         *  three colour mappings. */
        fab: "bg-primary-container text-on-primary-container shadow-level-3 hover:shadow-level-4 active:shadow-level-3",
        "fab-surface":
          "bg-surface-container-high text-primary shadow-level-3 hover:shadow-level-4 active:shadow-level-3",
        "destructive-tonal":
          "bg-error-container text-on-error-container hover:shadow-level-1 disabled:bg-on-surface/12 disabled:text-on-surface/38",

        // --- shadcn aliases (deprecated) ---
        default:
          "bg-primary text-on-primary shadow-level-0 hover:shadow-level-1 active:shadow-level-0 disabled:bg-on-surface/12 disabled:text-on-surface/38 disabled:shadow-level-0",
        secondary:
          "bg-secondary-container text-on-secondary-container shadow-level-0 hover:shadow-level-1 active:shadow-level-0 disabled:bg-on-surface/12 disabled:text-on-surface/38 disabled:shadow-level-0",
        outline:
          "border border-outline bg-transparent text-primary focus-visible:border-primary disabled:border-on-surface/12 disabled:text-on-surface/38",
        ghost: "bg-transparent text-primary disabled:text-on-surface/38",
        link: "bg-transparent text-primary underline-offset-4 hover:underline disabled:text-on-surface/38",
      },
      size: {
        /** M3 standard: 40dp tall, 24dp of horizontal padding. */
        default: "h-10 px-6 has-[>svg]:pl-4",
        md: "h-10 px-6 has-[>svg]:pl-4",
        /** M3 Expressive extra-small. Below this you are under the 32dp
         *  minimum, so `xs` is the floor for anything tappable. */
        xs: "h-8 gap-1.5 px-3 text-label-md has-[>svg]:pl-2 [&_svg:not([class*='size-'])]:size-4",
        /** Documented deviation: M3 offers no 36dp step, and jumping the ~40
         *  existing `size="sm"` call sites straight to 40dp costs a row of
         *  visible records in the admin data tables. 36dp keeps that density. */
        sm: "h-9 px-4 has-[>svg]:pl-3",
        /** M3 Expressive medium. */
        lg: "h-14 px-8 text-title-md has-[>svg]:pl-6 [&_svg:not([class*='size-'])]:size-6",

        icon: "size-10",
        "icon-xs": "size-8 [&_svg:not([class*='size-'])]:size-4",
        "icon-sm": "size-9",
        "icon-lg": "size-14 [&_svg:not([class*='size-'])]:size-6",

        /** M3 FAB: 56dp, extra-large shape 28dp (rounded-xl), resting level 3. */
        fab: "size-14 rounded-xl [&_svg:not([class*='size-'])]:size-6",
      },
    },
    compoundVariants: [
      // Text-only variants sit closer to their label — 12dp, not 24dp — because
      // there is no container edge to breathe away from.
      { variant: ["text", "ghost", "link"], size: ["default", "md"], class: "px-3 has-[>svg]:pl-2" },
      { variant: ["text", "ghost", "link"], size: "sm", class: "px-3 has-[>svg]:pl-2" },
      { variant: ["text", "ghost", "link"], size: "xs", class: "px-2 has-[>svg]:pl-1.5" },
      { variant: ["text", "ghost", "link"], size: "lg", class: "px-4 has-[>svg]:pl-3" },
    ],
    defaultVariants: {
      variant: "filled",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "filled",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
