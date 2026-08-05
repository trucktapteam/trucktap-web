import { describe, expect, it } from "vitest";
import { formatDateTime, getActiveAnnouncements, getUpcomingStops, isAnnouncementActive } from "./format";
import { makeTruck } from "./test-fixtures";

const NOW = new Date("2026-08-02T12:00:00.000Z");

describe("formatDateTime", () => {
  // Regression test for a real production hydration bug: UpcomingStopsSection
  // is a Client Component, so Next renders it once on the server and again
  // in the browser during hydration. Without an explicit `timeZone`,
  // `toLocaleString` resolves the *runtime's own* zone — the server (e.g.
  // Vercel, UTC) and a visitor's browser (whatever zone they're in) can
  // legitimately disagree, producing two different strings for the same
  // instant and a guaranteed React hydration mismatch (error #418).
  // Confirmed live: production served "3:00 PM" server-side but hydrated to
  // "11:00 AM" in an America/New_York browser for the same stop.
  it("with an explicit timeZone, is deterministic regardless of the caller's own zone", () => {
    expect(formatDateTime("2026-08-05T15:00:00.000Z", "UTC")).toBe("Wed, Aug 5, 3:00 PM");
  });

  it("without a timeZone, resolves the ambient runtime zone (the deliberate post-mount behavior)", () => {
    // No explicit assertion on the resulting hour here — the point is that
    // this call path exists and is intentionally zone-sensitive; asserting
    // a specific hour would just hardcode this test's own machine's zone.
    // UpcomingStopsSection.test.tsx exercises the actual mount-driven
    // switch between this and the UTC-forced call above.
    expect(formatDateTime("2026-08-05T15:00:00.000Z")).toMatch(/^Wed, Aug 5, \d{1,2}:\d{2} [AP]M$/);
  });
});

// This policy must match the Expo app's own getAnnouncementExpiresAt /
// isAnnouncementActive (contexts/AppContext.tsx) exactly — the site and
// the app rendering different things for the same truck is the bug, not
// a style choice. Confirmed in production: Güero's Salsa and More has a
// grand-opening announcement from 2026-05-30 with no `expires_at` at all
// (created before that field existed) — the old web logic treated a
// missing `expires_at` as "never expires" and showed it indefinitely; the
// real app policy has always fallen back to 7 days after `timestamp`,
// which is long past for that post.
describe("isAnnouncementActive", () => {
  it("is active with time to spare before an explicit expires_at", () => {
    const announcement = { timestamp: NOW.toISOString(), expires_at: "2026-08-02T18:00:00.000Z" };
    expect(isAnnouncementActive(announcement, NOW)).toBe(true);
  });

  it("is inactive once an explicit expires_at has passed", () => {
    const announcement = { timestamp: NOW.toISOString(), expires_at: "2026-08-01T00:00:00.000Z" };
    expect(isAnnouncementActive(announcement, NOW)).toBe(false);
  });

  it("is inactive at the exact expires_at instant (the boundary is exclusive)", () => {
    const expiresAt = "2026-08-02T18:00:00.000Z";
    expect(isAnnouncementActive({ timestamp: NOW.toISOString(), expires_at: expiresAt }, new Date(expiresAt))).toBe(
      false
    );
  });

  it("is active one millisecond before the exact expires_at instant", () => {
    const expiresAt = new Date("2026-08-02T18:00:00.000Z");
    const oneMsBefore = new Date(expiresAt.getTime() - 1);
    expect(isAnnouncementActive({ timestamp: NOW.toISOString(), expires_at: expiresAt.toISOString() }, oneMsBefore)).toBe(
      true
    );
  });

  it("falls back to 7 days after timestamp when expires_at is missing — a recent post is still active", () => {
    const announcement = { timestamp: NOW.toISOString() };
    const threeDaysLater = new Date(NOW.getTime() + 3 * 24 * 60 * 60 * 1000);
    expect(isAnnouncementActive(announcement, threeDaysLater)).toBe(true);
  });

  it("falls back to 7 days after timestamp when expires_at is missing — an old post (the Güero's case) is expired", () => {
    const announcement = { timestamp: "2026-05-30T20:02:26.891Z" }; // real production timestamp, no expires_at
    const productionNow = new Date("2026-08-05T04:32:17.951Z"); // real production "now" at investigation time
    expect(isAnnouncementActive(announcement, productionNow)).toBe(false);
  });

  it("falls back to 7 days after timestamp when expires_at fails to parse", () => {
    const announcement = { timestamp: NOW.toISOString(), expires_at: "not a real date" };
    const threeDaysLater = new Date(NOW.getTime() + 3 * 24 * 60 * 60 * 1000);
    const eightDaysLater = new Date(NOW.getTime() + 8 * 24 * 60 * 60 * 1000);
    expect(isAnnouncementActive(announcement, threeDaysLater)).toBe(true);
    expect(isAnnouncementActive(announcement, eightDaysLater)).toBe(false);
  });

  // Safest behavior for data too broken to date at all: never eternally
  // active. A missing/unparseable `timestamp` (with no expires_at either)
  // resolves to the Unix epoch — already in the past for any real `now`.
  it("treats a missing or malformed timestamp (with no expires_at) as already expired, never as eternally active", () => {
    expect(isAnnouncementActive({ timestamp: "" }, NOW)).toBe(false);
    expect(isAnnouncementActive({ timestamp: "not a real date" }, NOW)).toBe(false);
  });
});

