import { notFound } from "next/navigation";

/**
 * Catch-all for unmatched paths inside a locale.
 *
 * The middleware rewrites essentially every request into `[locale]`, so an
 * unknown URL arrives here rather than at a root-level 404. That matters
 * structurally: `app/layout.tsx` is a pass-through, and the real `<html>` and
 * `<body>` live in `[locale]/layout.tsx`. Routing the miss through this
 * segment means the 404 renders inside a layout that actually has a document.
 */
export default function CatchAllNotFound(): never {
  notFound();
}
