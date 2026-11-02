import { createSupabaseServerClient } from "./supabase/server";
import { titleCaseSlug } from "./location";
import { SITE_URL } from "./site";

/**
 * A state/city page only exists — and is only worth indexing — once enough
 * real trucks are actually based there. Below this, `/trucks` (unfiltered)
 * is still the right place to find a truck in that area; a page with one
 * or two listings reads as thin, near-duplicate content next to the
 * truck's own profile.
 */
export const STATE_MIN_TRUCKS = 3;
export const CITY_MIN_TRUCKS = 2;

export type CityGeographySummary = {
  citySlug: string;
  cityName: string;
  stateSlug: string;
  stateName: string;
  stateAbbreviation: string;
  count: number;
};

export type StateGeographySummary = {
  stateSlug: string;
  stateName: string;
  count: number;
  cities: CityGeographySummary[];
};

export type GeographyRow = {
  home_state: string;
  home_state_slug: string;
  home_city: string;
  home_city_slug: string;
};

/**
 * Every classified truck's resolved home geography, straight from
 * `public_trucks.home_state_slug`/`home_city_slug` — the columns the
 * backfill script populated from `service_area`. Never touches
 * `service_area` itself, `locations`, or `upcoming_stops`: geography pages
 * are strictly a "where is this truck based" question, not "where is it
 * right now" or "where will it be."
 */
async function getClassifiedGeographyRows(): Promise<GeographyRow[]> {
  const supabase = createSupabaseServerClient();

  const { data, error } = await supabase
    .from("public_trucks")
    .select("home_state, home_state_slug, home_city, home_city_slug")
    .not("home_state_slug", "is", null)
    .returns<GeographyRow[]>();

  if (error) throw new Error(`Failed to load geography summary: ${error.message}`);
  return data ?? [];
}

/**
 * Aggregates every classified truck into a per-state, per-city summary
 * with real counts — the single source of truth `/state/[stateSlug]` and
 * `/city/[citySlug]` resolve against (via `findQualifyingState`/
 * `findQualifyingCity`), the sitemap enumerates from, and state pages
 * cross-link their qualifying cities from.
 */
export async function getGeographySummaries(): Promise<StateGeographySummary[]> {
  const rows = await getClassifiedGeographyRows();
  return buildGeographySummaries(rows);
}

/** Pure aggregation step, split out from the fetch above so it's directly testable without mocking Supabase. */
export function buildGeographySummaries(rows: GeographyRow[]): StateGeographySummary[] {
  const states = new Map<string, StateGeographySummary>();

  for (const row of rows) {
    let state = states.get(row.home_state_slug);
    if (!state) {
      state = { stateSlug: row.home_state_slug, stateName: titleCaseSlug(row.home_state_slug), count: 0, cities: [] };
      states.set(row.home_state_slug, state);
    }
    state.count++;

    let city = state.cities.find((c) => c.citySlug === row.home_city_slug);
    if (!city) {
      city = {
        citySlug: row.home_city_slug,
        cityName: row.home_city,
        stateSlug: row.home_state_slug,
        stateName: state.stateName,
        stateAbbreviation: row.home_state,
        count: 0,
      };
      state.cities.push(city);
    }
    city.count++;
  }

  return [...states.values()];
}

/** States with enough trucks to have their own page. */
export function qualifyingStates(summaries: StateGeographySummary[]): StateGeographySummary[] {
  return summaries.filter((s) => s.count >= STATE_MIN_TRUCKS);
}

/** Cities with enough trucks to have their own page, across every state in `summaries`. */
export function qualifyingCities(summaries: StateGeographySummary[]): CityGeographySummary[] {
  return summaries.flatMap((s) => s.cities.filter((c) => c.count >= CITY_MIN_TRUCKS));
}

/** The `/state/[stateSlug]` resolution: `null` means the caller should `notFound()` — missing entirely, or real but below `STATE_MIN_TRUCKS`. */
export function findQualifyingState(summaries: StateGeographySummary[], stateSlug: string): StateGeographySummary | null {
  const state = summaries.find((s) => s.stateSlug === stateSlug);
  return state && state.count >= STATE_MIN_TRUCKS ? state : null;
}

