import { createSupabaseServerClient } from "./supabase/server";
import { formatBasedNearLocation } from "./location";
import { formatDateTime, getLiveStatus, getUpcomingStops } from "./format";
import type { UpcomingStop } from "./types";

/**
 * Column discipline matches truck-data.ts: query only `public_trucks`
 * (never the base `trucks` table), name every column explicitly, and keep
 * this list to exactly what the `/trucks` directory card renders — a
 * narrower list than the profile page's `PUBLIC_TRUCK_COLUMNS` since a
 * list card shows far less than a full profile (same reasoning
 * rolling-trucks.ts already applies for the homepage marquee).
 */
const DIRECTORY_COLUMNS =
  "id, slug, name, cuisine_type, hero_image, logo, is_verified, is_open, " +
  "service_area, last_live_updated_at, live_started_at, live_expires_at";

type DirectoryTruckRow = {
  id: string;
  slug: string;
  name: string;
  cuisine_type: string | null;
  hero_image: string | null;
  logo: string | null;
  is_verified: boolean;
  is_open: boolean;
  service_area: string | null;
  last_live_updated_at: string | null;
  live_started_at: string | null;
  live_expires_at: string | null;
};

type UpcomingStopRow = {
  id: string;
  truck_id: string;
  starts_at: string;
  ends_at: string;
  location_text: string;
  note: string | null;
  status: UpcomingStop["status"];
  event_image_url: string | null;
};

export type DirectoryTier = "live" | "upcoming" | "ordinary";

/**
 * A single directory card's data, precomputed entirely server-side —
 * including every date-derived display string (`freshnessLabel`, the
 * upcoming stop's `whenLabel`) — so the Client Component that renders
 * search results never touches `Date` itself and can't produce a
 * server/client hydration mismatch the way the profile page's live
 * "went live Xm ago" text has to guard against with a mount flag.
 */
export type DirectoryTruckCard = {
  id: string;
  slug: string;
  name: string;
  cuisine_type: string | null;
  hero_image: string | null;
  logo: string | null;
  is_verified: boolean;
  tier: DirectoryTier;
  /** Sort key only — not for display. Null sorts last within the "ordinary" tier. */
  lastLiveUpdatedAt: string | null;
  /** "Went live 12 minutes ago" (live tier) or "Last live 3 days ago" (ordinary tier, or null if never live). */
  freshnessLabel: string | null;
  /** Sanitized "City, ST" — never the raw, often street-level `service_area`. */
  basedNear: string | null;
  /** Only set for the "upcoming" tier. */
  nextStop: { startsAt: string; whenLabel: string; locationText: string } | null;
};

/**
 * Narrows a directory query to one state or one city — the only two shapes
 * `/state/[stateSlug]` and `/city/[citySlug]` need. Filters on
 * `home_state_slug`/`home_city_slug` only (the columns the geography
 * backfill populated from `service_area`); nothing about "live" or
 * "upcoming" ever factors into which trucks a geography page lists, only
 * where they're based.
 */
export type DirectoryFilter = { stateSlug: string } | { citySlug: string };

/**
 * Fetches every public-eligible truck (optionally narrowed to one state or
 * city via `filter`) plus each one's soonest real upcoming stop, and
 * assembles ready-to-render directory cards. Reuses the same safe helpers
 * the truck-profile page already relies on (`getLiveStatus`,
 * `getUpcomingStops`, `formatBasedNearLocation`) rather than reimplementing
 * any of that logic — the directory's notion of "live" and "has a real
 * upcoming stop" is exactly the profile page's, and identical whether this
 * is `/trucks`, a state page, or a city page.
 *
 * Deliberately never queries `locations` (exact live coordinates): that
 * table is only ever exposed on a truck's own profile page, server-
 * rendered, while the truck is actually LIVE. Batch-fetching it for every
 * row on a public listing page would be a materially larger exposure
 * surface for a field this codebase has been careful to treat as
 * sensitive — so "current public location" here is the same sanitized
 * `service_area` text shown everywhere else, live or not.
 */
