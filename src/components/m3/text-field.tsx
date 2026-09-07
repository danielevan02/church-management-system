"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * Material 3 text field — outlined (default) and filled.
 *
 * This is a *new* component rather than a restyled `ui/input.tsx`, because M3's
 * text field is not a styled input: the label lives inside the control and
 * animates into the outline, which changes the DOM shape and the API. The
 * plain `<Input />` stays in place for the 37 files already using it and for
 * cases where a bare control is genuinely what you want (search bars, table
 * filters, the OTP/PIN inputs).
 *
 * ## Why a fieldset/legend for the notch
 *
 * Three ways to break the outline where the floated label crosses it:
 *
 *   1. Give the label a background matching the field's. Cheapest, but it is a
 *      lie — it breaks the moment the field sits on a gradient, an image, or a
 *      surface-container of a different tone than you assumed. And M3 fields
 *      routinely sit on several different container roles.
 *   2. Split the top border into segments and size the gap in JS. What
 *      material-web does. Pixel-perfect, needs a ResizeObserver and a measure
 *      pass, and re-measures on every locale switch.
 *   3. A real `<fieldset>` with a `<legend>` holding a copy of the label.
 *      The browser breaks the border around the legend for free, sized to the
 *      text, with no measurement and no JS.
 *
 * (3) wins here specifically because the app is bilingual: "Nomor telepon" and
 * "Phone number" are different widths, and next-intl can swap them without a
 * remount. A JS-measured notch would need to re-measure; the legend just
 * reflows. The duplicated label text is hidden from AT via `aria-hidden` on
 * the fieldset.
 *
 * ## Label float without a controlled component
 *
 * `placeholder=" "` plus `:placeholder-shown` gives a CSS-only "has value"
 * signal, so the float works with uncontrolled RHF `register()`, with
 * controlled values, and with browser autofill — all without an effect. A
 * caller-supplied placeholder sets `data-populated` instead, since a visible
 * placeholder means the label must already be out of the way.
 */

type TextFieldProps = Omit<React.ComponentProps<"input">, "size"> & {
  label: string
  variant?: "outlined" | "filled"
  supportingText?: React.ReactNode
  /** `true` marks the field invalid; a string also replaces the supporting text. */
  error?: boolean | string
  leadingIcon?: React.ReactNode
  trailingIcon?: React.ReactNode
  /** Renders M3's `current/max` counter. Requires `maxLength`. */
  showCounter?: boolean
  containerClassName?: string
}

