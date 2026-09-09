import { getLocale } from "next-intl/server";

import { Link } from "@/lib/i18n/navigation";
import { cn } from "@/lib/utils";

/**
 * Server-only locale switcher — two plain links with a hairline between them.
 * Use this on the landing page where bringing in the full Radix dropdown is
 * overkill and cuts initial JS by ~30-50 KB.
 *
 * It is styled in the landing page's `lp-*` tokens rather than in M3 roles on
 * purpose: those flip under `.dark`, and the landing page does not.
 */
export async function LocaleSwitcherStatic() {
  const current = await getLocale();
  return (
    <div className="inline-flex items-center gap-2 text-[0.8125rem] leading-none">
      <LocaleLink locale="id" current={current} label="ID" />
      <span className="h-3 w-px bg-lp-rule-firm" aria-hidden />
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
      aria-current={active ? "true" : undefined}
      className={cn(
        "transition-colors",
        active
          ? "font-medium text-lp-ink"
          : "text-lp-ink-faint hover:text-lp-ink",
      )}
    >
      {label}
    </Link>
  );
}
