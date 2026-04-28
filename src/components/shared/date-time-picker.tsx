"use client";

import { format, parse } from "date-fns";
import { enUS, id as idLocale } from "date-fns/locale";
import { CalendarIcon, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

type Props = {
  /** Stored as `yyyy-MM-dd'T'HH:mm` (matches native datetime-local). */
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  /** Disable dates before this date (inclusive). */
  fromDate?: Date;
  /** Disable dates after this date (inclusive). */
  toDate?: Date;
  /** When clearing the field is permitted. */
  clearable?: boolean;
  ariaLabel?: string;
};

const VALUE_FORMAT = "yyyy-MM-dd'T'HH:mm";

export function DateTimePicker({
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

  const hh = parsed ? format(parsed, "HH") : "";
  const mm = parsed ? format(parsed, "mm") : "";

  function commit(date: Date | undefined, hour: string, minute: string) {
    if (!date) {
      onChange("");
      return;
    }
    const h = clampInt(hour, 0, 23, parsed?.getHours() ?? 9);
    const m = clampInt(minute, 0, 59, parsed?.getMinutes() ?? 0);
    const next = new Date(date);
    next.setHours(h, m, 0, 0);
    onChange(format(next, VALUE_FORMAT));
  }

  function onSelectDate(date: Date | undefined) {
    commit(date, hh || "09", mm || "00");
  }

  function onTimeChange(part: "h" | "m", raw: string) {
    if (!parsed) return;
    if (part === "h") commit(parsed, raw, mm || "00");
    else commit(parsed, hh || "00", raw);
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
            ? format(parsed, "EEE, dd MMM yyyy · HH:mm", { locale: dfLocale })
            : (placeholder ?? t("placeholder"))}
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
          onSelect={onSelectDate}
          disabled={(date) => {
            if (fromDate && date < startOfDay(fromDate)) return true;
            if (toDate && date > endOfDay(toDate)) return true;
            return false;
          }}
          locale={dfLocale}
          weekStartsOn={1}
          autoFocus
        />
        <div className="flex items-end gap-2 border-t p-3">
          <div className="flex flex-col gap-1">
            <Label htmlFor="dtp-hh" className="text-xs text-muted-foreground">
              {t("hour")}
            </Label>
            <Input
              id="dtp-hh"
              type="number"
              inputMode="numeric"
              min={0}
              max={23}
              value={hh}
              disabled={!parsed}
              onChange={(e) => onTimeChange("h", e.target.value)}
              className="h-9 w-16 tabular-nums"
            />
          </div>
          <span className="pb-2 text-muted-foreground">:</span>
          <div className="flex flex-col gap-1">
            <Label htmlFor="dtp-mm" className="text-xs text-muted-foreground">
              {t("minute")}
            </Label>
            <Input
              id="dtp-mm"
              type="number"
              inputMode="numeric"
              min={0}
              max={59}
              value={mm}
              disabled={!parsed}
              onChange={(e) => onTimeChange("m", e.target.value)}
              className="h-9 w-16 tabular-nums"
            />
          </div>
          <Button
            type="button"
            size="sm"
            className="ml-auto"
            onClick={() => setOpen(false)}
          >
            {t("done")}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function clampInt(raw: string, lo: number, hi: number, fallback: number) {
  const n = parseInt(raw, 10);
  if (Number.isNaN(n)) return fallback;
  return Math.min(hi, Math.max(lo, n));
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
