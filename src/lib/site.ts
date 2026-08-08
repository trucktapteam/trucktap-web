/**
 * The canonical public URL for this site. Every metadataBase, Open Graph,
 * structured-data, robots.txt, and sitemap URL is built from this — not
 * hardcoded at the call site — so a future domain change only touches one
 * place. Not the same thing as `TRUCKTAP_PUBLIC_WEB_BASE_URL` in
 * truck-share.ts, which reproduces the Expo app's QR/deep-link contract
 * verbatim and is intentionally not shared with this file.
 */
export const SITE_URL = "https://gettrucktap.com";
