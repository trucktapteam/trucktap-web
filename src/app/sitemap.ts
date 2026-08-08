import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { getPublicTruckSitemapEntries } from "@/lib/truck-data";
import { getGeographySummaries, qualifyingCities, qualifyingStates } from "@/lib/geography";

// Same reasoning as the homepage's own `revalidate` (src/app/page.tsx):
// truck slugs change as trucks are added, so this can't be a one-time,
// build-time-only list without going fully dynamic. ISR keeps it fresh
// at most once an hour.
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${SITE_URL}/trucks`,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 0.9,
    },
  ];

  let truckEntries: MetadataRoute.Sitemap = [];
  try {
    const trucks = await getPublicTruckSitemapEntries();
    truckEntries = trucks.map((truck) => ({
      url: `${SITE_URL}/truck/${truck.slug}`,
      lastModified: truck.updated_at,
      changeFrequency: "daily",
      priority: 0.7,
    }));
  } catch (error) {
    // A transient Supabase outage shouldn't take the whole sitemap down —
    // degrade to the static pages only rather than erroring the route
    // (which would make sitemap.xml itself unreachable by crawlers).
    console.error("Sitemap truck query failed, serving static-pages-only sitemap:", error);
  }

  let geographyEntries: MetadataRoute.Sitemap = [];
  try {
    // Enumerated dynamically from home_state_slug/home_city_slug, at the
    // same STATE_MIN_TRUCKS/CITY_MIN_TRUCKS threshold the pages themselves
    // enforce (notFound() below it) — a slug never appears here without a
    // real page behind it, and a newly-qualifying place appears here
    // automatically the next time the sitemap regenerates, no code change.
    const summaries = await getGeographySummaries();
    geographyEntries = [
      ...qualifyingStates(summaries).map((state) => ({
        url: `${SITE_URL}/state/${state.stateSlug}`,
        lastModified: new Date(),
        changeFrequency: "daily" as const,
        priority: 0.8,
      })),
      ...qualifyingCities(summaries).map((city) => ({
        url: `${SITE_URL}/city/${city.citySlug}`,
        lastModified: new Date(),
        changeFrequency: "daily" as const,
        priority: 0.75,
      })),
    ];
  } catch (error) {
    console.error("Sitemap geography query failed, omitting state/city pages:", error);
  }

  return [...staticPages, ...truckEntries, ...geographyEntries];
}
