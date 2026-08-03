import { describe, expect, it, vi } from "vitest";
import { getRollingTrucks, getRollingTrucksOrFallback } from "./rolling-trucks";
import { fallbackRollingTrucks } from "./home-data";
import { createSupabaseServerClient } from "./supabase/server";

vi.mock("./supabase/server", () => ({
  createSupabaseServerClient: vi.fn(),
}));

// Matches the fake NEXT_PUBLIC_SUPABASE_URL set in vitest.setup.ts.
const REAL_LOGO = "https://test-project.supabase.co/storage/v1/object/public/truck-images/abc/logo-1.jpg";

/**
 * Builds a `.from("public_trucks").select(...).order(...).returns()` chain
 * that resolves to `{ data, error }` — `.returns<T>()` is a type-only
 * no-op in supabase-js, so it just needs to stay chainable/awaitable.
 */
function mockPublicTrucksQuery(data: unknown, error: { message: string } | null = null) {
  const result = Object.assign(Promise.resolve({ data, error }), {
    returns: () => result,
  });
  const order = vi.fn(() => result);
  const select = vi.fn(() => ({ order }));
  const from = vi.fn(() => ({ select }));
  vi.mocked(createSupabaseServerClient).mockReturnValue({
    from,
  } as unknown as ReturnType<typeof createSupabaseServerClient>);
  return { from, select, order };
}

describe("getRollingTrucks", () => {
  it("maps a successful query into the marquee shape", async () => {
    mockPublicTrucksQuery([
      {
        id: "t1",
        slug: "smoky-wheels-bbq",
        name: "Smoky Wheels BBQ",
        logo: REAL_LOGO,
        is_verified: true,
        updated_at: "2026-08-01T00:00:00.000Z",
      },
    ]);

    const trucks = await getRollingTrucks();

    expect(trucks).toEqual([
      {
        id: "t1",
        slug: "smoky-wheels-bbq",
        name: "Smoky Wheels BBQ",
        logo: REAL_LOGO,
        is_verified: true,
        updated_at: "2026-08-01T00:00:00.000Z",
      },
    ]);
  });

  it("queries only public_trucks with the explicit marquee column list", async () => {
    const { from, select } = mockPublicTrucksQuery([]);

    await getRollingTrucks();

    expect(from).toHaveBeenCalledWith("public_trucks");
    expect(select).toHaveBeenCalledWith("id, slug, name, logo, is_verified, updated_at");
  });

  it("excludes rows with a missing logo", async () => {
    mockPublicTrucksQuery([
      { id: "t1", slug: "no-logo", name: "No Logo Truck", logo: null, is_verified: false, updated_at: "2026-08-01T00:00:00.000Z" },
    ]);

    expect(await getRollingTrucks()).toEqual([]);
  });

  it("excludes rows whose logo is on an unrenderable host (e.g. a shared stock placeholder)", async () => {
    mockPublicTrucksQuery([
      {
        id: "t1",
        slug: "placeholder-logo",
        name: "Placeholder Logo Truck",
        logo: "https://images.unsplash.com/photo-123?w=200",
        is_verified: false,
        updated_at: "2026-08-01T00:00:00.000Z",
      },
    ]);

    expect(await getRollingTrucks()).toEqual([]);
  });

  it("excludes rows with a malformed logo URL", async () => {
    mockPublicTrucksQuery([
      { id: "t1", slug: "bad-url", name: "Bad URL Truck", logo: "not a url", is_verified: false, updated_at: "2026-08-01T00:00:00.000Z" },
    ]);

    expect(await getRollingTrucks()).toEqual([]);
  });

  it("throws when the query fails", async () => {
    mockPublicTrucksQuery(null, { message: "connection refused" });

    await expect(getRollingTrucks()).rejects.toThrow("connection refused");
  });
});

describe("getRollingTrucksOrFallback", () => {
  it("returns live trucks when the query succeeds", async () => {
    mockPublicTrucksQuery([
      { id: "t1", slug: "smoky-wheels-bbq", name: "Smoky Wheels BBQ", logo: REAL_LOGO, is_verified: true, updated_at: "2026-08-01T00:00:00.000Z" },
    ]);

    const result = await getRollingTrucksOrFallback();

    expect(result.source).toBe("live");
    expect(result.trucks).toHaveLength(1);
  });

  it("falls back to the static list when the query fails", async () => {
    mockPublicTrucksQuery(null, { message: "connection refused" });

    const result = await getRollingTrucksOrFallback();

    expect(result.source).toBe("fallback");
    expect(result.trucks).toBe(fallbackRollingTrucks);
  });

  it("falls back to the static list when the Supabase client itself throws (e.g. missing env vars)", async () => {
    vi.mocked(createSupabaseServerClient).mockImplementation(() => {
      throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.");
    });

    const result = await getRollingTrucksOrFallback();

    expect(result.source).toBe("fallback");
    expect(result.trucks).toBe(fallbackRollingTrucks);
  });
});
