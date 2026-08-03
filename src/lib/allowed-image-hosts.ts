/**
 * Single source of truth for which image hostnames this site will render
 * via next/image, shared between next.config.ts (build-time remotePatterns)
 * and PlaceholderImage.tsx (runtime allowlist check before rendering a
 * `src`). Deriving both from the same env var, rather than hardcoding the
 * hostname twice, is what makes the runtime check a real safety net: a
 * truck row can reference an image on any host (a stock-photo URL, some
 * other CDN, a typo) — anything other than our own Supabase Storage must
 * fall back to the placeholder instead of crashing the page, which is
 * exactly what happens when next/image is given a `src` whose host isn't
 * in remotePatterns.
 */
export function getSupabaseStorageHostname(): string | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) return null;
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
}
