"use client"

import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react"
import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"

/**
 * M3 snackbar, via sonner.
 *
 * A spec-pure M3 snackbar is always `inverse-surface` — the icon carries the
 * semantic, not the container — which is why `--normal-bg` is the inverse
 * pair. The per-type variables are still mapped because the app mounts this
 * with `richColors`, so typed toasts do get coloured; pointing them at the
 * container roles keeps that legible in both schemes instead of using sonner's
 * own hardcoded palette.
 *
 * Shape is extra-small (4dp) per M3 snackbar, not the app's 12dp default.
 */
const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-5" />,
        info: <InfoIcon className="size-5" />,
        warning: <TriangleAlertIcon className="size-5" />,
        error: <OctagonXIcon className="size-5" />,
        loading: <Loader2Icon className="size-5 animate-spin" />,
      }}
      style={
        {
          "--normal-bg": "var(--md-sys-color-inverse-surface)",
          "--normal-text": "var(--md-sys-color-inverse-on-surface)",
          "--normal-border": "transparent",

          "--success-bg": "var(--md-sys-color-success-container)",
          "--success-text": "var(--md-sys-color-on-success-container)",
          "--success-border": "transparent",

          "--error-bg": "var(--md-sys-color-error-container)",
          "--error-text": "var(--md-sys-color-on-error-container)",
          "--error-border": "transparent",

          "--warning-bg": "var(--md-sys-color-warning-container)",
          "--warning-text": "var(--md-sys-color-on-warning-container)",
          "--warning-border": "transparent",

          "--info-bg": "var(--md-sys-color-secondary-container)",
          "--info-text": "var(--md-sys-color-on-secondary-container)",
          "--info-border": "transparent",

          "--border-radius": "var(--radius-xs)",
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
