import { describe, expect, it } from "vitest";
import { makeTruck } from "./test-fixtures";
import {
  toGallerySectionInfo,
  toMenuSectionInfo,
  toQuickActionsInfo,
  toStatusBarTruck,
  toTruckHeroInfo,
  toTruckQrPosterInfo,
  toUpcomingStopsInfo,
} from "./truck-view-models";

// Real production shape: an exact street-address service_area, and a
// currentLocation whose label/lat/long point at an equally exact
// coordinate (a last-known-LIVE location, which offline can be a
// commissary or home base — see location.ts and StatusBar.tsx).
const SENSITIVE_TRUCK = makeTruck({
  service_area: "1850, Ring Road, Elizabethtown, Kentucky",
  currentLocation: {
    label: "1251, Ring Road, Elizabethtown, Kentucky",
    latitude: 37.7228032,
    longitude: -85.8952234,
  },
});

const SENSITIVE_SUBSTRINGS = ["Ring Road", "37.7228032", "-85.8952234"];

const CLIENT_COMPONENT_BUILDERS = [
  ["TruckHero", toTruckHeroInfo],
  ["QuickActions", toQuickActionsInfo],
  ["UpcomingStopsSection", toUpcomingStopsInfo],
  ["GallerySection", toGallerySectionInfo],
  ["MenuSection", toMenuSectionInfo],
  ["TruckQrPoster", toTruckQrPosterInfo],
] as const;

// Regression coverage for the privacy fix: Next.js serializes a Client
// Component's entire prop value into the page's RSC hydration payload
// (embedded in the raw HTML) regardless of which fields that component
// actually reads. These view models are the exact objects `page.tsx` hands
// to each Client Component, so asserting on their own shape/serialized
// form is a direct, deterministic proxy for "does this ever reach the
// response" — complementary to the real-browser/production-HTML check
// this change was also verified with (see the task report).
describe("truck view models never carry private location data to Client Components", () => {
  it.each(CLIENT_COMPONENT_BUILDERS)(
    "%s's view model has no currentLocation/service_area field, and its serialized form contains none of the sensitive data",
    (_name, builder) => {
      const info = builder(SENSITIVE_TRUCK);
      const serialized = JSON.stringify(info);

      expect(info).not.toHaveProperty("currentLocation");
      expect(info).not.toHaveProperty("service_area");
      for (const needle of SENSITIVE_SUBSTRINGS) {
        expect(serialized).not.toContain(needle);
      }
    }
  );

  it("still carries no currentLocation for any of them even when the truck is actually LIVE", () => {
    const liveTruck = makeTruck({
      is_open: true,
      live_started_at: "2026-08-04T11:30:00.000Z",
      live_expires_at: "2099-01-01T00:00:00.000Z",
      currentLocation: { label: "Farmers Market", latitude: 1, longitude: 2 },
    });

    for (const [, builder] of CLIENT_COMPONENT_BUILDERS) {
      const info = builder(liveTruck);
      expect(info).not.toHaveProperty("currentLocation");
      expect(JSON.stringify(info)).not.toContain("Farmers Market");
    }
  });
});

describe("StatusBar's view model — the one deliberate exception", () => {
  it("is the sole view model that carries currentLocation, passed through exactly as-is", () => {
    const info = toStatusBarTruck(SENSITIVE_TRUCK);
    expect(info.currentLocation).toEqual(SENSITIVE_TRUCK.currentLocation);
  });

  it("still carries the raw service_area (StatusBar sanitizes it itself at render time via formatBasedNearLocation)", () => {
    const info = toStatusBarTruck(SENSITIVE_TRUCK);
    expect(info.service_area).toBe(SENSITIVE_TRUCK.service_area);
  });
});
