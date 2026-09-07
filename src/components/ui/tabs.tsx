"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Tabs as TabsPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

/**
 * Material 3 tabs.
 *
 * M3 has two kinds and no third:
 *
 *   primary    top-level navigation within a screen. 48dp (64dp with icons
 *              stacked above labels), a full-width divider beneath the row,
 *              and a 3dp indicator that hugs the *label* width with rounded
 *              top corners. Active label goes `primary`.
 *   secondary  a second level nested inside a primary tab. 2dp indicator
 *              spanning the whole tab, active label stays `on-surface`.
 *
 * Notably absent: shadcn's default pill/segmented look. In M3 that is a
 * *segmented button*, a different component with different semantics (it
 * filters or toggles, it does not navigate). The old `default` and `line`
 * variant names are aliased onto primary/secondary.
 *
 * ## The indicator slides
 *
 * This is the part that cannot be done in CSS. The first version of this
 * component gave every trigger its own `::after` and cross-faded their
 * opacity, so the indicator *popped* from one tab to the next. In M3 it
 * travels — and that travel is the main thing that makes a tab row feel like
 * M3 rather than like a styled tab row.
 *
 * A pseudo-element cannot animate between two different elements, so there is
 * exactly one indicator, positioned from the active trigger's measured box and
 * moved with a spatial spring. Measurement is driven by a MutationObserver on
 * `data-state` (Radix's own signal for which tab is active) plus a
 * ResizeObserver for reflows and web-font swaps.
 *
 * Primary and secondary measure *different boxes*: primary hugs the label
 * (measured with a Range over the trigger's contents), secondary spans the
 * whole tab. With `flex-1` triggers those differ by a lot.
 *
 * The indicator is client-only — it needs layout to exist before it can be
 * placed — so it is absent from the server HTML and appears on hydration.
 * `ready` suppresses the transition for that first placement so it does not
 * slide in from the origin.
 */

type IndicatorRect = {
  left: number
  width: number
  top: number
  height: number
  vertical: boolean
}

function Tabs({
  className,
  orientation = "horizontal",
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      data-orientation={orientation}
      orientation={orientation}
      className={cn(
        "group/tabs flex data-[orientation=horizontal]:flex-col",
        className
      )}
      {...props}
    />
  )
}

const tabsListVariants = cva(
  [
    "group/tabs-list relative flex items-stretch",
    "border-outline-variant",
    "group-data-[orientation=horizontal]/tabs:border-b",
    "group-data-[orientation=vertical]/tabs:h-fit group-data-[orientation=vertical]/tabs:flex-col group-data-[orientation=vertical]/tabs:border-r",
  ],
  {
    variants: {
      variant: {
        primary: "",
        secondary: "",
        // deprecated aliases
        default: "",
        line: "",
      },
    },
    defaultVariants: { variant: "primary" },
  }
)

function TabsList({
  className,
  variant = "primary",
  children,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List> &
  VariantProps<typeof tabsListVariants>) {
  const resolved =
    variant === "line" ? "secondary" : variant === "default" ? "primary" : variant

  const listRef = React.useRef<HTMLDivElement>(null)
  const [rect, setRect] = React.useState<IndicatorRect | null>(null)
  // No transition on the very first placement, or the indicator slides in from
  // the origin on mount.
  const [ready, setReady] = React.useState(false)

  React.useEffect(() => {
    const list = listRef.current
    if (!list) return

    let frame = 0
    const measure = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        const active = list.querySelector<HTMLElement>(
          '[data-slot="tabs-trigger"][data-state="active"]'
        )
        if (!active) return

        const primary = list.dataset.variant !== "secondary"
        // A primary indicator hugs the *label*, not the tab. The triggers are
        // flex-1 so the tab box is far wider than its text — insetting the box
        // by a fixed amount gives a bar several times the label's width. A
        // Range over the trigger's contents measures the text and icon
        // exactly, with no wrapper element and no font-metric guessing.
        let box: DOMRect
        if (primary) {
          const range = document.createRange()
          range.selectNodeContents(active)
          box = range.getBoundingClientRect()
          range.detach()
          // An empty or not-yet-laid-out trigger measures zero; fall back.
          if (box.width === 0 && box.height === 0) box = active.getBoundingClientRect()
        } else {
          box = active.getBoundingClientRect()
        }

        const listBox = list.getBoundingClientRect()
        setRect({
          left: box.left - listBox.left + list.scrollLeft,
          width: box.width,
          top: box.top - listBox.top + list.scrollTop,
          height: box.height,
          // Radix stamps the orientation on the list; read it there rather
          // than touching the ref during render.
          vertical: list.getAttribute("data-orientation") === "vertical",
        })
        setReady(true)
      })
    }

    measure()

    // Radix flips data-state on the triggers; that is the authoritative signal.
    const mutations = new MutationObserver(measure)
    mutations.observe(list, {
      subtree: true,
      attributes: true,
      attributeFilter: ["data-state"],
    })

    // Reflow, container resize, and the web-font swap all move the labels.
    const resizes = new ResizeObserver(measure)
    resizes.observe(list)
    for (const child of Array.from(list.children)) resizes.observe(child)

    return () => {
      cancelAnimationFrame(frame)
      mutations.disconnect()
      resizes.disconnect()
    }
  }, [children])

  return (
    <TabsPrimitive.List
      ref={listRef}
      data-slot="tabs-list"
      data-variant={resolved}
      className={cn(tabsListVariants({ variant }), className)}
      {...props}
    >
      {children}
      {rect ? (
        <span
          aria-hidden
          data-slot="tabs-indicator"
          className={cn(
            "pointer-events-none absolute bg-primary",
            ready && "motion-spatial transition-[translate,width,height]",
            resolved === "primary"
              ? "rounded-t-[3px] group-data-[orientation=horizontal]/tabs:h-[3px]"
              : "group-data-[orientation=horizontal]/tabs:h-0.5",
            "group-data-[orientation=horizontal]/tabs:bottom-[-1px]",
            "group-data-[orientation=vertical]/tabs:right-[-1px]",
            resolved === "primary"
              ? "group-data-[orientation=vertical]/tabs:w-[3px]"
              : "group-data-[orientation=vertical]/tabs:w-0.5"
          )}
          style={
            rect.vertical
              ? {
                  translate: `0 ${rect.top}px`,
                  height: rect.height,
                }
              : {
                  translate: `${rect.left}px 0`,
                  width: rect.width,
                }
          }
        />
      ) : null}
    </TabsPrimitive.List>
  )
}

function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        "state-layer m3-focus-ring relative inline-flex flex-1 items-center justify-center gap-2",
        // 48dp; 64dp and stacked when the tab carries an icon above its label.
        "min-h-12 px-4 py-3.5",
        "text-title-sm whitespace-nowrap",
        // Colour is an effect, so it gets an effects spring — no overshoot.
        "motion-effects-fast text-on-surface-variant transition-colors",
        "disabled:pointer-events-none disabled:text-on-surface/38",
        "group-data-[orientation=vertical]/tabs:w-full group-data-[orientation=vertical]/tabs:justify-start",
        "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-6",
        "group-data-[variant=primary]/tabs-list:data-[state=active]:text-primary",
        "group-data-[variant=secondary]/tabs-list:data-[state=active]:text-on-surface",
        className
      )}
      {...props}
    />
  )
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn("flex-1 pt-4 outline-none", className)}
      {...props}
    />
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent, tabsListVariants }
