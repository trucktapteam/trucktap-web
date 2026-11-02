import { cache } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { SiteHeader } from "@/components/home/SiteHeader";
import { SiteFooter } from "@/components/home/SiteFooter";
import { TrucksDirectory } from "@/components/trucks/TrucksDirectory";
import { CityScheduleSection } from "@/components/city/CityScheduleSection";
import { getCitySchedule, type CityScheduleDay } from "@/lib/city-schedule";
import { getRankedDirectoryTrucks } from "@/lib/trucks-directory";
import {
  buildCityMetadata,
  findQualifyingCity,
  findQualifyingState,
  getGeographySummaries,
  type CityGeographySummary,
} from "@/lib/geography";

// Same reasoning as /trucks: LIVE status is the point, so this can't sit on
// the homepage's 1-hour cadence.
export const revalidate = 60;

type Props = { params: Promise<{ citySlug: string }> };

async function resolveCity(citySlug: string): Promise<{ city: CityGeographySummary; stateQualifies: boolean } | null> {
  const summaries = await getGeographySummaries();
  const city = findQualifyingCity(summaries, citySlug);
  if (!city) return null;
  // A city can qualify (>= CITY_MIN_TRUCKS) while its state doesn't (e.g. a
  // 2-truck city in an otherwise-thin state) — only link back to a state
  // page that actually exists.
  const stateQualifies = findQualifyingState(summaries, city.stateSlug) !== null;
  return { city, stateQualifies };
}

// Shared by the metadata and the page within one request, so the title and the
// visible section always agree. If the schedule can't load, the page still
// lists its trucks and simply has no schedule section.
const loadSchedule = cache(async (citySlug: string): Promise<CityScheduleDay[]> => {
  try {
    return await getCitySchedule(citySlug);
  } catch (error) {
    console.error(`Failed to load /city/${citySlug} schedule:`, error);
    return [];
  }
});

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { citySlug } = await params;
  const resolved = await resolveCity(citySlug);
  if (!resolved) return {};

  const { title, description, canonicalUrl } = buildCityMetadata(
    resolved.city,
    (await loadSchedule(resolved.city.citySlug)).length > 0
  );
  return {
    title,
    description,
    alternates: { canonical: canonicalUrl },
    openGraph: { title, description, type: "website", url: canonicalUrl },
  };
}

export default async function CityPage({ params }: Props) {
  const { citySlug } = await params;
  const resolved = await resolveCity(citySlug);
  if (!resolved) notFound();
  const { city, stateQualifies } = resolved;

  let trucks: Awaited<ReturnType<typeof getRankedDirectoryTrucks>> = [];
  let loadFailed = false;
  try {
    trucks = await getRankedDirectoryTrucks(new Date(), { citySlug: city.citySlug });
  } catch (error) {
    console.error(`Failed to load /city/${citySlug} directory:`, error);
    loadFailed = true;
  }

  const schedule = await loadSchedule(city.citySlug);

  return (
    <div className="paper-grid flex flex-1 flex-col">
      <SiteHeader />

      <main className="flex-1 px-4 py-10 sm:py-14 lg:px-6">
        <div className="mx-auto max-w-3xl">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm font-bold text-navy/50">
            <Link href="/trucks" className="transition hover:text-brand-dark">
              All trucks
            </Link>
            {stateQualifies && (
              <>
                <span aria-hidden="true">/</span>
                <Link href={`/state/${city.stateSlug}`} className="transition hover:text-brand-dark">
                  {city.stateName}
                </Link>
              </>
            )}
          </div>

          <h1 className="mt-2 text-balance text-4xl leading-[0.95] font-black tracking-tight text-navy sm:text-5xl">
            Food Trucks in {city.cityName}, {city.stateAbbreviation}
          </h1>
          <p className="mt-3 max-w-[60ch] text-pretty text-lg text-navy/70">
            {city.count} food truck{city.count === 1 ? "" : "s"} based in {city.cityName} on TruckTap. Trucks that
            are live right now show up first, then anyone with an upcoming stop.
          </p>

          <CityScheduleSection cityName={city.cityName} days={schedule} />

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
