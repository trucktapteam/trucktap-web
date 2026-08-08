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

/**
 * Real device screenshots of the live app, taken against real TruckTap
 * data (see the geography backfill work — several of these are the same
 * trucks: Güero's Salsa, Papa Pasta, Everetts Family Sweets). Source:
 * public/home/screenshots/ — the hero, community, and owner files were
 * all captured at 1440x3088; keep that aspect ratio in mind if any
 * consumer ever sets an explicit width/height instead of using `fill`.
 */
export const screenshots = {
  heroDiscover: { file: "hero-discover.jpg", alt: "TruckTap discovery map showing food trucks live across Hardin County, Kentucky" },
  heroProfile: { file: "hero-profile.jpg", alt: "Güero's Salsa and More truck profile on TruckTap, open now with a 5-star rating" },
  heroMenu: { file: "hero-menu.jpg", alt: "Sonny Boys Backyard truck profile showing barbecue sandwiches" },
  communityMap: { file: "community-map.jpg", alt: "TruckTap map view showing food truck locations across the region" },
  communityProfile: { file: "community-profile.jpg", alt: "Papa Pasta truck profile on TruckTap with customer reviews" },
  communityMenu: { file: "community-menu.jpg", alt: "Everetts Family Sweets and More menu items with prices on TruckTap" },
  ownerDashboard: { file: "owner-dashboard.jpg", alt: "TruckTap owner dashboard showing the Go Live button and today's opportunities" },
} satisfies Record<string, AppScreenshot>;

/**
 * The 10-screenshot App Store marketing set — each image already has its
 * own headline/subcopy baked in (that's the point: these are the exact
 * assets submitted to the App Store and Google Play), so consumers should
 * show them near-verbatim rather than captioning them again.
 */
export const storeScreenshots: AppScreenshot[] = [
  { file: "store/10-your-next-favorite-meal.png", alt: "Your Next Favorite Meal Awaits — dozens of trucks, open right now" },
  { file: "store/01-find-food-trucks.png", alt: "Find Food Trucks Near You — real trucks, real locations, updated live" },
  { file: "store/02-know-whos-open.png", alt: "Know Who's Open Now — see live status before you drive over" },
  { file: "store/03-explore-menus.png", alt: "Explore Menus Before You Go — browse dishes and prices ahead of time" },
  { file: "store/04-eat-with-confidence.png", alt: "Eat With Confidence — real reviews from real regulars" },
  { file: "store/05-see-whats-cooking.png", alt: "See What's Cooking — photos straight from the truck" },
  { file: "store/06-navigate-one-tap.png", alt: "Navigate With One Tap — turn-by-turn directions, instantly" },
  { file: "store/07-never-miss-favorites.png", alt: "Never Miss Your Favorites — see upcoming stops before they roll out" },
  { file: "store/08-always-up-to-date.png", alt: "Always Up To Date — owners update hours and location in real time" },
  { file: "store/09-discover-local-favorites.png", alt: "Discover Local Favorites — new trucks and hidden gems near you" },
];

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
