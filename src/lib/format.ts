import type { Truck } from "./types";

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

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
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
export function getLiveStatus(truck: Truck, now: Date = new Date()): LiveStatus {
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

export function getTodayHours(truck: Truck, now: Date = new Date()) {
  if (!truck.operating_hours) return null;
  const weekday = now.toLocaleDateString("en-US", { weekday: "long" }) as keyof typeof truck.operating_hours;
  return truck.operating_hours[weekday] ?? null;
}

export function getActiveAnnouncements(truck: Truck, now: Date = new Date()) {
  return truck.announcements.filter(
    (a) => !a.expires_at || new Date(a.expires_at).getTime() > now.getTime()
  );
}

/** Cancelled/completed stops, and anything that has already ended, never show. */
export function getUpcomingStops(truck: Truck, now: Date = new Date()) {
  return truck.upcomingStops.filter((s) => {
    if (s.status === "cancelled" || s.status === "completed") return false;
    return new Date(s.ends_at).getTime() > now.getTime();
  });
}

/** `null` when there are no reviews yet — shared by the hero identity summary and ReviewsSection. */
export function getRatingSummary(truck: Truck): { average: number; count: number } | null {
  if (truck.reviews.length === 0) return null;
  const average = truck.reviews.reduce((sum, r) => sum + r.rating, 0) / truck.reviews.length;
  return { average, count: truck.reviews.length };
}
