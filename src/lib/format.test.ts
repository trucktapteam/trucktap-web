import { describe, expect, it } from "vitest";
import { getActiveAnnouncements, getUpcomingStops } from "./format";
import { makeTruck } from "./test-fixtures";

const NOW = new Date("2026-08-02T12:00:00.000Z");

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
