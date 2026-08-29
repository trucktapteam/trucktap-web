import { createSupabaseServerClient } from "@/lib/supabase/server";
import { formatBasedNearLocation } from "@/lib/location";
import { isSupabaseStorageImageUrl } from "@/lib/allowed-image-hosts";
import { formatEventTimeParts, formatEventDayLabel, formatLiveDuration } from "./broadcast-time";

/**
 * Assembles THE TRUCKTAP GUIDE for the TTN-86 broadcast prototype from
 * real `public_trucks` / `upcoming_stops` data only. Curated broadcast
 * programming, not an exhaustive listing:
 *
 *  - LIVE rows: trucks that are genuinely live right now (same test as
 *    `getLiveStatus`). Location shown is ONLY the sanitized public
 *    "City, ST" (`formatBasedNearLocation`) — never lat/lng, never a
 *    current street address / location label.
 *  - SCHEDULED rows: real upcoming stops inside a short broadcast horizon
 *    that carry a valid IANA `timezone`. Times are rendered in the stop's
 *    OWN zone (EDT / CDT / MST …). Stops whose zone is missing or
 *    unrecognised are silently excluded — a zone is never guessed.
 *
 * Fails soft: any query error returns an empty guide (the broadcast still
 * renders, just as a station-ID card + empty listings).
 */

const SCHEDULE_HORIZON_DAYS = 21;
const MAX_SCHEDULED_ROWS = 24;
const LOCATION_MAX = 46;

export type GuideRowData =
  | {
      kind: "live";
      key: string;
      slug: string;
      name: string;
      cuisine: string | null;
      isVerified: boolean;
      basedNear: string | null;
      onAirLabel: string;
    }
  | {
      kind: "scheduled";
      key: string;
      slug: string;
      name: string;
      cuisine: string | null;
      isVerified: boolean;
      basedNear: string | null;
      timeLabel: string;
      zoneAbbr: string;
      dayLabel: string;
      locationText: string;
    };

export type ProgrammingSlate =
  | {
      kind: "live";
      slug: string;
      name: string;
      basedNear: string | null;
      onAirLabel: string;
      image: string | null;
    }
  | {
      kind: "next";
      slug: string;
      name: string;
      dayLabel: string;
      timeLabel: string;
      zoneAbbr: string;
      locationText: string;
      image: string | null;
    }
  | { kind: "stationId" };

export type TtnGuide = {
  generatedAtIso: string;
  rows: GuideRowData[];
  liveNames: string[];
  slateA: ProgrammingSlate;
  slateB: ProgrammingSlate;
  hasLive: boolean;
};

const PUBLIC_TRUCK_COLUMNS =
  "id, slug, name, cuisine_type, is_verified, logo, hero_image, service_area, " +
  "is_open, live_started_at, live_expires_at";

type PublicTruckRow = {
  id: string;
  slug: string;
  name: string;
  cuisine_type: string | null;
  is_verified: boolean;
  logo: string | null;
  hero_image: string | null;
  service_area: string | null;
  is_open: boolean;
  live_started_at: string | null;
  live_expires_at: string | null;
};

type StopRow = {
  id: string;
  truck_id: string;
  starts_at: string;
  ends_at: string;
  location_text: string | null;
  status: string;
  timezone: string | null;
  event_image_url: string | null;
};

function truncate(text: string, max: number): string {
  const clean = text.trim().replace(/\s+/g, " ");
  return clean.length <= max ? clean : `${clean.slice(0, max - 1).trimEnd()}…`;
}

/** The owner form's placeholder cuisine values read as noise in a listing. */
function displayCuisine(value: string | null): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed || /^(unspecified|other|n\/?a)$/i.test(trimmed)) return null;
  return trimmed;
}

function pickImage(truck: PublicTruckRow): string | null {
  if (truck.hero_image && isSupabaseStorageImageUrl(truck.hero_image)) return truck.hero_image;
  if (truck.logo && isSupabaseStorageImageUrl(truck.logo)) return truck.logo;
  return null;
}

function isActuallyLive(truck: PublicTruckRow, now: Date): boolean {
  if (!truck.is_open || !truck.live_started_at) return false;
  if (!truck.live_expires_at) return true;
  return new Date(truck.live_expires_at).getTime() > now.getTime();
}

function emptyGuide(nowIso: string): TtnGuide {
  return {
    generatedAtIso: nowIso,
    rows: [],
    liveNames: [],
    slateA: { kind: "stationId" },
    slateB: { kind: "stationId" },
    hasLive: false,
  };
}

