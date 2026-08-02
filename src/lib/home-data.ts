/**
 * Static content for the marketing homepage — mirrors gettrucktap.com
 * (the live GitHub Pages site) as of the rebuild. Kept as data rather than
 * hardcoded JSX so the rolling truck list in particular can be updated
 * without touching component code, without the old site's runtime GitHub
 * API fetch.
 */

export const APP_STORE_URL = "https://apps.apple.com/us/app/trucktap/id6762240100";
export const GOOGLE_PLAY_URL =
  "https://play.google.com/store/apps/details?id=app.rork.trucktap_food_truck_finder_cqgko70&hl=en_US";
export const FACEBOOK_URL = "https://www.facebook.com/profile.php?id=61574337256977";
export const ANTHEM_YOUTUBE_WATCH_URL = "https://youtube.com/shorts/rpr4vHIFAHY?feature=share";
export const ANTHEM_YOUTUBE_EMBED_URL = "https://www.youtube.com/embed/rpr4vHIFAHY";

export type RollingTruck = { file: string; alt: string };

/** Every truck logo currently displayed in the "Already Rolling" marquee. */
export const rollingTrucks: RollingTruck[] = [
  { file: "502-cakery.jpg", alt: "502 Cakery" },
  { file: "acme-chicken-bowls.jpeg", alt: "Acme Chicken Bowls" },
  { file: "bussin-bites.jpg", alt: "Bussin Bites" },
  { file: "f-bomb.jpg", alt: "F-Bomb" },
  { file: "joyces-kitchen.jpg", alt: "Joyce's Kitchen" },
  { file: "mericana.jpg", alt: "Mericana" },
  { file: "sonny-boys.png", alt: "Sonny Boys" },
  { file: "sunny-girls.png", alt: "Sunny Girls" },
  { file: "archies-snowballs.jpg", alt: "Archie's Snowballs" },
  { file: "backyard-bites.jpg", alt: "Backyard Bites" },
  { file: "balco-funnels.jpg", alt: "Balco Funnels" },
  { file: "big-papa-jakes.jpg", alt: "Big Papa Jake's" },
  { file: "cupcake-caboose.jpg", alt: "Cupcake Caboose" },
  { file: "drop-it-like-its-tot.jpg", alt: "Drop It Like It's Tot" },
  { file: "el-taco-rico.png", alt: "El Taco Rico" },
  { file: "everetts-sweets.jpg", alt: "Everett's Sweets" },
  { file: "exqueeze-me.jpg", alt: "Exqueeze Me" },
  { file: "get-sauced.jpg", alt: "Get Sauced" },
  { file: "gueros-salsa.png", alt: "Guero's Salsa" },
  { file: "hillbilly-haven.png", alt: "Hillbilly Haven" },
  { file: "ice-ice-shavy.jpg", alt: "Ice Ice Shavy" },
  { file: "its-forking-good.jpg", alt: "It's Forking Good" },
  { file: "j-mos.jpg", alt: "J Mo's" },
  { file: "miss-steaks.jpg", alt: "Miss Steaks" },
  { file: "momma-rose.jpg", alt: "Momma Rose" },
  { file: "oktoberfeast.jpg", alt: "Oktoberfeast" },
  { file: "papa-pasta.jpg", alt: "Papa Pasta" },
  { file: "pelons-tacos.jpg", alt: "Pelon's Tacos" },
  { file: "pico-de-gallo.png", alt: "Pico de Gallo" },
  { file: "poppys-dogs.jpg", alt: "Poppy's Dogs" },
  { file: "quench-lemonade.jpg", alt: "Quench Lemonade" },
  { file: "r-and-b-bbq.png", alt: "R&B BBQ" },
  { file: "smash-n-roll.jpg", alt: "Smash N Roll" },
  { file: "sno-bros.jpg", alt: "Sno Bros" },
  { file: "streets-gyros.jpg", alt: "Streets Gyros" },
  { file: "terrie-kays.jpg", alt: "Terrie Kay's" },
  { file: "the-cooking-leprechaun.jpg", alt: "The Cooking Leprechaun" },
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
