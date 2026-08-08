import { describe, expect, it, vi } from "vitest";
import sitemap from "./sitemap";
import { getPublicTruckSitemapEntries } from "@/lib/truck-data";

vi.mock("@/lib/truck-data", () => ({
  getPublicTruckSitemapEntries: vi.fn(),
}));

describe("sitemap", () => {
  it("includes the homepage and every eligible truck under its canonical gettrucktap.com/truck/<slug> URL", async () => {
    vi.mocked(getPublicTruckSitemapEntries).mockResolvedValue([
      { slug: "papa-pasta", updated_at: "2026-08-01T00:00:00.000Z" },
      { slug: "el-taco-rico", updated_at: "2026-08-02T00:00:00.000Z" },
    ]);

    const entries = await sitemap();

    expect(entries.map((entry) => entry.url)).toEqual([
      "https://gettrucktap.com",
      "https://gettrucktap.com/truck/papa-pasta",
      "https://gettrucktap.com/truck/el-taco-rico",
    ]);
  });

  it("falls back to a homepage-only sitemap when the truck query fails, instead of erroring the whole route", async () => {
    vi.mocked(getPublicTruckSitemapEntries).mockRejectedValue(new Error("connection refused"));

    const entries = await sitemap();

    expect(entries).toEqual([expect.objectContaining({ url: "https://gettrucktap.com" })]);
  });
});
