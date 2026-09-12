import { formatInTimeZone, fromZonedTime } from "date-fns-tz";

import { church } from "./church";
import { TZ } from "@/lib/datetime";

/**
 * Per-deployment campus facts for the public landing page.
 *
 * Everything a church would need to correct after handover lives here or in an
 * env var, so re-skinning a deployment never means editing a component. The
 * defaults are deliberately conservative: where a fact is not known, the
 * default is the *true, general* fact ("Tangerang, Banten") rather than a
 * plausible-looking invention, and any control whose target is unknown is not
 * rendered at all rather than rendered dead. See `.env.example`.
 */

const env = (key: string): string => process.env[key]?.trim() ?? "";

/** 0 = Sunday, matching `Date.prototype.getDay()`. */
export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export type ServiceSlot = {
  /** i18n key under `lp.schedule.services`. */
  readonly key: string;
  readonly weekday: Weekday;
  /** Wall-clock start in Asia/Jakarta, "HH:mm". */
  readonly time: string;
  readonly durationMin: number;
  /** Whether this slot feeds the hero's next-service countdown. */
  readonly countdown: boolean;
};

/**
 * The gathering rhythm. Not read from the `services` table on purpose: the
 * landing page is a static marketing surface and must render without a
 * database round-trip.
 *
 * `countdown: false` on two of these is the load-bearing detail. TYOG runs at
 * the same instant as Ibadah Umum II, and Sekolah Minggu alongside it — so
 * marking all three as countdown-eligible would have the hero pick one of
 * three simultaneous services by sort order and name it as "the next
 * gathering". The countdown therefore tracks only the slots that define a
 * unique time, and the schedule table below still lists all five.
 *
 * Durations are estimates and are the other thing worth correcting on
 * handover; they only affect how long a service is reported as "in progress".
 */
export const SERVICE_SLOTS: readonly ServiceSlot[] = [
  { key: "umumEarly", weekday: 0, time: "07:00", durationMin: 90, countdown: true },
  { key: "umumLate", weekday: 0, time: "10:00", durationMin: 90, countdown: true },
  { key: "tyog", weekday: 0, time: "10:00", durationMin: 90, countdown: false },
  { key: "sekolahMinggu", weekday: 0, time: "10:00", durationMin: 75, countdown: false },
  { key: "doa", weekday: 3, time: "19:00", durationMin: 90, countdown: true },
] as const;

