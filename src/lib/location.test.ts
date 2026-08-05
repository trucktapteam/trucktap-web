import { describe, expect, it } from "vitest";
import { formatBasedNearLocation } from "./location";

describe("formatBasedNearLocation", () => {
  it("reduces a full street address (comma-separated, full state name) to city/state", () => {
    expect(formatBasedNearLocation("300, Sewer Plant Rd, Hodgenville, Kentucky")).toBe("Hodgenville, KY");
  });

  it("reduces a full street address (comma-separated, state abbreviation) to city/state", () => {
    expect(formatBasedNearLocation("58, Ernest R Kouma Blvd, Radcliff, KY")).toBe("Radcliff, KY");
  });

  it("reduces a full street address with a multi-word street name to city/state", () => {
    expect(formatBasedNearLocation("1850, Ring Road, Elizabethtown, Kentucky")).toBe("Elizabethtown, KY");
  });

  it("discards every street-related comma segment, however many there are", () => {
    // Real production value: a duplicated street segment before city/state.
    expect(formatBasedNearLocation("220 Lexington Ct, Lexington Ct, Conroe, TX")).toBe("Conroe, TX");
  });

  it("normalizes a full state name to its two-letter abbreviation", () => {
    expect(formatBasedNearLocation("100, Walmart Drive, Elizabethtown, Kentucky")).toBe("Elizabethtown, KY");
  });

  it("passes through an already-clean 'City, ST' value unchanged", () => {
    expect(formatBasedNearLocation("Glasgow, KY")).toBe("Glasgow, KY");
  });

  it("passes through an already-clean 'City, State Name' value, abbreviating the state", () => {
    expect(formatBasedNearLocation("Lyndon, Kentucky")).toBe("Lyndon, KY");
  });

  it("parses a comma-less 'City ST' value", () => {
    expect(formatBasedNearLocation("Elizabethtown KY")).toBe("Elizabethtown, KY");
  });

  it("parses a comma-less 'City State Name' value with a two-word state", () => {
    expect(formatBasedNearLocation("Newark New Jersey")).toBe("Newark, NJ");
  });

  it("strips a trailing ZIP code", () => {
    expect(formatBasedNearLocation("Radcliff, KY 40160")).toBe("Radcliff, KY");
  });

  it("fails closed on a street address with no recognizable state at all", () => {
    expect(formatBasedNearLocation("123 Main St")).toBeNull();
  });

  it("fails closed rather than leak a street segment mistaken for a city", () => {
    // "123 Main St" would otherwise land in the city slot next to a valid state.
    expect(formatBasedNearLocation("123 Main St, KY")).toBeNull();
  });

  it("fails closed on an unrecognized/malformed trailing token", () => {
    expect(formatBasedNearLocation("Somewhere, Unknownstate")).toBeNull();
  });

  it("fails closed on an empty or whitespace-only value", () => {
    expect(formatBasedNearLocation("   ")).toBeNull();
  });

  it("returns null when there is no service_area at all", () => {
    expect(formatBasedNearLocation(null)).toBeNull();
    expect(formatBasedNearLocation(undefined)).toBeNull();
  });
});
