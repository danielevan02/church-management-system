"use client";

import { format, parse } from "date-fns";
import { enUS, id as idLocale } from "date-fns/locale";
import { CalendarIcon, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

type Props = {
  /** Stored as `yyyy-MM-dd` (matches native date input). Empty string = no value. */
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  fromDate?: Date;
  toDate?: Date;
  clearable?: boolean;
  ariaLabel?: string;
};

const VALUE_FORMAT = "yyyy-MM-dd";

/**
 * Default year range when fromDate/toDate aren't provided. Wide enough to
 * cover birthdays, baptism dates (decades back) AND future event dates.
 */
const DEFAULT_YEARS_BACK = 100;
const DEFAULT_YEARS_FORWARD = 5;

function defaultStartMonth(): Date {
  const d = new Date();
  d.setFullYear(d.getFullYear() - DEFAULT_YEARS_BACK, 0, 1);
  return d;
}
function defaultEndMonth(): Date {
  const d = new Date();
  d.setFullYear(d.getFullYear() + DEFAULT_YEARS_FORWARD, 11, 31);
  return d;
}

export function DatePicker({
  value,
  onChange,
  placeholder,
  disabled,
  className,
  fromDate,
  toDate,
  clearable = false,
  ariaLabel,
}: Props) {
  const t = useTranslations("common.datetime");
  const locale = useLocale();
  const dfLocale = locale === "id" ? idLocale : enUS;
  const [open, setOpen] = useState(false);

  const parsed = useMemo(() => {
    if (!value) return null;
    const d = parse(value, VALUE_FORMAT, new Date());
    return Number.isNaN(d.getTime()) ? null : d;
  }, [value]);

  function onSelect(date: Date | undefined) {
    if (!date) {
      onChange("");
      setOpen(false);
      return;
    }
    onChange(format(date, VALUE_FORMAT));
    setOpen(false);
  }

  return (
    <Popover open={open} onOpenChange={(o) => !disabled && setOpen(o)}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          aria-label={ariaLabel}
          className={cn(
            "w-full justify-start text-left font-normal",
            !parsed && "text-muted-foreground",
            className,
          )}
        >
          <CalendarIcon className="h-4 w-4" />
          {parsed
            ? format(parsed, "EEEE, dd MMM yyyy", { locale: dfLocale })
            : (placeholder ?? t("placeholderDate"))}
          {clearable && parsed ? (
            <span
              role="button"
              tabIndex={0}
              aria-label={t("clear")}
              className="ml-auto inline-flex h-5 w-5 items-center justify-center rounded-sm text-muted-foreground hover:bg-muted hover:text-foreground"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onChange("");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onChange("");
                }
              }}
            >
              <X className="h-3.5 w-3.5" />
            </span>
          ) : null}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={parsed ?? undefined}
          onSelect={onSelect}
          captionLayout="dropdown"
          startMonth={fromDate ?? defaultStartMonth()}
          endMonth={toDate ?? defaultEndMonth()}
          defaultMonth={parsed ?? undefined}
          disabled={(date) => {
            if (fromDate && date < startOfDay(fromDate)) return true;
            if (toDate && date > endOfDay(toDate)) return true;
            return false;
          }}
          locale={dfLocale}
          weekStartsOn={1}
          autoFocus
        />
      </PopoverContent>
    </Popover>
  );
}

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function endOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}
