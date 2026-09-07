"use client"

import * as React from "react"
import { OTPInput, OTPInputContext } from "input-otp"
import { MinusIcon } from "lucide-react"

import { cn } from "@/lib/utils"

/**
 * PIN / OTP entry.
 *
 * M3 has no OTP component, so each slot is a small outlined text field: 56dp
 * square, 4dp shape, 1dp `outline` that goes `primary` plus a 2dp inset ring
 * when active, and `title-large` (22px) digits.
 *
 * Slots are separate boxes with a gap rather than shadcn's single joined
 * strip. Two reasons: a joined strip has to fake the active outline with
 * z-index and negative borders, and this is the member PIN pad — the app's
 * throttling is deliberately lenient because the congregation skews elderly,
 * so discrete, large, obviously-separate targets are the point.
 */
function InputOTP({
  className,
  containerClassName,
  ...props
}: React.ComponentProps<typeof OTPInput> & {
  containerClassName?: string
}) {
  return (
    <OTPInput
      data-slot="input-otp"
      containerClassName={cn(
        "flex items-center gap-2 has-disabled:opacity-50",
        containerClassName
      )}
      className={cn("disabled:cursor-not-allowed", className)}
      {...props}
    />
  )
}

function InputOTPGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="input-otp-group"
      className={cn("flex items-center gap-2", className)}
      {...props}
    />
  )
}

function InputOTPSlot({
  index,
  className,
  ...props
}: React.ComponentProps<"div"> & {
  index: number
}) {
  const inputOTPContext = React.useContext(OTPInputContext)
  const { char, hasFakeCaret, isActive } = inputOTPContext?.slots[index] ?? {}

  return (
    <div
      data-slot="input-otp-slot"
      data-active={isActive}
      className={cn(
        "relative flex size-14 items-center justify-center rounded-xs",
        "border border-outline text-title-lg text-on-surface",
        "transition-[border-color,box-shadow] duration-150 ease-standard outline-none",
        "data-[active=true]:z-10 data-[active=true]:border-primary data-[active=true]:inset-ring-2 data-[active=true]:inset-ring-primary",
        "aria-invalid:border-error data-[active=true]:aria-invalid:inset-ring-error",
        className
      )}
      {...props}
    >
      {char}
      {hasFakeCaret && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-6 w-px animate-caret-blink bg-primary duration-1000" />
        </div>
      )}
    </div>
  )
}

function InputOTPSeparator({ ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="input-otp-separator"
      role="separator"
      className="text-on-surface-variant"
      {...props}
    >
      <MinusIcon />
    </div>
  )
}

export { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator }
