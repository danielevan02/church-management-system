"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { PanelLeftIcon } from "lucide-react"
import { Slot } from "radix-ui"
import { usePathname } from "next/navigation"

import { useIsMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const SIDEBAR_COOKIE_NAME = "sidebar_state"
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7
const SIDEBAR_WIDTH = "22.5rem"  // M3 navigation drawer: 360dp
const SIDEBAR_WIDTH_MOBILE = "22.5rem"  // modal drawer, same 360dp
const SIDEBAR_WIDTH_ICON = "5rem"  // M3 navigation rail: 80dp
const SIDEBAR_KEYBOARD_SHORTCUT = "b"

type SidebarContextProps = {
  state: "expanded" | "collapsed"
  open: boolean
  setOpen: (open: boolean) => void
  openMobile: boolean
  setOpenMobile: (open: boolean) => void
  isMobile: boolean
  toggleSidebar: () => void
}

const SidebarContext = React.createContext<SidebarContextProps | null>(null)

function useSidebar() {
  const context = React.useContext(SidebarContext)
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider.")
  }

  return context
}

function SidebarProvider({
  defaultOpen = true,
  open: openProp,
  onOpenChange: setOpenProp,
  className,
  style,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  defaultOpen?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
}) {
  const isMobile = useIsMobile()
  const [openMobile, setOpenMobile] = React.useState(false)

  // This is the internal state of the sidebar.
  // We use openProp and setOpenProp for control from outside the component.
  const [_open, _setOpen] = React.useState(defaultOpen)
  const open = openProp ?? _open
  const setOpen = React.useCallback(
    (value: boolean | ((value: boolean) => boolean)) => {
      const openState = typeof value === "function" ? value(open) : value
      if (setOpenProp) {
        setOpenProp(openState)
      } else {
        _setOpen(openState)
      }

      // This sets the cookie to keep the sidebar state.
      document.cookie = `${SIDEBAR_COOKIE_NAME}=${openState}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`
    },
    [setOpenProp, open]
  )

  // Helper to toggle the sidebar.
  const toggleSidebar = React.useCallback(() => {
    return isMobile ? setOpenMobile((open) => !open) : setOpen((open) => !open)
  }, [isMobile, setOpen, setOpenMobile])

  // Adds a keyboard shortcut to toggle the sidebar.
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.key === SIDEBAR_KEYBOARD_SHORTCUT &&
        (event.metaKey || event.ctrlKey)
      ) {
        event.preventDefault()
        toggleSidebar()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [toggleSidebar])

  // We add a state so that we can do data-state="expanded" or "collapsed".
  // This makes it easier to style the sidebar with Tailwind classes.
  const state = open ? "expanded" : "collapsed"

  const contextValue = React.useMemo<SidebarContextProps>(
    () => ({
      state,
      open,
      setOpen,
      isMobile,
      openMobile,
      setOpenMobile,
      toggleSidebar,
    }),
    [state, open, setOpen, isMobile, openMobile, setOpenMobile, toggleSidebar]
  )

  return (
    <SidebarContext.Provider value={contextValue}>
      <TooltipProvider delayDuration={0}>
        <div
          data-slot="sidebar-wrapper"
          style={
            {
              "--sidebar-width": SIDEBAR_WIDTH,
              "--sidebar-width-icon": SIDEBAR_WIDTH_ICON,
              ...style,
            } as React.CSSProperties
          }
          className={cn(
            "group/sidebar-wrapper flex min-h-svh w-full has-data-[variant=inset]:bg-sidebar",
            className
          )}
          {...props}
        >
          {children}
        </div>
      </TooltipProvider>
    </SidebarContext.Provider>
  )
}

function Sidebar({
  side = "left",
  variant = "sidebar",
  collapsible = "offcanvas",
  className,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  side?: "left" | "right"
  variant?: "sidebar" | "floating" | "inset"
  collapsible?: "offcanvas" | "icon" | "none"
}) {
  const { isMobile, state, openMobile, setOpenMobile } = useSidebar()

  if (collapsible === "none") {
    return (
      <div
        data-slot="sidebar"
        className={cn(
          "flex h-full w-(--sidebar-width) flex-col bg-sidebar text-sidebar-foreground",
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }

  if (isMobile) {
    return (
      <Sheet open={openMobile} onOpenChange={setOpenMobile} {...props}>
        <SheetContent
          data-sidebar="sidebar"
          data-slot="sidebar"
          data-mobile="true"
          className="w-(--sidebar-width) bg-sidebar p-0 text-sidebar-foreground [&>button]:hidden"
          style={
            {
              "--sidebar-width": SIDEBAR_WIDTH_MOBILE,
            } as React.CSSProperties
          }
          side={side}
        >
          <SheetHeader className="sr-only">
            <SheetTitle>Sidebar</SheetTitle>
            <SheetDescription>Displays the mobile sidebar.</SheetDescription>
          </SheetHeader>
          <div className="flex h-full w-full flex-col">{children}</div>
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <div
      className="group peer hidden text-sidebar-foreground md:block"
      data-state={state}
      data-collapsible={state === "collapsed" ? collapsible : ""}
      data-variant={variant}
      data-side={side}
      data-slot="sidebar"
    >
      {/* This is what handles the sidebar gap on desktop */}
      <div
        data-slot="sidebar-gap"
        className={cn(
          "relative w-(--sidebar-width) bg-transparent transition-[width] m3-sidebar-motion",
          "group-data-[collapsible=offcanvas]:w-0",
          "group-data-[side=right]:rotate-180",
          variant === "floating" || variant === "inset"
            ? "group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+(--spacing(4)))]"
            : "group-data-[collapsible=icon]:w-(--sidebar-width-icon)"
        )}
      />
      <div
        data-slot="sidebar-container"
        className={cn(
          "fixed inset-y-0 z-10 hidden h-svh w-(--sidebar-width) transition-[left,right,width] m3-sidebar-motion md:flex",
          side === "left"
            ? "left-0 group-data-[collapsible=offcanvas]:left-[calc(var(--sidebar-width)*-1)]"
            : "right-0 group-data-[collapsible=offcanvas]:right-[calc(var(--sidebar-width)*-1)]",
          // Adjust the padding for floating and inset variants.
          variant === "floating" || variant === "inset"
            ? "p-2 group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+(--spacing(4))+2px)]"
            : "group-data-[collapsible=icon]:w-(--sidebar-width-icon) group-data-[side=left]:border-r group-data-[side=right]:border-l",
          className
        )}
        {...props}
      >
        <div
          data-sidebar="sidebar"
          data-slot="sidebar-inner"
          className="flex h-full w-full flex-col bg-sidebar group-data-[variant=floating]:rounded-lg"
        >
          {children}
        </div>
      </div>
    </div>
  )
}

function SidebarTrigger({
  className,
  onClick,
  ...props
}: React.ComponentProps<typeof Button>) {
  const { toggleSidebar } = useSidebar()

  return (
    <Button
      data-sidebar="trigger"
      data-slot="sidebar-trigger"
      variant="ghost"
      size="icon"
      className={cn("size-7", className)}
      onClick={(event) => {
        onClick?.(event)
        toggleSidebar()
      }}
      {...props}
    >
      <PanelLeftIcon />
      <span className="sr-only">Toggle Sidebar</span>
    </Button>
  )
}

function SidebarRail({ className, ...props }: React.ComponentProps<"button">) {
  const { toggleSidebar } = useSidebar()

  return (
    <button
      data-sidebar="rail"
      data-slot="sidebar-rail"
      aria-label="Toggle Sidebar"
      tabIndex={-1}
      onClick={toggleSidebar}
      title="Toggle Sidebar"
      className={cn(
        "absolute inset-y-0 z-20 hidden w-4 -translate-x-1/2 transition-colors motion-effects-fast group-data-[side=left]:-right-4 group-data-[side=right]:left-0 after:absolute after:inset-y-0 after:left-1/2 after:w-[2px] hover:after:bg-outline-variant sm:flex",
        "in-data-[side=left]:cursor-w-resize in-data-[side=right]:cursor-e-resize",
        "[[data-side=left][data-state=collapsed]_&]:cursor-e-resize [[data-side=right][data-state=collapsed]_&]:cursor-w-resize",
        "group-data-[collapsible=offcanvas]:translate-x-0 group-data-[collapsible=offcanvas]:after:left-full hover:group-data-[collapsible=offcanvas]:bg-sidebar",
        "[[data-side=left][data-collapsible=offcanvas]_&]:-right-2",
        "[[data-side=right][data-collapsible=offcanvas]_&]:-left-2",
        className
      )}
      {...props}
    />
  )
}

function SidebarInset({ className, ...props }: React.ComponentProps<"main">) {
  return (
    <main
      data-slot="sidebar-inset"
      className={cn(
        "relative flex w-full flex-1 flex-col bg-surface",
        "md:peer-data-[variant=inset]:m-2 md:peer-data-[variant=inset]:ml-0 md:peer-data-[variant=inset]:rounded-lg md:peer-data-[variant=inset]:peer-data-[state=collapsed]:peer-data-[collapsible=offcanvas]:ml-2",
        className
      )}
      {...props}
    />
  )
}

function SidebarInput({
  className,
  ...props
}: React.ComponentProps<typeof Input>) {
  return (
    <Input
      data-slot="sidebar-input"
      data-sidebar="input"
      density="compact"
      className={cn("w-full", className)}
      {...props}
    />
  )
}

function SidebarHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-header"
      data-sidebar="header"
      className={cn("flex flex-col gap-2 p-2", className)}
      {...props}
    />
  )
}

function SidebarFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-footer"
      data-sidebar="footer"
      className={cn("flex flex-col gap-2 p-2", className)}
      {...props}
    />
  )
}

