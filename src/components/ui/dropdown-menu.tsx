"use client"

import * as React from "react"
import { CheckIcon, ChevronRightIcon, CircleIcon } from "lucide-react"
import { DropdownMenu as DropdownMenuPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

/**
 * M3 menu.
 *
 * Spec: `surface-container` at level 2, extra-small (4dp) shape, 8dp of
 * vertical padding, and items that are **48dp tall** with 12dp of horizontal
 * padding and `label-large` labels. shadcn's 30dp items with `text-sm` are
 * roughly two thirds the height — this is the single largest density change in
 * the migration, and it is deliberate: 48dp is M3's minimum comfortable target
 * for a list of actions, and this app is used one-handed on phones.
 *
 * Highlight is a state layer rather than `focus:bg-surface-container-highest`, driven off Radix's
 * `data-highlighted` so keyboard navigation and pointer hover agree. Leading
 * icons are `on-surface-variant` while the label is `on-surface`, which is
 * what gives an M3 menu its hierarchy without any weight change.
 */

const MENU_SURFACE = [
  "z-50 min-w-[8rem] rounded-xs py-2",
  "bg-surface-container text-on-surface shadow-level-2",
  "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
  // Opacity on an effects spring, scaleY on a spatial one — see transitions.css.
  "data-[state=open]:m3-menu-enter data-[state=closed]:m3-menu-exit",
]

const MENU_ITEM = [
  "state-layer relative flex cursor-default items-center gap-3 px-3",
  "min-h-12 text-label-lg outline-hidden select-none",
  "data-[disabled]:pointer-events-none data-[disabled]:text-on-surface/38",
  "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-6",
  "[&_svg:not([class*='text-'])]:text-on-surface-variant",
]

function DropdownMenu({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Root>) {
  return <DropdownMenuPrimitive.Root data-slot="dropdown-menu" {...props} />
}

function DropdownMenuPortal({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Portal>) {
  return (
    <DropdownMenuPrimitive.Portal data-slot="dropdown-menu-portal" {...props} />
  )
}

function DropdownMenuTrigger({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Trigger>) {
  return (
    <DropdownMenuPrimitive.Trigger
      data-slot="dropdown-menu-trigger"
      {...props}
    />
  )
}

function DropdownMenuContent({
  className,
  sideOffset = 4,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Content>) {
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        data-slot="dropdown-menu-content"
        sideOffset={sideOffset}
        className={cn(
          MENU_SURFACE,
          "max-h-(--radix-dropdown-menu-content-available-height) origin-(--radix-dropdown-menu-content-transform-origin)",
          // Scrolling belongs to the root menu only, and it must not be part
          // of MENU_SURFACE — see the note on DropdownMenuSubContent.
          "overflow-x-hidden overflow-y-auto",
          className
        )}
        {...props}
      />
    </DropdownMenuPrimitive.Portal>
  )
}

function DropdownMenuGroup({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Group>) {
  return (
    <DropdownMenuPrimitive.Group data-slot="dropdown-menu-group" {...props} />
  )
}

function DropdownMenuItem({
  className,
  inset,
  variant = "default",
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Item> & {
  inset?: boolean
  variant?: "default" | "destructive"
}) {
  return (
    <DropdownMenuPrimitive.Item
      data-slot="dropdown-menu-item"
      data-inset={inset}
      data-variant={variant}
      className={cn(
        MENU_ITEM,
        "data-[inset]:pl-12",
        // A destructive menu item colours its label and icon, not its
        // container — the container is reserved for selection in M3.
        "data-[variant=destructive]:text-error data-[variant=destructive]:*:[svg]:text-error!",
        className
      )}
      {...props}
    />
  )
}

function DropdownMenuCheckboxItem({
  className,
  children,
  checked,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.CheckboxItem>) {
  return (
    <DropdownMenuPrimitive.CheckboxItem
      data-slot="dropdown-menu-checkbox-item"
      className={cn(
        MENU_ITEM,
        "pl-12",
        // M3 shows a selected menu option as a secondary-container row.
        "data-[state=checked]:bg-secondary-container data-[state=checked]:text-on-secondary-container",
        className
      )}
      checked={checked}
      {...props}
    >
      <span className="pointer-events-none absolute left-3 flex size-6 items-center justify-center">
        <DropdownMenuPrimitive.ItemIndicator>
          <CheckIcon className="size-5" />
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </DropdownMenuPrimitive.CheckboxItem>
  )
}

function DropdownMenuRadioGroup({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.RadioGroup>) {
  return (
    <DropdownMenuPrimitive.RadioGroup
      data-slot="dropdown-menu-radio-group"
      {...props}
    />
  )
}

function DropdownMenuRadioItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.RadioItem>) {
  return (
    <DropdownMenuPrimitive.RadioItem
      data-slot="dropdown-menu-radio-item"
      className={cn(
        MENU_ITEM,
        "pl-12",
        "data-[state=checked]:bg-secondary-container data-[state=checked]:text-on-secondary-container",
        className
      )}
      {...props}
    >
      <span className="pointer-events-none absolute left-3 flex size-6 items-center justify-center">
        <DropdownMenuPrimitive.ItemIndicator>
          <CircleIcon className="size-2.5 fill-current" />
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </DropdownMenuPrimitive.RadioItem>
  )
}

function DropdownMenuLabel({
  className,
  inset,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Label> & {
  inset?: boolean
}) {
  return (
    <DropdownMenuPrimitive.Label
      data-slot="dropdown-menu-label"
      data-inset={inset}
      className={cn(
        "px-3 py-2 text-title-sm text-on-surface-variant data-[inset]:pl-12",
        className
      )}
      {...props}
    />
  )
}

function DropdownMenuSeparator({
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Separator>) {
  return (
    <DropdownMenuPrimitive.Separator
      data-slot="dropdown-menu-separator"
      className={cn("my-2 h-px bg-outline-variant", className)}
      {...props}
    />
  )
}

function DropdownMenuShortcut({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="dropdown-menu-shortcut"
      className={cn(
        "ml-auto pl-4 text-label-lg text-on-surface-variant",
        className
      )}
      {...props}
    />
  )
}

function DropdownMenuSub({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Sub>) {
  return <DropdownMenuPrimitive.Sub data-slot="dropdown-menu-sub" {...props} />
}

function DropdownMenuSubTrigger({
  className,
  inset,
  children,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.SubTrigger> & {
  inset?: boolean
}) {
  return (
    <DropdownMenuPrimitive.SubTrigger
      data-slot="dropdown-menu-sub-trigger"
      data-inset={inset}
      className={cn(MENU_ITEM, "data-[inset]:pl-12", className)}
      {...props}
    >
      {children}
      <ChevronRightIcon className="ml-auto size-5" />
    </DropdownMenuPrimitive.SubTrigger>
  )
}

/**
 * Submenu panel.
 *
 * The `<Portal>` is load-bearing, not decoration. Radix renders `SubContent`
 * *inside* the parent `Content`'s DOM subtree, and the parent needs
 * `overflow-y: auto` so a long menu can scroll. `overflow-x: hidden` comes
 * along with it, and a submenu is positioned beyond the parent's right edge —
 * so it was being clipped away entirely.
 *
 * The failure mode is nasty because nothing looks broken from the inside: the
 * element mounts, `data-state` is "open", computed opacity is 1, visibility is
 * visible, and `getBoundingClientRect()` reports a real box, because
 * `getBoundingClientRect` ignores clipping. Only a hit test gives it away —
 * `elementFromPoint` at the submenu's centre returned `<html>`. That is what
 * "the language menu opens nothing" was.
 *
 * `position: fixed` would normally escape an ancestor's overflow, and Radix's
 * popper does use it — but the parent menu's own popper wrapper carries a
 * `transform`, which makes it the containing block for fixed descendants and
 * puts the submenu back inside the clip. Portaling to the body is the fix that
 * does not depend on any of that.
 */
function DropdownMenuSubContent({
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.SubContent>) {
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.SubContent
        data-slot="dropdown-menu-sub-content"
        className={cn(
          MENU_SURFACE,
          // A submenu floats above its parent menu, so one level higher.
          "shadow-level-3 origin-(--radix-dropdown-menu-content-transform-origin)",
          "max-h-(--radix-dropdown-menu-content-available-height) overflow-x-hidden overflow-y-auto",
          className
        )}
        {...props}
      />
    </DropdownMenuPrimitive.Portal>
  )
}

export {
  DropdownMenu,
  DropdownMenuPortal,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
}
