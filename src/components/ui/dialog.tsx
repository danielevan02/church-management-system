"use client"

import * as React from "react"
import { XIcon } from "lucide-react"
import { Dialog as DialogPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

/**
 * Material 3 basic dialog.
 *
 * Differences from the shadcn original that matter:
 *
 * - Surface is `surface-container-high` with extra-large shape (28dp) and
 *   level 3 elevation. shadcn's `bg-surface` would make the dialog the same
 *   colour as the page behind it now that `background` maps to `surface`.
 * - Scrim is `scrim` at 32%, per spec, not `black/50`. On a tinted neutral
 *   palette that reads as a wash of the brand hue rather than flat grey.
 * - Enter/exit are asymmetric: 400ms emphasized-decelerate in, 200ms
 *   emphasized-accelerate out. M3 is deliberate about things arriving slowly
 *   and leaving fast; symmetric durations are the most common tell that a
 *   "Material" implementation is not actually following the motion spec.
 * - Headline is headline-small on on-surface, body is body-medium on
 *   on-surface-variant, and actions right-align with an 8dp gap.
 *
 * `showCloseButton` stays default-true for compatibility with the 14 existing
 * call sites, but note that a spec-pure M3 dialog has no dismiss affordance in
 * the corner — it is dismissed through its actions.
 */

function Dialog({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />
}

function DialogTrigger({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />
}

function DialogPortal({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Portal>) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />
}

function DialogClose({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />
}

function DialogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      data-slot="dialog-overlay"
      className={cn(
        "fixed inset-0 z-50 bg-scrim/32",
        "data-[state=open]:m3-scrim-enter data-[state=closed]:m3-scrim-exit",
        className
      )}
      {...props}
    />
  )
}

function DialogContent({
  className,
  children,
  showCloseButton = true,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & {
  showCloseButton?: boolean
}) {
  return (
    <DialogPortal data-slot="dialog-portal">
      <DialogOverlay />
      <DialogPrimitive.Content
        data-slot="dialog-content"
        className={cn(
          "fixed top-1/2 left-1/2 z-50 grid w-full -translate-x-1/2 -translate-y-1/2 gap-4",
          // M3: min 280dp, max 560dp, 24dp padding, extra-large shape, level 3.
          "min-w-[280px] max-w-[calc(100%-3rem)] rounded-xl p-6 sm:max-w-[560px]",
          "bg-surface-container-high text-on-surface shadow-level-3 outline-none",
          "data-[state=open]:m3-dialog-enter data-[state=closed]:m3-dialog-exit",
          className
        )}
        {...props}
      >
        {children}
        {showCloseButton && (
          <DialogPrimitive.Close
            data-slot="dialog-close"
            aria-label="Close"
            // A standard M3 icon button: 40dp, fully round, state layer.
            className="state-layer m3-focus-ring absolute top-4 right-4 inline-flex size-10 items-center justify-center rounded-full text-on-surface-variant [&_svg:not([class*='size-'])]:size-6"
          >
            <XIcon />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPortal>
  )
}

function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-header"
      className={cn("flex flex-col gap-4 text-left", className)}
      {...props}
    />
  )
}

function DialogFooter({ className, children, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

function DialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn("text-headline-sm text-on-surface", className)}
      {...props}
    />
  )
}

function DialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn("text-body-md text-on-surface-variant", className)}
      {...props}
    />
  )
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
}
