import { describe, expect, it, vi } from "vitest";
import { getTruckBySlug, resolveTruckForRoute, toMenuImageUrls } from "./truck-data";
import { createSupabaseServerClient } from "./supabase/server";

vi.mock("./supabase/server", () => ({
  createSupabaseServerClient: vi.fn(),
}));

const BOARD_URL = "https://test-project.supabase.co/storage/v1/object/public/truck-images/abc/menu-board-1.jpg";
const ITEM_URL = "https://test-project.supabase.co/storage/v1/object/public/truck-images/abc/menu-1.jpg";

describe("toMenuImageUrls", () => {
  // Regression test: the owner app's "photograph the whole board" upload
  // flow stores that entry as `"menu-board:" + url`, not a bare URL. Left
  // unparsed, `new URL("menu-board:https://...")` treats "menu-board:"
  // itself as the protocol, isSupabaseStorageImageUrl rejects it, and
  // MenuSection falls back to the decorative gradient instead of the real
  // photographed board — exactly what TestTruck 7/25 was showing.
  it("strips the menu-board: label prefix so the real URL underneath is used", () => {
    expect(toMenuImageUrls([`menu-board:${BOARD_URL}`])).toEqual([BOARD_URL]);
  });

  it("leaves unlabeled entries (individual menu-item photos) unchanged", () => {
    expect(toMenuImageUrls([ITEM_URL])).toEqual([ITEM_URL]);
  });

  it("handles a mix of labeled and unlabeled entries in one array", () => {
    expect(toMenuImageUrls([`menu-board:${BOARD_URL}`, ITEM_URL])).toEqual([BOARD_URL, ITEM_URL]);
  });

  it("returns an empty array for non-array input", () => {
    expect(toMenuImageUrls(null)).toEqual([]);
    expect(toMenuImageUrls(undefined)).toEqual([]);
  });

  it("filters out non-string entries", () => {
    expect(toMenuImageUrls([ITEM_URL, 42, null, { foo: "bar" }])).toEqual([ITEM_URL]);
  });
});

const PAPA_PASTA_ID = "3f7c1a2b-4444-4dfc-89d5-711111111111";
const ARCHIVED_TRUCK_ID = "aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee";