function TextField({
  label,
  variant = "outlined",
  supportingText,
  error,
  leadingIcon,
  trailingIcon,
  showCounter = false,
  containerClassName,
  className,
  id: idProp,
  placeholder,
  maxLength,
  onChange,
  ...props
}: TextFieldProps) {
  const autoId = React.useId()
  const id = idProp ?? autoId
  const describedById = `${id}-supporting`

  const hasError = Boolean(error)
  const message = typeof error === "string" ? error : supportingText

  // Counter only. The value itself stays uncontrolled so RHF `register()` and
  // native autofill keep working; we just shadow its length.
  const initialLength = String(props.value ?? props.defaultValue ?? "").length
  const [length, setLength] = React.useState(initialLength)
  const controlledLength =
    props.value !== undefined ? String(props.value).length : length

  const handleChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setLength(event.target.value.length)
      onChange?.(event)
    },
    [onChange]
  )

  const outlined = variant === "outlined"

  return (
    <div
      className={cn(
        "m3-field group/field flex w-full flex-col",
        // The label's horizontal inset and the outline's notch position have to
        // agree exactly, or the border draws straight through the floated
        // label. Deriving both from one variable is the only way they stay in
        // sync when a leading icon pushes the label 52dp in.
        leadingIcon ? "[--field-inset:3.25rem]" : "[--field-inset:1rem]",
        containerClassName
      )}
      data-error={hasError || undefined}
      data-populated={placeholder ? "true" : undefined}
      data-variant={variant}
    >
      <div className="relative w-full">
        {leadingIcon && (
          <span
            aria-hidden
            className={cn(
              "pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-on-surface-variant",
              "field-error:text-error field-disabled:text-on-surface/38",
              "[&_svg:not([class*='size-'])]:size-6"
            )}
          >
            {leadingIcon}
          </span>
        )}

        <input
          id={id}
          // See the note above — this is the CSS-only "has value" signal.
          placeholder={placeholder ?? " "}
          maxLength={maxLength}
          aria-invalid={hasError || undefined}
          aria-describedby={message || showCounter ? describedById : undefined}
          onChange={handleChange}
          className={cn(
            "peer h-14 w-full appearance-none bg-transparent text-body-lg text-on-surface outline-none",
            "caret-primary selection:bg-primary selection:text-on-primary",
            // The placeholder is a layout device, not content — never show it.
            "placeholder:text-transparent",
            "disabled:cursor-not-allowed disabled:text-on-surface/38",
            // Autofill repaints the background; keep the field's own surface.
            "[&:-webkit-autofill]:[-webkit-text-fill-color:var(--md-sys-color-on-surface)]",
            outlined
              ? "rounded-xs px-4"
              : // Filled: label occupies the top of the box, so the value sits low.
                "rounded-t-xs px-4 pt-6 pb-2",
            leadingIcon && "pl-13",
            trailingIcon && "pr-13",
            className
          )}
          {...props}
        />

        {/* Label. Rests vertically centred, floats onto the outline (outlined)
            or to the top of the box (filled) on focus or when populated. */}
        <label
          htmlFor={id}
          className={cn(
            "pointer-events-none absolute z-10 max-w-[calc(100%-2rem)] truncate",
            "left-(--field-inset)",
            "text-body-lg text-on-surface-variant",
            "transition-[top,font-size,line-height,color] duration-150 ease-standard",
            outlined
              ? [
                  "top-1/2 -translate-y-1/2",
                  "field-focus:top-0 field-focus:text-body-sm field-focus:text-primary",
                  "field-populated:top-0 field-populated:text-body-sm",
                ]
              : [
                  "top-1/2 -translate-y-1/2",
                  "field-focus:top-2 field-focus:translate-y-0 field-focus:text-body-sm field-focus:text-primary",
                  "field-populated:top-2 field-populated:translate-y-0 field-populated:text-body-sm",
                ],
            "field-error:text-error",
            "field-disabled:text-on-surface/38"
          )}
        >
          {label}
        </label>

        {trailingIcon && (
          <span
            aria-hidden
            className={cn(
              "pointer-events-none absolute right-3 top-1/2 z-10 -translate-y-1/2 text-on-surface-variant",
              "field-error:text-error field-disabled:text-on-surface/38",
              "[&_svg:not([class*='size-'])]:size-6"
            )}
          >
            {trailingIcon}
          </span>
        )}

        {outlined ? (
          /* Notched outline. `-top-[5px]` pulls the fieldset up so the browser
             draws its top border through the vertical centre of the legend,
             which is exactly where the floated label sits. */
          <fieldset
            aria-hidden
            className={cn(
              "pointer-events-none absolute inset-x-0 -top-[5px] bottom-0 m-0 min-w-0 overflow-hidden rounded-xs",
              "pr-2 pl-[calc(var(--field-inset)-0.25rem)]",
              "border border-outline transition-[border-color,border-width] duration-150 ease-standard",
              "field-focus:border-[3px] field-focus:border-primary",
              "field-error:border-error field-error:field-focus:border-error",
              "field-disabled:border-on-surface/12"
            )}
          >
            <legend
              className={cn(
                "invisible block h-[11px] w-auto max-w-[0.01px] overflow-hidden p-0 text-[12px] whitespace-nowrap",
                "transition-[max-width] duration-100 ease-standard",
                "field-focus:max-w-full field-populated:max-w-full"
              )}
            >
              <span className="visible inline-block px-1 opacity-0">{label}</span>
            </legend>
          </fieldset>
        ) : (
          /* Filled: a container plus a bottom active indicator. Drawn as
             sibling elements so the indicator can thicken to 3dp on focus
             without shifting the 56dp box height. */
          <>
            <div
              aria-hidden
              className={cn(
                "pointer-events-none absolute inset-0 -z-10 rounded-t-xs bg-surface-container-highest",
                "field-disabled:bg-on-surface/[0.04]"
              )}
            />
            <div
              aria-hidden
              className={cn(
                "pointer-events-none absolute inset-x-0 bottom-0 h-px bg-on-surface-variant",
                "transition-[height,background-color] duration-150 ease-standard",
                "field-focus:h-[3px] field-focus:bg-primary",
                "field-error:bg-error",
                "field-disabled:bg-on-surface/38"
              )}
            />
          </>
        )}
      </div>

      {(message || (showCounter && maxLength)) && (
        <div
          className={cn(
            "mt-1 flex items-start gap-4 px-4 text-body-sm",
            hasError ? "text-error" : "text-on-surface-variant"
          )}
        >
          <span id={describedById} className="flex-1">
            {message}
          </span>
          {showCounter && maxLength ? (
            <span className="shrink-0 tabular-nums">
              {controlledLength}/{maxLength}
            </span>
          ) : null}
        </div>
      )}
    </div>
  )
}

export { TextField, type TextFieldProps }
