"use client";

import { useCallback, useRef, useState } from "react";
import type { Truck } from "@/lib/types";
import { PlaceholderImage } from "./PlaceholderImage";
import { SectionHeading } from "./SectionHeading";
import { GalleryLightbox } from "./GalleryLightbox";

export function GallerySection({ truck }: { truck: Truck }) {
  const photos = truck.gallery_images;
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const triggerRefs = useRef<Array<HTMLButtonElement | null>>([]);

  // Stable across re-renders (only recreated if openIndex actually
  // changes) so GalleryLightbox's keydown-listener effect isn't torn
  // down and rebuilt on every unrelated re-render of this component
  // while the modal is open.
  const handleClose = useCallback(() => {
    setOpenIndex(null);
    triggerRefs.current[openIndex ?? -1]?.focus();
  }, [openIndex]);

  if (photos.length === 0) return null;

  return (
    <section>
      <SectionHeading title="Photos" />
      <div className="mt-4 grid grid-cols-3 gap-2.5">
        {photos.map((seed, i) => (
          <button
            key={seed}
            ref={(el) => {
              triggerRefs.current[i] = el;
            }}
            type="button"
            onClick={() => setOpenIndex(i)}
            aria-label={`Open photo ${i + 1} of ${photos.length}`}
            className="group block w-full overflow-hidden rounded-xl shadow-sm ring-1 ring-black/5 focus-visible:ring-2 focus-visible:ring-brand"
          >
            <PlaceholderImage
              seed={seed}
              label={`Photo ${i + 1}`}
              className="aspect-square transition-transform duration-300 ease-out group-hover:scale-110"
              sizes="(min-width: 1024px) 250px, 33vw"
            />
          </button>
        ))}
      </div>

      {openIndex !== null && (
        <GalleryLightbox photos={photos} truckName={truck.name} initialIndex={openIndex} onClose={handleClose} />
      )}
    </section>
  );
}
