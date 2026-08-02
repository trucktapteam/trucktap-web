import { communityPhotos } from "@/lib/home-data";
import { SectionHead } from "./SectionHead";
import { CommunityLightboxGrid } from "./CommunityLightboxGrid";

export function SeenSection() {
  return (
    <section className="px-4 py-14 sm:py-20 lg:px-6">
      <div className="mx-auto max-w-6xl">
        <SectionHead
          kicker="Community sightings"
          title="Seen on TruckTap"
          description="Real trucks, real events, real food truck culture. The good stuff shows up in parking lots, festivals, neighborhoods, and anywhere people are hungry enough to follow the smoke."
        />

        <div className="mt-10">
          <CommunityLightboxGrid photos={communityPhotos} />
        </div>
      </div>
    </section>
  );
}
