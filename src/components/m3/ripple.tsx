"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * M3 press ripple, as an opt-in island.
 *
 * The CSS state layer in `src/styles/m3/state.css` covers hover, focus and
 * press for every component with zero JS. The ripple is the one part of M3's
 * interaction model that genuinely cannot be done in CSS — it needs the press
 * coordinates — so it is packaged separately rather than baked into `Button`,
 * where it would force `"use client"` onto ~150 mostly-server call sites.
 *
 * Drop it into surfaces where the press origin carries meaning: nav items,
 * list rows, FABs, calendar days. All of those are already client components.
 *
 * Usage — the parent must carry `ripple-host` (position + overflow clipping):
 *
 *   <button className="ripple-host state-layer rounded-full ...">
 *     <Ripple />
 *     <Icon />
 *   </button>
 *
 * `className` lands on each ripple span, so a caller can override the wash
 * colour or opacity where `currentColor` is not what should ripple.
 *
 * It binds to `parentElement` rather than taking the host as a prop, which is
 * the same contract material-web's `<md-ripple>` uses: the ripple is a child of
 * the thing it decorates, and needs no wiring at the call site.
 */

type RippleInstance = {
  id: number
  cx: number
  cy: number
  diameter: number
}

const ENTER_MS = 450
const EXIT_MS = 375

export function Ripple({ className }: { className?: string }) {
  const anchorRef = React.useRef<HTMLSpanElement>(null)
  const [ripples, setRipples] = React.useState<RippleInstance[]>([])
  const [releasing, setReleasing] = React.useState<Set<number>>(new Set())
  const nextId = React.useRef(0)

  React.useEffect(() => {
    const host = anchorRef.current?.parentElement
    if (!host) return

    // M3 motion is decorative here; users who asked for less of it get the
    // state layer alone, which still communicates the press.
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)")
    if (reduced.matches) return

    function spawn(clientX: number, clientY: number) {
      const rect = host!.getBoundingClientRect()
      const x = clientX - rect.left
      const y = clientY - rect.top
      // Grow to cover the farthest corner, so the ripple always fills the host.
      const diameter =
        2 *
        Math.hypot(
          Math.max(x, rect.width - x),
          Math.max(y, rect.height - y)
        )
      const id = nextId.current++
      setRipples((prev) => [...prev, { id, cx: x, cy: y, diameter }])
      return id
    }

    function release(id: number) {
      setReleasing((prev) => new Set(prev).add(id))
      window.setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== id))
        setReleasing((prev) => {
          const next = new Set(prev)
          next.delete(id)
          return next
        })
      }, EXIT_MS)
    }

    let activeId: number | null = null

    function onPointerDown(event: PointerEvent) {
      if (event.button !== 0) return
      activeId = spawn(event.clientX, event.clientY)
    }

    function endPress() {
      if (activeId === null) return
      release(activeId)
      activeId = null
    }

    // Keyboard activation ripples from the centre — there is no press point.
    function onKeyDown(event: KeyboardEvent) {
      if (event.repeat) return
      if (event.key !== "Enter" && event.key !== " ") return
      const rect = host!.getBoundingClientRect()
      const id = spawn(rect.left + rect.width / 2, rect.top + rect.height / 2)
      window.setTimeout(() => release(id), ENTER_MS / 2)
    }

    host.addEventListener("pointerdown", onPointerDown)
    host.addEventListener("pointerup", endPress)
    host.addEventListener("pointerleave", endPress)
    host.addEventListener("pointercancel", endPress)
    host.addEventListener("keydown", onKeyDown)

    return () => {
      host.removeEventListener("pointerdown", onPointerDown)
      host.removeEventListener("pointerup", endPress)
      host.removeEventListener("pointerleave", endPress)
      host.removeEventListener("pointercancel", endPress)
      host.removeEventListener("keydown", onKeyDown)
    }
  }, [])

  return (
    <span
      ref={anchorRef}
      aria-hidden
      style={{ display: "contents" }}
    >
      {ripples.map((ripple) => (
        <span
          key={ripple.id}
          className={cn("pointer-events-none absolute rounded-full bg-current", className)}
          style={{
            left: ripple.cx - ripple.diameter / 2,
            top: ripple.cy - ripple.diameter / 2,
            width: ripple.diameter,
            height: ripple.diameter,
            // Matches --md-sys-state-pressed-opacity.
            opacity: releasing.has(ripple.id) ? 0 : 0.1,
            transform: "scale(1)",
            animation: `m3-ripple-in ${ENTER_MS}ms var(--md-sys-motion-easing-emphasized-decelerate) forwards`,
            transition: `opacity ${EXIT_MS}ms var(--md-sys-motion-easing-standard)`,
          }}
        />
      ))}
    </span>
  )
}
