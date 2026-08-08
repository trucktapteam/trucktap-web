import { describe, expect, it, vi } from "vitest";
import {
  buildCityMetadata,
  buildGeographySummaries,
  buildStateMetadata,
  findQualifyingCity,
  findQualifyingState,
  getGeographySummaries,
  qualifyingCities,
  qualifyingStates,
  type GeographyRow,
  type StateGeographySummary,
} from "./geography";
import { createSupabaseServerClient } from "./supabase/server";

vi.mock("./supabase/server", () => ({
  createSupabaseServerClient: vi.fn(),
}));

function row(overrides: Partial<GeographyRow> = {}): GeographyRow {
  return {
    home_state: "KY",
    home_state_slug: "kentucky",
    home_city: "Elizabethtown",
    home_city_slug: "elizabethtown-ky",
    ...overrides,
  };
}

describe("buildGeographySummaries", () => {
  it("groups trucks into per-state, per-city counts", () => {
    const summaries = buildGeographySummaries([
      row({ home_city: "Elizabethtown", home_city_slug: "elizabethtown-ky" }),
      row({ home_city: "Elizabethtown", home_city_slug: "elizabethtown-ky" }),
      row({ home_city: "Louisville", home_city_slug: "louisville-ky" }),
      row({ home_state: "IL", home_state_slug: "illinois", home_city: "Dwight", home_city_slug: "dwight-il" }),
    ]);

    const kentucky = summaries.find((s) => s.stateSlug === "kentucky")!;
    expect(kentucky.count).toBe(3);
    expect(kentucky.stateName).toBe("Kentucky");
    expect(kentucky.cities.find((c) => c.citySlug === "elizabethtown-ky")?.count).toBe(2);
    expect(kentucky.cities.find((c) => c.citySlug === "louisville-ky")?.count).toBe(1);

    const illinois = summaries.find((s) => s.stateSlug === "illinois")!;
    expect(illinois.count).toBe(1);
    expect(illinois.stateName).toBe("Illinois");
  });

  it("returns an empty array for no rows", () => {
    expect(buildGeographySummaries([])).toEqual([]);
  });

  it("carries the state abbreviation and name onto each city summary", () => {
    const [kentucky] = buildGeographySummaries([row()]);
    const [city] = kentucky.cities;
    expect(city.stateAbbreviation).toBe("KY");
    expect(city.stateName).toBe("Kentucky");
  });
});

describe("qualifyingStates / qualifyingCities", () => {
  const summaries = buildGeographySummaries([
    ...Array.from({ length: 3 }, () => row({ home_city: "Elizabethtown", home_city_slug: "elizabethtown-ky" })),
    row({ home_city: "Radcliff", home_city_slug: "radcliff-ky" }),
    row({ home_city: "Radcliff", home_city_slug: "radcliff-ky" }),
    row({ home_state: "CO", home_state_slug: "colorado", home_city: "Idaho Springs", home_city_slug: "idaho-springs-co" }),
  ]);
  // Kentucky: 5 trucks total (3 Elizabethtown + 2 Radcliff) -> qualifies as a state.
  // elizabethtown-ky: 3 -> qualifies as a city. radcliff-ky: 2 -> qualifies (exactly at threshold).
  // Colorado: 1 truck -> does not qualify as a state; idaho-springs-co: 1 -> does not qualify as a city.

  it("includes a state at or above STATE_MIN_TRUCKS (3), excludes below", () => {
    const states = qualifyingStates(summaries).map((s) => s.stateSlug);
    expect(states).toContain("kentucky");
    expect(states).not.toContain("colorado");
  });

  it("includes a city at or above CITY_MIN_TRUCKS (2), excludes below — including the exact boundary", () => {
    const cities = qualifyingCities(summaries).map((c) => c.citySlug);
    expect(cities).toContain("elizabethtown-ky");
    expect(cities).toContain("radcliff-ky"); // exactly 2 — boundary is inclusive
    expect(cities).not.toContain("idaho-springs-co");
  });
});

