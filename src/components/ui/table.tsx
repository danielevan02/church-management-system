"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * Data table.
 *
 * M3 dropped the data table component that M2 had, so this follows M3's list
 * and surface rules instead: `outline-variant` dividers, `title-small`
 * `on-surface-variant` headers, `body-medium` cells, 56dp header and 52dp body
 * rows.
 *
 * Row hover is the M3 state layer expressed as a background rather than a
 * pseudo-element — `on-surface` at 8%, the exact value `state-layer` uses.
 * `<tr>` is a poor host for an absolutely-positioned `::before` (its box model
 * varies with `border-collapse`), and a background composites identically here
 * because a row has no shape of its own to respect.
 *
 * Selection uses `secondary-container`, matching how every other M3 component
 * in this system shows "this one is chosen".
 */
function Table({ className, ...props }: React.ComponentProps<"table">) {
  return (
    <div
      data-slot="table-container"
      className="relative w-full overflow-x-auto"
    >
      <table
        data-slot="table"
        className={cn("w-full caption-bottom text-body-md text-on-surface", className)}
        {...props}
      />
    </div>
  )
}

function TableHeader({ className, ...props }: React.ComponentProps<"thead">) {
  return (
    <thead
      data-slot="table-header"
      className={cn("[&_tr]:border-b [&_tr]:border-outline-variant", className)}
      {...props}
    />
  )
}

function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
  return (
    <tbody
      data-slot="table-body"
      className={cn("[&_tr:last-child]:border-0", className)}
      {...props}
    />
  )
}

function TableFooter({ className, ...props }: React.ComponentProps<"tfoot">) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn(
        "border-t border-outline-variant bg-surface-container text-title-sm [&>tr]:last:border-b-0",
        className
      )}
      {...props}
    />
  )
}

function TableRow({ className, ...props }: React.ComponentProps<"tr">) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        "border-b border-outline-variant transition-colors duration-150 ease-standard",
        "hover:bg-on-surface/8 has-aria-expanded:bg-on-surface/8",
        "data-[state=selected]:bg-secondary-container data-[state=selected]:text-on-secondary-container",
        className
      )}
      {...props}
    />
  )
}

function TableHead({ className, ...props }: React.ComponentProps<"th">) {
  return (
    <th
      data-slot="table-head"
      className={cn(
        "h-14 px-4 text-left align-middle whitespace-nowrap",
        "text-title-sm text-on-surface-variant",
        "[&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
        className
      )}
      {...props}
    />
  )
}

function TableCell({ className, ...props }: React.ComponentProps<"td">) {
  return (
    <td
      data-slot="table-cell"
      className={cn(
        "h-13 px-4 align-middle whitespace-nowrap",
        "[&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
        className
      )}
      {...props}
    />
  )
}

function TableCaption({
  className,
  ...props
}: React.ComponentProps<"caption">) {
  return (
    <caption
      data-slot="table-caption"
      className={cn("mt-4 text-body-sm text-on-surface-variant", className)}
      {...props}
    />
  )
}

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
}