function SidebarSeparator({
  className,
  ...props
}: React.ComponentProps<typeof Separator>) {
  return (
    <Separator
      data-slot="sidebar-separator"
      data-sidebar="separator"
      className={cn("mx-4 w-auto bg-outline-variant", className)}
      {...props}
    />
  )
}

type IndicatorRect = {
  top: number
  left: number
  width: number
  height: number
}

function SidebarContent({
  className,
  children,
  onClick,
  ...props
}: React.ComponentProps<"div">) {
  const contentRef = React.useRef<HTMLDivElement>(null)
  const [rect, setRect] = React.useState<IndicatorRect | null>(null)
  const [ready, setReady] = React.useState(false)
  const [hasPending, setHasPending] = React.useState(false)
  /**
   * True while the indicator is following a *layout* change rather than a
   * navigation, which is the difference between it gliding and it trailing.
   *
   * The rect is measured in JS and applied as an inline style, and the element
   * also carries a 435ms spring on `transform,width,height`. That pairing is
   * right for a click — the pill glides from the old row to the new one — and
   * wrong for a resize: collapsing the drawer resizes every row, the
   * `ResizeObserver` below re-measures on every frame of the 435ms width
   * transition, and each new target restarts the spring from wherever the pill
   * currently is. The pill ends up crawling behind the rows the whole way and
   * settling late, which is the most visible thing wrong with the old collapse.
   * While tracking, the transition is dropped so the pill sits exactly on its
   * row every frame; navigation keeps the glide.
   */
  const [tracking, setTracking] = React.useState(false)
  const pathname = usePathname()
  const pendingTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)
  const trackingTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  const measure = React.useCallback(() => {
    const content = contentRef.current
    if (!content) return

    // Find the pending-active or active menu button inside this content container
    const target =
      content.querySelector<HTMLElement>(
        '[data-sidebar="menu-button"][data-pending-active="true"]'
      ) ??
      content.querySelector<HTMLElement>(
        '[data-sidebar="menu-button"][data-active="true"]'
      )

    if (!target) {
      setRect(null)
      return
    }

    const contentBox = content.getBoundingClientRect()
    const targetBox = target.getBoundingClientRect()

    // Position relative to content, accounting for scroll offset
    setRect({
      top: targetBox.top - contentBox.top + content.scrollTop,
      left: targetBox.left - contentBox.left + content.scrollLeft,
      width: targetBox.width,
      height: targetBox.height,
    })

    // Avoid initial fly-in transition on page load
    requestAnimationFrame(() => {
      setReady(true)
    })
  }, [])

  // Re-measure on pathname change, DOM mutations, or resize
  React.useEffect(() => {
    const content = contentRef.current
    if (!content) return

    // Route changed: clear all optimistic pending states
    content
      .querySelectorAll<HTMLElement>(
        '[data-sidebar="menu-button"][data-pending-active="true"]'
      )
      .forEach((btn) => btn.removeAttribute("data-pending-active"))
    setHasPending(false)

    let frame = 0
    const debouncedMeasure = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(measure)
    }

    debouncedMeasure()

    const mutations = new MutationObserver(debouncedMeasure)
    mutations.observe(content, {
      subtree: true,
      attributes: true,
      attributeFilter: ["data-active"],
    })

    const trackLayout = () => {
      setTracking(true)
      if (trackingTimerRef.current) clearTimeout(trackingTimerRef.current)
      // Restore the glide once resizing has been quiet for a couple of frames.
      trackingTimerRef.current = setTimeout(() => setTracking(false), 160)
      debouncedMeasure()
    }

    const resizes = new ResizeObserver(trackLayout)
    resizes.observe(content)
    for (const child of Array.from(content.children)) {
      resizes.observe(child)
    }

    return () => {
      cancelAnimationFrame(frame)
      mutations.disconnect()
      resizes.disconnect()
      if (pendingTimerRef.current) {
        clearTimeout(pendingTimerRef.current)
      }
      if (trackingTimerRef.current) {
        clearTimeout(trackingTimerRef.current)
      }
    }
  }, [measure, pathname])

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    onClick?.(e)
    const content = contentRef.current
    if (!content) return

    const target = (e.target as HTMLElement).closest<HTMLElement>(
      '[data-sidebar="menu-button"]'
    )
    if (!target || !content.contains(target)) return

    // Don't activate indicator on disabled items, action buttons, or items opting out
    if (
      target.getAttribute("aria-disabled") === "true" ||
      target.hasAttribute("disabled") ||
      target.getAttribute("data-no-indicator") === "true" ||
      target.classList.contains("bg-primary") ||
      target.closest('[data-sidebar="menu-action"]') ||
      target.closest('[data-slot="sidebar-group-action"]')
    ) {
      return
    }

    // If item is already active and not pending, no need to glide
    if (
      target.getAttribute("data-active") === "true" &&
      !content.querySelector('[data-sidebar="menu-button"][data-pending-active="true"]')
    ) {
      return
    }

    // Clear previous pending states everywhere in this content
    content
      .querySelectorAll<HTMLElement>(
        '[data-sidebar="menu-button"][data-pending-active="true"]'
      )
      .forEach((btn) => btn.removeAttribute("data-pending-active"))

    target.setAttribute("data-pending-active", "true")
    setHasPending(true)

    // Measure target immediately for instant optimistic sliding response
    const contentBox = content.getBoundingClientRect()
    const targetBox = target.getBoundingClientRect()

    setRect({
      top: targetBox.top - contentBox.top + content.scrollTop,
      left: targetBox.left - contentBox.left + content.scrollLeft,
      width: targetBox.width,
      height: targetBox.height,
    })
    setReady(true)

    // Safety timeout in case navigation is cancelled or delayed
    if (pendingTimerRef.current) clearTimeout(pendingTimerRef.current)
    pendingTimerRef.current = setTimeout(() => {
      if (!contentRef.current) return
      contentRef.current
        .querySelectorAll<HTMLElement>(
          '[data-sidebar="menu-button"][data-pending-active="true"]'
        )
        .forEach((btn) => btn.removeAttribute("data-pending-active"))
      setHasPending(false)
      measure()
    }, 4000)
  }

  return (
    <div
      ref={contentRef}
      data-slot="sidebar-content"
      data-sidebar="content"
      data-sliding-ready={ready && !!rect ? "true" : undefined}
      data-has-pending={hasPending ? "true" : undefined}
      onClick={handleClick}
      className={cn(
        // Vertical scroll in both states. The collapsed rail used to be
        // `overflow-hidden` (shadcn's way of keeping a scrollbar out of a
        // narrow rail), but this app has 31 nav rows: at the old 32dp they
        // already needed ~1250dp against roughly 600dp of rail, so the bottom
        // third simply could not be reached. `overflow-x-hidden` keeps the
        // horizontal clipping that the hidden was really there for.
        "relative flex min-h-0 flex-1 flex-col gap-2 overflow-x-hidden overflow-y-auto",
        className
      )}
      {...props}
    >
      {rect && (
        <div
          aria-hidden="true"
          data-slot="sidebar-menu-indicator"
          className={cn(
            "pointer-events-none absolute top-0 left-0 z-0 bg-secondary-container",
            ready &&
              !tracking &&
              "motion-spatial transition-[transform,width,height,opacity]",
            "rounded-xl group-data-[collapsible=icon]:rounded-full",
          )}
          style={{
            transform: `translate3d(${rect.left}px, ${rect.top}px, 0)`,
            width: rect.width,
            height: rect.height,
            willChange: "transform, width, height",
          }}
        />
      )}
      {children}
    </div>
  )
}

function SidebarGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-group"
      data-sidebar="group"
      className={cn("relative flex w-full min-w-0 flex-col p-2", className)}
      {...props}
    />
  )
}

function SidebarGroupLabel({
  className,
  asChild = false,
  ...props
}: React.ComponentProps<"div"> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "div"

  return (
    <Comp
      data-slot="sidebar-group-label"
      data-sidebar="group-label"
      className={cn(
        // M3 navigation drawer section header: 56dp, title-small.
        "flex h-14 shrink-0 items-center px-4 text-title-sm text-on-surface-variant outline-hidden transition-[margin,opacity] m3-sidebar-motion [&>svg]:size-5 [&>svg]:shrink-0",
        "group-data-[collapsible=icon]:-mt-14 group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:pointer-events-none",
        className
      )}
      {...props}
    />
  )
}

function SidebarGroupAction({
  className,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="sidebar-group-action"
      data-sidebar="group-action"
      className={cn(
        "state-layer m3-focus-ring absolute top-3 right-3 flex aspect-square w-8 items-center justify-center rounded-full p-0 text-on-surface-variant outline-hidden [&>svg]:size-5 [&>svg]:shrink-0",
        // Increases the hit area of the button on mobile.
        "after:absolute after:-inset-2 md:after:hidden",
        "group-data-[collapsible=icon]:hidden",
        className
      )}
      {...props}
    />
  )
}

