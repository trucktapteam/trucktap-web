import { describe, expect, it } from "vitest";
import { getHeroDisplayMode } from "./hero-display";

describe("getHeroDisplayMode", () => {
  it("returns 'contain' for the explicitly overridden TestTruck 7/25 profile", () => {
    expect(getHeroDisplayMode({ slug: "testtruck-7-25" })).toBe("contain");
  });

  it("defaults to 'cover' for every truck not explicitly overridden", () => {
    expect(getHeroDisplayMode({ slug: "sonny-boys-backyard" })).toBe("cover");
    expect(getHeroDisplayMode({ slug: "cupcake-caboose" })).toBe("cover");
    expect(getHeroDisplayMode({ slug: "el-taco-rico" })).toBe("cover");
    expect(getHeroDisplayMode({ slug: "some-brand-new-truck" })).toBe("cover");
  });
});
