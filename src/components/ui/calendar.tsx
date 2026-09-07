"use client"

import * as React from "react"
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react"
import {
  DayPicker,
  getDefaultClassNames,
  type DayButton,
} from "react-day-picker"

import { cn } from "@/lib/utils"
import { Ripple } from "@/components/m3/ripple"
import { Button, buttonVariants } from "@/components/ui/button"

/**
 * M3 date picker (docked/embedded form).
 *
 * The M3 metrics that matter here:
 *   - day cell is **40dp**, circular, `body-large` — not shadcn's 32dp square
 *   - selected day fills with `primary` / `on-primary`
 *   - today is a 1dp `primary` *outline* with a `primary` label, never a fill,
 *     so "today" and "selected" stay independently readable
 *   - range ends are `primary` circles, the middle is `secondary-container`
 *   - weekday initials are `title-small` on `on-surface-variant`
 *
 * Day cells get a real `<Ripple />`. This is one of the few places where the
 * press origin genuinely reads — you tap a specific date in a dense grid — and
 * the calendar is already a client component, so the island costs nothing
 * extra here.
 */
function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = "label",
  buttonVariant = "text",
  formatters,
  components,
  ...props
}: React.ComponentProps<typeof DayPicker> & {
  buttonVariant?: React.ComponentProps<typeof Button>["variant"]
}) {
  const defaultClassNames = getDefaultClassNames()

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn(
        // 40dp cells, per M3.
        "group/calendar bg-surface p-3 [--cell-size:--spacing(10)]",
        "[[data-slot=card-content]_&]:bg-transparent [[data-slot=popover-content]_&]:bg-transparent",
        String.raw`rtl:**:[.rdp-button\_next>svg]:rotate-180`,
        String.raw`rtl:**:[.rdp-button\_previous>svg]:rotate-180`,
        className
      )}
      captionLayout={captionLayout}
      formatters={{
        formatMonthDropdown: (date) =>
          date.toLocaleString("default", { month: "short" }),
        ...formatters,
      }}
      classNames={{
        root: cn("w-fit", defaultClassNames.root),
        months: cn(
          "relative flex flex-col gap-4 md:flex-row",
          defaultClassNames.months
        ),
        month: cn("flex w-full flex-col gap-4", defaultClassNames.month),
        nav: cn(
          "absolute inset-x-0 top-0 flex w-full items-center justify-between gap-1",
          defaultClassNames.nav
        ),
        button_previous: cn(
          buttonVariants({ variant: buttonVariant, size: "icon" }),
          "size-(--cell-size) p-0 text-on-surface-variant select-none aria-disabled:text-on-surface/38",
          defaultClassNames.button_previous
        ),
        button_next: cn(
          buttonVariants({ variant: buttonVariant, size: "icon" }),
          "size-(--cell-size) p-0 text-on-surface-variant select-none aria-disabled:text-on-surface/38",
          defaultClassNames.button_next
        ),
        month_caption: cn(
          "flex h-(--cell-size) w-full items-center justify-center px-(--cell-size)",
          defaultClassNames.month_caption
        ),
        dropdowns: cn(
          "flex h-(--cell-size) w-full items-center justify-center gap-1.5 text-title-sm text-on-surface",
          defaultClassNames.dropdowns
        ),
        dropdown_root: cn(
          "relative rounded-xs border border-outline has-focus:border-primary has-focus:inset-ring-2 has-focus:inset-ring-primary",
          defaultClassNames.dropdown_root
        ),
        dropdown: cn(
          "absolute inset-0 bg-surface-container opacity-0",
          defaultClassNames.dropdown
        ),
        caption_label: cn(
          "text-on-surface select-none",
          captionLayout === "label"
            ? "text-title-sm"
            : "state-layer flex h-10 items-center gap-1 rounded-full pr-2 pl-3 text-title-sm [&>svg]:size-5 [&>svg]:text-on-surface-variant",
          defaultClassNames.caption_label
        ),
        table: "w-full border-collapse",
        weekdays: cn("flex", defaultClassNames.weekdays),
        weekday: cn(
          "flex-1 text-title-sm text-on-surface-variant select-none",
          defaultClassNames.weekday
        ),
        week: cn("mt-1 flex w-full", defaultClassNames.week),
        week_number_header: cn(
          "w-(--cell-size) select-none",
          defaultClassNames.week_number_header
        ),
        week_number: cn(
          "text-body-sm text-on-surface-variant select-none",
          defaultClassNames.week_number
        ),
        day: cn(
          "group/day relative aspect-square h-full w-full p-0 text-center select-none",
          defaultClassNames.day
        ),
        // Range ends keep their circle; the middle is a squared-off tonal band.
        range_start: cn("rounded-l-full", defaultClassNames.range_start),
        range_middle: cn(
          "rounded-none bg-secondary-container",
          defaultClassNames.range_middle
        ),
        range_end: cn("rounded-r-full", defaultClassNames.range_end),
        // M3 today is an outline, not a fill — see the note above.
        today: cn(
          "text-primary [&>button]:inset-ring [&>button]:inset-ring-primary",
          defaultClassNames.today
        ),
        outside: cn(
          "text-on-surface/38 aria-selected:text-on-surface/38",
          defaultClassNames.outside
        ),
        disabled: cn("text-on-surface/38", defaultClassNames.disabled),
        hidden: cn("invisible", defaultClassNames.hidden),
        ...classNames,
      }}
      components={{
        Root: ({ className, rootRef, ...props }) => {
          return (
            <div
              data-slot="calendar"
              ref={rootRef}
              className={cn(className)}
              {...props}
            />
          )
        },
        Chevron: ({ className, orientation, ...props }) => {
          if (orientation === "left") {
            return (
              <ChevronLeftIcon className={cn("size-5", className)} {...props} />
            )
          }

          if (orientation === "right") {
            return (
              <ChevronRightIcon
                className={cn("size-5", className)}
                {...props}
              />
            )
          }

          return (
            <ChevronDownIcon className={cn("size-5", className)} {...props} />
          )
        },
        DayButton: CalendarDayButton,
        WeekNumber: ({ children, ...props }) => {
          return (
            <td {...props}>
              <div className="flex size-(--cell-size) items-center justify-center text-center">
                {children}
              </div>
            </td>
          )
        },
        ...components,
      }}
      {...props}
    />
  )
}

