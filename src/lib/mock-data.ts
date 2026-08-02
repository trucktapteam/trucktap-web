import type { Truck } from "./types";

const now = Date.now();
const minutesAgo = (m: number) => new Date(now - m * 60_000).toISOString();
const hoursAgo = (h: number) => minutesAgo(h * 60);
const daysAgo = (d: number) => hoursAgo(d * 24);
const hoursFromNow = (h: number) => new Date(now + h * 60 * 60_000).toISOString();
const daysFromNow = (d: number) => hoursFromNow(d * 24);

/**
 * One fully-populated mock truck for reviewing the complete page layout.
 * Field shape matches the approved `public_trucks` view contract plus the
 * related tables (locations, reviews, upcoming_stops) a real page would
 * join in later. No network image URLs — hero/logo/gallery/menu/flyer
 * fields are placeholder seeds rendered by <PlaceholderImage>, so the page
 * never depends on external assets while there's no real Storage data.
 */
export const mockTruck: Truck = {
  id: "mock-0001",
  slug: "smoky-wheels-bbq",
  name: "Smoky Wheels BBQ",
  cuisine_type: "BBQ",
  description: null,
  bio: "Slow-smoked, low-and-slow Texas-style BBQ out of a converted horse trailer. We've been firing up the smoker at 4am six days a week since 2019 — brisket, ribs, and a sausage recipe passed down from three generations back. Family-run, veteran-owned, and always happy to talk pit techniques with anyone who asks.",
  phone: "(502) 555-0142",
  website: "https://smokywheelsbbq.example.com",
  hero_image: "hero-smoky-wheels",
  logo: "logo-smoky-wheels",
  gallery_images: [
    "gallery-brisket-plate",
    "gallery-smoker",
    "gallery-line-at-lunch",
    "gallery-ribs-closeup",
    "gallery-truck-exterior",
    "gallery-team-photo",
  ],
  menu_images: ["menu-board-1", "menu-board-2"],
  menu_items: [
    {
      id: "item-1",
      name: "Brisket Plate",
      description: "Half a pound of hand-trimmed brisket, two sides, and a slice of Texas toast.",
      price: 16,
      category: "Plates",
      image: "menu-item-brisket",
      available: true,
    },
    {
      id: "item-2",
      name: "St. Louis Ribs (Half Rack)",
      description: "Dry-rubbed and smoked six hours, sauce on the side.",
      price: 14,
      category: "Plates",
      image: "menu-item-ribs",
      available: true,
    },
    {
      id: "item-3",
      name: "Smoked Sausage Link",
      description: "House recipe, all beef.",
      price: 6,
      category: "Sandwiches & Sides",
      available: true,
    },
    {
      id: "item-4",
      name: "Pulled Pork Sandwich",
      description: "Topped with vinegar slaw.",
      price: 11,
      category: "Sandwiches & Sides",
      available: true,
    },
    {
      id: "item-5",
      name: "Mac & Cheese",
      description: "Smoked gouda, panko crust.",
      price: 5,
      category: "Sides",
      available: true,
    },
    {
      id: "item-6",
      name: "Banana Pudding",
      description: "Sold out most days by 1pm.",
      price: 5,
      category: "Desserts",
      available: false,
    },
  ],
  announcements: [
    {
      id: "ann-1",
      message: "Running low on brisket today — come early! Ribs and sausage still going strong.",
      timestamp: hoursAgo(2),
      expires_at: hoursFromNow(6),
    },
  ],
  is_verified: true,
  is_open: true,
  service_area: "Elizabethtown & Radcliff, KY",
  operating_hours: {
    Monday: { open: "11:00", close: "19:00", closed: false },
    Tuesday: { open: "11:00", close: "19:00", closed: false },
    Wednesday: { open: "11:00", close: "19:00", closed: false },
    Thursday: { open: "11:00", close: "19:00", closed: false },
    Friday: { open: "11:00", close: "20:00", closed: false },
    Saturday: { open: "11:00", close: "20:00", closed: false },
    Sunday: { open: "00:00", close: "00:00", closed: true },
  },
  facebook_url: "https://facebook.com/smokywheelsbbq",
  instagram_url: "https://instagram.com/smokywheelsbbq",
  tiktok_url: "https://tiktok.com/@smokywheelsbbq",
  trust_badges: ["veteran_owned", "family_owned"],
  last_live_updated_at: minutesAgo(8),
  live_started_at: minutesAgo(94),
  live_expires_at: hoursFromNow(10.5),
  created_at: daysAgo(620),
  updated_at: daysAgo(3),
  currentLocation: {
    label: "Walmart Supercenter, 1420 N Dixie Hwy, Elizabethtown, KY",
    latitude: 37.7136,
    longitude: -85.8941,
  },
  upcomingStops: [
    {
      id: "stop-1",
      starts_at: daysFromNow(2),
      ends_at: hoursFromNow(2 * 24 + 4),
      location_text: "Elizabethtown Farmers Market, 400 W Dixie Ave",
      note: "Live music from 5-7pm",
      status: "scheduled",
      flyer_image: "flyer-farmers-market",
    },
    {
      id: "stop-2",
      starts_at: daysFromNow(5),
      ends_at: hoursFromNow(5 * 24 + 3),
      location_text: "Radcliff VFW Post 3960",
      status: "scheduled",
    },
  ],
  reviews: [
    {
      id: "review-1",
      rating: 5,
      text: "Best brisket I've had outside of Texas, no exaggeration. Get there before noon on weekends or they'll be sold out.",
      created_at: daysAgo(4),
      reviewer_display_name: "Marcus T.",
    },
    {
      id: "review-2",
      rating: 5,
      text: "The mac and cheese alone is worth the trip. Super friendly crew too.",
      created_at: daysAgo(11),
      reviewer_display_name: "Priya R.",
      owner_reply: {
        body: "Thank you Priya! See you next time :)",
        created_at: daysAgo(10),
      },
    },
    {
      id: "review-3",
      rating: 4,
      text: "Ribs were great, had to wait about 20 minutes but it was lunch rush so fair enough.",
      created_at: daysAgo(19),
      reviewer_display_name: "Dana K.",
    },
  ],
};