describe("getActiveAnnouncements", () => {
  it("includes an announcement that expires in the future", () => {
    const truck = makeTruck({
      announcements: [
        {
          id: "a1",
          message: "still active",
          timestamp: NOW.toISOString(),
          expires_at: "2026-08-02T18:00:00.000Z",
        },
      ],
    });
    expect(getActiveAnnouncements(truck, NOW)).toHaveLength(1);
  });

  it("excludes an announcement that already expired — must never display", () => {
    const truck = makeTruck({
      announcements: [
        {
          id: "a1",
          message: "expired yesterday",
          timestamp: NOW.toISOString(),
          expires_at: "2026-08-01T00:00:00.000Z",
        },
      ],
    });
    expect(getActiveAnnouncements(truck, NOW)).toEqual([]);
  });

  // Regression test for the real Güero's Salsa and More bug: no
  // `expires_at` must not mean "shows forever."
  it("excludes an old announcement with no expires_at once its 7-day fallback window has passed", () => {
    const truck = makeTruck({
      announcements: [
        { id: "a1", message: "grand opening soon!", timestamp: "2026-05-30T20:02:26.891Z" },
      ],
    });
    expect(getActiveAnnouncements(truck, new Date("2026-08-05T04:32:17.951Z"))).toEqual([]);
  });

  it("returns an empty array when there are no announcements", () => {
    expect(getActiveAnnouncements(makeTruck(), NOW)).toEqual([]);
  });
});

describe("getUpcomingStops", () => {
  it("excludes a cancelled stop even if it's scheduled in the future", () => {
    const truck = makeTruck({
      upcomingStops: [
        {
          id: "s1",
          starts_at: "2026-08-05T00:00:00.000Z",
          ends_at: "2026-08-05T04:00:00.000Z",
          location_text: "Somewhere",
          status: "cancelled",
        },
      ],
    });
    expect(getUpcomingStops(truck, NOW)).toEqual([]);
  });

  it("excludes a completed stop even if its end time is in the future", () => {
    const truck = makeTruck({
      upcomingStops: [
        {
          id: "s1",
          starts_at: "2026-08-05T00:00:00.000Z",
          ends_at: "2026-08-05T04:00:00.000Z",
          location_text: "Somewhere",
          status: "completed",
        },
      ],
    });
    expect(getUpcomingStops(truck, NOW)).toEqual([]);
  });

  it("excludes a stop that has already ended — past stops must never display", () => {
    const truck = makeTruck({
      upcomingStops: [
        {
          id: "s1",
          starts_at: "2026-07-30T00:00:00.000Z",
          ends_at: "2026-07-30T04:00:00.000Z",
          location_text: "Old spot",
          status: "scheduled",
        },
      ],
    });
    expect(getUpcomingStops(truck, NOW)).toEqual([]);
  });

  it("includes scheduled, delayed, and sold_out stops that haven't ended yet", () => {
    const truck = makeTruck({
      upcomingStops: [
        {
          id: "s1",
          starts_at: "2026-08-05T00:00:00.000Z",
          ends_at: "2026-08-05T04:00:00.000Z",
          location_text: "A",
          status: "scheduled",
        },
        {
          id: "s2",
          starts_at: "2026-08-06T00:00:00.000Z",
          ends_at: "2026-08-06T04:00:00.000Z",
          location_text: "B",
          status: "delayed",
        },
        {
          id: "s3",
          starts_at: "2026-08-07T00:00:00.000Z",
          ends_at: "2026-08-07T04:00:00.000Z",
          location_text: "C",
          status: "sold_out",
        },
      ],
    });
    expect(getUpcomingStops(truck, NOW).map((s) => s.id)).toEqual(["s1", "s2", "s3"]);
  });

  it("returns an empty array when there are no stops", () => {
    expect(getUpcomingStops(makeTruck(), NOW)).toEqual([]);
  });
});
