"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import type { Truck } from "@/lib/types";
import { useBodyScrollLock, useDialogKeyTrap } from "./useDialogA11y";
import { CloseIcon } from "./GalleryLightbox";
import { PosterArtwork } from "./TruckQrPoster";

/**
 * Full-size QR poster preview — the "equivalent accessible full-screen
 * preview" for the poster, since GalleryLightbox's PlaceholderImage-based
 * viewer only knows how to show a single Supabase Storage photo URL, not
 * a live-rendered composition like this poster. Shares the same
 * focus-trap/Escape/scroll-lock behavior via useDialogA11y so it matches
 * the gallery/menu-item lightbox exactly, just without prev/next (there's
 * only ever one poster).
 *
 * Portaled to document.body for the same reason as GalleryLightbox: the
 * sidebar trigger lives inside a `<Reveal>` wrapper, whose translate-y-*
 * utility sets the CSS `translate` property and becomes a containing
 * block for `position: fixed` descendants, trapping an in-place dialog
 * inside the sidebar's own box instead of the viewport.
 */
export function PosterPreviewModal({
  truck,
  qrValue,
  onClose,
}: {
  truck: Truck;
  qrValue: string;
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeButtonRef.current?.focus();
  }, []);

  useBodyScrollLock();
  useDialogKeyTrap({ dialogRef, onClose });

  return createPortal(
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label={`QR poster for ${truck.name}`}
      className="animate-fade-in fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/92 p-4 backdrop-blur-sm sm:p-8"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <button
        ref={closeButtonRef}
        type="button"
        onClick={onClose}
        aria-label="Close QR poster preview"
        className="absolute top-4 right-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
      >
        <CloseIcon />
      </button>

      <div className="w-full max-w-sm">
        <PosterArtwork truck={truck} qrValue={qrValue} qrSize={200} />
      </div>
    </div>,
    document.body
  );
}
