/**
 * Reproduces the Expo app's existing truck deep-link contract
 * (lib/truckShare.ts's getTruckShareUrl, used by both app/(truck)/qr.tsx
 * and app/(truck)/poster.tsx) so the web-native QR poster encodes exactly
 * the same destination the app's own QR/poster screens already do — the
 * public base URL plus `/truck/<truck id>` (the row's UUID, not the slug).
 * Not this repo's route contract to redefine; reproduced verbatim.
 */
const TRUCKTAP_PUBLIC_WEB_BASE_URL = "https://gettrucktap.com";

export function getTruckQrPayload(truckId: string): string {
  return `${TRUCKTAP_PUBLIC_WEB_BASE_URL}/truck/${encodeURIComponent(truckId)}`;
}
