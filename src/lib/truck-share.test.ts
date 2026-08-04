import { describe, expect, it } from "vitest";
import { getTruckQrPayload } from "./truck-share";

describe("getTruckQrPayload", () => {
  it("matches the exact deep-link contract the Expo app's QR/poster screens already use", () => {
    // lib/truckShare.ts's getTruckShareUrl in the Expo app: base URL +
    // `/truck/<truck id>` — the row's id, not the slug.
    expect(getTruckQrPayload("cb02b35a-bc50-4dfc-9d57-3fd5ee1af25a")).toBe(
      "https://gettrucktap.com/truck/cb02b35a-bc50-4dfc-9d57-3fd5ee1af25a"
    );
  });

  it("URL-encodes the id the same way the app's getTruckAppPath does", () => {
    expect(getTruckQrPayload("weird id/with slash")).toBe(
      "https://gettrucktap.com/truck/weird%20id%2Fwith%20slash"
    );
  });
});
