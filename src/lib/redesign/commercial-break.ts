/**
 * TTN-86 commercial breaks. Most homepage loads show the normal TTN-86
 * programming panel (the LIVE / NEXT ON TTN-86 slate). On a minority of
 * loads that panel is given over to a commercial break instead — one of
 * our YouTube spots, chosen weighted ~50 / 25 / 25.
 *
 * Both decisions (whether it's a break, and which spot) are made once per
 * server render and passed down as a prop, so the visitor never sees the
 * panel flip or the spot swap while they're on the page or mid-watch.
 *
 * `weight` is relative, not a percentage; the picker normalizes.
 */

export type Commercial = {
  /** YouTube video id — the spot plays from this actual video. */
  readonly id: string;
  /** Relative selection weight. */
  readonly weight: number;
  /** Headline shown with the spot (already in the intended casing). */
  readonly title: string;
  /** One supporting line under the headline. */
  readonly supporting: string;
};

export const COMMERCIALS: readonly Commercial[] = [
  {
    id: "MyD3OXsTtWo",
    weight: 50,
    title: "Good Job, Bob.",
    supporting: "Somebody finally figured it out.",
  },
  {
    id: "Hlgjb1L_dEM",
    weight: 25,
    title: "Find Food Trucks Near You.",
    supporting: "Real trucks. Real spots. Right now.",
  },
  {
    id: "OTkSQbQBsKM",
    weight: 25,
    title: "Find Food Trucks. For Real.",
    supporting: "No more driving out to an empty curb.",
  },
] as const;

/**
 * Share of homepage loads where the TTN-86 programming panel runs a
 * commercial break instead of the normal featured/next slate. Tuned to
 * feel like an occasional real network break, not a takeover.
 */
export const COMMERCIAL_BREAK_RATE = 0.33;

/**
 * Weighted random pick among the spots. Call once per server render; the
 * result is passed down as a prop so the client never re-rolls.
 */
export function pickCommercial(
  commercials: readonly Commercial[] = COMMERCIALS,
  random: () => number = Math.random,
): Commercial {
  const total = commercials.reduce((sum, c) => sum + c.weight, 0);
  let threshold = random() * total;
  for (const commercial of commercials) {
    threshold -= commercial.weight;
    if (threshold < 0) return commercial;
  }
  return commercials[commercials.length - 1];
}

/**
 * The once-per-render decision for the TTN-86 programming panel: a
 * `Commercial` to run as a break, or `null` to show the normal slate.
 * The gate and the weighted pick are independent draws from `random`.
 */
export function pickBroadcastBreak(
  random: () => number = Math.random,
  rate: number = COMMERCIAL_BREAK_RATE,
): Commercial | null {
  if (random() >= rate) return null;
  return pickCommercial(COMMERCIALS, random);
}
