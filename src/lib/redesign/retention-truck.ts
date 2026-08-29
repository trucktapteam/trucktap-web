import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isSupabaseStorageImageUrl } from "@/lib/allowed-image-hosts";
import type { TruckQrPosterInfo } from "@/lib/truck-view-models";

/**
 * Real data for the post-TTN "LOVE THIS TRUCK? / DON'T LOSE IT." section,
 * read live from `public_trucks` (the same view the rest of the site uses).
 *
 * PRIMARY truck: Bona Fide Barbecue — its poster, its QR destination, and
 * its curated "serving window open" gallery frame, all one truck. This is
 * the happy path and its output is unchanged.
 *
 * FAILSAFE: if that row can't be loaded (renamed, unpublished, deleted, or
 * a query error), the section falls back to the next available real public
 * truck in `FALLBACK_SLUGS` rather than silently disappearing from the
 * homepage. A fallback truck still gets a real poster + real QR + real
 * profile link; it just doesn't carry the curated window photo
 * (`windowImage: null`) — RetentionSection already renders correctly
 * without it, and we don't guess what an arbitrary gallery image shows.
 * No fabricated status or business information in any case.
 *
 * Returns `null` only if NONE of the curated trucks resolve (a broad
 * `public_trucks` outage), in which case the section is omitted.
 *
 * `PRIMARY_WINDOW_MATCH` is a substring of the stored gallery URL, not an
 * index, so re-ordering the gallery can't silently swap the picture.
 */

const PRIMARY_SLUG = "bona-fide-barbecue";
const PRIMARY_WINDOW_MATCH = "gallery-1787370440004-8";
const PRIMARY_WINDOW_ALT =
  "Bona Fide Barbecue's matte-black barbecue truck with its serving window open";

// Real, long-established public trucks — used only if the primary can't load.
const FALLBACK_SLUGS = ["the-wurst", "sonny-boys-backyard", "g-ero-s-salsa-and-more"];

export type RetentionTruck = {
  /** Exactly what <PosterArtwork> needs — nothing wider crosses to the client. */
  poster: TruckQrPosterInfo;
  /** For the visible, crawlable profile link (`/truck/<slug>`). Resolves to
   *  the same truck the poster's QR encodes via `getTruckQrPayload(id)`. */
  slug: string;
  windowImage: { src: string; alt: string } | null;
};

type PublicTruckRow = {
  id: string;
  slug: string;
  name: string;
  hero_image: string | null;
  logo: string | null;
  gallery_images: unknown;
};

export async function getRetentionTruck(): Promise<RetentionTruck | null> {
  try {
    const supabase = createSupabaseServerClient();

    const { data, error } = await supabase
      .from("public_trucks")
      .select("id, slug, name, hero_image, logo, gallery_images")
      .in("slug", [PRIMARY_SLUG, ...FALLBACK_SLUGS])
      .returns<PublicTruckRow[]>();

    if (error) throw new Error(error.message);

    const bySlug = new Map((data ?? []).map((row) => [row.slug, row]));
    // Primary first, then each fallback in listed order.
    const row = [PRIMARY_SLUG, ...FALLBACK_SLUGS]
      .map((slug) => bySlug.get(slug))
      .find((r): r is PublicTruckRow => Boolean(r));

    if (!row) return null;

    const isPrimary = row.slug === PRIMARY_SLUG;
    const galleryUrls = Array.isArray(row.gallery_images)
      ? row.gallery_images.filter((url): url is string => typeof url === "string")
      : [];
    // Only the primary carries a curated, described window photo.
    const windowHit = isPrimary
      ? galleryUrls.find((url) => url.includes(PRIMARY_WINDOW_MATCH))
      : undefined;

    return {
      poster: {
        id: row.id,
        name: row.name,
        hero_image: row.hero_image,
        logo: row.logo,
      },
      slug: row.slug,
      windowImage:
        windowHit && isSupabaseStorageImageUrl(windowHit)
          ? { src: windowHit, alt: PRIMARY_WINDOW_ALT }
          : null,
    };
  } catch (error) {
    console.error("getRetentionTruck: public_trucks lookup failed", error);
    return null;
  }
}
