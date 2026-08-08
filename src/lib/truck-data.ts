import { createSupabaseServerClient } from "./supabase/server";
import type {
  Announcement,
  CurrentLocation,
  MenuItem,
  Review,
  Truck,
  UpcomingStop,
} from "./types";

/**
 * Maps live Supabase data into the existing `Truck` contract. This is the
 * only place that talks to Supabase for the truck-profile page — every
 * component still consumes the same `Truck` shape it did against
 * lib/mock-data.ts, so no component changes were needed to wire this up.
 *
 * Column discipline (see the integration audit): `public_trucks` is a
 * pre-filtered, pre-whitelisted view — safe to query broadly, but we still
 * name columns explicitly for consistency. `public.trucks` (the base
 * table) is never queried directly: its RLS policy allows the same rows
 * but does not hide columns like owner_id or live_source the way the view
 * does. `profiles` and `upcoming_stops` are queried directly (no public
 * view exists for them), and BOTH carry columns RLS does not hide —
 * profiles has email/push_token, upcoming_stops has ~10 internal
 * automation fields. Every query below lists only the columns this page
 * actually renders.
 */

const PUBLIC_TRUCK_COLUMNS =
  "id, slug, name, cuisine_type, description, bio, phone, website, hero_image, logo, " +
  "gallery_images, menu_images, menu_items, announcements, is_verified, is_open, " +
  "service_area, facebook_url, instagram_url, tiktok_url, trust_badges, " +
  "last_live_updated_at, live_started_at, live_expires_at, created_at, updated_at";

type PublicTruckRow = {
  id: string;
  slug: string;
  name: string;
  cuisine_type: string | null;
  description: string | null;
  bio: string | null;
  phone: string | null;
  website: string | null;
  hero_image: string | null;
  logo: string | null;
  gallery_images: unknown;
  menu_images: unknown;
  menu_items: unknown;
  announcements: unknown;
  is_verified: boolean;
  is_open: boolean;
  service_area: string | null;
  facebook_url: string | null;
  instagram_url: string | null;
  tiktok_url: string | null;
  trust_badges: unknown;
  last_live_updated_at: string | null;
  live_started_at: string | null;
  live_expires_at: string | null;
  created_at: string;
  updated_at: string;
};

type LocationRow = {
  id: string;
  truck_id: string;
  label: string | null;
  latitude: number | null;
  longitude: number | null;
};

type UpcomingStopRow = {
  id: string;
  truck_id: string;
  starts_at: string;
  ends_at: string;
  location_text: string;
  note: string | null;
  status: UpcomingStop["status"];
  event_image_url: string | null;
};

type ReviewRow = {
  id: string;
  truck_id: string;
  user_id: string;
  rating: number;
  text: string;
  created_at: string;
};

type ProfileRow = {
  id: string;
  display_name: string | null;
  profile_photo: string | null;
};

type ReviewReplyRow = {
  id: string;
  truck_id: string;
  review_id: string;
  body: string;
  created_at: string;
  deleted_at: string | null;
};

function toStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((v): v is string => typeof v === "string") : [];
}

const MENU_BOARD_LABEL_PREFIX = "menu-board:";

/**
 * The owner app's dedicated "photograph the whole board" upload flow labels
 * that entry by literally prefixing the stored URL with `"menu-board:"` —
 * as opposed to a photo captured while adding an individual menu item,
 * which lands in this same `menu_images` array unprefixed. Strip the label
 * so the real Supabase Storage URL underneath resolves normally; left
 * on, `new URL("menu-board:https://...")` parses "menu-board:" itself as
 * the protocol, so isSupabaseStorageImageUrl rejects it and the board
 * photo falls back to the decorative gradient instead of the real board.
 */
export function toMenuImageUrls(value: unknown): string[] {
  return toStringArray(value).map((entry) =>
    entry.startsWith(MENU_BOARD_LABEL_PREFIX) ? entry.slice(MENU_BOARD_LABEL_PREFIX.length) : entry
  );
}

function mapMenuItems(value: unknown): MenuItem[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is Record<string, unknown> => typeof item === "object" && item !== null)
    .map((item) => ({
      id: String(item.id ?? ""),
      name: String(item.name ?? ""),
      description: typeof item.description === "string" ? item.description : undefined,
      price: typeof item.price === "number" ? item.price : Number(item.price ?? 0),
      category: typeof item.category === "string" ? item.category : undefined,
      image: typeof item.image === "string" ? item.image : undefined,
      available: typeof item.available === "boolean" ? item.available : undefined,
    }))
    .filter((item) => item.id !== "" && item.name !== "");
}

function mapAnnouncements(value: unknown): Announcement[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is Record<string, unknown> => typeof item === "object" && item !== null)
    .map((item) => ({
      id: String(item.id ?? ""),
      message: String(item.message ?? ""),
      timestamp: String(item.timestamp ?? ""),
      expires_at: typeof item.expires_at === "string" ? item.expires_at : undefined,
    }))
    .filter((item) => item.id !== "" && item.message !== "");
}