export async function getDirectoryTrucks(now: Date = new Date(), filter?: DirectoryFilter): Promise<DirectoryTruckCard[]> {
  const supabase = createSupabaseServerClient();

  let truckQuery = supabase.from("public_trucks").select(DIRECTORY_COLUMNS);
  if (filter && "stateSlug" in filter) truckQuery = truckQuery.eq("home_state_slug", filter.stateSlug);
  if (filter && "citySlug" in filter) truckQuery = truckQuery.eq("home_city_slug", filter.citySlug);

  const { data: truckRows, error: trucksError } = await truckQuery.returns<DirectoryTruckRow[]>();

  if (trucksError) throw new Error(`Failed to load trucks for directory: ${trucksError.message}`);

  const rows = truckRows ?? [];
  const ids = rows.map((row) => row.id);

  const { data: stopRows, error: stopsError } =
    ids.length > 0
      ? await supabase
          .from("upcoming_stops")
          .select("id, truck_id, starts_at, ends_at, location_text, note, status, event_image_url")
          .in("truck_id", ids)
          .order("starts_at", { ascending: true })
          .returns<UpcomingStopRow[]>()
      : { data: [] as UpcomingStopRow[], error: null };

  if (stopsError) throw new Error(`Failed to load upcoming stops for directory: ${stopsError.message}`);

  const stopsByTruckId = new Map<string, UpcomingStop[]>();
  for (const stop of stopRows ?? []) {
    const mapped: UpcomingStop = {
      id: stop.id,
      starts_at: stop.starts_at,
      ends_at: stop.ends_at,
      location_text: stop.location_text,
      note: stop.note ?? undefined,
      status: stop.status,
      flyer_image: stop.event_image_url ?? undefined,
    };
    const existing = stopsByTruckId.get(stop.truck_id);
    if (existing) existing.push(mapped);
    else stopsByTruckId.set(stop.truck_id, [mapped]);
  }

  return rows.map((row) => {
    const liveStatus = getLiveStatus(row, now);
    const eligibleStops = getUpcomingStops({ upcomingStops: stopsByTruckId.get(row.id) ?? [] }, now);
    const nextStopRow = eligibleStops[0] ?? null;

    const tier: DirectoryTier = liveStatus.kind === "live" ? "live" : nextStopRow ? "upcoming" : "ordinary";

    return {
      id: row.id,
      slug: row.slug,
      name: row.name,
      cuisine_type: row.cuisine_type,
      hero_image: row.hero_image,
      logo: row.logo,
      is_verified: row.is_verified,
      tier,
      lastLiveUpdatedAt: row.last_live_updated_at,
      freshnessLabel: liveStatus.kind === "live" ? liveStatus.freshnessLabel : liveStatus.lastSeenLabel,
      basedNear: formatBasedNearLocation(row.service_area),
      nextStop: nextStopRow
        ? {
            startsAt: nextStopRow.starts_at,
            whenLabel: formatDateTime(nextStopRow.starts_at),
            locationText: nextStopRow.location_text,
          }
        : null,
    };
  });
}

const TIER_ORDER: Record<DirectoryTier, number> = { live: 0, upcoming: 1, ordinary: 2 };

/** Descending by timestamp, nulls sorted last. Handled as explicit cases,
 * not `-Infinity` sentinels — `-Infinity - -Infinity` is `NaN`, and a
 * `NaN` comparator return value is not "equal": Array.prototype.sort
 * treats it as "don't swap", which silently breaks the alphabetical
 * tiebreak for any two trucks that have both never gone live. */
function timeDesc(a: string | null, b: string | null): number {
  if (a === null && b === null) return 0;
  if (a === null) return 1;
  if (b === null) return -1;
  return new Date(b).getTime() - new Date(a).getTime();
}

/**
 * The "don't make stale trucks look equivalent to active ones" ordering:
 * live trucks first (freshest confirmation first), then trucks with a
 * real upcoming stop (soonest first), then everything else (most
 * recently ever-live first, nulls — trucks that have never gone live —
 * sorted last, alphabetically among themselves). A pure function over
 * already-fetched cards so it's directly testable without touching
 * Supabase.
 */
export function rankDirectoryTrucks(trucks: DirectoryTruckCard[]): DirectoryTruckCard[] {
  return [...trucks].sort((a, b) => {
    const tierDiff = TIER_ORDER[a.tier] - TIER_ORDER[b.tier];
    if (tierDiff !== 0) return tierDiff;

    if (a.tier === "upcoming" && b.tier === "upcoming") {
      return new Date(a.nextStop!.startsAt).getTime() - new Date(b.nextStop!.startsAt).getTime();
    }

    const freshness = timeDesc(a.lastLiveUpdatedAt, b.lastLiveUpdatedAt);
    if (freshness !== 0) return freshness;
    return a.name.localeCompare(b.name);
  });
}

/** Convenience entry point `/trucks`, `/state/[stateSlug]`, and `/city/[citySlug]` all call: fetch (optionally filtered), then rank — same ranking regardless of filter. */
export async function getRankedDirectoryTrucks(now: Date = new Date(), filter?: DirectoryFilter): Promise<DirectoryTruckCard[]> {
  return rankDirectoryTrucks(await getDirectoryTrucks(now, filter));
}
