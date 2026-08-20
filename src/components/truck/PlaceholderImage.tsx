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
  fit?: "cover" | "contain";
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
  // `attempt` counts load tries for the *current* seed: 0 is the first
  // (normal) request, 1 is the one bounded retry. A single transient
  // failure - a dropped request, a cold cache slot that 404s once, a
  // network blip while a page loads a dozen images at once - used to
  // permanently commit this component instance to the gradient fallback
  // for the rest of the page view, even though the exact same URL loads
  // fine moments later (which is exactly what happens when the lightbox
  // mounts a fresh instance of this same component and succeeds on its
  // first try). One retry gives every image the same second chance the
  // lightbox gets for free, without retrying forever.
  const [attempt, setAttempt] = useState(0);
  const [permanentlyFailed, setPermanentlyFailed] = useState(false);
  const MAX_RETRIES = 1;

  const handleError = () => {
    if (attempt < MAX_RETRIES) {
      // Bump `attempt` - both re-keys and re-sources the <Image> below, so
      // React remounts a genuinely new <img> element (not a reused,
      // already-errored one) requesting a URL the browser's HTTP cache and
      // Vercel's Image Optimization cache have never seen, instead of
      // re-fetching whatever got cached (or failed) the first time.
      setAttempt((a) => a + 1);
    } else {
      // Retry exhausted - only now is this "permanently" failed, and only
      // now does the parent get told, per onImageError's contract.
      setPermanentlyFailed(true);
      onImageError?.();
    }
  };

  // Only the retry attempt needs a cache-busting suffix; the first attempt
  // uses the seed exactly as given so a normal successful load isn't
  // penalized with an unnecessary cache-cold request.
  const retrySrc = attempt > 0 ? `${seed}${seed.includes("?") ? "&" : "?"}retry=${attempt}` : seed;

  if (seed && isSupabaseStorageImageUrl(seed) && !permanentlyFailed) {
    const fitClass = fit === "contain" ? "object-contain" : "object-cover";

    if (mode === "auto") {
      return (
        <Image
          key={attempt}
          src={retrySrc}
          alt={label}
          width={1600}
          height={1600}
          sizes={sizes}
          className={`h-auto w-auto ${fitClass} ${className}`}
          onError={handleError}
        />
      );
    }

    return (
      <div className={`relative isolate overflow-hidden ${className}`}>
        <Image key={attempt} src={retrySrc} alt={label} fill sizes={sizes} className={fitClass} onError={handleError} />
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
      {/* `permanentlyFailed` (as opposed to a missing/mock seed) means a
          real photo exists but couldn't be decoded even after one retry —
          most often an iPhone HEIC/HEIF upload the browser can't render.
          Surfacing that distinction keeps a broken upload from looking
          identical to "no photo was ever added," which would otherwise
          hide the problem from the owner and from anyone debugging it
          indefinitely. */}
      {permanentlyFailed && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-center bg-black/45 px-2 py-1 text-center text-[10px] font-medium leading-tight text-white/90 backdrop-blur-sm">
          Photo unavailable
        </div>
      )}
    </div>
  );
}
