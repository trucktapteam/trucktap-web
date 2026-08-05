/**
 * Canonical TruckTap app-store listing URLs — the single source every
 * "App Store" / "Google Play" button on the site must link to. Deep-links
 * straight to the TruckTap listing on each store, never the storefront
 * homepage: a customer clicking "App Store" from a truck's profile should
 * land on TruckTap, not have to search for it themselves.
 *
 * Import these two constants everywhere a download button is rendered —
 * do not hardcode `apps.apple.com`/`play.google.com` URLs at the call
 * site. A previous regression (AppDownloadCta.tsx linking to the bare
 * `https://apps.apple.com/` / `https://play.google.com/` homepages
 * instead of these) is exactly what this file exists to prevent from
 * happening again.
 */
export const APP_STORE_URL = "https://apps.apple.com/us/app/trucktap/id6762240100";
export const GOOGLE_PLAY_URL =
  "https://play.google.com/store/apps/details?id=app.rork.trucktap_food_truck_finder_cqgko70&hl=en_US";