function mapTrustBadges(value: unknown): Truck["trust_badges"] {
  return toStringArray(value) as Truck["trust_badges"];
}

/**
 * True for well-formed RFC 4122 UUIDs (versions 1-5) — used to decide
 * whether a `/truck/[slug]` path segment that didn't match any slug is
 * worth a second lookup by id, versus just a typo'd or unknown slug.
 */
function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

type Supabase = ReturnType<typeof createSupabaseServerClient>;

async function loadPublicTruckRow(
  supabase: Supabase,
  column: "slug" | "id",
  value: string
): Promise<PublicTruckRow | null> {
  const { data, error } = await supabase
    .from("public_trucks")
    .select(PUBLIC_TRUCK_COLUMNS)
    .eq(column, value)
    .maybeSingle<PublicTruckRow>();

  if (error) throw new Error(`Failed to load truck (${column}=${value}): ${error.message}`);
  return data;
}

/**
 * Loads every related entity (location, stops, reviews + their reviewer
 * profiles and owner replies) for a truck row already resolved from
 * `public_trucks`, and assembles the full `Truck` contract. Shared by both
 * slug- and id-based lookups so the two entry points can never drift.
 */
async function hydrateTruck(supabase: Supabase, truckRow: PublicTruckRow): Promise<Truck> {
  const [locationResult, stopsResult, reviewsResult] = await Promise.all([
    supabase
      .from("locations")
      .select("id, truck_id, label, latitude, longitude")
      .eq("truck_id", truckRow.id)
      .maybeSingle<LocationRow>(),
    supabase
      .from("upcoming_stops")
      .select("id, truck_id, starts_at, ends_at, location_text, note, status, event_image_url")
      .eq("truck_id", truckRow.id)
      .order("starts_at", { ascending: true })
      .returns<UpcomingStopRow[]>(),
    supabase
      .from("reviews")
      .select("id, truck_id, user_id, rating, text, created_at")
      .eq("truck_id", truckRow.id)
      .order("created_at", { ascending: false })
      .returns<ReviewRow[]>(),
  ]);

  if (locationResult.error) {
    throw new Error(`Failed to load location for truck "${truckRow.id}": ${locationResult.error.message}`);
  }
  if (stopsResult.error) {
    throw new Error(`Failed to load upcoming stops for truck "${truckRow.id}": ${stopsResult.error.message}`);
  }
  if (reviewsResult.error) {
    throw new Error(`Failed to load reviews for truck "${truckRow.id}": ${reviewsResult.error.message}`);
  }

  const reviewRows = reviewsResult.data ?? [];
  const reviewIds = reviewRows.map((r) => r.id);
  const reviewerIds = [...new Set(reviewRows.map((r) => r.user_id))];

  const [profilesResult, repliesResult] = await Promise.all([
    reviewerIds.length > 0
      ? supabase
          .from("profiles")
          .select("id, display_name, profile_photo")
          .in("id", reviewerIds)
          .returns<ProfileRow[]>()
      : Promise.resolve({ data: [] as ProfileRow[], error: null }),
    reviewIds.length > 0
      ? supabase
          .from("review_replies")
          .select("id, truck_id, review_id, body, created_at, deleted_at")
          .eq("truck_id", truckRow.id)
          .is("deleted_at", null)
          .returns<ReviewReplyRow[]>()
      : Promise.resolve({ data: [] as ReviewReplyRow[], error: null }),
  ]);

  if (profilesResult.error) {
    throw new Error(`Failed to load reviewer profiles for truck "${truckRow.id}": ${profilesResult.error.message}`);
  }
  if (repliesResult.error) {
    throw new Error(`Failed to load review replies for truck "${truckRow.id}": ${repliesResult.error.message}`);
  }

  const profileById = new Map((profilesResult.data ?? []).map((p) => [p.id, p]));
  const replyByReviewId = new Map((repliesResult.data ?? []).map((r) => [r.review_id, r]));

  const currentLocation: CurrentLocation | null =
    locationResult.data && locationResult.data.label && locationResult.data.latitude !== null && locationResult.data.longitude !== null
      ? {
          label: locationResult.data.label,
          latitude: locationResult.data.latitude,
          longitude: locationResult.data.longitude,
        }
      : null;

  const upcomingStops: UpcomingStop[] = (stopsResult.data ?? []).map((stop) => ({
    id: stop.id,
    starts_at: stop.starts_at,
    ends_at: stop.ends_at,
    location_text: stop.location_text,
    note: stop.note ?? undefined,
    status: stop.status,
    flyer_image: stop.event_image_url ?? undefined,
  }));

  const reviews: Review[] = reviewRows.map((review) => {
    const profile = profileById.get(review.user_id);
    const reply = replyByReviewId.get(review.id);
    return {
      id: review.id,
      rating: review.rating,
      text: review.text,
      created_at: review.created_at,
      reviewer_display_name: profile?.display_name || "TruckTap user",
      reviewer_photo: profile?.profile_photo ?? undefined,
      owner_reply: reply ? { body: reply.body, created_at: reply.created_at } : undefined,
    };
  });

  const truck: Truck = {
    id: truckRow.id,
    slug: truckRow.slug,
    name: truckRow.name,
    cuisine_type: truckRow.cuisine_type,
    description: truckRow.description,
    bio: truckRow.bio,
    phone: truckRow.phone,
    website: truckRow.website,
    hero_image: truckRow.hero_image,
    logo: truckRow.logo,
    gallery_images: toStringArray(truckRow.gallery_images),
    menu_images: toMenuImageUrls(truckRow.menu_images),
    menu_items: mapMenuItems(truckRow.menu_items),
    announcements: mapAnnouncements(truckRow.announcements),
    is_verified: truckRow.is_verified,
    is_open: truckRow.is_open,
    service_area: truckRow.service_area,
    // Not yet exposed by public_trucks — see integration audit. Degrades
    // safely: every consumer already treats this as optional.
    operating_hours: null,
    facebook_url: truckRow.facebook_url,
    instagram_url: truckRow.instagram_url,
    tiktok_url: truckRow.tiktok_url,
    trust_badges: mapTrustBadges(truckRow.trust_badges),
    last_live_updated_at: truckRow.last_live_updated_at,
    live_started_at: truckRow.live_started_at,
    live_expires_at: truckRow.live_expires_at,
    created_at: truckRow.created_at,
    updated_at: truckRow.updated_at,
    currentLocation,
    upcomingStops,
    reviews,
  };

  return truck;
}

