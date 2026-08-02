import type { Truck } from "./types";

/**
 * Minimal, fully-valid Truck fixture for unit tests — override only the
 * fields a given test cares about instead of repeating this whole shape
 * in every test file.
 */
export function makeTruck(overrides: Partial<Truck> = {}): Truck {
  return {
    id: "test-truck",
    slug: "test-truck",
    name: "Test Truck",
    cuisine_type: null,
    description: null,
    bio: null,
    phone: null,
    website: null,
    hero_image: null,
    logo: null,
    gallery_images: [],
    menu_images: [],
    menu_items: [],
    announcements: [],
    is_verified: false,
    is_open: false,
    service_area: null,
    operating_hours: null,
    facebook_url: null,
    instagram_url: null,
    tiktok_url: null,
    trust_badges: [],
    last_live_updated_at: null,
    live_started_at: null,
    live_expires_at: null,
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z",
    currentLocation: null,
    upcomingStops: [],
    reviews: [],
    ...overrides,
  };
}
