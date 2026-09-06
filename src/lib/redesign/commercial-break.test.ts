import { describe, expect, it } from "vitest";
import {
  COMMERCIAL_BREAK_RATE,
  COMMERCIALS,
  pickBroadcastBreak,
  pickCommercial,
} from "./commercial-break";

describe("pickCommercial", () => {
  it("returns the spot whose weight band contains the sample", () => {
    // Bands over total weight 100: [0,50) -> Bob, [50,75) -> near you,
    // [75,100) -> for real.
    expect(pickCommercial(COMMERCIALS, () => 0).id).toBe("MyD3OXsTtWo");
    expect(pickCommercial(COMMERCIALS, () => 0.49).id).toBe("MyD3OXsTtWo");
    expect(pickCommercial(COMMERCIALS, () => 0.5).id).toBe("Hlgjb1L_dEM");
    expect(pickCommercial(COMMERCIALS, () => 0.74).id).toBe("Hlgjb1L_dEM");
    expect(pickCommercial(COMMERCIALS, () => 0.75).id).toBe("OTkSQbQBsKM");
    expect(pickCommercial(COMMERCIALS, () => 0.999).id).toBe("OTkSQbQBsKM");
  });

  it("never falls off the end when random() returns ~1", () => {
    expect(pickCommercial(COMMERCIALS, () => 1)).toBe(COMMERCIALS[COMMERCIALS.length - 1]);
  });

  it("tracks the configured weights over many samples", () => {
    const counts: Record<string, number> = {};
    const n = 60_000;
    for (let i = 0; i < n; i++) {
      const id = pickCommercial(COMMERCIALS, () => (i + 0.5) / n).id;
      counts[id] = (counts[id] ?? 0) + 1;
    }
    expect(counts.MyD3OXsTtWo / n).toBeCloseTo(0.5, 2);
    expect(counts.Hlgjb1L_dEM / n).toBeCloseTo(0.25, 2);
    expect(counts.OTkSQbQBsKM / n).toBeCloseTo(0.25, 2);
  });

  it("keeps weights summing to a round 100 so the mix is easy to reason about", () => {
    expect(COMMERCIALS.reduce((sum, c) => sum + c.weight, 0)).toBe(100);
  });
});

describe("pickBroadcastBreak", () => {
  it("shows the normal slate (null) when the gate draw is at or above the rate", () => {
    // Pass the rate explicitly so this stays correct if COMMERCIAL_BREAK_RATE
    // is retuned later.
    expect(pickBroadcastBreak(() => 0.33, 0.33)).toBeNull();
    expect(pickBroadcastBreak(() => 0.99, 0.33)).toBeNull();
  });

  it("runs a break when the gate draw is below the rate", () => {
    // First draw 0 opens the gate; second draw 0 lands in Bob's band.
    const draws = [0, 0];
    let i = 0;
    const spot = pickBroadcastBreak(() => draws[i++]);
    expect(spot?.id).toBe("MyD3OXsTtWo");
  });

  it("honours a custom rate", () => {
    expect(pickBroadcastBreak(() => 0.5, 0)).toBeNull();
    const draws = [0.9, 0.9];
    let i = 0;
    expect(pickBroadcastBreak(() => draws[i++], 1)?.id).toBe("OTkSQbQBsKM");
  });

  it("lands a break on roughly COMMERCIAL_BREAK_RATE of loads", () => {
    let breaks = 0;
    const n = 60_000;
    for (let i = 0; i < n; i++) {
      // One deterministic sweep value reused for gate + pick this iteration.
      const v = (i + 0.5) / n;
      if (pickBroadcastBreak(() => v)) breaks++;
    }
    expect(breaks / n).toBeCloseTo(COMMERCIAL_BREAK_RATE, 2);
  });
});