/**
 * Looks up one truck by slug against live Supabase data, or `null` if no
 * public truck matches — the same contract `getMockTruckBySlug` had, so
 * the route needs no other changes. Query failures (outages, etc.) throw
 * rather than resolving to `null`, so they don't get misreported as a
 * missing truck by the route's `notFound()` call.
 */
export async function getTruckBySlug(slug: string): Promise<Truck | null> {
  const supabase = createSupabaseServerClient();
  const truckRow = await loadPublicTruckRow(supabase, "slug", slug);
  if (!truckRow) return null;
  return hydrateTruck(supabase, truckRow);
}

/**
 * Looks up one truck by id (its Supabase row UUID) against live data, or
 * `null` if no public truck matches. `public_trucks` already excludes
 * archived/test rows at the row level (see the RLS/view migration), so
 * this can never resolve a truck `getTruckBySlug` wouldn't also be able
 * to serve under its slug — it's purely a different lookup key onto the
 * same public contract.
 */
export async function getTruckById(id: string): Promise<Truck | null> {
  const supabase = createSupabaseServerClient();
  const truckRow = await loadPublicTruckRow(supabase, "id", id);
  if (!truckRow) return null;
  return hydrateTruck(supabase, truckRow);
}

export type TruckRouteResolution = {
  truck: Truck;
  /**
   * Non-null when this truck was only found via its legacy UUID, not the
   * requested slug — the caller should permanently redirect to
   * `/truck/${redirectToSlug}` rather than rendering in place, so the
   * canonical, human-readable URL is what search engines and browser
   * history end up with.
   */
  redirectToSlug: string | null;
};

/**
 * Resolves a `/truck/[slug]` path segment for both current (slug) and
 * legacy (raw Supabase UUID) links, without changing the QR/poster
 * payload the app and this site's own `TruckQrPoster` already encode
 * (`/truck/<truck id>` — see truck-share.ts). Slug match is tried first
 * since that's the overwhelmingly common case; the id fallback only runs
 * for values that are actually well-formed UUIDs, so a typo'd or unknown
 * slug takes one query, not two. Both lookups go through
 * `public_trucks`, so archived/test/non-public trucks never resolve
 * either way.
 */
export async function resolveTruckForRoute(param: string): Promise<TruckRouteResolution | null> {
  const bySlug = await getTruckBySlug(param);
  if (bySlug) return { truck: bySlug, redirectToSlug: null };

  if (!isUuid(param)) return null;

  const byId = await getTruckById(param);
  if (!byId) return null;

  return { truck: byId, redirectToSlug: byId.slug };
}

export type PublicTruckSitemapEntry = { slug: string; updated_at: string };

/**
 * Slugs (+ last-updated timestamps) for every truck currently eligible
 * for the sitemap. Queries only `public_trucks` — the same column-curated,
 * row-filtered view every other public lookup on this site uses — so
 * archived/test/non-public trucks are excluded the same way they are
 * everywhere else, not via a second, separate filter here. Throws on
 * query failure so the sitemap route can decide how to degrade, rather
 * than silently publishing an empty or stale sitemap.
 */
export async function getPublicTruckSitemapEntries(): Promise<PublicTruckSitemapEntry[]> {
  const supabase = createSupabaseServerClient();

  const { data, error } = await supabase
    .from("public_trucks")
    .select("slug, updated_at")
    .returns<PublicTruckSitemapEntry[]>();

  if (error) throw new Error(`Failed to load truck slugs for sitemap: ${error.message}`);

  return data ?? [];
}
