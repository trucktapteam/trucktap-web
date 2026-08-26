"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { TruckQrPosterInfo } from "@/lib/truck-view-models";
import { downloadPosterAsPng, posterFileName } from "@/lib/poster-download";
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
  truck: TruckQrPosterInfo;
  qrValue: string;
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const posterRef = useRef<HTMLDivElement>(null);
  const [downloadState, setDownloadState] = useState<"idle" | "working" | "error">("idle");

  useEffect(() => {
    closeButtonRef.current?.focus();
  }, []);

  useBodyScrollLock();
  useDialogKeyTrap({ dialogRef, onClose });

  async function handleDownload() {
    if (!posterRef.current || downloadState === "working") return;
    setDownloadState("working");
    try {
      await downloadPosterAsPng(posterRef.current, posterFileName(truck.name));
      setDownloadState("idle");
    } catch {
      setDownloadState("error");
    }
  }

  return createPortal(
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label={`QR poster for ${truck.name}`}
      className="animate-fade-in fixed inset-0 z-50 flex flex-col items-center justify-center overflow-y-auto bg-black/92 p-4 backdrop-blur-sm sm:p-8"
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
        <PosterArtwork truck={truck} qrValue={qrValue} qrSize={200} posterRef={posterRef} />

        <div className="mt-5 flex flex-col items-center gap-2">
          <button
            type="button"
            onClick={handleDownload}
            disabled={downloadState === "working"}
            className="inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-ink shadow-[var(--shadow-pop)] transition duration-200 hover:-translate-y-0.5 hover:text-brand-dark hover:shadow-md active:translate-y-0 active:scale-[0.97] disabled:pointer-events-none disabled:opacity-70"
          >
            <DownloadIcon />
            {downloadState === "working" ? "Preparing…" : "Download Poster"}
          </button>
          {downloadState === "error" && (
            <p className="text-xs font-medium text-white/80" role="alert">
              Couldn&apos;t generate the poster image. Please try again.
            </p>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}

function DownloadIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
      <path d="M10 2.5a.75.75 0 0 1 .75.75v7.44l2.22-2.22a.75.75 0 1 1 1.06 1.06l-3.5 3.5a.75.75 0 0 1-1.06 0l-3.5-3.5a.75.75 0 1 1 1.06-1.06l2.22 2.22V3.25A.75.75 0 0 1 10 2.5Z" />
      <path d="M3.5 12.75a.75.75 0 0 1 .75.75v1.5c0 .414.336.75.75.75h10a.75.75 0 0 0 .75-.75v-1.5a.75.75 0 0 1 1.5 0v1.5A2.25 2.25 0 0 1 15 17.5H5a2.25 2.25 0 0 1-2.25-2.25v-1.5a.75.75 0 0 1 .75-.75Z" />
    </svg>
  );
}
