import { describe, expect, it, vi } from "vitest";
import { buildCitySchedule, distanceMiles, getCitySchedule } from "./city-schedule";
import { createSupabaseServerClient } from "./supabase/server";

vi.mock("./supabase/server", () => ({ createSupabaseServerClient: vi.fn() }));

const NOW = new Date("2026-11-02T02:00:00.000Z");

const TRUCKS = [
  { id: "fbomb", slug: "f-bomb-food-trailer-cajun-food", name: "F-Bomb Cajun Poboys" },
  { id: "sunny", slug: "sunny-girl-s-cafe", name: "Sunny Girl's Cafe" },
  { id: "creamery", slug: "the-creamery-cart", name: "The Creamery Cart" },
];

// Times, addresses and coordinates copied from real production rows.
function stop(
  id: string,
  truck_id: string,
  starts_at: string,
  ends_at: string,
  location_text: string,
  latitude: number | null,
  longitude: number | null,
  overrides: Record<string, unknown> = {}
) {
  return {
    id,
    truck_id,
    starts_at,
    ends_at,
    timezone: "America/New_York",
    location_text,
    note: null,
    status: "scheduled" as const,
    latitude,
    longitude,
    ...overrides,
  };
}

const FLYWHEEL = stop("flywheel", "fbomb", "2026-11-05T21:00:00Z", "2026-11-06T00:00:00Z", "Flywheel Brewing", 37.6921, -85.8617);
const PRITCHARD = stop("pritchard", "sunny", "2026-11-07T15:00:00Z", "2026-11-07T19:00:00Z", "Pritchard Community Center", 37.6906, -85.865);
const TRACTOR = stop("tractor", "fbomb", "2026-11-07T15:00:00Z", "2026-11-07T19:00:00Z", "Tractor Supply", 37.7253, -85.8894);
const CREAMERY = stop("creamery", "creamery", "2026-11-07T17:00:00Z", "2026-11-07T21:00:00Z", "4507 N Dixie Hwy", 37.7506, -85.8956);

describe("distanceMiles", () => {
  it("is zero at the same point", () => {
    expect(distanceMiles(37.7, -85.867, 37.7, -85.867)).toBe(0);
  });

  it("matches a known distance: Elizabethtown to Louisville is about 39 miles", () => {
    const miles = distanceMiles(37.7, -85.867, 38.25611, -85.75139);
    expect(miles).toBeGreaterThan(37);
    expect(miles).toBeLessThan(41);
  });
});

