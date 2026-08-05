import type { Truck } from "./types";

export type HeroDisplayMode = "cover" | "contain";

/**
 * Which hero presentation a truck's profile uses. Real owner intent belongs
 * in Supabase as a persisted, owner-facing field — that doesn't exist yet
 * (see the integration audit), and this task is explicitly scoped to not
 * invent one. This map is a temporary, web-only preview mechanism for
 * evaluating "contain" ahead of that: keyed by slug, read nowhere near the
 * Supabase client, written back to nothing. Every truck not listed here
 * gets today's unchanged default.
 *
 * "cover" (default): full-bleed crop — right for a normal photo where the
 * subject already fills most of the frame, which is most trucks.
 * "contain": shows the complete, uncropped image centered over a blurred/
 * darkened copy of the same photo — for a hero whose subjects are spread
 * across the full frame (e.g. two people side by side) rather than
 * centered, where any crop cuts someone off. TestTruck 7/25's hero is
 * exactly this case: both people get cropped out under "cover", and the
 * two photos are close enough in aspect ratio (Sonny Boys ~1.78:1 vs
 * TestTruck ~1.78:1) that aspect ratio alone can't tell them apart — this
 * has to be a per-truck editorial choice, not automatic detection.
 */
const HERO_DISPLAY_MODE_OVERRIDES: Record<string, HeroDisplayMode> = {
  "testtruck-7-25": "contain",
};

export function getHeroDisplayMode(truck: Pick<Truck, "slug">): HeroDisplayMode {
  return HERO_DISPLAY_MODE_OVERRIDES[truck.slug] ?? "cover";
}
