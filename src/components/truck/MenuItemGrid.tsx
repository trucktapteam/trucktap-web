"use client";

import { useCallback, useRef, useState } from "react";
import type { MenuItem } from "@/lib/types";
import { formatCurrency } from "@/lib/format";
import { isSupabaseStorageImageUrl } from "@/lib/allowed-image-hosts";
import { PlaceholderImage } from "./PlaceholderImage";
import { GalleryLightbox } from "./GalleryLightbox";

export function MenuItemGrid({ items, truckName }: { items: MenuItem[]; truckName: string }) {
  const byCategory = new Map<string, MenuItem[]>();
  for (const item of items) {
    const category = item.category ?? "Menu";
    byCategory.set(category, [...(byCategory.get(category) ?? []), item]);
  }

  // Same reading order the rows render in (grouped by category), not the
  // raw `items` order — so prev/next in the lightbox matches what the user
  // actually sees on the page.
  const photoItems = Array.from(byCategory.values())
    .flat()
    .filter((item): item is MenuItem & { image: string } => Boolean(item.image) && isSupabaseStorageImageUrl(item.image!));

  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const triggerRefs = useRef<Array<HTMLButtonElement | null>>([]);

  // Stable across re-renders so GalleryLightbox's keydown-listener effect
  // isn't torn down and rebuilt on every unrelated re-render of this
  // component while the modal is open.
  const handleClose = useCallback(() => {
    setOpenIndex(null);
    triggerRefs.current[openIndex ?? -1]?.focus();
  }, [openIndex]);

  return (
    <div className="mt-4 space-y-7">
      {Array.from(byCategory.entries()).map(([category, categoryItems]) => (
        <div key={category}>
          <h3 className="flex items-center gap-2 text-xs font-bold tracking-widest text-muted uppercase">
            <span className="h-1 w-1 rounded-full bg-brand/60" />
            {category}
          </h3>
          <ul className="mt-3 divide-y divide-border overflow-hidden rounded-2xl border border-border bg-white shadow-[var(--shadow-card)]">
            {categoryItems.map((item) => {
              const unavailable = item.available === false;
              const photoIndex = photoItems.findIndex((p) => p.id === item.id);
              const hasPhoto = photoIndex !== -1;

              return (
                <li
                  key={item.id}
                  className="flex items-start gap-3.5 p-4 transition-colors duration-150 hover:bg-surface/60"
                >
                  {hasPhoto && (
                    <MenuItemThumbnail
                      item={item}
                      registerRef={(el) => {
                        triggerRefs.current[photoIndex] = el;
                      }}
                      onOpen={() => setOpenIndex(photoIndex)}
                    />
                  )}

                  <div className="flex min-w-0 flex-1 items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className={`text-sm font-semibold ${unavailable ? "text-muted" : "text-ink"}`}>
                        {item.name}
                        {unavailable && (
                          <span className="ml-2 rounded-full bg-surface px-1.5 py-0.5 text-[11px] font-medium text-muted">
                            Sold out today
                          </span>
                        )}
                      </p>
                      {item.description && (
                        <p className="mt-1 text-xs leading-relaxed text-muted">{item.description}</p>
                      )}
                    </div>
                    <span
                      className={`shrink-0 text-base font-extrabold tabular-nums ${unavailable ? "text-muted" : "text-brand-dark"}`}
                    >
                      {formatCurrency(item.price)}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      ))}

      {openIndex !== null && (
        <GalleryLightbox
          photos={photoItems.map((p) => p.image)}
          truckName={truckName}
          initialIndex={openIndex}
          onClose={handleClose}
        />
      )}
    </div>
  );
}

/**
 * A menu item's own compact photo thumbnail. Deliberately collapses to
 * nothing (not a gradient placeholder) if the image fails to load, so the
 * row reflows back to a clean text-only layout instead of showing broken
 * or decorative art for a photo that isn't actually there.
 */
function MenuItemThumbnail({
  item,
  onOpen,
  registerRef,
}: {
  // Callers only render this once they've confirmed item.image is a valid
  // Supabase Storage URL — plain MenuItem here (rather than a narrowed
  // type) since that guard happens one level up, not on this value itself.
  item: MenuItem;
  onOpen: () => void;
  registerRef: (el: HTMLButtonElement | null) => void;
}) {
  const [failed, setFailed] = useState(false);
  if (failed || !item.image) return null;

  return (
    <button
      ref={registerRef}
      type="button"
      onClick={onOpen}
      aria-label={`View photo of ${item.name}`}
      className="block h-16 w-16 shrink-0 overflow-hidden rounded-xl shadow-sm ring-1 ring-black/5 focus-visible:ring-2 focus-visible:ring-brand"
    >
      <PlaceholderImage
        seed={item.image}
        label={`${item.name} photo`}
        className="h-full w-full"
        sizes="64px"
        fallback="hide"
        onImageError={() => setFailed(true)}
      />
    </button>
  );
}
