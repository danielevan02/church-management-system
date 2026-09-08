"use client"

import * as React from "react"
import type { LucideIcon } from "lucide-react"

import { Ripple } from "@/components/m3/ripple"
import { Link, usePathname } from "@/lib/i18n/navigation"
import { cn } from "@/lib/utils"

/**
 * Material 3 navigation: bar (compact/bottom), rail (medium), drawer (expanded).
 *
 * All three are the same list of destinations at three breakpoints, so they
 * share one item type and one active-state resolver. M3's adaptive guidance is
 * to pick by window size class rather than by area of the app:
 *
 *   compact  (<600dp)   navigation bar, bottom, 3-5 destinations
 *   medium   (600-839)  navigation rail, 80dp
 *   expanded (>=840)    navigation drawer, 360dp
 *
 * ## The active indicator is the whole component
 *
 * What makes navigation read as M3 is not the colour, it is that selection is
 * expressed as a *shaped container* behind the icon — a 64x32 pill in the bar,
 * 56x32 in the rail, a full-width 28dp-round pill in the drawer — filled with
 * `secondary-container`. Everything else (label weight, icon fill, tint) is
 * secondary to that. This is also why the current member bottom nav does not
 * read as Material despite being a good-looking component: a floating
 * glassmorphic pill with a colour-only active state is a different design
 * language, and no amount of token swapping converts it.
 *
 * ## Icons: the one place lucide costs us fidelity
 *
 * M3 swaps outlined -> filled icons on selection, which lucide does not ship.
 * `activeIcon` lets you pass a filled equivalent where lucide has one; where it
 * does not, the indicator pill plus the label weight change carry the state on
 * their own. Adding Material Symbols as a second icon font for nav alone is not
 * worth the payload on a PWA — but it is a clean later upgrade, and the
 * `activeIcon` seam is where it would land.
 */

export type NavDestination = {
  href: string
  label: string
  icon: LucideIcon
  /** Filled counterpart shown when selected, per M3. Falls back to `icon`. */
  activeIcon?: LucideIcon
  /** `true` renders a small dot; a number or string renders a numeric badge. */
  badge?: boolean | number | string
  /** Exact-match only. Use for index routes that would otherwise match children. */
  exact?: boolean
}

function useActiveHref() {
  const pathname = usePathname()

  return React.useCallback(
    (destination: NavDestination) => {
      if (pathname === destination.href) return true
      if (destination.exact) return false
      return pathname.startsWith(`${destination.href}/`)
    },
    [pathname]
  )
}

function Badge({ value }: { value: NonNullable<NavDestination["badge"]> }) {
  if (value === true) {
    return (
      <span className="absolute top-0.5 right-1/2 size-1.5 translate-x-4 rounded-full bg-error" />
    )
  }
  return (
    <span className="absolute top-0 right-1/2 min-w-4 translate-x-5 rounded-full bg-error px-1 text-center text-label-sm text-on-error">
      {value}
    </span>
  )
}

/* ------------------------------------------------------------------ nav bar */

/**
 * M3 navigation bar. 80dp tall, `surface-container`, fixed to the bottom.
 * `safe-area-inset-bottom` is padded rather than offset so the bar's own
 * background extends into the home-indicator area on iOS PWAs.
 */
