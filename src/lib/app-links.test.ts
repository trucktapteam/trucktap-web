import { describe, expect, it } from "vitest";
import { APP_STORE_URL, GOOGLE_PLAY_URL } from "./app-links";

// Regression test for a real bug: AppDownloadCta.tsx linked to the bare
// App Store / Google Play storefront homepages instead of the TruckTap
// listing. These assertions pin the canonical URLs to the real listing
// (not just "some apple.com/google.com URL"), so a future edit that
// quietly widens them back to a homepage fails loudly.
describe("app-links", () => {
  it("APP_STORE_URL points directly at the TruckTap App Store listing, not the storefront homepage", () => {
    expect(APP_STORE_URL).toBe("https://apps.apple.com/us/app/trucktap/id6762240100");
    expect(APP_STORE_URL).not.toBe("https://apps.apple.com/");
  });

  it("GOOGLE_PLAY_URL points directly at the TruckTap Google Play listing, not the storefront homepage", () => {
    expect(GOOGLE_PLAY_URL).toBe(
      "https://play.google.com/store/apps/details?id=app.rork.trucktap_food_truck_finder_cqgko70&hl=en_US"
    );
    expect(GOOGLE_PLAY_URL).not.toBe("https://play.google.com/");
  });
});
