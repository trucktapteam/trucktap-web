import type { Announcement, Truck } from "./types";

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

/** "just now" / "8 minutes ago" / "3 hours ago" / "on Jul 30" */
export function formatRelativeTime(iso: string, now: Date = new Date()): string {
  const then = new Date(iso);
  const diffMs = now.getTime() - then.getTime();
  const diffMinutes = Math.floor(diffMs / 60_000);

  if (diffMinutes < 1) return "just now";
  if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes === 1 ? "" : "s"} ago`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return "yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;

  return `on ${then.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
}

/**
 * `timeZone` is optional and deliberately not defaulted to the runtime's
 * own zone: this is called from a Client Component (UpcomingStopsSection),
 * which Next.js renders once on the server and once again in the browser
 * during hydration. Server and browser can be in different zones (Vercel's
 * functions run in UTC; a visitor's browser doesn't), so letting each call
 * resolve `Intl`'s ambient zone independently produces two different
 * strings for the same instant — a guaranteed hydration text mismatch.
 * Callers pass an explicit zone (or omit it for a deliberate second pass —
 * see UpcomingStopsSection's `mounted` flag) so the two renders can agree.
 */
export function formatDateTime(iso: string, timeZone?: string): string {
  return new Date(iso).toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    ...(timeZone ? { timeZone } : {}),
  });
}

export type LiveStatus =
  | { kind: "live"; freshnessLabel: string }
  | { kind: "not-live"; lastSeenLabel: string | null };

/**
 * The truth test from Discovery: is_open alone can lag reality by up to
 * ~12 hours before the backend's auto-expiry cron catches up. Treat
 * `is_open && live_expires_at > now` as the real signal, and always pair
 * it with honest freshness wording rather than a bare badge.
 */
export function getLiveStatus(
  truck: Pick<Truck, "is_open" | "live_expires_at" | "live_started_at" | "last_live_updated_at">,
  now: Date = new Date()
): LiveStatus {
  const expiresAt = truck.live_expires_at ? new Date(truck.live_expires_at) : null;
  const isActuallyLive = truck.is_open && (!expiresAt || expiresAt.getTime() > now.getTime());

  if (isActuallyLive && truck.live_started_at) {
    return {
      kind: "live",
      freshnessLabel: `Went live ${formatRelativeTime(truck.live_started_at, now)}`,
    };
  }

  if (truck.last_live_updated_at) {
    return {
      kind: "not-live",
      lastSeenLabel: `Last live ${formatRelativeTime(truck.last_live_updated_at, now)}`,
    };
  }

  return { kind: "not-live", lastSeenLabel: null };
}

export function getTodayHours(truck: Pick<Truck, "operating_hours">, now: Date = new Date()) {
  if (!truck.operating_hours) return null;
  const weekday = now.toLocaleDateString("en-US", { weekday: "long" }) as keyof typeof truck.operating_hours;
  return truck.operating_hours[weekday] ?? null;
}

// Mirrors the Expo app's own ANNOUNCEMENT_EXPIRATION_MS
// (contexts/AppContext.tsx) exactly — this is the same 7-day window
// owners are told about when they post ("Announcements stay visible for
// 7 days"), not a separate web-only number.
const ANNOUNCEMENT_EXPIRATION_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Reproduces the Expo app's getAnnouncementExpiresAt exactly (same file),
 * so the site and the app agree on what's currently visible instead of
 * running a separate policy:
 *  1. A present, parseable `expires_at` wins outright — this is what
 *     addAnnouncement actually writes (`timestamp + 7 days`) for every
 *     announcement created since that field existed.
 *  2. Missing `expires_at` (announcements created before that field was
 *     added — confirmed in production data, e.g. Güero's Salsa's stale
 *     grand-opening post) falls back to 7 days after `timestamp`, exactly
 *     like the app does. It is NOT treated as "never expires."
 *  3. If `timestamp` doesn't parse either, this returns a timestamp of 0
 *     (the Unix epoch) — always in the past, so malformed data can never
 *     keep stale promotional copy visible forever.
 */
function getAnnouncementExpiresAt(announcement: Pick<Announcement, "timestamp" | "expires_at">): number {
  const explicitExpiration = announcement.expires_at ? Date.parse(announcement.expires_at) : NaN;
  if (Number.isFinite(explicitExpiration)) {
    return explicitExpiration;
  }

  const createdAt = Date.parse(announcement.timestamp);
  if (!Number.isFinite(createdAt)) {
    return 0;
  }

  return createdAt + ANNOUNCEMENT_EXPIRATION_MS;
}

export function isAnnouncementActive(
  announcement: Pick<Announcement, "timestamp" | "expires_at">,
  now: Date = new Date()
): boolean {
  return getAnnouncementExpiresAt(announcement) > now.getTime();
}

/**
 * The full "is this announcement something the public profile should show
 * right now" gate: `mapAnnouncements` (truck-data.ts) already drops
 * empty-message rows during mapping, but that's a step this function
 * doesn't control and shouldn't have to trust blindly — checking again
 * here means "no announcement text → render nothing" holds regardless of
 * what upstream did, the same way `getUpcomingStops` doesn't trust its
 * caller to have already excluded cancelled stops.
 */
export function getActiveAnnouncements(truck: Pick<Truck, "announcements">, now: Date = new Date()) {
  return truck.announcements.filter((a) => a.message.trim() !== "" && isAnnouncementActive(a, now));
}

/** Cancelled/completed stops, and anything that has already ended, never show. */
export function getUpcomingStops(truck: Pick<Truck, "upcomingStops">, now: Date = new Date()) {
  return truck.upcomingStops.filter((s) => {
    if (s.status === "cancelled" || s.status === "completed") return false;
    return new Date(s.ends_at).getTime() > now.getTime();
  });
}

/** `null` when there are no reviews yet — shared by the hero identity summary and ReviewsSection. */
export function getRatingSummary(truck: Pick<Truck, "reviews">): { average: number; count: number } | null {
  if (truck.reviews.length === 0) return null;
  const average = truck.reviews.reduce((sum, r) => sum + r.rating, 0) / truck.reviews.length;
  return { average, count: truck.reviews.length };
}
