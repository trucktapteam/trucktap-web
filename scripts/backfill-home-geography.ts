/**
 * One-time, idempotent backfill for public.trucks.home_city / home_state /
 * home_city_slug / home_state_slug, derived entirely from the existing
 * service_area free-text field via deriveHomeGeography (src/lib/location.ts)
 * — the same parser the website already ships and tests, not a second
 * implementation. Never queries locations or upcoming_stops, and never
 * derives geography from either.
 *
 * Defaults to a dry run: fetches candidates from public_trucks (already
 * excludes archived/test trucks — nothing extra to filter here), classifies
 * them, and prints the report. Nothing is written unless --apply is passed.
 *
 * --apply needs a service-role key: the anon key this repo uses everywhere
 * else cannot write to public.trucks (RLS only allows owner/admin writes).
 * Set SUPABASE_SERVICE_ROLE_KEY in the shell for that one invocation only —
 * it must never be added to .env.local or referenced anywhere in the
 * Next.js app itself.
 *
 * Usage:
 *   npm run backfill:home-geography                 # dry run
 *   npm run backfill:home-geography -- --dry-run      # same, explicit
 *   SUPABASE_SERVICE_ROLE_KEY=... npm run backfill:home-geography -- --apply
 */
import { createClient } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "../src/lib/supabase/server";
import {
  classifyTrucksForBackfill,
  resolveBackfillMode,
  type BackfillCandidateRow,
  type BackfillProposal,
  type BackfillSkip,
} from "../src/lib/home-geography-backfill";

try {
  process.loadEnvFile(".env.local");
} catch {
  // No .env.local present — fall through and let createSupabaseServerClient's
  // own "Missing NEXT_PUBLIC_SUPABASE_URL..." error explain what's missing.
}

type PublicTruckRow = BackfillCandidateRow;

async function fetchCandidates(): Promise<PublicTruckRow[]> {
  const supabase = createSupabaseServerClient();

  const { data, error } = await supabase
    .from("public_trucks")
    .select("id, slug, name, service_area, home_city, home_state")
    .order("slug")
    .returns<PublicTruckRow[]>();

  if (error) throw new Error(`Failed to load trucks from public_trucks: ${error.message}`);
  return data ?? [];
}

async function applyProposals(proposals: BackfillProposal[]): Promise<void> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY (plus NEXT_PUBLIC_SUPABASE_URL) must be set in the environment to --apply. " +
        "Dry runs don't need it — only the write path does, since RLS only allows owner/admin writes to trucks."
    );
  }

  const supabase = createClient(url, serviceRoleKey, { auth: { persistSession: false } });

  for (const proposal of proposals) {
    // .is("home_city", null) is a second, database-side idempotency guard —
    // belt-and-suspenders alongside classifyTrucksForBackfill's own check —
    // in case a row was populated by something else between the read above
    // and this write.
    const { error } = await supabase
      .from("trucks")
      .update({
        home_city: proposal.home_city,
        home_state: proposal.home_state,
        home_city_slug: proposal.home_city_slug,
        home_state_slug: proposal.home_state_slug,
      })
      .eq("id", proposal.id)
      .is("home_city", null);

    if (error) throw new Error(`Failed to update ${proposal.slug} (${proposal.id}): ${error.message}`);
  }
}

function printReport(proposals: BackfillProposal[], skips: BackfillSkip[], mode: "dry-run" | "apply"): void {
  const missing = skips.filter((s) => s.reason === "missing-service-area");
  const unparseable = skips.filter((s) => s.reason === "unparseable");
  const alreadyPopulated = skips.filter((s) => s.reason === "already-populated");
  const total = proposals.length + skips.length;

  console.log(`\n=== Home geography backfill — ${mode === "apply" ? "APPLY" : "DRY RUN"} ===\n`);
  console.log(`Eligible trucks (public_trucks — non-archived/non-test): ${total}`);
  console.log(`  Already had home_city/home_state:       ${alreadyPopulated.length}`);
  console.log(`  Missing service_area:                   ${missing.length}`);
  console.log(`  service_area present but unparseable:   ${unparseable.length}`);
  console.log(`  Proposed for assignment:                ${proposals.length}`);

  if (proposals.length > 0) {
    console.log(`\n--- Proposed assignments ---`);
    console.table(
      proposals.map((p) => ({
        name: p.name,
        slug: p.slug,
        service_area: p.service_area,
        home_city: p.home_city,
        home_state: p.home_state,
        home_city_slug: p.home_city_slug,
        home_state_slug: p.home_state_slug,
      }))
    );
  }

  if (unparseable.length > 0) {
    console.log(`\n--- Skipped: unparseable service_area (worth a manual look) ---`);
    console.table(unparseable.map((s) => ({ name: s.name, slug: s.slug, service_area: s.service_area })));
  }

  if (missing.length > 0) {
    console.log(`\n--- Skipped: no service_area ---`);
    console.table(missing.map((s) => ({ name: s.name, slug: s.slug })));
  }

  if (alreadyPopulated.length > 0) {
    console.log(`\n--- Skipped: already has home_city/home_state ---`);
    console.table(alreadyPopulated.map((s) => ({ name: s.name, slug: s.slug })));
  }

  console.log();
}

async function main(): Promise<void> {
  const mode = resolveBackfillMode(process.argv.slice(2));

  const rows = await fetchCandidates();
  const { proposals, skips } = classifyTrucksForBackfill(rows);

  printReport(proposals, skips, mode);

  if (mode === "dry-run") {
    console.log("Dry run only — nothing was written. Re-run with --apply to write these values.\n");
    return;
  }

  await applyProposals(proposals);
  console.log(`Applied ${proposals.length} update${proposals.length === 1 ? "" : "s"} to public.trucks.\n`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
