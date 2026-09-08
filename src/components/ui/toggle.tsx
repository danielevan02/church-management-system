"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Toggle as TogglePrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

/**
 * M3 toggle button.
 *
 * A standalone toggle in M3 is an *icon button in toggle mode*: 40dp, fully
 * round, and selection is expressed by filling the container — `standard`
 * fills to `primary`/`on-primary`, `outlined` fills to `inverse-surface`,
 * `tonal` to `secondary-container`. shadcn's `data-[state=on]:bg-surface-container-highest` (a
 * faint grey tint) reads as "hovered", not "selected", which is the whole
 * problem M3's filled-when-selected rule solves.
 *
 * Inside a `ToggleGroup` these are restyled into a segmented button — see
 * toggle-group.tsx.
 */
const toggleVariants = cva(
  [
    "state-layer m3-focus-ring motion-effects-fast",
    "transition-[background-color,box-shadow,border-color,color,transform]",
    "inline-flex items-center justify-center gap-2 rounded-full whitespace-nowrap",
    "text-label-lg",
    "disabled:pointer-events-none disabled:text-on-surface/38",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-6",
  ],
  {
    variants: {
      variant: {
        standard:
          "bg-transparent text-on-surface-variant data-[state=on]:bg-primary data-[state=on]:text-on-primary",
        outlined:
          "border border-outline bg-transparent text-on-surface-variant data-[state=on]:border-transparent data-[state=on]:bg-inverse-surface data-[state=on]:text-inverse-on-surface disabled:border-on-surface/12",
        tonal:
          "bg-surface-container-highest text-on-surface-variant data-[state=on]:bg-secondary-container data-[state=on]:text-on-secondary-container disabled:bg-on-surface/12",

        // deprecated shadcn aliases
        default:
          "bg-transparent text-on-surface-variant data-[state=on]:bg-primary data-[state=on]:text-on-primary",
        outline:
          "border border-outline bg-transparent text-on-surface-variant data-[state=on]:border-transparent data-[state=on]:bg-inverse-surface data-[state=on]:text-inverse-on-surface disabled:border-on-surface/12",
      },
      size: {
        default: "size-10 px-2",
        sm: "size-8 px-1.5 [&_svg:not([class*='size-'])]:size-5",
        lg: "size-14 px-3",
      },
    },
    defaultVariants: {
      variant: "standard",
      size: "default",
    },
  }
)

function Toggle({
  className,
  variant,
  size,
  ...props
}: React.ComponentProps<typeof TogglePrimitive.Root> &
  VariantProps<typeof toggleVariants>) {
  return (
    <TogglePrimitive.Root
      data-slot="toggle"
      className={cn(toggleVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Toggle, toggleVariants }
