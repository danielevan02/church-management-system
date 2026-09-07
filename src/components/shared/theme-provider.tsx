"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";

/**
 * Mounts next-themes so the `.dark` class actually lands on <html>.
 *
 * This was missing entirely: `next-themes` was a dependency and
 * `ui/sonner.tsx` already called `useTheme()`, but no provider was ever
 * rendered — so the class never applied and the app had no dark mode at all,
 * silently. Every `.dark` role in the design system was unreachable.
 *
 * `attribute="class"` is what `@custom-variant dark (&:is(.dark *))` in
 * globals.css expects. `defaultTheme="system"` follows the OS; a toggle is
 * `const { setTheme } = useTheme()` wherever you want to put one.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  );
}
