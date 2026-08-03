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
}: {
  seed: string;
  label: string;
  className?: string;
  sizes?: string;
  fit?: "cover" | "contain";
}) {
  const [failed, setFailed] = useState(false);

  if (seed && isSupabaseStorageImageUrl(seed) && !failed) {
    return (
      <div className={`relative isolate overflow-hidden ${className}`}>
        <Image
          src={seed}
          alt={label}
          fill
          sizes={sizes}
          className={fit === "contain" ? "object-contain" : "object-cover"}
          onError={() => setFailed(true)}
        />
      </div>
    );
  }

  const gradient = GRADIENTS[hashSeed(seed) % GRADIENTS.length];

  return (
    <div
      role="img"
      aria-label={label}
      className={`grain relative isolate overflow-hidden ${className}`}
      style={{ backgroundImage: gradient }}
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{ boxShadow: "inset 0 0 40px 6px rgba(0,0,0,0.35)" }}
      />
    </div>
  );
}
