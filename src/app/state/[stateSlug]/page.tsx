import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { SiteHeader } from "@/components/home/SiteHeader";
import { SiteFooter } from "@/components/home/SiteFooter";
import { TrucksDirectory } from "@/components/trucks/TrucksDirectory";
import { getRankedDirectoryTrucks } from "@/lib/trucks-directory";
import {
  buildStateMetadata,
  findQualifyingState,
  getGeographySummaries,
  qualifyingCities,
  type StateGeographySummary,
} from "@/lib/geography";

// Same reasoning as /trucks: LIVE status is the point, so this can't sit on
// the homepage's 1-hour cadence.
export const revalidate = 60;

type Props = { params: Promise<{ stateSlug: string }> };

async function resolveState(stateSlug: string): Promise<{ state: StateGeographySummary; cities: ReturnType<typeof qualifyingCities> } | null> {
  const summaries = await getGeographySummaries();
  const state = findQualifyingState(summaries, stateSlug);
  if (!state) return null;
  return { state, cities: qualifyingCities([state]) };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { stateSlug } = await params;
  const resolved = await resolveState(stateSlug);
  if (!resolved) return {};

  const { title, description, canonicalUrl } = buildStateMetadata(resolved.state);
  return {
    title,
    description,
    alternates: { canonical: canonicalUrl },
    openGraph: { title, description, type: "website", url: canonicalUrl },
  };
}

export default async function StatePage({ params }: Props) {
  const { stateSlug } = await params;
  const resolved = await resolveState(stateSlug);
  if (!resolved) notFound();
  const { state, cities } = resolved;

  let trucks: Awaited<ReturnType<typeof getRankedDirectoryTrucks>> = [];
  let loadFailed = false;
  try {
    trucks = await getRankedDirectoryTrucks(new Date(), { stateSlug: state.stateSlug });
  } catch (error) {
    console.error(`Failed to load /state/${stateSlug} directory:`, error);
    loadFailed = true;
  }

  return (
    <div className="paper-grid flex flex-1 flex-col">
      <SiteHeader />

      <main className="flex-1 px-4 py-10 sm:py-14 lg:px-6">
        <div className="mx-auto max-w-3xl">
          <Link href="/trucks" className="text-sm font-bold text-navy/50 transition hover:text-brand-dark">
            ← All trucks
          </Link>

          <h1 className="mt-2 text-balance text-4xl leading-[0.95] font-black tracking-tight text-navy sm:text-5xl">
            Food Trucks in {state.stateName}
          </h1>
          <p className="mt-3 max-w-[60ch] text-pretty text-lg text-navy/70">
            {state.count} food truck{state.count === 1 ? "" : "s"} based in {state.stateName} on TruckTap. Trucks
            that are live right now show up first, then anyone with an upcoming stop.
          </p>

          {cities.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-2" aria-label={`Cities in ${state.stateName}`}>
              {cities.map((city) => (
                <Link
                  key={city.citySlug}
                  href={`/city/${city.citySlug}`}
                  className="rounded-full border border-border bg-white px-3.5 py-1.5 text-sm font-semibold text-ink shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-brand hover:text-brand-dark"
                >
                  {city.cityName} ({city.count})
                </Link>
              ))}
            </div>
          )}

          <div className="mt-8">
            {loadFailed ? (
              <p className="rounded-2xl border border-dashed border-border bg-white p-8 text-center text-sm text-muted">
                Trucks are temporarily unavailable. Try refreshing in a moment.
              </p>
            ) : (
              <TrucksDirectory trucks={trucks} />
            )}
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