function makePublicTruckRow(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: PAPA_PASTA_ID,
    slug: "papa-pasta",
    name: "Papa Pasta",
    cuisine_type: "Italian",
    description: null,
    bio: null,
    phone: null,
    website: null,
    hero_image: null,
    logo: null,
    gallery_images: [],
    menu_images: [],
    menu_items: [],
    announcements: [],
    is_verified: true,
    is_open: false,
    service_area: null,
    facebook_url: null,
    instagram_url: null,
    tiktok_url: null,
    trust_badges: [],
    last_live_updated_at: null,
    live_started_at: null,
    live_expires_at: null,
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

type TableResult = { data: unknown; error: { message: string } | null };
type TableResolver = (column: string | undefined, value: unknown) => TableResult;

/**
 * Builds a chainable `.select().eq()/.in()/.order()/.maybeSingle()/.returns()`
 * mock that resolves lazily from `resolve(lastColumn, lastValue)` — lets a
 * single table (e.g. `public_trucks`, queried once by slug and, on
 * fallback, again by id) return different results depending on which
 * column the caller actually filtered on.
 */
function makeChain(resolve: TableResolver) {
  let lastColumn: string | undefined;
  let lastValue: unknown;
  const chain = {
    select: vi.fn(() => chain),
    eq: vi.fn((column: string, value: unknown) => {
      lastColumn = column;
      lastValue = value;
      return chain;
    }),
    in: vi.fn((column: string, value: unknown) => {
      lastColumn = column;
      lastValue = value;
      return chain;
    }),
    is: vi.fn(() => chain),
    order: vi.fn(() => chain),
    returns: vi.fn(() => chain),
    maybeSingle: vi.fn(() => Promise.resolve(resolve(lastColumn, lastValue))),
    then: (onResolve: (r: TableResult) => void, onReject: (e: unknown) => void) =>
      Promise.resolve(resolve(lastColumn, lastValue)).then(onResolve, onReject),
  };
  return chain;
}

function mockSupabaseTables(resolvers: Record<string, TableResolver>) {
  const empty: TableResolver = () => ({ data: null, error: null });
  const from = vi.fn((table: string) => makeChain(resolvers[table] ?? empty));
  vi.mocked(createSupabaseServerClient).mockReturnValue({
    from,
  } as unknown as ReturnType<typeof createSupabaseServerClient>);
  return { from };
}

/** No location, no upcoming stops, no reviews — keeps every scenario below focused on route resolution, not data mapping (already covered elsewhere). */
const NO_RELATED_DATA: Record<string, TableResolver> = {
  locations: () => ({ data: null, error: null }),
  upcoming_stops: () => ({ data: [], error: null }),
  reviews: () => ({ data: [], error: null }),
};

describe("resolveTruckForRoute", () => {
  it("resolves a valid slug directly, with no redirect", async () => {
    mockSupabaseTables({
      public_trucks: (column, value) =>
        column === "slug" && value === "papa-pasta"
          ? { data: makePublicTruckRow(), error: null }
          : { data: null, error: null },
      ...NO_RELATED_DATA,
    });

    const result = await resolveTruckForRoute("papa-pasta");

    expect(result?.truck.slug).toBe("papa-pasta");
    expect(result?.redirectToSlug).toBeNull();
  });

  it("falls back to a valid legacy UUID when no slug matches", async () => {
    mockSupabaseTables({
      public_trucks: (column, value) =>
        column === "id" && value === PAPA_PASTA_ID
          ? { data: makePublicTruckRow(), error: null }
          : { data: null, error: null },
      ...NO_RELATED_DATA,
    });

    const result = await resolveTruckForRoute(PAPA_PASTA_ID);

    expect(result?.truck.id).toBe(PAPA_PASTA_ID);
  });

  it("redirects a legacy UUID lookup to the truck's slug", async () => {
    mockSupabaseTables({
      public_trucks: (column, value) =>
        column === "id" && value === PAPA_PASTA_ID
          ? { data: makePublicTruckRow(), error: null }
          : { data: null, error: null },
      ...NO_RELATED_DATA,
    });

    const result = await resolveTruckForRoute(PAPA_PASTA_ID);

    expect(result?.redirectToSlug).toBe("papa-pasta");
  });

  it("returns null for a malformed id without attempting an id lookup", async () => {
    const { from } = mockSupabaseTables({
      public_trucks: () => ({ data: null, error: null }),
      ...NO_RELATED_DATA,
    });

    const result = await resolveTruckForRoute("not-a-real-uuid");

    expect(result).toBeNull();
    // Only the slug attempt should have queried public_trucks — an
    // invalid UUID must never trigger a second (id) lookup.
    expect(from).toHaveBeenCalledTimes(1);
  });

  it("returns null for a well-formed slug that doesn't exist", async () => {
    mockSupabaseTables({
      public_trucks: () => ({ data: null, error: null }),
      ...NO_RELATED_DATA,
    });

    const result = await resolveTruckForRoute("no-such-truck");

    expect(result).toBeNull();
  });

  it("never resolves an archived/test truck's UUID, even on the id fallback", async () => {
    // public_trucks' own view definition excludes archived/test rows at
    // the row level, so the mock simply reflects that: this truck's id
    // never appears in the view, regardless of which column is queried.
    const { from } = mockSupabaseTables({
      public_trucks: () => ({ data: null, error: null }),
      ...NO_RELATED_DATA,
    });

    const result = await resolveTruckForRoute(ARCHIVED_TRUCK_ID);

    expect(result).toBeNull();
    expect(from).toHaveBeenCalledWith("public_trucks");
    expect(from).not.toHaveBeenCalledWith("trucks");
  });
});

describe("getTruckBySlug", () => {
  it("still resolves by slug directly (unchanged contract)", async () => {
    mockSupabaseTables({
      public_trucks: (column, value) =>
        column === "slug" && value === "papa-pasta"
          ? { data: makePublicTruckRow(), error: null }
          : { data: null, error: null },
      ...NO_RELATED_DATA,
    });

    const truck = await getTruckBySlug("papa-pasta");

    expect(truck?.name).toBe("Papa Pasta");
  });
});
