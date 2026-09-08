import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * Material 3 card — tonal, flat by default.
 *
 * The card is where M3's "tone carries hierarchy" rule pays off most visibly.
 * A card is a *different colour* than the page it sits on, so it needs no
 * shadow and no border to read as a bounded region. Default is therefore
 * `filled` at level 0: `surface-container-low` on a `surface` page.
 *
 *   filled    surface-container, level 0       (default)
 *   elevated  surface-container-low, level 1   (only over scrolling content)
 *   outlined  surface + 1dp outline-variant    (densest, cheapest visually)
 *
 * Two deliberate departures from a literal spec reading:
 *
 * - M3 calls a "filled card" `surface-container-highest` (tone 90). Against a
 *   tinted `surface` page (98) that is four steps down and cards start to read
 *   as a wall of blocks. `surface-container` (94) is two steps — clearly
 *   separated, still light — and leaves the two highest containers free for
 *   things nested *inside* a card. It also keeps the three variants visually
 *   distinct: at container-low, `filled` and `elevated` were the same colour
 *   and the soft level-1 shadow was not enough to tell them apart.
 * - Shape is large (16dp), not medium (12dp). M3 permits both for cards; 16dp
 *   is what makes a flat tonal surface read as soft rather than as a panel,
 *   and it is what current Google surfaces use.
 *
 * Header shape follows the M3 "eyebrow + headline" pattern: a tracked uppercase
 * `label-medium` category above a `title-large` name. The eyebrow does the work
 * a bold heading would otherwise do, which is how the headline gets to stay at
 * a normal weight — M3 almost never sets display or headline text bold.
 */
const cardVariants = cva(
  [
    "flex flex-col rounded-lg",
    "[--card-pad:1.25rem] gap-(--card-pad) py-(--card-pad)",
    "transition-[box-shadow,background-color] duration-200 ease-standard",
  ],
  {
    variants: {
      variant: {
        filled: "bg-surface-container text-on-surface shadow-level-0",
        elevated: "bg-surface-container-low text-on-surface shadow-level-1",
        outlined:
          "border border-outline-variant bg-surface text-on-surface shadow-level-0",
        /** For a card nested inside another card or a tonal region. */
        nested: "bg-surface-container-high text-on-surface shadow-level-0",
      },
      density: {
        comfortable: "[--card-pad:1.25rem]",
        compact: "[--card-pad:1rem]",
        spacious: "[--card-pad:1.5rem]",
      },
      /** Whole-card click target: M3 state layer, plus a hover lift when elevated. */
      interactive: {
        true: "state-layer m3-focus-ring shape-morph-interactive cursor-pointer active:rounded-md",
        false: "",
      },
    },
    compoundVariants: [
      {
        variant: "elevated",
        interactive: true,
        class: "hover:shadow-level-2 active:shadow-level-1",
      },
    ],
    defaultVariants: {
      variant: "filled",
      density: "comfortable",
      interactive: false,
    },
  }
)

function Card({
  className,
  variant,
  density,
  interactive,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof cardVariants>) {
  return (
    <div
      data-slot="card"
      data-variant={variant ?? "filled"}
      className={cn(cardVariants({ variant, density, interactive }), className)}
      {...props}
    />
  )
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "@container/card-header grid auto-rows-min items-start gap-1 px-(--card-pad)",
        "has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-(--card-pad)",
        className
      )}
      {...props}
    />
  )
}

/**
 * Tracked uppercase category line above the title. Optional, but it is what
 * gives a flat tonal card its sense of structure without a rule or a shadow.
 */
function CardEyebrow({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-eyebrow"
      className={cn(
        "text-label-md tracking-[0.1em] text-on-surface-variant uppercase",
        className
      )}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn("text-title-lg text-on-surface", className)}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-body-md text-on-surface-variant", className)}
      {...props}
    />
  )
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-full row-start-1 self-start justify-self-end text-on-surface-variant",
        className
      )}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("px-(--card-pad)", className)}
      {...props}
    />
  )
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn(
        "flex items-center gap-2 px-(--card-pad) [.border-t]:pt-(--card-pad)",
        className
      )}
      {...props}
    />
  )
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardEyebrow,
  CardAction,
  CardDescription,
  CardContent,
  cardVariants,
}
