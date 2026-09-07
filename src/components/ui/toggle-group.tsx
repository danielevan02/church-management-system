"use client"

import * as React from "react"
import { type VariantProps } from "class-variance-authority"
import { ToggleGroup as ToggleGroupPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"
import { toggleVariants } from "@/components/ui/toggle"

/**
 * M3 segmented button.
 *
 * When `spacing` is 0 (the default) the group becomes a real segmented button:
 * one shared 1dp `outline` ring, fully-round outer ends, square inner joins
 * with a single divider between segments, and `secondary-container` on the
 * selected segment.
 *
 * `Toggle`'s own variants make round 40dp icon-button toggles, which is what a
 * standalone toggle is in M3. The segmented shape only applies inside a group,
 * so the shape overrides live here rather than in toggle.tsx.
 */
const ToggleGroupContext = React.createContext<
  VariantProps<typeof toggleVariants> & {
    spacing?: number
  }
>({
  size: "default",
  variant: "outlined",
  spacing: 0,
})

function ToggleGroup({
  className,
  variant = "outlined",
  size,
  spacing = 0,
  children,
  ...props
}: React.ComponentProps<typeof ToggleGroupPrimitive.Root> &
  VariantProps<typeof toggleVariants> & {
    spacing?: number
  }) {
  return (
    <ToggleGroupPrimitive.Root
      data-slot="toggle-group"
      data-variant={variant}
      data-size={size}
      data-spacing={spacing}
      style={{ "--gap": spacing } as React.CSSProperties}
      className={cn(
        "group/toggle-group flex w-fit items-center gap-[--spacing(var(--gap))]",
        // The ring belongs to the group so segments share one outline instead
        // of doubling it at every join.
        "data-[spacing=0]:rounded-full data-[spacing=0]:data-[variant=outlined]:border data-[spacing=0]:data-[variant=outlined]:border-outline",
        "data-[spacing=0]:overflow-hidden",
        className
      )}
      {...props}
    >
      <ToggleGroupContext.Provider value={{ variant, size, spacing }}>
        {children}
      </ToggleGroupContext.Provider>
    </ToggleGroupPrimitive.Root>
  )
}

function ToggleGroupItem({
  className,
  children,
  variant,
  size,
  ...props
}: React.ComponentProps<typeof ToggleGroupPrimitive.Item> &
  VariantProps<typeof toggleVariants>) {
  const context = React.useContext(ToggleGroupContext)

  return (
    <ToggleGroupPrimitive.Item
      data-slot="toggle-group-item"
      data-variant={context.variant || variant}
      data-size={context.size || size}
      data-spacing={context.spacing}
      className={cn(
        toggleVariants({
          variant: context.variant || variant,
          size: context.size || size,
        }),
        "w-auto min-w-0 shrink-0 px-4 focus:z-10 focus-visible:z-10",
        // Segmented: drop the per-item ring, square the joins, one divider.
        "data-[spacing=0]:rounded-none data-[spacing=0]:border-0",
        "data-[spacing=0]:not-first:border-l data-[spacing=0]:not-first:border-outline",
        className
      )}
      {...props}
    >
      {children}
    </ToggleGroupPrimitive.Item>
  )
}

export { ToggleGroup, ToggleGroupItem }