function CalendarDayButton({
  className,
  day,
  modifiers,
  children,
  ...props
}: React.ComponentProps<typeof DayButton>) {
  const defaultClassNames = getDefaultClassNames()

  const ref = React.useRef<HTMLButtonElement>(null)
  React.useEffect(() => {
    if (modifiers.focused) ref.current?.focus()
  }, [modifiers.focused])

  return (
    <Button
      ref={ref}
      variant="text"
      size="icon"
      data-day={day.date.toLocaleDateString()}
      data-selected-single={
        modifiers.selected &&
        !modifiers.range_start &&
        !modifiers.range_end &&
        !modifiers.range_middle
      }
      data-range-start={modifiers.range_start}
      data-range-end={modifiers.range_end}
      data-range-middle={modifiers.range_middle}
      className={cn(
        "ripple-host flex aspect-square size-auto w-full min-w-(--cell-size) flex-col gap-1",
        "rounded-full text-body-lg text-on-surface",
        "group-data-[focused=true]/day:relative group-data-[focused=true]/day:z-10",
        "data-[selected-single=true]:bg-primary data-[selected-single=true]:text-on-primary",
        "data-[range-start=true]:rounded-full data-[range-start=true]:bg-primary data-[range-start=true]:text-on-primary",
        "data-[range-end=true]:rounded-full data-[range-end=true]:bg-primary data-[range-end=true]:text-on-primary",
        "data-[range-middle=true]:rounded-none data-[range-middle=true]:bg-transparent data-[range-middle=true]:text-on-secondary-container",
        "[&>span]:text-body-sm [&>span]:opacity-70",
        defaultClassNames.day,
        className
      )}
      {...props}
    >
      <Ripple />
      {children}
    </Button>
  )
}

export { Calendar, CalendarDayButton }