export function NavigationBar({
  destinations,
  className,
  children,
  ariaLabel,
}: {
  destinations: readonly NavDestination[]
  className?: string
  /** Rendered after the destinations — e.g. the centre scan action. */
  children?: React.ReactNode
  ariaLabel: string
}) {
  const isActive = useActiveHref()

  return (
    <nav
      aria-label={ariaLabel}
      className={cn(
        "fixed inset-x-0 bottom-0 z-40 bg-surface-container md:hidden",
        "pb-[env(safe-area-inset-bottom)]",
        className
      )}
    >
      <ul className="flex h-20 items-stretch justify-around">
        {destinations.map((destination) => {
          const active = isActive(destination)
          const Icon = active
            ? (destination.activeIcon ?? destination.icon)
            : destination.icon

          return (
            <li key={destination.href} className="flex flex-1 justify-center">
              <Link
                href={destination.href}
                prefetch={true}
                aria-current={active ? "page" : undefined}
                className="m3-focus-ring group/dest flex w-full flex-col items-center gap-1 pt-3 pb-4"
              >
                {/* The active indicator. 64x32 pill, secondary-container. */}
                <span
                  className={cn(
                    "ripple-host state-layer relative flex h-8 w-16 items-center justify-center rounded-full",
                    // The indicator is a shaped container appearing, so its
                    // arrival is spatial: it springs in rather than fading.
                    "motion-spatial transition-[background-color,scale]",
                    active ? "scale-100" : "scale-90",
                    active
                      ? "bg-secondary-container text-on-secondary-container"
                      : "text-on-surface-variant"
                  )}
                >
                  <Ripple />
                  <Icon className="size-6" aria-hidden />
                  {destination.badge ? <Badge value={destination.badge} /> : null}
                </span>
                <span
                  className={cn(
                    "text-label-md",
                    active ? "text-on-surface" : "text-on-surface-variant"
                  )}
                >
                  {destination.label}
                </span>
              </Link>
            </li>
          )
        })}
        {children}
      </ul>
    </nav>
  )
}

/* ------------------------------------------------------- rail  &  drawer */

/**
 * M3 navigation rail (80dp, icons + labels stacked) and navigation drawer
 * (360dp, full-width pills). One component because the only differences are the
 * indicator's shape and the item's axis — splitting them duplicates the active
 * logic and lets the two drift apart.
 */
export function NavigationRail({
  destinations,
  variant = "rail",
  header,
  className,
  ariaLabel,
}: {
  destinations: readonly NavDestination[]
  variant?: "rail" | "drawer"
  /** Menu button, FAB or brand mark pinned above the destinations. */
  header?: React.ReactNode
  className?: string
  ariaLabel: string
}) {
  const isActive = useActiveHref()
  const drawer = variant === "drawer"

  return (
    <nav
      aria-label={ariaLabel}
      data-variant={variant}
      className={cn(
        "flex h-full flex-col bg-surface",
        drawer ? "w-90 p-3" : "w-20 items-center py-3",
        className
      )}
    >
      {header && (
        <div className={cn("mb-3 flex", drawer ? "px-4 py-2" : "justify-center")}>
          {header}
        </div>
      )}

      <ul className={cn("flex flex-col", drawer ? "gap-1" : "items-center gap-3")}>
        {destinations.map((destination) => {
          const active = isActive(destination)
          const Icon = active
            ? (destination.activeIcon ?? destination.icon)
            : destination.icon

          return (
            <li key={destination.href} className={drawer ? "w-full" : undefined}>
              <Link
                href={destination.href}
                prefetch={true}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "m3-focus-ring flex",
                  drawer
                    ? // 56dp tall, full-round indicator spanning the drawer.
                      [
                        "ripple-host state-layer h-14 w-full items-center gap-3 rounded-xl px-4",
                        "text-label-lg",
                        active
                          ? "bg-secondary-container text-on-secondary-container"
                          : "text-on-surface-variant",
                      ]
                    : "w-full flex-col items-center gap-1"
                )}
              >
                {drawer ? (
                  <>
                    <Ripple />
                    <Icon className="size-6 shrink-0" aria-hidden />
                    <span className="flex-1 truncate">{destination.label}</span>
                    {destination.badge && destination.badge !== true ? (
                      <span className="text-label-lg">{destination.badge}</span>
                    ) : null}
                  </>
                ) : (
                  <>
                    {/* Rail indicator: 56x32 pill. */}
                    <span
                      className={cn(
                        "ripple-host state-layer relative flex h-8 w-14 items-center justify-center rounded-full",
                        "motion-spatial transition-[background-color,scale]",
                        active ? "scale-100" : "scale-90",
                        active
                          ? "bg-secondary-container text-on-secondary-container"
                          : "text-on-surface-variant"
                      )}
                    >
                      <Ripple />
                      <Icon className="size-6" aria-hidden />
                      {destination.badge ? (
                        <Badge value={destination.badge} />
                      ) : null}
                    </span>
                    <span
                      className={cn(
                        "text-label-md text-center",
                        active ? "text-on-surface" : "text-on-surface-variant"
                      )}
                    >
                      {destination.label}
                    </span>
                  </>
                )}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
