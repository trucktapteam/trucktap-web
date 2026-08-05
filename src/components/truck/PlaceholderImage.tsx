"use client";

import { useState } from "react";
import Image from "next/image";
import { isSupabaseStorageImageUrl } from "@/lib/allowed-image-hosts";

// Moody, multi-stop duotones tuned to read like backlit grill/smoke
// photography rather than flat brand-color swatches — warm highlight
// falling off into a deep umber shadow, the way a truck photo lit at
// golden hour actually falls off.
const GRADIENTS = [
  "radial-gradient(120% 140% at 15% 10%, #ffd08a 0%, #ff9a3c 22%, #e8590c 48%, #7c1d0e 78%, #2b0805 100%)",
  "radial-gradient(120% 140% at 85% 15%, #ffe3a3 0%, #ffab4a 20%, #d9480f 50%, #6b1414 80%, #240604 100%)",
  "radial-gradient(130% 150% at 20% 85%, #ffcf8f 0%, #f2760d 24%, #b8340a 52%, #4a0f0a 82%, #1c0403 100%)",
  "radial-gradient(120% 140% at 80% 80%, #ffdca0 0%, #ff8a3d 22%, #c73a0a 50%, #5c1310 80%, #200504 100%)",
  "radial-gradient(130% 150% at 50% 0%, #ffe0a8 0%, #f57f1f 26%, #a8300b 55%, #3f0f0c 84%, #180302 100%)",
];

function hashSeed(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return hash;
}

// Ordinary truck photos (portrait phone shots through wide landscape shots)
// land well inside this range, so "cover-panoramic" crops them exactly like
// "cover" always has. Only a stitched/extreme-panorama upload — several
// times wider (or taller) than it is the other way — crosses it.
const PANORAMIC_ASPECT_RATIO_THRESHOLD = 2.4;

/**
 * Renders a real photo when `seed` is a real Supabase Storage URL, and
 * falls back to a deterministic, moody gradient "photo" — same layout
 * footprint either way — when it isn't: missing, empty, a mock seed like
 * "hero-smoky-wheels", or a URL whose image failed to load. The gradient
 * fallback is styled to feel like art direction rather than an obvious
 * wireframe placeholder, since it's still what most trucks without
 * uploaded photos will show in production.
 */
export function PlaceholderImage({
  seed,
  label,
  className = "",
  sizes = "100vw",
  fit = "cover",
  fallback = "gradient",
  onImageError,
  mode = "fill",
}: {
  seed: string;
  label: string;
  className?: string;
  sizes?: string;
  /** "cover-panoramic" behaves exactly like "cover" for ordinary photos, but
   * once the real image's own pixel dimensions are known (after it loads)
   * an extreme-aspect-ratio upload — a stitched panorama far wider or
   * taller than a normal truck photo — switches to "contain" instead, so a
   * fixed-aspect slot (the hero) doesn't crop away most of a panorama no
   * single crop position could have saved. Deterministic and content-only:
   * no owner-set focal point involved. */
  fit?: "cover" | "contain" | "cover-panoramic";
  /** "hide" renders nothing instead of the gradient — for spots (like menu-item
   * thumbnails) that must collapse to a clean text-only layout rather than show
   * decorative art when there's no real photo. */
  fallback?: "gradient" | "hide";
  /** Fires when a real image fails to load, in addition to (not instead of)
   * this component's own fallback — lets a caller with `fallback="hide"` also
   * collapse a wrapping element (e.g. an otherwise-empty click target). */
  onImageError?: () => void;
  /** "fill" (default) fills a sized parent — the usual case, everywhere a
   * slot has a fixed footprint (thumbnails, hero banners, cards). "auto" is
   * for viewers with no predetermined box (the lightbox): no wrapping
   * container, no `fill` — the image sizes itself from its own real aspect
   * ratio, so `className` should carry max-width/max-height constraints
   * directly (e.g. `max-h-[90vh] max-w-[90vw]`) rather than a fixed box. */
  mode?: "fill" | "auto";
}) {
  const [failed, setFailed] = useState(false);
  // Only ever set for fit="cover-panoramic", once the loaded image's real
  // dimensions reveal an extreme aspect ratio — starts false so ordinary
  // "cover" cropping is what paints first, same as before this prop existed.
  const [isPanoramic, setIsPanoramic] = useState(false);

  if (seed && isSupabaseStorageImageUrl(seed) && !failed) {
    const fitClass = fit === "contain" || isPanoramic ? "object-contain" : "object-cover";

    const handleLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
      if (fit !== "cover-panoramic") return;
      const img = e.currentTarget;
      if (!img.naturalWidth || !img.naturalHeight) return;
      const aspectRatio = img.naturalWidth / img.naturalHeight;
      if (
        aspectRatio > PANORAMIC_ASPECT_RATIO_THRESHOLD ||
        aspectRatio < 1 / PANORAMIC_ASPECT_RATIO_THRESHOLD
      ) {
        setIsPanoramic(true);
      }
    };

    if (mode === "auto") {
      return (
        <Image
          src={seed}
          alt={label}
          width={1600}
          height={1600}
          sizes={sizes}
          className={`h-auto w-auto ${fitClass} ${className}`}
          onLoad={handleLoad}
          onError={() => {
            setFailed(true);
            onImageError?.();
          }}
        />
      );
    }

    return (
      <div
        className={`relative isolate overflow-hidden ${isPanoramic ? "bg-ink" : ""} ${className}`}
      >
        <Image
          src={seed}
          alt={label}
          fill
          sizes={sizes}
          className={fitClass}
          onLoad={handleLoad}
          onError={() => {
            setFailed(true);
            onImageError?.();
          }}
        />
      </div>
    );
  }

  if (fallback === "hide") return null;

  const gradient = GRADIENTS[hashSeed(seed) % GRADIENTS.length];
  // "auto" mode has no sized parent to fill (that's the point — the real
  // image sizes itself from its own aspect ratio), so the decorative
  // fallback needs its own visible box size when it's the one rendering,
  // rather than collapsing to nothing.
  const autoFallbackSize = mode === "auto" ? "aspect-square h-[60vh]" : "";

  return (
    <div
      role="img"
      aria-label={label}
      className={`grain relative isolate overflow-hidden ${autoFallbackSize} ${className}`}
      style={{ backgroundImage: gradient }}
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{ boxShadow: "inset 0 0 40px 6px rgba(0,0,0,0.35)" }}
      />
    </div>
  );
}
