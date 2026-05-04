"use client";

import { Loader2 } from "lucide-react";
import { useTransition, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { useRouter } from "@/lib/i18n/navigation";

import type { ComponentProps } from "react";

type ButtonProps = Omit<ComponentProps<typeof Button>, "onClick" | "asChild">;

type Props = ButtonProps & {
  href: string;
  children: ReactNode;
};

/**
 * Button that navigates to `href` and immediately shows a spinner so
 * users don't mash the button thinking it didn't register. Useful on
 * landing-page CTAs where the destination route may take a beat to
 * fetch over a slow connection.
 */
export function LoadingLinkButton({ href, children, ...buttonProps }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <Button
      {...buttonProps}
      disabled={buttonProps.disabled || pending}
      onClick={() => {
        startTransition(() => {
          router.push(href);
        });
      }}
    >
      {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
      {children}
    </Button>
  );
}
