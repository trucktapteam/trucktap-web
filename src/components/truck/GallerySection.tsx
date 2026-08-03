import type { Truck } from "@/lib/types";
import { PlaceholderImage } from "./PlaceholderImage";
import { SectionHeading } from "./SectionHeading";

export function GallerySection({ truck }: { truck: Truck }) {
  if (truck.gallery_images.length === 0) return null;

  return (
    <section>
      <SectionHeading title="Photos" />
      <div className="mt-4 grid grid-cols-3 gap-2.5">
        {truck.gallery_images.map((seed, i) => (
          <div key={seed} className="overflow-hidden rounded-xl shadow-sm ring-1 ring-black/5">
            <PlaceholderImage
              seed={seed}
              label={`Photo ${i + 1}`}
              className="aspect-square transition-transform duration-300 ease-out hover:scale-110"
              sizes="(min-width: 1024px) 250px, 33vw"
            />
          </div>
        ))}
      </div>
    </section>
  );
}
