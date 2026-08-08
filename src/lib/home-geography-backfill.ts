import { deriveHomeGeography, toHomeGeographySlugs } from "./location";

/**
 * Input shape the backfill script reads from `public_trucks` — already
 * row-filtered to non-archived/non-test trucks by that view's own `WHERE`
 * clause, so this module never has to re-derive that exclusion itself.
 */
export type BackfillCandidateRow = {
  id: string;
  slug: string;
  name: string;
  service_area: string | null;
  home_city: string | null;
  home_state: string | null;
};

export type BackfillProposal = {
  id: string;
  slug: string;
  name: string;
  service_area: string;
  home_city: string;
  home_state: string;
  home_city_slug: string;
  home_state_slug: string;
};

export type BackfillSkipReason = "already-populated" | "missing-service-area" | "unparseable";

export type BackfillSkip = {
  id: string;
  slug: string;
  name: string;
  reason: BackfillSkipReason;
  service_area: string | null;
};

/**
 * Classifies every candidate row into either a proposed `{ home_city,
 * home_state, home_city_slug, home_state_slug }` assignment or a skip with
 * a reason — never both. Pure and side-effect-free so the script's actual
 * database calls can stay thin wrappers around this.
 *
 * Ordering matters for idempotency: a row that already has *either*
 * `home_city` or `home_state` set is always skipped as "already-populated"
 * before its `service_area` is even looked at — re-running this after a
 * previous `--apply` (or after a truck is manually corrected) must never
 * re-derive or overwrite a value that's already there.
 */
export function classifyTrucksForBackfill(rows: BackfillCandidateRow[]): {
  proposals: BackfillProposal[];
  skips: BackfillSkip[];
} {
  const proposals: BackfillProposal[] = [];
  const skips: BackfillSkip[] = [];

  for (const row of rows) {
    if (row.home_city !== null || row.home_state !== null) {
      skips.push({ id: row.id, slug: row.slug, name: row.name, reason: "already-populated", service_area: row.service_area });
      continue;
    }

    if (!row.service_area || row.service_area.trim() === "") {
      skips.push({ id: row.id, slug: row.slug, name: row.name, reason: "missing-service-area", service_area: row.service_area });
      continue;
    }

    const geography = deriveHomeGeography(row.service_area);
    if (!geography) {
      skips.push({ id: row.id, slug: row.slug, name: row.name, reason: "unparseable", service_area: row.service_area });
      continue;
    }

    const { citySlug, stateSlug } = toHomeGeographySlugs(geography);
    proposals.push({
      id: row.id,
      slug: row.slug,
      name: row.name,
      service_area: row.service_area,
      home_city: geography.city,
      home_state: geography.state,
      home_city_slug: citySlug,
      home_state_slug: stateSlug,
    });
  }

  return { proposals, skips };
}

/**
 * `--apply` is the only thing that makes the backfill script write
 * anything; no args, `--dry-run`, or an unrecognized flag all stay a dry
 * run. This is a safety default, not a parsing nicety — a typo'd flag
 * must never silently turn into a write.
 */
export function resolveBackfillMode(argv: string[]): "dry-run" | "apply" {
  return argv.includes("--apply") ? "apply" : "dry-run";
}