/**
 * Every optional field left empty/null — no bio, no menu, no photos, no
 * socials, no announcements, no stops, no reviews, no trust badges, never
 * live. Exists to prove every optional section on the profile page hides
 * itself cleanly instead of rendering an empty shell.
 */
export const sparseMockTruck: Truck = {
  id: "mock-0002",
  slug: "bare-bones-tacos",
  name: "Bare Bones Tacos",
  cuisine_type: null,
  description: null,
  bio: null,
  phone: null,
  website: null,
  hero_image: "hero-bare-bones",
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
  created_at: daysAgo(10),
  updated_at: daysAgo(1),
  currentLocation: null,
  upcomingStops: [],
  reviews: [],
};

/**
 * A mix of present, missing, expired, and past data on the same truck —
 * covers the cases sparseMockTruck can't: an About that only has
 * `description` (no `bio`), an announcement that's expired and must not
 * show, upcoming stops that are past/cancelled and must not show next to
 * one that's genuinely upcoming and must, and a review with no owner
 * reply.
 */
export const mixedMockTruck: Truck = {
  id: "mock-0003",
  slug: "edge-case-eats",
  name: "Edge Case Eats",
  cuisine_type: "Fusion",
  description: "Asian-Cajun fusion out of a repurposed taco truck.",
  bio: null,
  phone: "(502) 555-0199",
  website: null,
  hero_image: "hero-edge-case",
  logo: "logo-edge-case",
  gallery_images: [],
  menu_images: [],
  menu_items: [],
  announcements: [
    {
      id: "ann-expired",
      message: "This announcement expired yesterday and must never render.",
      timestamp: daysAgo(2),
      expires_at: hoursAgo(3),
    },
  ],
  is_verified: false,
  is_open: false,
  service_area: "Louisville, KY",
  operating_hours: {
    Monday: { open: "11:00", close: "19:00", closed: false },
    Tuesday: { open: "11:00", close: "19:00", closed: false },
    Wednesday: { open: "11:00", close: "19:00", closed: false },
    Thursday: { open: "11:00", close: "19:00", closed: false },
    Friday: { open: "11:00", close: "20:00", closed: false },
    Saturday: { open: "11:00", close: "20:00", closed: false },
    Sunday: { open: "00:00", close: "00:00", closed: true },
  },
  facebook_url: "https://facebook.com/edgecaseeats",
  instagram_url: null,
  tiktok_url: null,
  trust_badges: ["family_owned"],
  last_live_updated_at: daysAgo(2),
  live_started_at: null,
  live_expires_at: null,
  created_at: daysAgo(200),
  updated_at: daysAgo(5),
  currentLocation: null,
  upcomingStops: [
    {
      id: "stop-past",
      starts_at: daysAgo(3),
      ends_at: hoursAgo(50),
      location_text: "Old spot — must never render",
      status: "scheduled",
    },
    {
      id: "stop-cancelled",
      starts_at: daysFromNow(1),
      ends_at: hoursFromNow(26),
      location_text: "Cancelled spot — must never render",
      status: "cancelled",
    },
    {
      id: "stop-future",
      starts_at: daysFromNow(3),
      ends_at: hoursFromNow(3 * 24 + 2),
      location_text: "Bardstown Road Food Fest, Louisville",
      status: "scheduled",
    },
  ],
  reviews: [
    {
      id: "review-edge-1",
      rating: 5,
      text: "Great fusion flavors, no notes.",
      created_at: daysAgo(2),
      reviewer_display_name: "Alex P.",
    },
  ],
};

const mockTrucks: Truck[] = [mockTruck, sparseMockTruck, mixedMockTruck];

/**
 * Mock lookup keyed by slug — swap this for a `public_trucks` query once
 * Supabase is connected.
 */
export function getMockTruckBySlug(slug: string): Truck | null {
  return mockTrucks.find((t) => t.slug === slug) ?? null;
}
