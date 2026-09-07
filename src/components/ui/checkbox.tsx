"use client"

import * as React from "react"
import { CheckIcon } from "lucide-react"
import { Checkbox as CheckboxPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

/**
 * M3 checkbox: 18dp box, 2dp corners, 2dp `on-surface-variant` outline,
 * filling to `primary` with an `on-primary` tick when checked.
 *
 * `state-layer-control` gives it the 40dp circular state layer that overhangs
 * the box — that is what makes an 18dp control hit M3's 40dp touch target, and
 * it is the detail most "M3-styled" checkboxes miss.
 *
 * The wash colour is set explicitly per state rather than left to
 * `currentColor`: unchecked, the box has no text colour of its own, and once
 * checked `currentColor` would be `on-primary` (white), which is the wrong
 * wash over a light page.
 */
function Checkbox({
  className,
  ...props
}: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "state-layer-control m3-focus-ring peer size-[18px] shrink-0 rounded-[2px]",
        "border-2 border-on-surface-variant bg-transparent",
        "transition-[background-color,border-color] duration-150 ease-standard",
        "[--md-state-layer-color:var(--md-sys-color-on-surface)]",
        "data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-on-primary",
        "data-[state=checked]:[--md-state-layer-color:var(--md-sys-color-primary)]",
        "data-[state=indeterminate]:border-primary data-[state=indeterminate]:bg-primary data-[state=indeterminate]:text-on-primary",
        "disabled:cursor-not-allowed disabled:border-on-surface/38 disabled:data-[state=checked]:border-transparent disabled:data-[state=checked]:bg-on-surface/38",
        "aria-invalid:border-error",
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="grid place-content-center text-current transition-none"
      >
        <CheckIcon className="size-3.5" strokeWidth={3} />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}

export { Checkbox }
