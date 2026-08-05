import { describe, expect, it } from "vitest";
import { formatDateTime, getActiveAnnouncements, getUpcomingStops } from "./format";
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

describe("getActiveAnnouncements", () => {
  it("includes an announcement with no expiry", () => {
    const truck = makeTruck({
      announcements: [{ id: "a1", message: "no expiry", timestamp: NOW.toISOString() }],
    });
    expect(getActiveAnnouncements(truck, NOW)).toHaveLength(1);
  });

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
