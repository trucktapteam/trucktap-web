/**
 * Time formatting for the TTN-86 broadcast prototype.
 *
 * Two distinct clocks, deliberately not merged:
 *  - The MASTER NETWORK CLOCK runs on Eastern Time and is always labelled
 *    "ET" (a national-broadcast "all times Eastern" convention).
 *  - Each scheduled Guide listing is formatted in ITS OWN event-local
 *    timezone (the IANA id stored on `upcoming_stops.timezone`), labelled
 *    with the real abbreviation Intl produces — EDT / CDT / EST / MST, etc.
 *
 * A timezone is NEVER guessed. `formatEventTimeParts` returns null when the
 * zone is missing or not a valid IANA identifier, and the caller drops the
 * listing rather than inventing one.
 *
 * Everything here is a pure function of an ISO string + an explicit zone,
 * so server and client renders agree (no ambient-zone hydration mismatch).
 */

export const NETWORK_TIME_ZONE = "America/New_York";
export const NETWORK_TIME_ZONE_LABEL = "ET";

function partMap(parts: Intl.DateTimeFormatPart[]): Record<string, string> {
  const map: Record<string, string> = {};
  for (const part of parts) map[part.type] = part.value;
  return map;
}

/** "6:42:18 PM" (ET). `seconds: false` -> "6:42 PM". */
export function formatNetworkClock(iso: string, { seconds = true }: { seconds?: boolean } = {}): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: NETWORK_TIME_ZONE,
    hour: "numeric",
    minute: "2-digit",
    ...(seconds ? { second: "2-digit" } : {}),
    hour12: true,
  }).format(new Date(iso));
}

/** "WED AUG 28" (ET). */
export function formatNetworkDate(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: NETWORK_TIME_ZONE,
    weekday: "short",
    month: "short",
    day: "numeric",
  })
    .format(new Date(iso))
    .toUpperCase();
}

export type EventTimeParts = { time: string; zone: string };

/**
 * "1:00P" + "EDT" for a scheduled stop, in the stop's own timezone.
 * Returns null when `timeZone` is absent or not a recognised IANA id — the
 * caller then excludes the listing (we never guess a zone).
 */
export function formatEventTimeParts(
  iso: string,
  timeZone: string | null | undefined
): EventTimeParts | null {
  if (!timeZone) return null;
  try {
    const parts = partMap(
      new Intl.DateTimeFormat("en-US", {
        timeZone,
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
        timeZoneName: "short",
      }).formatToParts(new Date(iso))
    );
    const hour = parts.hour;
    const minute = parts.minute ?? "00";
    const meridiem = (parts.dayPeriod ?? "").toUpperCase().slice(0, 1);
    const zone = parts.timeZoneName ?? "";
    if (!hour || !zone) return null;
    return { time: `${hour}:${minute}${meridiem}`, zone };
  } catch {
    return null;
  }
}

/** YYYY-MM-DD as it falls in `timeZone` — used only for TODAY/TOMORROW comparisons. */
function localDateKey(iso: string, timeZone: string): string {
  const parts = partMap(
    new Intl.DateTimeFormat("en-CA", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).formatToParts(new Date(iso))
  );
  return `${parts.year}-${parts.month}-${parts.day}`;
}

/** "TODAY" | "TOMORROW" | "SAT AUG 30", evaluated in the event's own zone. */
export function formatEventDayLabel(iso: string, timeZone: string, nowIso: string): string {
  try {
    const eventKey = localDateKey(iso, timeZone);
    if (eventKey === localDateKey(nowIso, timeZone)) return "TODAY";
    const tomorrowIso = new Date(new Date(nowIso).getTime() + 86_400_000).toISOString();
    if (eventKey === localDateKey(tomorrowIso, timeZone)) return "TOMORROW";
    return new Intl.DateTimeFormat("en-US", {
      timeZone,
      weekday: "short",
      month: "short",
      day: "numeric",
    })
      .format(new Date(iso))
      .toUpperCase();
  } catch {
    return "";
  }
}

/** "1h 05m" / "12m" / "just now" — a duration, so timezone is irrelevant. */
export function formatLiveDuration(startedIso: string, nowIso: string): string {
  const ms = new Date(nowIso).getTime() - new Date(startedIso).getTime();
  if (!Number.isFinite(ms) || ms < 60_000) return "just now";
  const minutes = Math.floor(ms / 60_000);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const rem = minutes % 60;
  return rem === 0 ? `${hours}h` : `${hours}h ${String(rem).padStart(2, "0")}m`;
}
