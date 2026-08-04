import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTruckBySlug } from "@/lib/truck-data";
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

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const truck = await getTruckBySlug(slug);
  if (!truck) return {};

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
  const truck = await getTruckBySlug(slug);

  if (!truck) notFound();

  const pageUrl = `https://trucktap-web.vercel.app/truck/${truck.slug}`;

  return (
    <main className="flex-1 pb-20">
      <StructuredData truck={truck} url={pageUrl} />
      <TruckHero truck={truck} />

      <div className="mx-auto max-w-6xl px-4 pt-10 lg:px-6">
        <div className="flex flex-col gap-10 lg:grid lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start lg:gap-14">
          {/* Sidebar content: appears first on mobile (right after the hero,
              matching the approved wireframe), pinned to a sticky right
              column on desktop via explicit grid placement — same
              components, no duplicated markup. */}
          <aside className="flex flex-col gap-5 lg:sticky lg:top-6 lg:col-start-2">
            <Reveal delayMs={0}>
              <StatusBar truck={truck} />
            </Reveal>
            <Reveal delayMs={80}>
              <QuickActions truck={truck} />
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
              <TruckQrPoster truck={truck} variant="sidebar" />
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
              <UpcomingStopsSection truck={truck} />
            </Reveal>
            <Reveal>
              <GallerySection truck={truck} />
            </Reveal>
            <Reveal>
              <MenuSection truck={truck} />
            </Reveal>
            <Reveal>
              <ReviewsSection truck={truck} />
            </Reveal>
            <div className="lg:hidden">
              <AppDownloadCta />
            </div>
            <TruckQrPoster truck={truck} variant="mobile" />
            <TrustFooter truck={truck} />
          </div>
        </div>
      </div>
    </main>
  );
}
