import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * M3 outlined text field body, multiline. Same metrics as `Input`: 4dp shape,
 * 1dp `outline` border thickening to 3dp `primary` on focus, `body-large`
 * text. No floating label — see `Input`'s note.
 */
function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "field-sizing-content flex min-h-14 w-full rounded-xs px-4 py-3.5",
        "border border-outline bg-transparent text-body-lg text-on-surface",
        "transition-[border-color,border-width] duration-150 ease-standard outline-none",
        "caret-primary selection:bg-primary selection:text-on-primary",
        "placeholder:text-on-surface-variant",
        // 1dp border + 2dp inset ring = M3's 3dp focused outline with no
        // layout shift. Growing the border itself would nudge the value 2px.
        "focus-visible:border-primary focus-visible:inset-ring-2 focus-visible:inset-ring-primary",
        "disabled:cursor-not-allowed disabled:border-on-surface/12 disabled:text-on-surface/38",
        "aria-invalid:border-error aria-invalid:focus-visible:inset-ring-error",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
