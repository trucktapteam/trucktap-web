import type { Metadata, Viewport } from "next";
import { SITE_URL } from "@/lib/site";
import { RedesignHeroB } from "@/components/redesign/RedesignHeroB";
import { NetworkHandoff } from "@/components/redesign/NetworkHandoff";
import { Ttn86 } from "@/components/redesign/ttn/Ttn86";
import { RetentionSection } from "@/components/redesign/RetentionSection";
import { OwnerStorySection } from "@/components/redesign/OwnerStorySection";
import { PartnerNetworkSection } from "@/components/redesign/PartnerNetworkSection";
import { BecomePartnerSection } from "@/components/redesign/BecomePartnerSection";
import { RedesignFooter } from "@/components/redesign/RedesignFooter";
import { getTtnGuide } from "@/lib/redesign/ttn-guide";
import { getRetentionTruck } from "@/lib/redesign/retention-truck";

/**
 * The TruckTap homepage. Composition is the approved visual redesign
 * ("Redesign B" — see /redesign/b, the isolated preview mirror that keeps
 * its own noindex sandbox metadata). This route carries the real
 * production homepage metadata below and stays indexable / followable.
 */
export const metadata: Metadata = {
  title: { absolute: "TruckTap | Find Food Trucks That Are Actually Open" },
  description:
    "TruckTap helps you find food trucks that are actually open right now. See real locations, follow favorite trucks, and never miss an update.",
  openGraph: {
    title: "TruckTap | Find Food Trucks That Are Actually Open",
    description: "Real food trucks. Real locations. Less guessing, more eating.",
    type: "website",
    url: SITE_URL,
  },
};

export const viewport: Viewport = {
  themeColor: "#ff6b00",
};

// The live TTN-86 Guide and the hero's live signal must never be more than
// a minute stale — same ISR cadence as /trucks (was 1h on the old homepage).
export const revalidate = 60;

export default async function Home() {
  const now = new Date();
  const [guide, retentionTruck] = await Promise.all([
    getTtnGuide(now),
    getRetentionTruck(),
  ]);

  return (
    <div className="flex flex-1 flex-col bg-[#0a0a0a]">
      {/* This route is a committed-dark page, but the shared <body> is
          light (globals.css). Paint the document canvas dark so the iOS
          rubber-band / overscroll gutter matches instead of flashing
          light. Scoped here: it unmounts on client navigation away and
          never renders on other routes. */}
      <style>{`html{background-color:#0a0a0a;color-scheme:dark}`}</style>

      <main className="flex flex-1 flex-col">
        <RedesignHeroB />

        <NetworkHandoff />

        <Ttn86 guide={guide} serverNowIso={now.toISOString()} />

        <RetentionSection truck={retentionTruck} />

        <OwnerStorySection />

        <PartnerNetworkSection />

        <BecomePartnerSection />
      </main>

      <RedesignFooter />
    </div>
  );
}
