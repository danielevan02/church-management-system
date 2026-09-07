import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * M3 outlined text field body, without the floating label.
 *
 * M3 proper has no bare input — its text field owns its label, which is what
 * `@/components/m3/text-field` implements. This keeps the 37 existing
 * label-above call sites working while looking correct: 4dp shape, 1dp
 * `outline` border that thickens to 3dp `primary` on focus (not a ring),
 * `body-large` text, `on-surface/12` + `/38` when disabled.
 *
 * Height goes 36dp -> 56dp, which is M3's text field height. That is a real
 * density change on form-heavy screens; `density="compact"` gives 40dp for
 * toolbars, table filters and search bars where 56dp dominates the row.
 */
function Input({
  className,
  type,
  density = "default",
  ...props
}: React.ComponentProps<"input"> & { density?: "default" | "compact" }) {
  return (
    <input
      type={type}
      data-slot="input"
      data-density={density}
      className={cn(
        "w-full min-w-0 rounded-xs px-4",
        density === "compact" ? "h-10 text-body-md" : "h-14 text-body-lg",
        "border border-outline bg-transparent text-on-surface",
        "transition-[border-color,border-width] duration-150 ease-standard outline-none",
        "caret-primary selection:bg-primary selection:text-on-primary",
        "placeholder:text-on-surface-variant",
        "file:inline-flex file:h-8 file:border-0 file:bg-transparent file:text-label-lg file:text-primary",
        // 1dp border + 2dp inset ring = M3's 3dp focused outline with no
        // layout shift. Growing the border itself would nudge the value 2px.
        "focus-visible:border-primary focus-visible:inset-ring-2 focus-visible:inset-ring-primary",
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:border-on-surface/12 disabled:text-on-surface/38",
        "aria-invalid:border-error aria-invalid:focus-visible:inset-ring-error",
        className
      )}
      {...props}
    />
  )
}

export { Input }
