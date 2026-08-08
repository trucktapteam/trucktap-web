import { describe, expect, it, vi } from "vitest";
import { getDirectoryTrucks, rankDirectoryTrucks } from "./trucks-directory";
import { createSupabaseServerClient } from "./supabase/server";
import { makeDirectoryTruckCard as makeCard } from "./test-fixtures";

vi.mock("./supabase/server", () => ({
  createSupabaseServerClient: vi.fn(),
}));

describe("rankDirectoryTrucks", () => {
  it("puts live trucks before upcoming, and upcoming before ordinary", () => {
    const ordinary = makeCard({ id: "a", name: "A" });
    const upcoming = makeCard({
      id: "b",
      name: "B",
      tier: "upcoming",
      nextStop: { startsAt: "2026-08-10T00:00:00.000Z", whenLabel: "x", locationText: "y" },
    });
    const live = makeCard({ id: "c", name: "C", tier: "live" });

    expect(rankDirectoryTrucks([ordinary, upcoming, live]).map((t) => t.id)).toEqual(["c", "b", "a"]);
  });

  it("sorts live trucks by most-recently-confirmed first", () => {
    const older = makeCard({ id: "old", tier: "live", lastLiveUpdatedAt: "2026-08-01T00:00:00.000Z" });
    const newer = makeCard({ id: "new", tier: "live", lastLiveUpdatedAt: "2026-08-08T00:00:00.000Z" });

    expect(rankDirectoryTrucks([older, newer]).map((t) => t.id)).toEqual(["new", "old"]);
  });

  it("sorts upcoming trucks by soonest stop first", () => {
    const later = makeCard({
      id: "later",
      tier: "upcoming",
      nextStop: { startsAt: "2026-08-15T00:00:00.000Z", whenLabel: "x", locationText: "y" },
    });
    const sooner = makeCard({
      id: "sooner",
      tier: "upcoming",
      nextStop: { startsAt: "2026-08-09T00:00:00.000Z", whenLabel: "x", locationText: "y" },
    });

    expect(rankDirectoryTrucks([later, sooner]).map((t) => t.id)).toEqual(["sooner", "later"]);
  });

  // The reliability rule: a truck that has never used TruckTap must never
  // outrank one with real (even old) activity.
  it("within the ordinary tier, a truck with real history always outranks one that has never gone live", () => {
    const neverLive = makeCard({ id: "never", name: "Zeta", lastLiveUpdatedAt: null });
    const recentlyLive = makeCard({ id: "recent", name: "Alpha", lastLiveUpdatedAt: "2026-08-01T00:00:00.000Z" });

    expect(rankDirectoryTrucks([neverLive, recentlyLive]).map((t) => t.id)).toEqual(["recent", "never"]);
  });

  it("breaks ties among never-live trucks alphabetically, not by any fabricated signal", () => {
    const zeta = makeCard({ id: "z", name: "Zeta Truck" });
    const alpha = makeCard({ id: "a", name: "Alpha Truck" });

    expect(rankDirectoryTrucks([zeta, alpha]).map((t) => t.id)).toEqual(["a", "z"]);
  });

  it("does not mutate the input array", () => {
    const list = [makeCard({ id: "a", name: "B" }), makeCard({ id: "b", name: "A" })];
    const original = [...list];

    rankDirectoryTrucks(list);

    expect(list).toEqual(original);
  });
});

type TableResult = { data: unknown; error: { message: string } | null };

function makeChain(result: TableResult) {
  const chain = {
    select: vi.fn(() => chain),
    in: vi.fn(() => chain),
    order: vi.fn(() => chain),
    returns: vi.fn(() => chain),
    then: (onResolve: (r: TableResult) => void, onReject: (e: unknown) => void) =>
      Promise.resolve(result).then(onResolve, onReject),
  };
  return chain;
}

function mockSupabaseTables(resolvers: Record<string, TableResult>) {
  const from = vi.fn((table: string) => makeChain(resolvers[table] ?? { data: [], error: null }));
  vi.mocked(createSupabaseServerClient).mockReturnValue({
    from,
  } as unknown as ReturnType<typeof createSupabaseServerClient>);
  return { from };
}

const NOW = new Date("2026-08-08T12:00:00.000Z");

