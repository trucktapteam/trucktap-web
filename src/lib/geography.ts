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
    description: `Find food trucks based in ${state.stateName} on TruckTap — see who's live right now, what's coming up next, and browse ${state.count} ${truckWord}.`,
    canonicalUrl: `${SITE_URL}/state/${state.stateSlug}`,
  };
}

export function buildCityMetadata(city: CityGeographySummary): GeographyPageMetadata {
  const truckWord = city.count === 1 ? "truck" : "trucks";
  return {
    title: `Food Trucks in ${city.cityName}, ${city.stateAbbreviation}`,
    description: `Find food trucks based in ${city.cityName}, ${city.stateName} on TruckTap — see who's live right now, what's coming up next, and browse ${city.count} ${truckWord}.`,
    canonicalUrl: `${SITE_URL}/city/${city.citySlug}`,
  };
}
