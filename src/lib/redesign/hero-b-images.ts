import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isSupabaseStorageImageUrl } from "@/lib/allowed-image-hosts";

/**
 * Curated real-truck photography for the Option B (`/redesign/b`) hero.
 * Two images only: one dominant truck, one food close-up. Both are
 * hand-picked, art-directed choices made after reviewing each truck's
 * actual gallery — but the URLs are still read live from `public_trucks`
 * (the same view the rest of the site uses), so this stays honest to real
 * data and needs no schema change. If an owner later removes one of these
 * photos the slot simply doesn't render.
 *
 * `match` is a substring of the stored image URL rather than an array
 * index, so re-ordering a gallery doesn't silently swap the picture.
 */

export type HeroBSlot = "dominantTruck" | "foodCloseup";

export type HeroBImage = { src: string; alt: string };

type Curation = { slug: string; match: string | "hero"; alt: string };

const CURATION: Record<HeroBSlot, Curation> = {
  dominantTruck: {
    slug: "bona-fide-barbecue",
    match: "gallery-1787370440004-8",
    alt: "Bona Fide Barbecue's matte-black barbecue rig, front three-quarter view, serving window open",
  },
  foodCloseup: {
    slug: "the-wurst",
    match: "gallery-1786985484078-1",
    alt: "A bacon smashburger with mustard-seed sauce and pickles from The Wurst, on red-and-white checked paper",
  },
};

type PublicTruckImageRow = {
  slug: string;
  hero_image: string | null;
  gallery_images: unknown;
};

function candidateUrls(row: PublicTruckImageRow): string[] {
  const urls: string[] = [];
  if (typeof row.hero_image === "string") urls.push(row.hero_image);
  if (Array.isArray(row.gallery_images)) {
    for (const entry of row.gallery_images) {
      if (typeof entry === "string") urls.push(entry);
    }
  }
  return urls;
}

/**
 * Resolves the curated slots to renderable Supabase Storage URLs. Returns
 * a partial map — a missing slot (query failure, deleted photo, unknown
 * host) is just omitted, and the hero component degrades around it.
 */
export async function getHeroBImages(): Promise<Partial<Record<HeroBSlot, HeroBImage>>> {
  const supabase = createSupabaseServerClient();
  const slugs = [...new Set(Object.values(CURATION).map((c) => c.slug))];

  const { data, error } = await supabase
    .from("public_trucks")
    .select("slug, hero_image, gallery_images")
    .in("slug", slugs)
    .returns<PublicTruckImageRow[]>();

  if (error) {
    console.error("hero-b-images: public_trucks query failed", error);
    return {};
  }

  const bySlug = new Map((data ?? []).map((row) => [row.slug, row]));
  const result: Partial<Record<HeroBSlot, HeroBImage>> = {};

  for (const [slot, pick] of Object.entries(CURATION) as [HeroBSlot, Curation][]) {
    const row = bySlug.get(pick.slug);
    if (!row) continue;

    const hit =
      pick.match === "hero"
        ? typeof row.hero_image === "string"
          ? row.hero_image
          : undefined
        : candidateUrls(row).find((url) => url.includes(pick.match));

    if (hit && isSupabaseStorageImageUrl(hit)) {
      result[slot] = { src: hit, alt: pick.alt };
    }
  }

  return result;
}
