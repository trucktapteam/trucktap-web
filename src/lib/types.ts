/**
 * Shape mirrors the approved `public_trucks` Supabase view contract (25
 * columns) plus the related entities a profile page needs (locations,
 * reviews, upcoming stops). `slug` is not part of that view yet — it's a
 * planned backend addition — but routing is built around it now so no
 * page code needs to change once it lands.
 */
export type Truck = {
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
  gallery_images: string[];
  menu_images: string[];
  menu_items: MenuItem[];
  announcements: Announcement[];
  is_verified: boolean;
  is_open: boolean;
  service_area: string | null;
  operating_hours: OperatingHours | null;
  facebook_url: string | null;
  instagram_url: string | null;
  tiktok_url: string | null;
  trust_badges: TrustBadge[];
  last_live_updated_at: string | null;
  live_started_at: string | null;
  live_expires_at: string | null;
  created_at: string;
  updated_at: string;
  currentLocation: CurrentLocation | null;
  upcomingStops: UpcomingStop[];
  reviews: Review[];
};

export type MenuItem = {
  id: string;
  name: string;
  description?: string;
  price: number;
  category?: string;
  image?: string;
  available?: boolean;
};

export type Announcement = {
  id: string;
  message: string;
  timestamp: string;
  expires_at?: string;
};

export type TrustBadge = "family_owned" | "veteran_owned";

export type OperatingHours = Record<
  "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday" | "Sunday",
  { open: string; close: string; closed: boolean }
>;

export type CurrentLocation = {
  label: string;
  latitude: number;
  longitude: number;
};

export type UpcomingStop = {
  id: string;
  starts_at: string;
  ends_at: string;
  location_text: string;
  note?: string;
  status: "scheduled" | "delayed" | "cancelled" | "sold_out" | "completed";
  flyer_image?: string;
};

export type Review = {
  id: string;
  rating: number;
  text: string;
  created_at: string;
  reviewer_display_name: string;
  reviewer_photo?: string;
  owner_reply?: {
    body: string;
    created_at: string;
  };
};
