import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * Inline message block.
 *
 * M3 has no "alert" component — the nearest spec'd things are a snackbar
 * (transient, bottom of screen) and a banner (top of screen, dismissible).
 * This is neither: it is an inline block inside page content, so it is built
 * from container role pairs, medium shape and no elevation, which is how M3
 * expresses a bounded region of a different semantic weight.
 *
 * `destructive` moves from red text on a card to the `error-container` pair.
 * shadcn's version relies on the *text* carrying the semantic, which stops
 * working the moment the block is scanned rather than read.
 */
const alertVariants = cva(
  [
    "relative grid w-full grid-cols-[0_1fr] items-start gap-y-1 rounded-md px-4 py-3",
    "text-body-md",
    "has-[>svg]:grid-cols-[calc(var(--spacing)*5)_1fr] has-[>svg]:gap-x-3",
    "[&>svg]:size-5 [&>svg]:translate-y-0.5 [&>svg]:text-current",
  ],
  {
    variants: {
      variant: {
        default:
          "bg-surface-container-highest text-on-surface *:data-[slot=alert-description]:text-on-surface-variant",
        destructive:
          "bg-error-container text-on-error-container *:data-[slot=alert-description]:text-on-error-container/80",
        success:
          "bg-success-container text-on-success-container *:data-[slot=alert-description]:text-on-success-container/80",
        warning:
          "bg-warning-container text-on-warning-container *:data-[slot=alert-description]:text-on-warning-container/80",
        outlined:
          "border border-outline-variant bg-surface text-on-surface *:data-[slot=alert-description]:text-on-surface-variant",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Alert({
  className,
  variant,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof alertVariants>) {
  return (
    <div
      data-slot="alert"
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  )
}

function AlertTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-title"
      className={cn("col-start-2 line-clamp-1 min-h-5 text-title-sm", className)}
      {...props}
    />
  )
}

function AlertDescription({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-description"
      className={cn(
        "col-start-2 grid justify-items-start gap-1 text-body-md [&_p]:leading-relaxed",
        className
      )}
      {...props}
    />
  )
}

export { Alert, AlertTitle, AlertDescription, alertVariants }
