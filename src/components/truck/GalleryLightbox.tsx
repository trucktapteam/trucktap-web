"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { PlaceholderImage } from "./PlaceholderImage";
import { useBodyScrollLock, useDialogKeyTrap } from "./useDialogA11y";

/**
 * Full-size photo viewer. Reuses PlaceholderImage (not a raw next/image)
 * so a broken/unrenderable photo degrades to the same gradient fallback
 * used everywhere else instead of leaving a broken image in the modal.
 *
 * Rendered through a portal to document.body rather than in place: every
 * trigger for this lives inside a `<Reveal>` mount-animation wrapper, and
 * Reveal's `translate-y-*` utility sets the standalone CSS `translate`
 * property — which, like `transform`, establishes a new containing block
 * for `position: fixed` descendants (CSS Transforms Level 2). Left
 * in-place, this dialog's "fixed inset-0" resolves against that Reveal
 * div's own content box instead of the viewport, trapping it inside the
 * page's grid/flow. A portal sidesteps the ancestor chain entirely, so it
 * stays correct regardless of what a future wrapper does.
 */
export function GalleryLightbox({
  photos,
  truckName,
  initialIndex,
  onClose,
}: {
  photos: string[];
  truckName: string;
  initialIndex: number;
  onClose: () => void;
}) {
  const [index, setIndex] = useState(initialIndex);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const hasMultiple = photos.length > 1;

  const goPrev = useCallback(() => setIndex((i) => (i - 1 + photos.length) % photos.length), [photos.length]);
  const goNext = useCallback(() => setIndex((i) => (i + 1) % photos.length), [photos.length]);

  // Focus moves into the dialog the moment it opens.
  useEffect(() => {
    closeButtonRef.current?.focus();
  }, []);

  useBodyScrollLock();
  useDialogKeyTrap({
    dialogRef,
    onClose,
    onArrowLeft: hasMultiple ? goPrev : undefined,
    onArrowRight: hasMultiple ? goNext : undefined,
  });

  return createPortal(
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label={`Photo ${index + 1} of ${photos.length} — ${truckName}`}
      className="animate-fade-in fixed inset-0 z-50 flex flex-col bg-black/92 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="flex items-center justify-between p-4 sm:p-5">
        <p className="text-sm font-medium text-white/70" aria-live="polite">
          {index + 1} / {photos.length}
        </p>
        <button
          ref={closeButtonRef}
          type="button"
          onClick={onClose}
          aria-label="Close photo viewer"
          className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
        >
          <CloseIcon />
        </button>
      </div>

      <div className="relative flex flex-1 items-center justify-center px-3 pb-6 sm:px-6">
        {hasMultiple && (
          <button
            type="button"
            onClick={goPrev}
            aria-label="Previous photo"
            className="absolute left-1 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 sm:left-4"
          >
            <ChevronIcon direction="left" />
          </button>
        )}

        <PlaceholderImage
          seed={photos[index]}
          label={`Photo ${index + 1} of ${truckName}`}
          mode="auto"
          className="max-h-[90vh] max-w-[90vw] rounded-sm"
          sizes="90vw"
          fit="contain"
        />

        {hasMultiple && (
          <button
            type="button"
            onClick={goNext}
            aria-label="Next photo"
            className="absolute right-1 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 sm:right-4"
          >
            <ChevronIcon direction="right" />
          </button>
        )}
      </div>
    </div>,
    document.body
  );
}

export function CloseIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
      <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
    </svg>
  );
}

function ChevronIcon({ direction }: { direction: "left" | "right" }) {
  const d =
    direction === "left"
      ? "M12.79 5.23a.75.75 0 0 1 .02 1.06L8.832 10l3.98 3.71a.75.75 0 1 1-1.024 1.098l-4.5-4.25a.75.75 0 0 1 0-1.098l4.5-4.25a.75.75 0 0 1 1.06.02Z"
      : "M7.21 14.77a.75.75 0 0 1-.02-1.06L11.168 10l-3.98-3.71a.75.75 0 1 1 1.024-1.098l4.5 4.25a.75.75 0 0 1 0 1.098l-4.5 4.25a.75.75 0 0 1-1.06-.02Z";
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
      <path fillRule="evenodd" d={d} clipRule="evenodd" />
    </svg>
  );
}