function SidebarGroupContent({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-group-content"
      data-sidebar="group-content"
      className={cn("w-full", className)}
      {...props}
    />
  )
}

function SidebarMenu({ className, ...props }: React.ComponentProps<"ul">) {
  return (
    <ul
      data-slot="sidebar-menu"
      data-sidebar="menu"
      className={cn("flex w-full min-w-0 flex-col gap-1", className)}
      {...props}
    />
  )
}

function SidebarMenuItem({ className, ...props }: React.ComponentProps<"li">) {
  return (
    <li
      data-slot="sidebar-menu-item"
      data-sidebar="menu-item"
      className={cn(
        "group/menu-item relative z-10 group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center",
        className
      )}
      {...props}
    />
  )
}

/**
 * M3 navigation drawer item.
 *
 * The active state is the whole point: a full-width, fully-round (28dp)
 * `secondary-container` pill, which is how M3 says "you are here".
 *
 * Sliding active indicator glides with Material 3 spatial spring physics between
 * links on click and page changes.
 *
 * Hover/press come from `state-layer` rather than `hover:bg-*`, so the wash
 * composites correctly over both the transparent resting item and the tonal
 * active pill. Under `collapsible=icon` the item collapses to a 56x32 rail
 * indicator instead of a square.
 */
const sidebarMenuButtonVariants = cva(
  [
    "state-layer m3-focus-ring peer/menu-button",
    "flex w-full items-center gap-3 overflow-hidden rounded-xl px-4 text-left",
    "text-label-lg text-on-surface-variant",
    "transition-[width,height,padding,background-color,color] m3-sidebar-motion",
    "group-has-data-[sidebar=menu-action]/menu-item:pr-8",
    // Collapsed rail: 56x32 pill, icon only.
    // Collapsed rail: a 40dp circle. It was a 56x32 stadium, which is M3's own
    // rail indicator spec, but next to the round brand mark and avatar it read
    // as an odd shape rather than a deliberate one. `gap-0` matters as much as
    // the size: the label collapses to `max-width: 0` rather than
    // `display: none`, so its 12dp gap survived and offset the icon 6dp left of
    // centre in every row.
    "group-data-[collapsible=icon]:size-10! group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:gap-0 group-data-[collapsible=icon]:rounded-full group-data-[collapsible=icon]:px-0!",
    "data-[active=true]:bg-secondary-container data-[active=true]:text-on-secondary-container data-[active=true]:font-semibold",
    "data-[pending-active=true]:text-on-secondary-container data-[pending-active=true]:font-semibold",
    "disabled:pointer-events-none disabled:text-on-surface/38",
    "aria-disabled:pointer-events-none aria-disabled:text-on-surface/38",
    "[&>span:last-child]:truncate [&>svg]:size-6 [&>svg]:shrink-0",
  ],
  {
    variants: {
      variant: {
        default: "",
        outline:
          "border border-outline-variant bg-surface data-[active=true]:border-transparent",
      },
      size: {
        // M3 drawer item height.
        default: "h-14",
        sm: "h-10 text-label-md [&>svg]:size-5",
        lg: "h-14 group-data-[collapsible=icon]:p-0!",  // collapsed size comes from the base circle
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function SidebarMenuButton({
  asChild = false,
  isActive = false,
  variant = "default",
  size = "default",
  tooltip,
  className,
  ...props
}: React.ComponentProps<"button"> & {
  asChild?: boolean
  isActive?: boolean
  tooltip?: string | React.ComponentProps<typeof TooltipContent>
} & VariantProps<typeof sidebarMenuButtonVariants>) {
  const Comp = asChild ? Slot.Root : "button"
  const { isMobile, state } = useSidebar()

  const button = (
    <Comp
      data-slot="sidebar-menu-button"
      data-sidebar="menu-button"
      data-size={size}
      data-active={isActive}
      className={cn(sidebarMenuButtonVariants({ variant, size }), className)}
      {...props}
    />
  )

  if (!tooltip) {
    return button
  }

  if (typeof tooltip === "string") {
    tooltip = {
      children: tooltip,
    }
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>{button}</TooltipTrigger>
      <TooltipContent
        side="right"
        align="center"
        hidden={state !== "collapsed" || isMobile}
        {...tooltip}
      />
    </Tooltip>
  )
}

function SidebarMenuAction({
  className,
  asChild = false,
  showOnHover = false,
  ...props
}: React.ComponentProps<"button"> & {
  asChild?: boolean
  showOnHover?: boolean
}) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="sidebar-menu-action"
      data-sidebar="menu-action"
      className={cn(
        "state-layer m3-focus-ring absolute top-3 right-2 flex aspect-square w-8 items-center justify-center rounded-full p-0 text-on-surface-variant outline-hidden [&>svg]:size-5 [&>svg]:shrink-0",
        // Increases the hit area of the button on mobile.
        "after:absolute after:-inset-2 md:after:hidden",
        "peer-data-[size=sm]/menu-button:top-1",
        "peer-data-[size=default]/menu-button:top-1.5",
        "peer-data-[size=lg]/menu-button:top-2.5",
        "group-data-[collapsible=icon]:hidden",
        showOnHover &&
          "group-focus-within/menu-item:opacity-100 group-hover/menu-item:opacity-100 peer-data-[active=true]/menu-button:text-on-secondary-container data-[state=open]:opacity-100 md:opacity-0",
        className
      )}
      {...props}
    />
  )
}

function SidebarMenuBadge({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-menu-badge"
      data-sidebar="menu-badge"
      className={cn(
        "pointer-events-none absolute right-4 flex h-5 min-w-5 items-center justify-center text-label-lg text-on-surface-variant tabular-nums select-none",
        "peer-data-[active=true]/menu-button:text-on-secondary-container",
        "peer-data-[size=sm]/menu-button:top-1",
        "peer-data-[size=default]/menu-button:top-1.5",
        "peer-data-[size=lg]/menu-button:top-2.5",
        "group-data-[collapsible=icon]:hidden",
        className
      )}
      {...props}
    />
  )
}

function SidebarMenuSkeleton({
  className,
  showIcon = false,
  ...props
}: React.ComponentProps<"div"> & {
  showIcon?: boolean
}) {
  // Random width between 50 to 90%.
  const width = React.useMemo(() => {
    return `${Math.floor(Math.random() * 40) + 50}%`
  }, [])

  return (
    <div
      data-slot="sidebar-menu-skeleton"
      data-sidebar="menu-skeleton"
      className={cn("flex h-14 items-center gap-3 rounded-xl px-4", className)}
      {...props}
    >
      {showIcon && (
        <Skeleton
          className="size-6 rounded-full"
          data-sidebar="menu-skeleton-icon"
        />
      )}
      <Skeleton
        className="h-4 max-w-(--skeleton-width) flex-1"
        data-sidebar="menu-skeleton-text"
        style={
          {
            "--skeleton-width": width,
          } as React.CSSProperties
        }
      />
    </div>
  )
}

function SidebarMenuSub({ className, ...props }: React.ComponentProps<"ul">) {
  return (
    <ul
      data-slot="sidebar-menu-sub"
      data-sidebar="menu-sub"
      className={cn(
        "mx-4 flex min-w-0 translate-x-px flex-col gap-1 border-l border-outline-variant px-3 py-1",
        "group-data-[collapsible=icon]:hidden",
        className
      )}
      {...props}
    />
  )
}

function SidebarMenuSubItem({
  className,
  ...props
}: React.ComponentProps<"li">) {
  return (
    <li
      data-slot="sidebar-menu-sub-item"
      data-sidebar="menu-sub-item"
      className={cn("group/menu-sub-item relative", className)}
      {...props}
    />
  )
}

function SidebarMenuSubButton({
  asChild = false,
  size = "md",
  isActive = false,
  className,
  ...props
}: React.ComponentProps<"a"> & {
  asChild?: boolean
  size?: "sm" | "md"
  isActive?: boolean
}) {
  const Comp = asChild ? Slot.Root : "a"

  return (
    <Comp
      data-slot="sidebar-menu-sub-button"
      data-sidebar="menu-sub-button"
      data-size={size}
      data-active={isActive}
      className={cn(
        "state-layer m3-focus-ring flex h-10 min-w-0 -translate-x-px items-center gap-3 overflow-hidden rounded-full px-3 text-on-surface-variant outline-hidden",
        "disabled:pointer-events-none disabled:text-on-surface/38 aria-disabled:pointer-events-none aria-disabled:text-on-surface/38",
        "[&>span:last-child]:truncate [&>svg]:size-5 [&>svg]:shrink-0",
        "data-[active=true]:bg-secondary-container data-[active=true]:text-on-secondary-container",
        size === "sm" && "text-label-md",
        size === "md" && "text-label-lg",
        "group-data-[collapsible=icon]:hidden",
        className
      )}
      {...props}
    />
  )
}

export {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
}
