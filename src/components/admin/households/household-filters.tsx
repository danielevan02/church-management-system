"use client";

import { Loader2, Search, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";

import { Input } from "@/components/ui/input";

const DEBOUNCE_MS = 300;

export function HouseholdFilters() {
  const t = useTranslations("households.filters");
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const [pending, startTransition] = useTransition();
  const initial = sp.get("q") ?? "";
  const [q, setQ] = useState(initial);
  const lastPushedRef = useRef(initial);

  useEffect(() => {
    const next = q.trim();
    if (next === lastPushedRef.current) return;

    const handle = setTimeout(() => {
      lastPushedRef.current = next;
      const params = new URLSearchParams(sp.toString());
      if (next === "") params.delete("q");
      else params.set("q", next);
      params.delete("page");
      startTransition(() => {
        const qs = params.toString();
        router.push(qs ? `${pathname}?${qs}` : pathname);
      });
    }, DEBOUNCE_MS);

    return () => clearTimeout(handle);
  }, [q, pathname, router, sp]);

  return (
    <div className="relative max-w-md">
      {pending ? (
        <Loader2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
      ) : (
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      )}
      <Input
        type="text"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={t("searchPlaceholder")}
        className="pl-9 pr-9"
      />
      {q && (
        <button
          type="button"
          onClick={() => setQ("")}
          aria-label={t("clear")}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-sm p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
