/**
 * Static content for the marketing homepage — mirrors gettrucktap.com
 * (the live GitHub Pages site) as of the rebuild. The rolling truck
 * marquee itself is now live data (see lib/rolling-trucks.ts);
 * `fallbackRollingTrucks` below is only the outage backup for that query.
 */

// App Store / Google Play URLs live in lib/app-links.ts — the single
// canonical source every download button on the site imports from.
export const FACEBOOK_URL = "https://www.facebook.com/profile.php?id=61574337256977";
export const ANTHEM_YOUTUBE_WATCH_URL = "https://youtube.com/shorts/rpr4vHIFAHY?feature=share";
export const ANTHEM_YOUTUBE_EMBED_URL = "https://www.youtube.com/embed/rpr4vHIFAHY";

export type FallbackRollingTruck = { file: string; alt: string };

/**
 * Small static backup for the "Already Rolling" marquee, used only when
 * the live `public_trucks` query fails (see lib/rolling-trucks.ts) — kept
 * short since this is an outage path, not the normal render path.
 */
export const fallbackRollingTrucks: FallbackRollingTruck[] = [
  { file: "502-cakery.jpg", alt: "502 Cakery" },
  { file: "acme-chicken-bowls.jpeg", alt: "Acme Chicken Bowls" },
  { file: "bussin-bites.jpg", alt: "Bussin Bites" },
  { file: "f-bomb.jpg", alt: "F-Bomb" },
  { file: "joyces-kitchen.jpg", alt: "Joyce's Kitchen" },
  { file: "mericana.jpg", alt: "Mericana" },
  { file: "papa-pasta.jpg", alt: "Papa Pasta" },
  { file: "quench-lemonade.jpg", alt: "Quench Lemonade" },
  { file: "the-pizza-guys.jpg", alt: "The Pizza Guys" },
  { file: "the-station.png", alt: "The Station" },
];

export type AppScreenshot = { file: string; alt: string };

/** Source: screenshots/ in TruckTap-site. 1242x2688 (iPhone) originals. */
export const screenshots = {
  liveMap: { file: "live-map.jpg", alt: "TruckTap live map showing nearby food trucks" },
  truckProfile: { file: "truck-profile.jpg", alt: "TruckTap truck profile screen" },
  truckMenu: { file: "truck-menu.jpg", alt: "TruckTap truck menu and gallery screen" },
  favorites: { file: "favorites-screen.jpg", alt: "TruckTap favorites and profile screen" },
  notifications: { file: "notifications-screen.jpg", alt: "TruckTap notifications and settings screen" },
  discoverMap: { file: "discover-map.jpg", alt: "TruckTap discovery map screen" },
  goLive: { file: "go-live.jpg", alt: "TruckTap Go Live screen for food truck owners" },
} satisfies Record<string, AppScreenshot>;

export type CommunityPhoto = { file: string; alt: string; feature?: boolean };

/** "Seen on TruckTap" community gallery. */
export const communityPhotos: CommunityPhoto[] = [
  { file: "trucktap-hero.png", alt: "TruckTap community food truck scene", feature: true },
  { file: "earl.jpg", alt: "Food truck community sighting" },
  { file: "batman.jpg", alt: "Playful food truck culture sighting" },
  { file: "taco-lover.jpg", alt: "Taco lover community image" },
  { file: "price-is-right.jpg", alt: "Food truck event culture image" },
  { file: "spongebob.jpg", alt: "Fun community food truck image" },
  { file: "waldo.jpg", alt: "Community food truck culture image" },
];
