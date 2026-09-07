"use client"

import * as React from "react"
import { Label as LabelPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

/**
 * Standalone form label.
 *
 * M3 has no label-above-the-control pattern — its text field owns its label.
 * This exists for the label-above forms already in the codebase; new forms
 * should reach for `@/components/m3/text-field` instead. Typed as `label-large`
 * (14/20, weight 500), which is what M3 uses for control labels.
 *
 * Disabled goes to `on-surface/38` rather than `opacity-50`: opacity fades the
 * label's contrast against the page as well as against its own container.
 */
function Label({
  className,
  ...props
}: React.ComponentProps<typeof LabelPrimitive.Root>) {
  return (
    <LabelPrimitive.Root
      data-slot="label"
      className={cn(
        "flex items-center gap-2 text-label-lg text-on-surface select-none",
        "group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:text-on-surface/38",
        "peer-disabled:cursor-not-allowed peer-disabled:text-on-surface/38",
        className
      )}
      {...props}
    />
  )
}

export { Label }