describe("buildCitySchedule", () => {
  it("includes stops by where they happen, even for trucks based elsewhere or with no home city", () => {
    const days = buildCitySchedule("elizabethtown-ky", [FLYWHEEL, PRITCHARD, CREAMERY], TRUCKS, NOW);
    expect(days.flatMap((day) => day.stops.map((s) => s.truckName))).toEqual([
      "F-Bomb Cajun Poboys",
      "Sunny Girl's Cafe",
      "The Creamery Cart",
    ]);
  });

  it("uses coordinates, not address text: a matching address far away is out, a blank-city address nearby is in", () => {
    const farButNamed = stop("far", "fbomb", "2026-11-05T21:00:00Z", "2026-11-06T00:00:00Z", "Elizabethtown Rd, Hickory NC", 35.7303, -81.3099);
    const nearNoCity = stop("school", "sunny", "2026-11-06T16:00:00Z", "2026-11-06T18:30:00Z", "Central Hardin High School", 37.6736, -85.9096);
    const days = buildCitySchedule("elizabethtown-ky", [farButNamed, nearNoCity], TRUCKS, NOW);
    expect(days.flatMap((day) => day.stops.map((s) => s.id))).toEqual(["school"]);
  });

  it.each([
    ["Sonora", 37.5221, -85.9022],
    ["Rineyville", 37.7458, -85.9759],
    ["Fort Knox", 37.9117, -85.9407],
    ["Hickory NC", 35.7303, -81.3099],
  ])("leaves out %s from Elizabethtown", (name, latitude, longitude) => {
    const other = stop("x", "sunny", "2026-11-05T21:00:00Z", "2026-11-06T00:00:00Z", name, latitude, longitude);
    expect(buildCitySchedule("elizabethtown-ky", [other], TRUCKS, NOW)).toEqual([]);
  });

  it("groups by local date with correct time labels, sorted by start", () => {
    const days = buildCitySchedule("elizabethtown-ky", [CREAMERY, TRACTOR, FLYWHEEL], TRUCKS, NOW);
    expect(days.map((day) => day.label)).toEqual(["Thu, Nov 5", "Sat, Nov 7"]);
    expect(days[0].stops[0]).toMatchObject({
      truckSlug: "f-bomb-food-trailer-cajun-food",
      timeLabel: "4:00 PM EST – 7:00 PM EST",
      locationText: "Flywheel Brewing",
    });
    expect(days[1].stops.map((s) => s.timeLabel)).toEqual(["10:00 AM EST – 2:00 PM EST", "12:00 PM EST – 4:00 PM EST"]);
  });

  it("keeps an 8:00 PM stop on its local date, not the next UTC date", () => {
    const evening = stop("evening", "fbomb", "2026-11-06T01:00:00Z", "2026-11-06T03:00:00Z", "Flywheel Brewing", 37.6921, -85.8617);
    const [day] = buildCitySchedule("elizabethtown-ky", [evening], TRUCKS, NOW);
    expect(day).toMatchObject({ key: "2026-11-05", label: "Thu, Nov 5" });
    expect(day.stops[0].timeLabel).toBe("8:00 PM EST – 10:00 PM EST");
  });

  it("repeats the date when a stop ends on the next local day", () => {
    const late = stop("late", "fbomb", "2026-11-07T03:00:00Z", "2026-11-07T06:00:00Z", "Flywheel Brewing", 37.6921, -85.8617);
    const [day] = buildCitySchedule("elizabethtown-ky", [late], TRUCKS, NOW);
    expect(day.stops[0].timeLabel).toBe("10:00 PM EST – Sat, Nov 7, 1:00 AM EST");
  });

  it("includes a stop inside 14 days and leaves out one beyond it", () => {
    const inside = stop("inside", "creamery", "2026-11-14T17:00:00Z", "2026-11-14T21:00:00Z", "4507 N Dixie Hwy", 37.7506, -85.8956);
    const outside = stop("outside", "sunny", "2026-11-18T16:00:00Z", "2026-11-18T18:30:00Z", "Kensington Manor", 37.7043, -85.8712);
    const days = buildCitySchedule("elizabethtown-ky", [inside, outside], TRUCKS, NOW);
    expect(days.flatMap((day) => day.stops.map((s) => s.id))).toEqual(["inside"]);
  });

  it("keeps a stop that's under way, and drops one that has ended", () => {
    const underWay = stop("under-way", "fbomb", "2026-11-02T01:00:00Z", "2026-11-02T03:00:00Z", "Flywheel Brewing", 37.6921, -85.8617);
    const ended = stop("ended", "fbomb", "2026-11-01T16:00:00Z", "2026-11-01T20:00:00Z", "Flywheel Brewing", 37.6921, -85.8617);
    const days = buildCitySchedule("elizabethtown-ky", [underWay, ended], TRUCKS, NOW);
    expect(days.flatMap((day) => day.stops.map((s) => s.id))).toEqual(["under-way"]);
  });

  it.each([
    ["cancelled", { status: "cancelled" }],
    ["completed", { status: "completed" }],
    ["no timezone", { timezone: null }],
    ["bad timezone", { timezone: "Not/AZone" }],
    ["no latitude", { latitude: null }],
    ["no longitude", { longitude: null }],
    ["non-public truck", { truck_id: "archived" }],
  ])("leaves out a stop with %s", (_name, overrides) => {
    const row = { ...FLYWHEEL, ...overrides } as typeof FLYWHEEL;
    expect(buildCitySchedule("elizabethtown-ky", [row], TRUCKS, NOW)).toEqual([]);
  });

  it("keeps delayed and sold-out stops, with their status", () => {
    const days = buildCitySchedule("elizabethtown-ky", [{ ...FLYWHEEL, status: "delayed" }], TRUCKS, NOW);
    expect(days[0].stops[0].status).toBe("delayed");
  });

  it("returns nothing for a city with no configured area", () => {
    expect(buildCitySchedule("nowhere-zz", [FLYWHEEL], TRUCKS, NOW)).toEqual([]);
  });

  it("gives identical results whatever zone the server runs in", () => {
    const original = process.env.TZ;
    process.env.TZ = "UTC";
    const utc = buildCitySchedule("elizabethtown-ky", [FLYWHEEL, CREAMERY], TRUCKS, NOW);
    process.env.TZ = "Asia/Tokyo";
    const tokyo = buildCitySchedule("elizabethtown-ky", [FLYWHEEL, CREAMERY], TRUCKS, NOW);
    process.env.TZ = original;
    expect(tokyo).toEqual(utc);
  });

  it("never carries coordinates in its output", () => {
    const output = JSON.stringify(buildCitySchedule("elizabethtown-ky", [FLYWHEEL], TRUCKS, NOW));
    expect(output).not.toContain("37.6921");
  });
});

describe("getCitySchedule", () => {
  function mockTables(stops: unknown[], trucks: unknown[]) {
    const chain = (data: unknown[]) => {
      const c: Record<string, unknown> = {};
      for (const method of ["select", "gt", "lt", "not", "in"]) c[method] = vi.fn(() => c);
      c.returns = vi.fn(() => Promise.resolve({ data, error: null }));
      return c as Record<string, ReturnType<typeof vi.fn>>;
    };
    const chains: Record<string, Record<string, ReturnType<typeof vi.fn>>> = {
      upcoming_stops: chain(stops),
      public_trucks: chain(trucks),
    };
    const from = vi.fn((table: string) => chains[table]);
    vi.mocked(createSupabaseServerClient).mockReturnValue({ from } as unknown as ReturnType<
      typeof createSupabaseServerClient
    >);
    return { from, chains };
  }

  it("reads trucks only from public_trucks and names its columns", async () => {
    const { from, chains } = mockTables([FLYWHEEL], TRUCKS);
    const days = await getCitySchedule("elizabethtown-ky", NOW);

    expect(from).not.toHaveBeenCalledWith("trucks");
    expect(chains.upcoming_stops.select.mock.calls[0][0]).not.toContain("*");
    expect(days[0].stops[0].timeLabel).toBe("4:00 PM EST – 7:00 PM EST");
  });

  it("makes no queries for a city with no configured area", async () => {
    const { from } = mockTables([], []);
    await expect(getCitySchedule("nowhere-zz", NOW)).resolves.toEqual([]);
    expect(from).not.toHaveBeenCalled();
  });
});
