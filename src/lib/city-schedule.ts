import { getUpcomingStops } from "./format";
import { formatStopClockRange, formatStopDay } from "./stop-time";
import { createSupabaseServerClient } from "./supabase/server";
import type { UpcomingStop } from "./types";

export const SCHEDULE_WINDOW_DAYS = 14;

type CityArea = { latitude: number; longitude: number; radiusMiles: number };

/**
 * Where each city page looks for stops. The database has no city boundaries
 * or city centers, so a stop counts as "in or near" a city when its saved
 * coordinates are within this radius of the city's published center point
 * (Wikipedia coordinates). Louisville's radius is wider because the
 * consolidated city covers about 325 square miles.
 *
 * A city that isn't listed shows no schedule section until it's added here:
 * its page is otherwise unchanged, and a location is never inferred from
 * address text.
 */
export const CITY_AREAS: Record<string, CityArea> = {
  "campbellsville-ky": { latitude: 37.34583, longitude: -85.34556, radiusMiles: 5 },
  "elizabethtown-ky": { latitude: 37.7, longitude: -85.867, radiusMiles: 5 },
  "louisville-ky": { latitude: 38.25611, longitude: -85.75139, radiusMiles: 12 },
  "radcliff-ky": { latitude: 37.829918, longitude: -85.945541, radiusMiles: 5 },
  "shepherdsville-ky": { latitude: 37.981425, longitude: -85.702007, radiusMiles: 5 },
};

/** Straight-line (haversine) distance in miles. */
export function distanceMiles(latA: number, lngA: number, latB: number, lngB: number): number {
  const toRadians = (degrees: number) => (degrees * Math.PI) / 180;
  const dLat = toRadians(latB - latA);
  const dLng = toRadians(lngB - lngA);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(toRadians(latA)) * Math.cos(toRadians(latB)) * Math.sin(dLng / 2) ** 2;
  return 3958.8 * 2 * Math.asin(Math.sqrt(h));
}

type StopRow = {
  id: string;
  truck_id: string;
  starts_at: string;
  ends_at: string;
  timezone: string | null;
  location_text: string;
  note: string | null;
  status: UpcomingStop["status"];
  latitude: number | null;
  longitude: number | null;
};

type TruckRow = { id: string; slug: string; name: string };

export type CityScheduleStop = {
  id: string;
  truckName: string;
  truckSlug: string;
  timeLabel: string;
  locationText: string;
  note: string | null;
  status: UpcomingStop["status"];
};

export type CityScheduleDay = { key: string; label: string; stops: CityScheduleStop[] };

/**
 * Pure grouping step: keeps stops inside the city's area and the schedule
 * window, sorts them by start time, then truck name, then stop id so the order
 * never varies between loads, and groups them by the calendar date where
 * each stop happens. A stop with missing coordinates, an unusable
 * timezone, or a truck that isn't public is left out, never guessed at.
 */
export function buildCitySchedule(
  citySlug: string,
  stops: StopRow[],
  trucks: TruckRow[],
  now: Date = new Date()
): CityScheduleDay[] {
  const area = CITY_AREAS[citySlug];
  if (!area) return [];

  const truckById = new Map(trucks.map((truck) => [truck.id, truck]));
  const horizon = now.getTime() + SCHEDULE_WINDOW_DAYS * 86_400_000;

  const nearby = stops.filter(
    (stop) =>
      stop.latitude !== null &&
      stop.longitude !== null &&
      new Date(stop.starts_at).getTime() < horizon &&
      truckById.has(stop.truck_id) &&
      distanceMiles(area.latitude, area.longitude, stop.latitude, stop.longitude) <= area.radiusMiles
  );
  const rowById = new Map(nearby.map((stop) => [stop.id, stop]));

  const asStops: UpcomingStop[] = nearby.map((row) => ({ ...row, note: row.note ?? undefined }));
  const truckNameOf = (stopId: string) => truckById.get(rowById.get(stopId)?.truck_id ?? "")?.name ?? "";
  const upcoming = getUpcomingStops({ upcomingStops: asStops }, now).sort(
    (a, b) =>
      new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime() ||
      truckNameOf(a.id).localeCompare(truckNameOf(b.id), "en") ||
      a.id.localeCompare(b.id, "en")
  );

  const days = new Map<string, CityScheduleDay>();
  for (const stop of upcoming) {
    const row = rowById.get(stop.id);
    const truck = row && truckById.get(row.truck_id);
    const day = formatStopDay(stop, now);
    const timeLabel = formatStopClockRange(stop, now);
    if (!row || !truck || !day || !timeLabel) continue;

    const entry = days.get(day.key) ?? { ...day, stops: [] };
    entry.stops.push({
      id: stop.id,
      truckName: truck.name,
      truckSlug: truck.slug,
      timeLabel,
      locationText: stop.location_text,
      note: row.note,
      status: stop.status,
    });
    days.set(day.key, entry);
  }

  return [...days.values()].sort((a, b) => a.key.localeCompare(b.key));
}

/**
 * Column discipline matches truck-data.ts: `upcoming_stops` carries internal
 * automation fields RLS doesn't hide, so only these columns are read, and
 * truck details come only from `public_trucks`, so archived and test trucks
 * can't appear. Runs only on the server; coordinates never reach the page.
 */
export async function getCitySchedule(citySlug: string, now: Date = new Date()): Promise<CityScheduleDay[]> {
  if (!CITY_AREAS[citySlug]) return [];

  const supabase = createSupabaseServerClient();
  const { data: stopRows, error: stopsError } = await supabase
    .from("upcoming_stops")
    .select("id, truck_id, starts_at, ends_at, timezone, location_text, note, status, latitude, longitude")
    .gt("ends_at", now.toISOString())
    .lt("starts_at", new Date(now.getTime() + SCHEDULE_WINDOW_DAYS * 86_400_000).toISOString())
    .not("latitude", "is", null)
    .not("longitude", "is", null)
    .returns<StopRow[]>();

  if (stopsError) throw new Error(`Failed to load stops for ${citySlug}: ${stopsError.message}`);

  const stops = stopRows ?? [];
  const truckIds = [...new Set(stops.map((stop) => stop.truck_id))];
  if (truckIds.length === 0) return [];

  const { data: truckRows, error: trucksError } = await supabase
    .from("public_trucks")
    .select("id, slug, name")
    .in("id", truckIds)
    .returns<TruckRow[]>();

  if (trucksError) throw new Error(`Failed to load trucks for ${citySlug}: ${trucksError.message}`);

  return buildCitySchedule(citySlug, stops, truckRows ?? [], now);
}