/** The `/city/[citySlug]` resolution: `null` means the caller should `notFound()` — missing entirely, or real but below `CITY_MIN_TRUCKS`. */
export function findQualifyingCity(summaries: StateGeographySummary[], citySlug: string): CityGeographySummary | null {
  const city = summaries.flatMap((s) => s.cities).find((c) => c.citySlug === citySlug);
  return city && city.count >= CITY_MIN_TRUCKS ? city : null;
}

export type GeographyPageMetadata = { title: string; description: string; canonicalUrl: string };

export function buildStateMetadata(state: StateGeographySummary): GeographyPageMetadata {
  const truckWord = state.count === 1 ? "truck" : "trucks";
  return {
    title: `Food Trucks in ${state.stateName}`,
    description: `Find food trucks in ${state.stateName} on TruckTap. See who's LIVE right now, check upcoming stops, and browse ${state.count} ${truckWord} based here.`,
    canonicalUrl: `${SITE_URL}/state/${state.stateSlug}`,
  };
}

/** `hasSchedule` keeps the wording honest: only a page that actually lists dated stops claims to. */
export function buildCityMetadata(city: CityGeographySummary, hasSchedule = false): GeographyPageMetadata {
  const truckWord = city.count === 1 ? "truck" : "trucks";
  const place = `${city.cityName}, ${city.stateName}`;
  return {
    title: hasSchedule ? `Food Trucks in ${place}: Upcoming Schedules` : `Food Trucks in ${place}`,
    description: hasSchedule
      ? `See upcoming food truck schedules in and near ${place}, plus who's LIVE right now. Browse ${city.count} ${truckWord} based here on TruckTap.`
      : `Find food trucks in ${place} on TruckTap. See who's LIVE right now and browse ${city.count} ${truckWord} based here.`,
    canonicalUrl: `${SITE_URL}/city/${city.citySlug}`,
  };
}

export type AreaLink = { href: string; label: string };
export type AreaLinks = { states: AreaLink[]; cities: AreaLink[] };

/** Links to the state and city pages that actually exist, largest first. Pure, so it's testable without Supabase. */
export function buildAreaLinks(summaries: StateGeographySummary[]): AreaLinks {
  const byCount = <T extends { count: number }>(a: T, b: T) => b.count - a.count;
  return {
    states: qualifyingStates(summaries)
      .sort(byCount)
      .map((state) => ({ href: `/state/${state.stateSlug}`, label: state.stateName })),
    cities: qualifyingCities(summaries)
      .sort(byCount)
      .map((city) => ({ href: `/city/${city.citySlug}`, label: `${city.cityName}, ${city.stateAbbreviation}` })),
  };
}

/** Never lets a navigation aid take a page down: if geography can't load, there are simply no links. */
export async function getAreaLinks(): Promise<AreaLinks> {
  try {
    return buildAreaLinks(await getGeographySummaries());
  } catch (error) {
    console.error("Failed to load area links:", error);
    return { states: [], cities: [] };
  }
}

/**
 * A truck's links to its own city and state pages. Uses the truck's resolved
 * home geography, never its free-text `service_area`, and links only to pages
 * that exist. A truck with no classified geography gets no links.
 */
export function buildTruckAreaLinks(
  summaries: StateGeographySummary[],
  truck: { home_city_slug: string | null; home_state_slug: string | null }
): AreaLink[] {
  const links: AreaLink[] = [];
  const city = truck.home_city_slug ? findQualifyingCity(summaries, truck.home_city_slug) : null;
  if (city) links.push({ href: `/city/${city.citySlug}`, label: `${city.cityName}, ${city.stateAbbreviation}` });
  const state = truck.home_state_slug ? findQualifyingState(summaries, truck.home_state_slug) : null;
  if (state) links.push({ href: `/state/${state.stateSlug}`, label: state.stateName });
  return links;
}

export async function getTruckAreaLinks(truck: {
  home_city_slug: string | null;
  home_state_slug: string | null;
}): Promise<AreaLink[]> {
  if (!truck.home_city_slug && !truck.home_state_slug) return [];
  try {
    return buildTruckAreaLinks(await getGeographySummaries(), truck);
  } catch (error) {
    console.error("Failed to load truck area links:", error);
    return [];
  }
}
