"use client";

import { Loader2 } from "lucide-react";
import { useTransition, type ReactNode } from "react";

import { triggerNavigationStart } from "@/components/shared/navigation-progress";
import { cn } from "@/lib/utils";
import { useRouter } from "@/lib/i18n/navigation";

type Props = {
  href: string;
  children: ReactNode;
  className?: string;
  /** Optional icon shown before the children when not pending. */
  icon?: ReactNode;
};

/**
 * Link-styled control that acknowledges the press immediately, then pushes the
 * route in a transition. Use it where a tap needs confirming so users on a
 * slow connection do not press again.
 *
 * Two things it has to get right.
 *
 * **It must not resize when it becomes pending.** The spinner used to be
 * rendered *in place of* `icon`, which meant a `LoadingLink` with no icon —
 * every call site on the landing page — grew by an icon plus a gap the instant
 * it was clicked. The button jumped sideways under the finger that had just
 * pressed it. The label is now swapped for a centred spinner in the same box,
 * so the control keeps its exact dimensions.
 *
 * **It must tell the global progress bar it is navigating.** This renders a
 * `<button>`, not an `<a href>`, so `NavigationProgress`'s delegated click
 * listener cannot see it; without the explicit signal, clicking "Masuk" was
 * the one kind of navigation on the site that showed no top bar at all.
 *
 * Unlike the top bar, the spinner here is *not* delayed. A page-level
 * indicator for a 90ms navigation is noise; acknowledging a press is the one
 * piece of feedback that has to be instant, or the tap feels ignored.
 */
export function LoadingLink({ href, children, className, icon }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      aria-busy={pending}
      onClick={() => {
        triggerNavigationStart();
        startTransition(() => {
          router.push(href);
        });
      }}
      className={cn(
        "relative inline-flex items-center justify-center gap-1.5 disabled:opacity-70",
        className,
      )}
    >
      <span
        className={cn(
          "inline-flex items-center gap-1.5",
          pending && "invisible",
        )}
      >
        {icon ?? null}
        <span>{children}</span>
      </span>

      {pending ? (
        <Loader2
          className="absolute h-4 w-4 animate-spin motion-reduce:animate-none"
          aria-hidden
        />
      ) : null}
    </button>
  );
}