describe("findQualifyingState", () => {
  const summaries: StateGeographySummary[] = [
    { stateSlug: "kentucky", stateName: "Kentucky", count: 28, cities: [] },
    { stateSlug: "colorado", stateName: "Colorado", count: 1, cities: [] },
  ];

  it("returns the state when it meets the threshold", () => {
    expect(findQualifyingState(summaries, "kentucky")?.stateName).toBe("Kentucky");
  });

  it("returns null for a real state below the threshold (caller should notFound())", () => {
    expect(findQualifyingState(summaries, "colorado")).toBeNull();
  });

  it("returns null for a slug that doesn't exist at all", () => {
    expect(findQualifyingState(summaries, "nowhere")).toBeNull();
  });
});

describe("findQualifyingCity", () => {
  const summaries: StateGeographySummary[] = [
    {
      stateSlug: "kentucky",
      stateName: "Kentucky",
      count: 9,
      cities: [
        { citySlug: "elizabethtown-ky", cityName: "Elizabethtown", stateSlug: "kentucky", stateName: "Kentucky", stateAbbreviation: "KY", count: 7 },
        { citySlug: "burnside-ky", cityName: "Burnside", stateSlug: "kentucky", stateName: "Kentucky", stateAbbreviation: "KY", count: 1 },
      ],
    },
  ];

  it("returns the city when it meets the threshold", () => {
    expect(findQualifyingCity(summaries, "elizabethtown-ky")?.cityName).toBe("Elizabethtown");
  });

  it("returns null for a real city below the threshold", () => {
    expect(findQualifyingCity(summaries, "burnside-ky")).toBeNull();
  });

  it("returns null for a slug that doesn't exist at all", () => {
    expect(findQualifyingCity(summaries, "nowhere-xx")).toBeNull();
  });
});

describe("buildStateMetadata / buildCityMetadata", () => {
  it("builds a unique title, description, and canonical URL for a state", () => {
    const meta = buildStateMetadata({ stateSlug: "kentucky", stateName: "Kentucky", count: 28, cities: [] });
    expect(meta.title).toBe("Food Trucks in Kentucky");
    expect(meta.description).toContain("Kentucky");
    expect(meta.description).toContain("28 trucks");
    expect(meta.canonicalUrl).toBe("https://gettrucktap.com/state/kentucky");
  });

  it("uses singular 'truck' for a count of exactly one", () => {
    const meta = buildStateMetadata({ stateSlug: "colorado", stateName: "Colorado", count: 1, cities: [] });
    expect(meta.description).toContain("1 truck.");
  });

  it("builds a unique title, description, and canonical URL for a city", () => {
    const meta = buildCityMetadata({
      citySlug: "elizabethtown-ky",
      cityName: "Elizabethtown",
      stateSlug: "kentucky",
      stateName: "Kentucky",
      stateAbbreviation: "KY",
      count: 7,
    });
    expect(meta.title).toBe("Food Trucks in Elizabethtown, KY");
    expect(meta.description).toContain("Elizabethtown, Kentucky");
    expect(meta.canonicalUrl).toBe("https://gettrucktap.com/city/elizabethtown-ky");
  });
});

type TableResult = { data: unknown; error: { message: string } | null };

function makeChain(result: TableResult) {
  const chain = {
    select: vi.fn(() => chain),
    not: vi.fn(() => chain),
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

describe("getGeographySummaries", () => {
  it("queries public_trucks only, filtered to classified rows — never trucks/locations/upcoming_stops", async () => {
    const { from } = mockSupabaseTables({ public_trucks: { data: [row()], error: null } });

    const summaries = await getGeographySummaries();

    expect(from).toHaveBeenCalledWith("public_trucks");
    expect(from).not.toHaveBeenCalledWith("trucks");
    expect(from).not.toHaveBeenCalledWith("locations");
    expect(from).not.toHaveBeenCalledWith("upcoming_stops");
    expect(summaries[0].stateSlug).toBe("kentucky");
  });

  it("throws when the query fails", async () => {
    mockSupabaseTables({ public_trucks: { data: null, error: { message: "connection refused" } } });

    await expect(getGeographySummaries()).rejects.toThrow("connection refused");
  });
});
