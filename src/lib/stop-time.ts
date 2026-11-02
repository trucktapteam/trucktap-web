/**
 * Display text for a scheduled stop, always in the stop's OWN saved timezone
 * (`upcoming_stops.timezone`), with that zone named in the text. Same rule
 * as the homepage guide's broadcast-time.ts: a timezone is never guessed.
 *
 * Every value here is a pure function of the stop and an explicit `now`. The
 * runtime's own zone is never consulted, so a server in UTC, a visitor in
 * California and a visitor in Kentucky all get identical text for the same
 * stop. Built from `formatToParts` rather than a whole formatted string so
 * the spacing can't vary between JavaScript engines (some put a special
 * narrow space before "PM").
 */

export type StopTimeLabels = {
  /** "Thu, Nov 5, 4:00 PM EST – 7:00 PM EST" */
  whenLabel: string;
  /** "Nov": the date chip's month, in the stop's zone. */
  monthLabel: string;
  /** "5": the date chip's day, in the stop's zone. */
  dayLabel: string;
};

type StopTimes = {
  starts_at: string;
  ends_at?: string | null;
  timezone: string | null | undefined;
};

export function isValidTimeZone(timeZone: string | null | undefined): timeZone is string {
  if (!timeZone) return false;
  try {
    new Intl.DateTimeFormat("en-US", { timeZone });
    return true;
  } catch {
    return false;
  }
}

function partsIn(date: Date, timeZone: string, options: Intl.DateTimeFormatOptions): Record<string, string> {
  const parts: Record<string, string> = {};
  for (const part of new Intl.DateTimeFormat("en-US", { ...options, timeZone }).formatToParts(date)) {
    parts[part.type] = part.value;
  }
  return parts;
}

/** "4:00 PM EST" */
function clockText(date: Date, timeZone: string): string {
  const { hour, minute, dayPeriod, timeZoneName } = partsIn(date, timeZone, {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZoneName: "short",
  });
  return `${hour}:${minute} ${dayPeriod} ${timeZoneName}`;
}

/** "Thu, Nov 5", or "Tue, Aug 28, 2029" when it isn't this year where the stop is. */
function dateText(date: Date, timeZone: string, now: Date): string {
  const { weekday, month, day, year } = partsIn(date, timeZone, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const currentYear = partsIn(now, timeZone, { year: "numeric" }).year;
  const base = `${weekday}, ${month} ${day}`;
  return year === currentYear ? base : `${base}, ${year}`;
}

/**
 * The end time shows only when it's real and after the start. An end on a
 * later local date repeats the date, so a late stop can't read as ending
 * before it began.
 *
 * Returns `null` when the zone is missing or unrecognised, or the start isn't
 * a real date: the caller leaves the stop out rather than showing a time it
 * can't stand behind.
 */
export function formatStopTime(stop: StopTimes, now: Date = new Date()): StopTimeLabels | null {
  const { timezone } = stop;
  if (!isValidTimeZone(timezone)) return null;

  const start = new Date(stop.starts_at);
  if (Number.isNaN(start.getTime())) return null;

  const startDate = dateText(start, timezone, now);
  const startClock = clockText(start, timezone);
  const { month, day } = partsIn(start, timezone, { month: "short", day: "numeric" });

  const end = stop.ends_at ? new Date(stop.ends_at) : null;
  let whenLabel = `${startDate}, ${startClock}`;
  if (end && end.getTime() > start.getTime()) {
    const endDate = dateText(end, timezone, now);
    const endClock = clockText(end, timezone);
    whenLabel += endDate === startDate ? ` – ${endClock}` : ` – ${endDate}, ${endClock}`;
  }

  return { whenLabel, monthLabel: month, dayLabel: day };
}
