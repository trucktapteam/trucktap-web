import { createSupabaseServerClient } from "./supabase/server";
import { isSupabaseStorageImageUrl } from "./allowed-image-hosts";
import { fallbackRollingTrucks, type FallbackRollingTruck } from "./home-data";

export type RollingTruck = {
  id: string;
  slug: string;
  name: string;
  logo: string;
  is_verified: boolean;
  updated_at: string;
};

type PublicTruckLogoRow = {
  id: string;
  slug: string;
  name: string;
  logo: string | null;
  is_verified: boolean;
  updated_at: string;
};

/**
 * Live rolling-truck list for the homepage marquee. Queries only the
 * columns the marquee renders — never `select('*')`, never the base
 * `trucks` table — and excludes any row whose `logo` isn't actually
 * renderable (missing, or hosted somewhere other than our own Supabase
 * Storage, e.g. the shared onboarding placeholder photo some rows still
 * carry). Throws on query failure so the caller can decide how to
 * degrade — see `getRollingTrucksOrFallback` for the homepage's actual
 * fallback behavior.
 */
export async function getRollingTrucks(): Promise<RollingTruck[]> {
  const supabase = createSupabaseServerClient();

  const { data, error } = await supabase
    .from("public_trucks")
    .select("id, slug, name, logo, is_verified, updated_at")
    .order("updated_at", { ascending: false })
    .returns<PublicTruckLogoRow[]>();

  if (error) throw new Error(`Failed to load rolling trucks: ${error.message}`);

  return (data ?? [])
    .filter(
      (row): row is PublicTruckLogoRow & { logo: string } =>
        typeof row.logo === "string" && isSupabaseStorageImageUrl(row.logo)
    )
    .map((row) => ({
      id: row.id,
      slug: row.slug,
      name: row.name,
      logo: row.logo,
      is_verified: row.is_verified,
      updated_at: row.updated_at,
    }));
}

export type RollingTrucksResult =
  | { source: "live"; trucks: RollingTruck[] }
  | { source: "fallback"; trucks: FallbackRollingTruck[] };

/**
 * Homepage-safe wrapper: falls back to a small static logo list if the
 * live query fails (env misconfiguration, outage, etc.), so a backend
 * problem doesn't leave the "Already Rolling" section empty.
 */
export async function getRollingTrucksOrFallback(): Promise<RollingTrucksResult> {
  try {
    const trucks = await getRollingTrucks();
    return { source: "live", trucks };
  } catch (error) {
    console.error("Rolling trucks query failed, using static fallback list:", error);
    return { source: "fallback", trucks: fallbackRollingTrucks };
  }
}
