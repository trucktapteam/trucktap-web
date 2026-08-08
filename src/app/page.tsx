import type { Metadata, Viewport } from "next";
import { SITE_URL } from "@/lib/site";
import { SiteHeader } from "@/components/home/SiteHeader";
import { SiteFooter } from "@/components/home/SiteFooter";
import { HeroSection } from "@/components/home/HeroSection";
import { WhySection } from "@/components/home/WhySection";
import { HowItWorksSection } from "@/components/home/HowItWorksSection";
import { ScreensSection } from "@/components/home/ScreensSection";
import { CommunitySection } from "@/components/home/CommunitySection";
import { OwnersSection } from "@/components/home/OwnersSection";
import { PersonalitySection } from "@/components/home/PersonalitySection";
import { SeenSection } from "@/components/home/SeenSection";
import { AnthemSection } from "@/components/home/AnthemSection";
import { RollingTrucksSection } from "@/components/home/RollingTrucksSection";
import { FinalCtaSection } from "@/components/home/FinalCtaSection";

// The page is otherwise fully static, but RollingTrucksSection now reads
// live public_trucks data — without this it would be fetched once at
// build time and only ever update on the next deploy. ISR re-generates it
// in the background at most once an hour instead, keeping the static
// performance/caching without going fully dynamic.
export const revalidate = 3600;

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

export default function Home() {
  return (
    <div className="paper-grid flex flex-1 flex-col">
      <SiteHeader />
      <main className="flex-1">
        <HeroSection />
        <WhySection />
        <HowItWorksSection />
        <ScreensSection />
        <CommunitySection />
        <OwnersSection />
        <PersonalitySection />
        <SeenSection />
        <AnthemSection />
        <RollingTrucksSection />
        <FinalCtaSection />
      </main>
      <SiteFooter />
    </div>
  );
}