export async function getTtnGuide(now: Date = new Date()): Promise<TtnGuide> {
  const nowIso = now.toISOString();

  try {
    const supabase = createSupabaseServerClient();
    const horizonIso = new Date(now.getTime() + SCHEDULE_HORIZON_DAYS * 86_400_000).toISOString();

    const [liveResult, stopsResult] = await Promise.all([
      supabase
        .from("public_trucks")
        .select(PUBLIC_TRUCK_COLUMNS)
        .eq("is_open", true)
        .not("live_started_at", "is", null)
        .returns<PublicTruckRow[]>(),
      supabase
        .from("upcoming_stops")
        .select("id, truck_id, starts_at, ends_at, location_text, status, timezone, event_image_url")
        .gt("ends_at", nowIso)
        .lt("starts_at", horizonIso)
        .not("timezone", "is", null)
        .neq("timezone", "")
        .order("starts_at", { ascending: true })
        .returns<StopRow[]>(),
    ]);

    if (liveResult.error) throw new Error(`live query: ${liveResult.error.message}`);
    if (stopsResult.error) throw new Error(`stops query: ${stopsResult.error.message}`);

    // ---- LIVE ----
    const live = (liveResult.data ?? [])
      .filter((t) => isActuallyLive(t, now))
      .sort(
        (a, b) => new Date(b.live_started_at!).getTime() - new Date(a.live_started_at!).getTime()
      );
    const liveSlugs = new Set(live.map((t) => t.slug));

    const liveRows: GuideRowData[] = live.map((t) => ({
      kind: "live",
      key: `live-${t.id}`,
      slug: t.slug,
      name: t.name,
      cuisine: displayCuisine(t.cuisine_type),
      isVerified: t.is_verified,
      basedNear: formatBasedNearLocation(t.service_area),
      onAirLabel: formatLiveDuration(t.live_started_at!, nowIso),
    }));

    // ---- SCHEDULED ----
    const stops = stopsResult.data ?? [];
    const stopTruckIds = [...new Set(stops.map((s) => s.truck_id))];

    let truckById = new Map<string, PublicTruckRow>();
    if (stopTruckIds.length > 0) {
      const { data, error } = await supabase
        .from("public_trucks")
        .select(PUBLIC_TRUCK_COLUMNS)
        .in("id", stopTruckIds)
        .returns<PublicTruckRow[]>();
      if (error) throw new Error(`stop-trucks query: ${error.message}`);
      truckById = new Map((data ?? []).map((t) => [t.id, t]));
    }

    const scheduledRows: GuideRowData[] = [];
    let firstNextSlate: Extract<ProgrammingSlate, { kind: "next" }> | null = null;

    for (const stop of stops) {
      if (scheduledRows.length >= MAX_SCHEDULED_ROWS) break;

      const truck = truckById.get(stop.truck_id);
      if (!truck) continue; // archived / test / non-public
      if (liveSlugs.has(truck.slug)) continue; // already an ON AIR row
      if (stop.status === "cancelled" || stop.status === "completed") continue;

      const timeParts = formatEventTimeParts(stop.starts_at, stop.timezone);
      if (!timeParts) continue; // no reliable zone — silently exclude, never guess

      const dayLabel = formatEventDayLabel(stop.starts_at, stop.timezone!, nowIso);
      if (!dayLabel) continue;

      const locationText = truncate(stop.location_text ?? "", LOCATION_MAX);
      if (!locationText) continue;

      scheduledRows.push({
        kind: "scheduled",
        key: `stop-${stop.id}`,
        slug: truck.slug,
        name: truck.name,
        cuisine: displayCuisine(truck.cuisine_type),
        isVerified: truck.is_verified,
        basedNear: formatBasedNearLocation(truck.service_area),
        timeLabel: timeParts.time,
        zoneAbbr: timeParts.zone,
        dayLabel,
        locationText,
      });

      if (!firstNextSlate) {
        firstNextSlate = {
          kind: "next",
          slug: truck.slug,
          name: truck.name,
          dayLabel,
          timeLabel: timeParts.time,
          zoneAbbr: timeParts.zone,
          locationText,
          image: pickImage(truck),
        };
      }
    }

    // ---- SLATES (programming panel) ----
    const liveSlate: Extract<ProgrammingSlate, { kind: "live" }> | null =
      live.length > 0
        ? {
            kind: "live",
            slug: live[0].slug,
            name: live[0].name,
            basedNear: formatBasedNearLocation(live[0].service_area),
            onAirLabel: formatLiveDuration(live[0].live_started_at!, nowIso),
            image: pickImage(live[0]),
          }
        : null;

    const slateA: ProgrammingSlate = liveSlate ?? firstNextSlate ?? { kind: "stationId" };
    const slateB: ProgrammingSlate =
      liveSlate && firstNextSlate ? firstNextSlate : { kind: "stationId" };

    return {
      generatedAtIso: nowIso,
      rows: [...liveRows, ...scheduledRows],
      liveNames: live.map((t) => t.name),
      slateA,
      slateB,
      hasLive: live.length > 0,
    };
  } catch (error) {
    console.error("getTtnGuide failed, returning empty guide:", error);
    return emptyGuide(nowIso);
  }
}
