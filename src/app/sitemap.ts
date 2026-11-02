import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { getPublicTruckSitemapEntries } from "@/lib/truck-data";
import { getGeographySummaries, qualifyingCities, qualifyingStates } from "@/lib/geography";

// Generated on every request, deliberately. With `revalidate = 3600` this file
// never refreshed on Vercel: the Oct 14, 2026 deployment was still serving its
// build-time sitemap 18 days later, from a cache entry about 2.9 days old. Under
// `next start` the same setting did regenerate, so the difference is specific
// to Vercel, and the sitemap only changed on deployment. Search engines fetch
// this rarely, so the cost is small: one function run and two short queries.
export const dynamic = "force-dynamic";

// `lastModified` is only set where a real edit time exists (truck profiles).
// Pages with no such record leave it out: stamping them with the current time
// would claim a change on every fetch that never happened.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${SITE_URL}/trucks`,
      changeFrequency: "hourly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/privacy`,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  // No try/catch: if either query fails, the request fails with a 500. A 200
  // with most pages missing would tell search engines those pages are gone,
  // while a 500 is plainly an error and can be fetched again later. Zero public
  // trucks is treated the same way, since it can only mean something is wrong.
  const trucks = await getPublicTruckSitemapEntries();
  if (trucks.length === 0) throw new Error("Sitemap found no public trucks");

  const truckEntries: MetadataRoute.Sitemap = trucks.map((truck) => ({
    url: `${SITE_URL}/truck/${truck.slug}`,
    lastModified: truck.updated_at,
    changeFrequency: "daily",
    priority: 0.7,
  }));

  // Enumerated dynamically from home_state_slug/home_city_slug, at the
  // same STATE_MIN_TRUCKS/CITY_MIN_TRUCKS threshold the pages themselves
  // enforce (notFound() below it) — a slug never appears here without a
  // real page behind it, and a newly-qualifying place appears here
  // automatically the next time the sitemap regenerates, no code change.
  const summaries = await getGeographySummaries();
  const geographyEntries: MetadataRoute.Sitemap = [
    ...qualifyingStates(summaries).map((state) => ({
      url: `${SITE_URL}/state/${state.stateSlug}`,
      changeFrequency: "daily" as const,
      priority: 0.8,
    })),
    ...qualifyingCities(summaries).map((city) => ({
      url: `${SITE_URL}/city/${city.citySlug}`,
      changeFrequency: "daily" as const,
      priority: 0.75,
    })),
  ];

  return [...staticPages, ...truckEntries, ...geographyEntries];
}
