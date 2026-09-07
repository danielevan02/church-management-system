"use client"

import * as React from "react"
import { Tooltip as TooltipPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

function TooltipProvider({
  delayDuration = 0,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Provider>) {
  return (
    <TooltipPrimitive.Provider
      data-slot="tooltip-provider"
      delayDuration={delayDuration}
      {...props}
    />
  )
}

function Tooltip({
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Root>) {
  return <TooltipPrimitive.Root data-slot="tooltip" {...props} />
}

function TooltipTrigger({
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Trigger>) {
  return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />
}

/**
 * M3 plain tooltip: `inverse-surface` container, `inverse-on-surface` label,
 * `body-small`, 4dp shape, 24dp min height, and no elevation.
 *
 * The arrow is deliberately gone. M3 tooltips — plain and rich — have no
 * caret; the inverse surface is what makes them read as a layer above the page.
 * Keeping an arrow is the single clearest giveaway of a Material-flavoured
 * tooltip that isn't actually following the spec.
 */
function TooltipContent({
  className,
  sideOffset = 4,
  children,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Content>) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        data-slot="tooltip-content"
        sideOffset={sideOffset}
        className={cn(
          "z-50 flex min-h-6 w-fit items-center rounded-xs px-2 py-1",
          "bg-inverse-surface text-body-sm text-balance text-inverse-on-surface",
          "origin-(--radix-tooltip-content-transform-origin)",
          "data-[state=delayed-open]:m3-dialog-enter data-[state=instant-open]:m3-dialog-enter",
          "data-[state=closed]:m3-dialog-exit",
          className
        )}
        {...props}
      >
        {children}
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  )
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }
