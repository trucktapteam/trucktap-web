import type { Metadata } from "next";
import { SiteHeader } from "@/components/home/SiteHeader";
import { SiteFooter } from "@/components/home/SiteFooter";
import { TrucksDirectory } from "@/components/trucks/TrucksDirectory";
import { getRankedDirectoryTrucks } from "@/lib/trucks-directory";
import { SITE_URL } from "@/lib/site";

// LIVE status is the whole point of this page — the homepage's 1-hour
// marquee cadence would leave "live now" visibly stale. A short window
// keeps it close to real-time without going fully dynamic per-request.
export const revalidate = 60;

const TITLE = "Find Food Trucks Near You";
const DESCRIPTION =
  "Browse food trucks on TruckTap — see who's live right now, what's coming up, and find a truck's menu, photos, and location.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_URL}/trucks` },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    type: "website",
    url: `${SITE_URL}/trucks`,
  },
};

export default async function TrucksPage() {
  let trucks: Awaited<ReturnType<typeof getRankedDirectoryTrucks>> = [];
  let loadFailed = false;

  try {
    trucks = await getRankedDirectoryTrucks();
  } catch (error) {
    console.error("Failed to load /trucks directory:", error);
    loadFailed = true;
  }

  return (
    <div className="paper-grid flex flex-1 flex-col">
      <SiteHeader />

      <main className="flex-1 px-4 py-10 sm:py-14 lg:px-6">
        <div className="mx-auto max-w-3xl">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-brand/28 bg-cream-2 px-3.5 py-2 text-xs font-black tracking-[0.04em] text-brand-ink uppercase">
            <span className="h-2.5 w-2.5 rounded-full bg-success shadow-[0_0_0_5px_rgba(76,175,80,0.18)]" />
            Live, right now
          </div>
          <h1 className="text-balance text-4xl leading-[0.95] font-black tracking-tight text-navy sm:text-5xl">
            Find Food Trucks
          </h1>
          <p className="mt-3 max-w-[60ch] text-pretty text-lg text-navy/70">
            Trucks that are live right now show up first, then anyone with an upcoming stop. Search by name or
            cuisine to narrow it down.
          </p>

          <div className="mt-8">
            {loadFailed ? (
              <p className="rounded-2xl border border-dashed border-border bg-white p-8 text-center text-sm text-muted">
                Trucks are temporarily unavailable. Try refreshing in a moment.
              </p>
            ) : trucks.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-border bg-white p-8 text-center text-sm text-muted">
                No trucks are on TruckTap yet — check back soon.
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