export const campus = {
  legalName: church.name,
  shortName: church.shortName,
  /** Signage on the building itself, as photographed in `visit.jpeg`. */
  signage: env("NEXT_PUBLIC_CHURCH_SIGNAGE") || "Gereja Kristen Tangerang",
  addressLine: env("NEXT_PUBLIC_CHURCH_ADDRESS"),
  city: env("NEXT_PUBLIC_CHURCH_CITY") || "Tangerang",
  region: env("NEXT_PUBLIC_CHURCH_REGION") || "Banten",
  country: env("NEXT_PUBLIC_CHURCH_COUNTRY") || "Indonesia",
  /**
   * A name query rather than coordinates: it opens the real Maps result for
   * this church on every platform, and unlike a hard-coded lat/lng it cannot
   * be silently wrong.
   */
  mapsUrl:
    env("NEXT_PUBLIC_CHURCH_MAPS_URL") ||
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      church.name,
    )}`,
  /**
   * Secretariat WhatsApp, E.164 without the leading `+`.
   *
   * Falls back to the giving-confirmation number because that is the one
   * WhatsApp contact the app already required before this page existed. Without
   * the fallback an unset `NEXT_PUBLIC_CHURCH_WHATSAPP` silently removed the
   * landing page's primary call to action — "message the secretariat" — since
   * every control here refuses to render rather than point nowhere.
   */
  whatsapp: (
    env("NEXT_PUBLIC_CHURCH_WHATSAPP") ||
    env("NEXT_PUBLIC_CHURCH_GIVING_CONFIRM_WA")
  ).replace(/[^\d]/g, ""),
  email: env("NEXT_PUBLIC_CHURCH_EMAIL"),
  /** Rendered only when set — an unset livestream falls back to the secretariat or YouTube channel. */
  livestreamUrl:
    env("NEXT_PUBLIC_CHURCH_LIVESTREAM_URL") ||
    "https://www.youtube.com/@gkjtangerang7135",
  instagramUrl:
    env("NEXT_PUBLIC_CHURCH_INSTAGRAM_URL") ||
    "https://www.instagram.com/gkjtangerang/",
  youtubeUrl:
    env("NEXT_PUBLIC_CHURCH_YOUTUBE_URL") ||
    "https://www.youtube.com/@gkjtangerang7135",
  facebookUrl:
    env("NEXT_PUBLIC_CHURCH_FACEBOOK_URL") ||
    "https://www.facebook.com/gkj.tangerang.79/",
} as const;

export function whatsappLink(text: string, number = campus.whatsapp): string {
  if (!number) return "";
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
}

/** Full address, skipping the parts a deployment has not filled in. */
export function formatAddress(): string {
  return [campus.addressLine, campus.city, campus.region, campus.country]
    .filter(Boolean)
    .join(", ");
}

/**
 * The next UTC instant at which `slot` starts, in Jakarta wall-clock terms.
 *
 * Written against the Jakarta *calendar* rather than by adding milliseconds to
 * `now`: the server runs in UTC on Vercel, so "next Sunday 07:00" has to be
 * resolved as a zoned wall-clock string and converted, or the answer is seven
 * hours out for a third of every day.
 */
export function nextOccurrence(slot: ServiceSlot, from: Date = new Date()): Date {
  const [hh, mm] = slot.time.split(":").map(Number);
  const todayInJakarta = formatInTimeZone(from, TZ, "yyyy-MM-dd");
  const jakartaWeekday = Number(formatInTimeZone(from, TZ, "i")) % 7; // ISO 1-7 -> 0-6

  let deltaDays = (slot.weekday - jakartaWeekday + 7) % 7;
  const candidate = fromZonedTime(
    addDaysToIsoDate(todayInJakarta, deltaDays) +
      `T${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}:00`,
    TZ,
  );

  if (candidate.getTime() <= from.getTime()) {
    deltaDays += 7;
    return fromZonedTime(
      addDaysToIsoDate(todayInJakarta, deltaDays) +
        `T${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}:00`,
      TZ,
    );
  }
  return candidate;
}

/** Date-only arithmetic on a "yyyy-MM-dd" string, free of any timezone. */
function addDaysToIsoDate(iso: string, days: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + days);
  return dt.toISOString().slice(0, 10);
}

/**
 * A resolved gathering, as ISO instants.
 *
 * ISO strings rather than `Date`s because this crosses the server/client
 * boundary, and both ends rather than just the start so the client can say
 * "in progress" without needing the slot table or a timezone library.
 */
export type NextService = {
  readonly slotKey: string;
  readonly startsAtIso: string;
  readonly endsAtIso: string;
};

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * The occurrence to report for this slot: the one happening *now* if there is
 * one, otherwise the next.
 *
 * `nextOccurrence` returns a strictly future start, which is correct for
 * "when is the next one" and wrong for a service that started ten minutes
 * ago — it rolls straight past it to next week. That made the countdown's
 * "in progress" state unreachable: the client could never see an occurrence
 * whose start was in the past, so the branch rendering it was dead code. It
 * took a Wednesday-evening service to expose it, because with Sunday-only
 * times the window is easy to miss.
 *
 * So: take the next future start, look one week back, and if that occurrence
 * has not finished yet, report it instead.
 */
function resolve(slot: ServiceSlot, from: Date): NextService {
  const next = nextOccurrence(slot, from);
  const durationMs = slot.durationMin * 60_000;
  const previous = new Date(next.getTime() - WEEK_MS);
  const startsAt =
    previous.getTime() + durationMs > from.getTime() ? previous : next;

  return {
    slotKey: slot.key,
    startsAtIso: startsAt.toISOString(),
    endsAtIso: new Date(startsAt.getTime() + durationMs).toISOString(),
  };
}

/** The soonest countdown-eligible gathering. */
export function nextService(from: Date = new Date()): NextService {
  return [...countdownSchedule(from)][0];
}

/** Countdown-eligible slots plus their next instant, for the client ticker. */
export function countdownSchedule(
  from: Date = new Date(),
): readonly NextService[] {
  return SERVICE_SLOTS.filter((s) => s.countdown)
    .map((slot) => resolve(slot, from))
    .sort((a, b) => a.startsAtIso.localeCompare(b.startsAtIso));
}

/** Every slot with its next instant, for the schedule table. */
export function fullSchedule(
  from: Date = new Date(),
): readonly NextService[] {
  return SERVICE_SLOTS.map((slot) => resolve(slot, from));
}

/**
 * A Google Calendar "add event" URL for a weekly gathering.
 *
 * A hosted template link rather than a generated `.ics` download: on Android
 * and iOS a downloaded `.ics` frequently opens in a file viewer instead of the
 * calendar, and this page's audience is overwhelmingly mobile. The `recur`
 * parameter carries the weekly rule, so one tap subscribes to the series
 * rather than adding a single Sunday.
 */
export function googleCalendarUrl({
  title,
  slot,
  details,
  from = new Date(),
}: {
  title: string;
  slot: ServiceSlot;
  details?: string;
  from?: Date;
}): string {
  const start = nextOccurrence(slot, from);
  const end = new Date(start.getTime() + slot.durationMin * 60_000);
  const stamp = (d: Date) => d.toISOString().replace(/[-:]|\.\d{3}/g, "");
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: title,
    dates: `${stamp(start)}/${stamp(end)}`,
    location: formatAddress(),
    recur: "RRULE:FREQ=WEEKLY",
  });
  if (details) params.set("details", details);
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
