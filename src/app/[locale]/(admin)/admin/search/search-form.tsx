"use client";

import { Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "@/lib/i18n/navigation";

export function SearchForm({ initialQuery }: { initialQuery: string }) {
  const t = useTranslations("search");
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [q, setQ] = useState(initialQuery);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = q.trim();
    startTransition(() => {
      router.replace(
        trimmed ? `/admin/search?q=${encodeURIComponent(trimmed)}` : "/admin/search",
      );
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t("placeholder")}
          className="pl-9"
          autoFocus
        />
      </div>
      <Button type="submit" disabled={pending || q.trim().length < 2}>
        {t("submit")}
      </Button>
    </form>
  );
}
