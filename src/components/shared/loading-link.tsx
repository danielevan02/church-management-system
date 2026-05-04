"use client";

import { Loader2 } from "lucide-react";
import { useTransition, type ReactNode } from "react";

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
 * Anchor-style link that swaps its icon for a spinner the moment it's
 * clicked, then pushes the route in a transition. Use it for text-style
 * sign-in / sign-up links where a full button feels too heavy but you
 * still want feedback so users don't tap repeatedly on slow networks.
 */
export function LoadingLink({ href, children, className, icon }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        startTransition(() => {
          router.push(href);
        });
      }}
      className={cn(
        "inline-flex items-center gap-1.5 disabled:opacity-70",
        className,
      )}
    >
      {pending ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : icon ?? null}
      <span>{children}</span>
    </button>
  );
}
