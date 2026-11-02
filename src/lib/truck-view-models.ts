import { getUpcomingStops } from "./format";
import { formatStopTime, type StopTimeLabels } from "./stop-time";
import type { Truck, UpcomingStop } from "./types";

/**
 * Narrow, purpose-built view models for every Client Component the truck
 * profile page renders, plus the pure functions that build them from a full
 * `Truck`.
 *
 * Why this exists: Next.js serializes a Client Component's entire prop
 * value into the page's RSC hydration payload (embedded in the raw HTML
 * response) regardless of which fields that component actually reads.
 * `/truck/[slug]/page.tsx` used to pass the full `truck` object straight
 * through to half a dozen Client Components — none of which render
 * `currentLocation` or `service_area`, but the exact last-known-LIVE
 * coordinates and (often street-address) service area were still present
 * in the page source for every visitor, view-source or a plain `curl`,
 * regardless of what the rendered UI showed.
 *
 * The fix has to happen at the value level, not just the type level: a
 * `Pick<Truck, ...>` prop *type* only limits what TypeScript requires the
 * caller to provide — the actual runtime object handed to a Client
 * Component still needs to be a real, separately-constructed object literal
 * containing only those fields, or the extra fields ride along at runtime
 * regardless of what the type says. That's what the `to*Info` functions
 * below do: pick fields out into a fresh object, once, at the one place
 * (`page.tsx`) that has the full `Truck` and is safe to have it (a Server
 * Component itself is never serialized to the client).
 *
 * `StatusBarTruck` is the one deliberate exception: `currentLocation` is
 * included because StatusBar is the sole component authorized to render it
 * (exact location + "Get Directions", only while the truck is actually
 * LIVE — see StatusBar.tsx). That's still safe because StatusBar itself is
 * Server-rendered and never crosses into a Client Component's serialized
 * props.
 */

export type TruckHeroInfo = Pick<
  Truck,
  "id" | "hero_image" | "logo" | "name" | "cuisine_type" | "is_verified" | "reviews"
>;

export function toTruckHeroInfo(truck: Truck): TruckHeroInfo {
  const { id, hero_image, logo, name, cuisine_type, is_verified, reviews } = truck;
  return { id, hero_image, logo, name, cuisine_type, is_verified, reviews };
}

export type QuickActionsInfo = Pick<Truck, "phone" | "name">;

export function toQuickActionsInfo(truck: Truck): QuickActionsInfo {
  const { phone, name } = truck;
  return { phone, name };
}

export type UpcomingStopView = Pick<UpcomingStop, "id" | "location_text" | "note" | "status" | "flyer_image"> &
  StopTimeLabels;

export type UpcomingStopsInfo = { name: string; stops: UpcomingStopView[] };

/**
 * Which stops to show and their display text are both settled here, on the
 * server, so UpcomingStopsSection renders identical text during server
 * rendering and hydration: it never touches a Date or a clock.
 */
export function toUpcomingStopsInfo(truck: Truck, now: Date = new Date()): UpcomingStopsInfo {
  const stops: UpcomingStopView[] = [];
  for (const stop of getUpcomingStops(truck, now)) {
    const time = formatStopTime(stop, now);
    if (!time) continue;
    const { id, location_text, note, status, flyer_image } = stop;
    stops.push({ id, location_text, note, status, flyer_image, ...time });
  }
  return { name: truck.name, stops };
}

export type GallerySectionInfo = Pick<Truck, "gallery_images" | "name">;

export function toGallerySectionInfo(truck: Truck): GallerySectionInfo {
  const { gallery_images, name } = truck;
  return { gallery_images, name };
}

export type MenuSectionInfo = Pick<Truck, "menu_items" | "menu_images" | "name">;

export function toMenuSectionInfo(truck: Truck): MenuSectionInfo {
  const { menu_items, menu_images, name } = truck;
  return { menu_items, menu_images, name };
}

export type TruckQrPosterInfo = Pick<Truck, "id" | "name" | "hero_image" | "logo">;

export function toTruckQrPosterInfo(truck: Truck): TruckQrPosterInfo {
  const { id, name, hero_image, logo } = truck;
  return { id, name, hero_image, logo };
}

export type StatusBarTruck = Pick<
  Truck,
  | "name"
  | "phone"
  | "website"
  | "is_open"
  | "live_expires_at"
  | "live_started_at"
  | "last_live_updated_at"
  | "service_area"
  | "operating_hours"
  | "currentLocation"
  | "upcomingStops"
>;

export function toStatusBarTruck(truck: Truck): StatusBarTruck {
  const {
    name,
    phone,
    website,
    is_open,
    live_expires_at,
    live_started_at,
    last_live_updated_at,
    service_area,
    operating_hours,
    currentLocation,
    upcomingStops,
  } = truck;
  return {
    name,
    phone,
    website,
    is_open,
    live_expires_at,
    live_started_at,
    last_live_updated_at,
    service_area,
    operating_hours,
    currentLocation,
    upcomingStops,
  };
}
