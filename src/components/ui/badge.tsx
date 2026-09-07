import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

/**
 * Status pill, M3-flavoured.
 *
 * M3 has two things in this space and neither is quite this component: a
 * *badge* (a 16dp `error` dot or count on an icon) and a *chip* (32dp,
 * interactive, filters or represents an entity). What this codebase actually
 * uses Badge for, across 38 files, is a non-interactive status pill inside
 * table rows — so it is sized between the two: 24dp with `label-medium`,
 * fully round, tonal container roles.
 *
 * `default` moved from solid `primary` to `secondary-container`. A small pill
 * filled with `primary` is very loud in M3's colour system, and status pills
 * are ambient information — the row is the content, not the badge. Use
 * `variant="primary"` where a badge genuinely needs to shout.
 *
 * `success` and `warning` use the M3 custom colours from roles.css, which is
 * what the hardcoded emerald/amber utilities scattered around the app should
 * become — those ignored the theme and inverted badly in dark mode.
 */
const badgeVariants = cva(
  [
    "m3-focus-ring inline-flex h-6 w-fit shrink-0 items-center justify-center gap-1",
    "overflow-hidden rounded-full border border-transparent px-2",
    "text-label-md whitespace-nowrap",
    "transition-[background-color,border-color,color] duration-150 ease-standard",
    "[&>svg]:pointer-events-none [&>svg]:size-3.5",
    // Only anchors/buttons rendered through asChild are interactive.
    "[a&]:state-layer [button&]:state-layer",
  ],
  {
    variants: {
      variant: {
        default: "bg-secondary-container text-on-secondary-container",
        primary: "bg-primary text-on-primary",
        tertiary: "bg-tertiary-container text-on-tertiary-container",
        success: "bg-success-container text-on-success-container",
        warning: "bg-warning-container text-on-warning-container",
        destructive: "bg-error text-on-error",
        "destructive-tonal": "bg-error-container text-on-error-container",
        secondary: "bg-surface-container-highest text-on-surface-variant",
        outline: "border-outline bg-transparent text-on-surface-variant",
        ghost: "bg-transparent text-on-surface-variant",
        link: "bg-transparent text-primary underline-offset-4 [a&]:hover:underline",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "span"

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
