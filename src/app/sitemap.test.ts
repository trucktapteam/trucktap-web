import { describe, expect, it, vi } from "vitest";
import sitemap from "./sitemap";
import { getPublicTruckSitemapEntries } from "@/lib/truck-data";
import { getGeographySummaries, type StateGeographySummary } from "@/lib/geography";

vi.mock("@/lib/truck-data", () => ({
  getPublicTruckSitemapEntries: vi.fn(),
}));

vi.mock("@/lib/geography", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/geography")>();
  return { ...actual, getGeographySummaries: vi.fn() };
});

const QUALIFYING_AND_THIN_SUMMARIES: StateGeographySummary[] = [
  {
    stateSlug: "kentucky",
    stateName: "Kentucky",
    count: 5,
    cities: [
      { citySlug: "elizabethtown-ky", cityName: "Elizabethtown", stateSlug: "kentucky", stateName: "Kentucky", stateAbbreviation: "KY", count: 3 },
      { citySlug: "burnside-ky", cityName: "Burnside", stateSlug: "kentucky", stateName: "Kentucky", stateAbbreviation: "KY", count: 1 },
    ],
  },
  {
    stateSlug: "colorado",
    stateName: "Colorado",
    count: 1,
    cities: [
      { citySlug: "idaho-springs-co", cityName: "Idaho Springs", stateSlug: "colorado", stateName: "Colorado", stateAbbreviation: "CO", count: 1 },
    ],
  },
];

describe("sitemap", () => {
  it("includes the homepage, /trucks, and every eligible truck under its canonical gettrucktap.com/truck/<slug> URL", async () => {
    vi.mocked(getPublicTruckSitemapEntries).mockResolvedValue([
      { slug: "papa-pasta", updated_at: "2026-08-01T00:00:00.000Z" },
      { slug: "el-taco-rico", updated_at: "2026-08-02T00:00:00.000Z" },
    ]);
    vi.mocked(getGeographySummaries).mockResolvedValue([]);

    const entries = await sitemap();

    expect(entries.map((entry) => entry.url)).toEqual([
      "https://gettrucktap.com",
      "https://gettrucktap.com/trucks",
      "https://gettrucktap.com/privacy",
      "https://gettrucktap.com/truck/papa-pasta",
      "https://gettrucktap.com/truck/el-taco-rico",
    ]);
  });

  it("includes only qualifying state/city pages, excluding below-threshold places", async () => {
    vi.mocked(getPublicTruckSitemapEntries).mockResolvedValue([{ slug: "papa-pasta", updated_at: "2026-08-01T00:00:00.000Z" }]);
    vi.mocked(getGeographySummaries).mockResolvedValue(QUALIFYING_AND_THIN_SUMMARIES);

    const entries = await sitemap();
    const urls = entries.map((entry) => entry.url);

    expect(urls).toContain("https://gettrucktap.com/state/kentucky");
    expect(urls).toContain("https://gettrucktap.com/city/elizabethtown-ky");
    // Colorado (1 truck) and Burnside, KY (1 truck) are both below threshold.
    expect(urls).not.toContain("https://gettrucktap.com/state/colorado");
    expect(urls).not.toContain("https://gettrucktap.com/city/idaho-springs-co");
    expect(urls).not.toContain("https://gettrucktap.com/city/burnside-ky");
  });

  // A successful but incomplete sitemap tells crawlers those pages are gone.
  it("fails the request when the truck query fails", async () => {
    vi.mocked(getPublicTruckSitemapEntries).mockRejectedValue(new Error("connection refused"));
    vi.mocked(getGeographySummaries).mockResolvedValue(QUALIFYING_AND_THIN_SUMMARIES);

    await expect(sitemap()).rejects.toThrow("connection refused");
  });

  it("fails the request when the geography query fails", async () => {
    vi.mocked(getPublicTruckSitemapEntries).mockResolvedValue([
      { slug: "papa-pasta", updated_at: "2026-08-01T00:00:00.000Z" },
    ]);
    vi.mocked(getGeographySummaries).mockRejectedValue(new Error("connection refused"));

    await expect(sitemap()).rejects.toThrow("connection refused");
  });

  it("fails the request when the truck query returns no trucks at all", async () => {
    vi.mocked(getPublicTruckSitemapEntries).mockResolvedValue([]);
    vi.mocked(getGeographySummaries).mockResolvedValue([]);

    await expect(sitemap()).rejects.toThrow("no public trucks");
  });

  // The sitemap stayed frozen at its build on Vercel with `revalidate`.
  it("is generated per request rather than cached", async () => {
    const route = await import("./sitemap");
    expect(route.dynamic).toBe("force-dynamic");
  });

  // Generated per request, a `new Date()` here would claim every page changed on every fetch.
  it("sets lastModified only from a truck's real edit time", async () => {
    vi.mocked(getPublicTruckSitemapEntries).mockResolvedValue([
      { slug: "papa-pasta", updated_at: "2026-08-01T00:00:00.000Z" },
    ]);
    vi.mocked(getGeographySummaries).mockResolvedValue(QUALIFYING_AND_THIN_SUMMARIES);

    const entries = await sitemap();
    const withDate = entries.filter((entry) => entry.lastModified !== undefined);

    expect(withDate).toEqual([expect.objectContaining({ url: "https://gettrucktap.com/truck/papa-pasta", lastModified: "2026-08-01T00:00:00.000Z" })]);
  });

  it("picks up a newly published truck on the next request", async () => {
    vi.mocked(getGeographySummaries).mockResolvedValue([]);
    vi.mocked(getPublicTruckSitemapEntries).mockResolvedValue([{ slug: "papa-pasta", updated_at: "2026-08-01T00:00:00.000Z" }]);
    expect((await sitemap()).map((e) => e.url)).not.toContain("https://gettrucktap.com/truck/new-truck");

    vi.mocked(getPublicTruckSitemapEntries).mockResolvedValue([{ slug: "new-truck", updated_at: "2026-11-02T00:00:00.000Z" }]);
    expect((await sitemap()).map((e) => e.url)).toContain("https://gettrucktap.com/truck/new-truck");
  });
});