function makeTruckRow(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: "t1",
    slug: "papa-pasta",
    name: "Papa Pasta",
    cuisine_type: "Italian",
    hero_image: null,
    logo: null,
    is_verified: false,
    is_open: false,
    service_area: null,
    last_live_updated_at: null,
    live_started_at: null,
    live_expires_at: null,
    ...overrides,
  };
}

describe("getDirectoryTrucks", () => {
  it("queries public_trucks only — never the unrestricted base trucks table", async () => {
    const { from } = mockSupabaseTables({ public_trucks: { data: [], error: null } });

    await getDirectoryTrucks(NOW);

    expect(from).toHaveBeenCalledWith("public_trucks");
    expect(from).not.toHaveBeenCalledWith("trucks");
  });

  it("marks a truck live when is_open and live_expires_at is in the future, using the sanitized service area", async () => {
    mockSupabaseTables({
      public_trucks: {
        data: [
          makeTruckRow({
            is_open: true,
            service_area: "6544, 2nd Dragoons Road, Fort Knox, Kentucky",
            last_live_updated_at: "2026-08-08T11:00:00.000Z",
            live_started_at: "2026-08-08T11:00:00.000Z",
            live_expires_at: "2026-08-08T23:00:00.000Z",
          }),
        ],
        error: null,
      },
      upcoming_stops: { data: [], error: null },
    });

    const [truck] = await getDirectoryTrucks(NOW);

    expect(truck.tier).toBe("live");
    expect(truck.freshnessLabel).toMatch(/Went live/);
    expect(truck.basedNear).toBe("Fort Knox, KY");
  });

  it("treats is_open=true with an already-expired live_expires_at as not live (the Discovery lag rule)", async () => {
    mockSupabaseTables({
      public_trucks: {
        data: [makeTruckRow({ is_open: true, live_started_at: "2026-08-07T00:00:00.000Z", live_expires_at: "2026-08-08T00:00:00.000Z" })],
        error: null,
      },
      upcoming_stops: { data: [], error: null },
    });

    const [truck] = await getDirectoryTrucks(NOW);

    expect(truck.tier).not.toBe("live");
  });

  it("classifies a non-live truck with a real future upcoming stop as 'upcoming'", async () => {
    mockSupabaseTables({
      public_trucks: { data: [makeTruckRow()], error: null },
      upcoming_stops: {
        data: [
          {
            id: "s1",
            truck_id: "t1",
            starts_at: "2026-08-10T00:00:00.000Z",
            ends_at: "2026-08-10T04:00:00.000Z",
            location_text: "Farmers Market",
            note: null,
            status: "scheduled",
            event_image_url: null,
          },
        ],
        error: null,
      },
    });

    const [truck] = await getDirectoryTrucks(NOW);

    expect(truck.tier).toBe("upcoming");
    expect(truck.nextStop).toEqual({
      startsAt: "2026-08-10T00:00:00.000Z",
      whenLabel: expect.any(String),
      locationText: "Farmers Market",
    });
  });

  it("ignores a cancelled stop and falls back to 'ordinary'", async () => {
    mockSupabaseTables({
      public_trucks: { data: [makeTruckRow()], error: null },
      upcoming_stops: {
        data: [
          {
            id: "s1",
            truck_id: "t1",
            starts_at: "2026-08-10T00:00:00.000Z",
            ends_at: "2026-08-10T04:00:00.000Z",
            location_text: "Farmers Market",
            note: null,
            status: "cancelled",
            event_image_url: null,
          },
        ],
        error: null,
      },
    });

    const [truck] = await getDirectoryTrucks(NOW);

    expect(truck.tier).toBe("ordinary");
    expect(truck.nextStop).toBeNull();
  });

  it("throws when the trucks query fails", async () => {
    mockSupabaseTables({ public_trucks: { data: null, error: { message: "connection refused" } } });

    await expect(getDirectoryTrucks(NOW)).rejects.toThrow("connection refused");
  });

  it("throws when the upcoming_stops query fails", async () => {
    mockSupabaseTables({
      public_trucks: { data: [makeTruckRow()], error: null },
      upcoming_stops: { data: null, error: { message: "boom" } },
    });

    await expect(getDirectoryTrucks(NOW)).rejects.toThrow("boom");
  });
});
