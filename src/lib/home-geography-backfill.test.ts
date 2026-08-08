import { describe, expect, it } from "vitest";
import {
  classifyTrucksForBackfill,
  resolveBackfillMode,
  type BackfillCandidateRow,
} from "./home-geography-backfill";

function makeRow(overrides: Partial<BackfillCandidateRow> = {}): BackfillCandidateRow {
  return {
    id: "t1",
    slug: "test-truck",
    name: "Test Truck",
    service_area: null,
    home_city: null,
    home_state: null,
    ...overrides,
  };
}

describe("classifyTrucksForBackfill", () => {
  it("proposes a home_city/home_state/slug assignment for a parseable service_area", () => {
    const { proposals, skips } = classifyTrucksForBackfill([
      makeRow({ id: "1", slug: "papa-pasta", name: "Papa Pasta", service_area: "124, Ernest R. Kouma Boulevard, Radcliff, Kentucky" }),
    ]);

    expect(skips).toEqual([]);
    expect(proposals).toEqual([
      {
        id: "1",
        slug: "papa-pasta",
        name: "Papa Pasta",
        service_area: "124, Ernest R. Kouma Boulevard, Radcliff, Kentucky",
        home_city: "Radcliff",
        home_state: "KY",
        home_city_slug: "radcliff-ky",
        home_state_slug: "kentucky",
      },
    ]);
  });

  it("skips a truck that already has home_city or home_state set, without looking at service_area", () => {
    const { proposals, skips } = classifyTrucksForBackfill([
      makeRow({ id: "1", home_city: "Somewhere", home_state: "KY", service_area: "totally unparseable garbage" }),
      makeRow({ id: "2", home_city: null, home_state: "KY", service_area: null }),
    ]);

    expect(proposals).toEqual([]);
    expect(skips.map((s) => s.reason)).toEqual(["already-populated", "already-populated"]);
  });

  it("skips a truck with a missing or blank service_area", () => {
    const { proposals, skips } = classifyTrucksForBackfill([
      makeRow({ id: "1", service_area: null }),
      makeRow({ id: "2", service_area: "" }),
      makeRow({ id: "3", service_area: "   " }),
    ]);

    expect(proposals).toEqual([]);
    expect(skips.every((s) => s.reason === "missing-service-area")).toBe(true);
  });

  it("skips a truck whose service_area the parser can't confidently resolve", () => {
    const { proposals, skips } = classifyTrucksForBackfill([
      makeRow({ id: "1", service_area: "Warren County and surrounding areas" }),
    ]);

    expect(proposals).toEqual([]);
    expect(skips).toEqual([
      { id: "1", slug: "test-truck", name: "Test Truck", reason: "unparseable", service_area: "Warren County and surrounding areas" },
    ]);
  });

  it("processes a mixed batch, keeping proposals and skips in their original row order within each list", () => {
    const rows = [
      makeRow({ id: "1", slug: "a", service_area: "Louisville, KY" }),
      makeRow({ id: "2", slug: "b", service_area: null }),
      makeRow({ id: "3", slug: "c", service_area: "Somewhere, Unknownstate" }),
      makeRow({ id: "4", slug: "d", home_city: "Already Set", service_area: "Frankfort, KY" }),
      makeRow({ id: "5", slug: "e", service_area: "Elizabethtown, KY" }),
    ];

    const { proposals, skips } = classifyTrucksForBackfill(rows);

    expect(proposals.map((p) => p.slug)).toEqual(["a", "e"]);
    expect(skips.map((s) => [s.slug, s.reason])).toEqual([
      ["b", "missing-service-area"],
      ["c", "unparseable"],
      ["d", "already-populated"],
    ]);
  });
});

describe("resolveBackfillMode", () => {
  it("defaults to dry-run with no arguments", () => {
    expect(resolveBackfillMode([])).toBe("dry-run");
  });

  it("stays dry-run for an explicit --dry-run flag", () => {
    expect(resolveBackfillMode(["--dry-run"])).toBe("dry-run");
  });

  it("stays dry-run for an unrecognized flag — a typo must never turn into a write", () => {
    expect(resolveBackfillMode(["--apply-typo", "--applyy"])).toBe("dry-run");
  });

  it("only switches to apply for the exact --apply flag", () => {
    expect(resolveBackfillMode(["--apply"])).toBe("apply");
  });

  it("recognizes --apply alongside other flags", () => {
    expect(resolveBackfillMode(["--verbose", "--apply"])).toBe("apply");
  });
});
