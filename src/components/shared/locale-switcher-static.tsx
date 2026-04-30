import { getLocale } from "next-intl/server";

import { Link } from "@/lib/i18n/navigation";
import { cn } from "@/lib/utils";

/**
 * Server-only locale switcher — two simple pill links. Use this on
 * landing pages where bringing in the full Radix dropdown is overkill
 * and cuts initial JS by ~30-50 KB.
 */
export async function LocaleSwitcherStatic() {
  const current = await getLocale();
  return (
    <div className="inline-flex items-center gap-0.5 rounded-full border bg-background/60 p-0.5 text-xs font-medium backdrop-blur">
      <LocaleLink locale="id" current={current} label="ID" />
      <LocaleLink locale="en" current={current} label="EN" />
    </div>
  );
}

function LocaleLink({
  locale,
  current,
  label,
}: {
  locale: "id" | "en";
  current: string;
  label: string;
}) {
  const active = current === locale;
  return (
    <Link
      href="/"
      locale={locale}
      className={cn(
        "rounded-full px-2.5 py-1 transition-colors",
        active
          ? "bg-foreground text-background"
          : "text-muted-foreground hover:text-foreground",
      )}
    >
      {label}
    </Link>
  );
}
