import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { getPublicTruckSitemapEntries } from "@/lib/truck-data";

// Same reasoning as the homepage's own `revalidate` (src/app/page.tsx):
// truck slugs change as trucks are added, so this can't be a one-time,
// build-time-only list without going fully dynamic. ISR keeps it fresh
// at most once an hour.
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const homepage: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
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
    // degrade to homepage-only rather than erroring the route (which
    // would make sitemap.xml itself unreachable by crawlers).
    console.error("Sitemap truck query failed, serving homepage-only sitemap:", error);
  }

  return [...homepage, ...truckEntries];
}
