import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { resolveTruckForRoute } from "@/lib/truck-data";
import { TruckHero } from "@/components/truck/TruckHero";
import { StatusBar } from "@/components/truck/StatusBar";
import { QuickActions } from "@/components/truck/QuickActions";
import { ConnectLinks } from "@/components/truck/ConnectLinks";
import { AnnouncementBanner } from "@/components/truck/AnnouncementBanner";
import { UpcomingStopsSection } from "@/components/truck/UpcomingStopsSection";
import { AboutSection } from "@/components/truck/AboutSection";
import { MenuSection } from "@/components/truck/MenuSection";
import { GallerySection } from "@/components/truck/GallerySection";
import { ReviewsSection } from "@/components/truck/ReviewsSection";
import { AppDownloadCta } from "@/components/truck/AppDownloadCta";
import { TruckQrPoster } from "@/components/truck/TruckQrPoster";
import { TrustFooter } from "@/components/truck/TrustFooter";
import { StructuredData } from "@/components/truck/StructuredData";
import { Reveal } from "@/components/truck/Reveal";
import {
  toTruckHeroInfo,
  toQuickActionsInfo,
  toUpcomingStopsInfo,
  toGallerySectionInfo,
  toMenuSectionInfo,
  toTruckQrPosterInfo,
  toStatusBarTruck,
} from "@/lib/truck-view-models";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const resolution = await resolveTruckForRoute(slug);
  if (!resolution) return {};
  const { truck } = resolution;

  const description = (truck.bio ?? truck.description ?? `${truck.name} on TruckTap.`).slice(0, 155);

  return {
    title: truck.name,
    description,
    openGraph: {
      title: truck.name,
      description,
      type: "website",
    },
  };
}

export default async function TruckProfilePage({ params }: Props) {
  const { slug } = await params;
  const resolution = await resolveTruckForRoute(slug);

  if (!resolution) notFound();
  if (resolution.redirectToSlug) permanentRedirect(`/truck/${resolution.redirectToSlug}`);

  const { truck } = resolution;
  const pageUrl = `https://trucktap-web.vercel.app/truck/${truck.slug}`;

  // Every Client Component below gets one of these explicitly narrowed
  // objects, never `truck` itself: Next.js serializes a Client Component's
  // entire prop value into the page's RSC hydration payload (embedded in
  // the raw HTML) regardless of which fields it actually reads. Building a
  // real, separate object here — not just a narrower TypeScript type on
  // the component — is what actually keeps `truck.currentLocation` (exact
  // last-known-LIVE coordinates) and the raw `truck.service_area` (often a
  // street address) out of every response but StatusBar's, which is the
  // only component that renders location data and stays Server-rendered.
  // See src/lib/truck-view-models.ts.
  const truckHeroInfo = toTruckHeroInfo(truck);
  const quickActionsInfo = toQuickActionsInfo(truck);
  const upcomingStopsInfo = toUpcomingStopsInfo(truck);
  const gallerySectionInfo = toGallerySectionInfo(truck);
  const menuSectionInfo = toMenuSectionInfo(truck);
  const truckQrPosterInfo = toTruckQrPosterInfo(truck);
  const statusBarTruck = toStatusBarTruck(truck);

  return (
    <main className="flex-1 pb-20">
      <StructuredData truck={truck} url={pageUrl} />
      <TruckHero truck={truckHeroInfo} />

      <div className="mx-auto max-w-6xl px-4 pt-10 lg:px-6">
        <div className="flex flex-col gap-10 lg:grid lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start lg:gap-14">
          {/* Sidebar content: appears first on mobile (right after the hero,
              matching the approved wireframe), pinned to a sticky right
              column on desktop via explicit grid placement — same
              components, no duplicated markup. */}
          <aside className="flex flex-col gap-5 lg:sticky lg:top-6 lg:col-start-2">
            <Reveal delayMs={0}>
              <StatusBar truck={statusBarTruck} />
            </Reveal>
            <Reveal delayMs={80}>
              <QuickActions truck={quickActionsInfo} />
            </Reveal>
            <Reveal delayMs={120}>
              <ConnectLinks truck={truck} />
            </Reveal>
            {/* A visual break rather than another card — signals "get the
                app" is a different tier from the status/actions above it,
                which stay tightly grouped since they're both about
                reaching this specific truck right now. */}
            <Reveal delayMs={160} className="hidden border-t border-border/70 pt-5 lg:block">
              <AppDownloadCta compact />
            </Reveal>
            <Reveal delayMs={220}>
              <TruckQrPoster truck={truckQrPosterInfo} variant="sidebar" />
            </Reveal>
          </aside>

          <div className="flex flex-col gap-12 lg:col-start-1 lg:row-start-1">
            <AnnouncementBanner truck={truck} />
            {/* Order matches how customers actually browse: who are they? →
                where will they be? → what do they look like? → what do
                they serve? → what do people say? */}
            <Reveal>
              <AboutSection truck={truck} />
            </Reveal>
            <Reveal>
              <UpcomingStopsSection truck={upcomingStopsInfo} />
            </Reveal>
            <Reveal>
              <GallerySection truck={gallerySectionInfo} />
            </Reveal>
            <Reveal>
              <MenuSection truck={menuSectionInfo} />
            </Reveal>
            <Reveal>
              <ReviewsSection truck={truck} />
            </Reveal>
            <div className="lg:hidden">
              <AppDownloadCta />
            </div>
            <TruckQrPoster truck={truckQrPosterInfo} variant="mobile" />
            <TrustFooter truck={truck} />
          </div>
        </div>
      </div>
    </main>
  );
}
