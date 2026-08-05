"use client";

import { useCallback, useRef, useState } from "react";
import type { MenuSectionInfo } from "@/lib/truck-view-models";
import { PlaceholderImage } from "./PlaceholderImage";
import { SectionHeading } from "./SectionHeading";
import { MenuItemGrid } from "./MenuItemGrid";
import { GalleryLightbox } from "./GalleryLightbox";

/**
 * Menu board photos (if any) always lead, since that's the truck's own
 * authoritative source; structured items (if any) follow underneath —
 * both can exist together, e.g. a photographed board plus a
 * price/description breakdown typed in separately. Never an empty shell:
 * hides entirely when there's neither.
 */
export function MenuSection({ truck }: { truck: MenuSectionInfo }) {
  const hasItems = truck.menu_items.length > 0;
  const boardImages = truck.menu_images;
  const hasBoardPhotos = boardImages.length > 0;

  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const triggerRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const handleClose = useCallback(() => {
    setOpenIndex(null);
    triggerRefs.current[openIndex ?? -1]?.focus();
  }, [openIndex]);

  if (!hasItems && !hasBoardPhotos) return null;

  return (
    <section>
      <SectionHeading title="Menu" />

      {hasBoardPhotos && (
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {boardImages.map((seed, i) => (
            <button
              key={seed}
              ref={(el) => {
                triggerRefs.current[i] = el;
              }}
              type="button"
              onClick={() => setOpenIndex(i)}
              aria-label={`Open menu board ${i + 1} of ${boardImages.length}`}
              className="group block w-full overflow-hidden rounded-xl shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-md focus-visible:ring-2 focus-visible:ring-brand"
            >
              <PlaceholderImage
                seed={seed}
                label={`Menu board ${i + 1}`}
                className="aspect-[3/4]"
                sizes="(min-width: 640px) 33vw, 50vw"
              />
            </button>
          ))}
        </div>
      )}

      {hasItems && <MenuItemGrid items={truck.menu_items} truckName={truck.name} />}

      {openIndex !== null && (
        <GalleryLightbox photos={boardImages} truckName={truck.name} initialIndex={openIndex} onClose={handleClose} />
      )}
    </section>
  );
}
