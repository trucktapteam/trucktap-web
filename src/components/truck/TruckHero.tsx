"use client";

import { useCallback, useRef, useState } from "react";
import type { Truck } from "@/lib/types";
import { getRatingSummary } from "@/lib/format";
import { isSupabaseStorageImageUrl } from "@/lib/allowed-image-hosts";
import { PlaceholderImage } from "./PlaceholderImage";
import { GalleryLightbox } from "./GalleryLightbox";

export function TruckHero({ truck }: { truck: Truck }) {
  const ratingSummary = getRatingSummary(truck);

  // Only a real, loadable Supabase Storage photo is worth a full-size
  // viewer — a mock-seed/missing value renders PlaceholderImage's
  // decorative gradient instead, and that's not "an image" to open. Also
  // demoted the moment the real photo fails to load at runtime, so a
  // broken URL never leaves a dead-looking button behind (same pattern as
  // MenuItemGrid's photo thumbnails).
  const [heroFailed, setHeroFailed] = useState(false);
  const [logoFailed, setLogoFailed] = useState(false);
  const heroClickable = Boolean(truck.hero_image && isSupabaseStorageImageUrl(truck.hero_image) && !heroFailed);
  const logoClickable = Boolean(truck.logo && isSupabaseStorageImageUrl(truck.logo) && !logoFailed);

  const [openViewer, setOpenViewer] = useState<"hero" | "logo" | null>(null);
  const heroTriggerRef = useRef<HTMLButtonElement>(null);
  const logoTriggerRef = useRef<HTMLButtonElement>(null);

  const handleClose = useCallback(() => {
    setOpenViewer((current) => {
      if (current === "hero") heroTriggerRef.current?.focus();
      if (current === "logo") logoTriggerRef.current?.focus();
      return null;
    });
  }, []);

  // Every hero shows the complete, uncropped photo — no owner-uploaded
  // image is ever destructively cropped, regardless of where its subjects
  // sit in the frame or how the container's aspect ratio compares to the
  // photo's own. A blurred, darkened, slightly enlarged copy of the same
  // image fills the rest of the band behind it, so there's never dead
  // letterbox space. No ken-burns zoom on either layer: it would slowly
  // crop the "complete image" guarantee away on the sharp copy, and the
  // static `scale-110` the blurred copy needs (so its softened edges stay
  // hidden past the box's own bounds) would just fight an animation
  // driving the same `transform` property.
  const heroImage = (
    <div className="relative h-full w-full overflow-hidden bg-ink">
      <div aria-hidden="true" className="absolute inset-0">
        <PlaceholderImage
          seed={truck.hero_image ?? truck.id}
          label=""
          className="h-full w-full scale-110 blur-2xl brightness-[0.45] saturate-75"
          sizes="100vw"
          fit="cover"
          onImageError={() => setHeroFailed(true)}
        />
      </div>
      <div className="absolute inset-0">
        <PlaceholderImage
          seed={truck.hero_image ?? truck.id}
          label={`${truck.name} hero photo`}
          className="h-full w-full"
          sizes="100vw"
          fit="contain"
          onImageError={() => setHeroFailed(true)}
        />
      </div>
    </div>
  );

  const logoImage = (
    <PlaceholderImage
      seed={truck.logo ?? `${truck.id}-logo`}
      label={`${truck.name} logo`}
      className={
        logoClickable
          ? "h-full w-full rounded-2xl"
          : "h-24 w-24 shrink-0 rounded-2xl border-4 border-white shadow-[var(--shadow-pop)] sm:h-28 sm:w-28 lg:h-32 lg:w-32"
      }
      sizes="(min-width: 1024px) 128px, (min-width: 640px) 112px, 96px"
      onImageError={() => setLogoFailed(true)}
    />
  );

  return (
    <div className="relative">
      {/* One consistent height for every truck — tall enough to give the
          complete, uncropped image room to breathe before the blurred
          backdrop fills in the rest, without reading as excessively tall
          on an ordinary photo. */}
      <div className="relative h-60 w-full overflow-hidden sm:h-80 lg:h-[28rem]">
        {heroClickable ? (
          <button
            ref={heroTriggerRef}
            type="button"
            onClick={() => setOpenViewer("hero")}
            aria-label={`Open full-size hero image for ${truck.name}`}
            className="block h-full w-full focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-white"
          >
            {heroImage}
          </button>
        ) : (
          heroImage
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-black/0 to-black/10" />
      </div>

      <div className="mx-auto max-w-6xl px-4 lg:px-6">
        {/* Only the logo overlaps the photo — a fixed, deliberate amount
            independent of text length — so the name/badge/cuisine block
            below always sits on solid page background and stays readable
            no matter how bright, dark, or long the hero photo/name is.
            The overlap grows in step with the logo itself (roughly half
            its height at every breakpoint) so it still reads as
            deliberate at the larger desktop size, not just bigger. */}
        <div className="relative -mt-12 sm:-mt-14 lg:-mt-16">
          {logoClickable ? (
            <button
              ref={logoTriggerRef}
              type="button"
              onClick={() => setOpenViewer("logo")}
              aria-label={`Open full-size logo image for ${truck.name}`}
              className="block h-24 w-24 shrink-0 rounded-2xl border-4 border-white shadow-[var(--shadow-pop)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand sm:h-28 sm:w-28 lg:h-32 lg:w-32"
            >
              {logoImage}
            </button>
          ) : (
            logoImage
          )}
        </div>

        <div className="mt-3.5 animate-fade-up sm:mt-4">
          <h1 className="text-balance text-2xl leading-tight font-black tracking-tight text-ink sm:text-4xl lg:text-5xl">
            {truck.name}
          </h1>

          {/* Secondary identity meta — cuisine, rating, and the Partner
              badge all live here, off the name's own line, so the name
              reads clearly and the badge no longer competes for space
              against it. */}
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5">
            {(truck.cuisine_type || ratingSummary) && (
              <div className="flex flex-wrap items-center gap-x-1.5 text-sm text-muted sm:text-base">
                {truck.cuisine_type && <span className="font-medium tracking-wide">{truck.cuisine_type}</span>}
                {truck.cuisine_type && ratingSummary && <span aria-hidden="true">·</span>}
                {ratingSummary && (
                  <span className="inline-flex items-center gap-1 font-semibold text-ink">
                    <StarIcon />
                    {ratingSummary.average.toFixed(1)}
                    <span className="font-normal text-muted">({ratingSummary.count})</span>
                  </span>
                )}
              </div>
            )}
            {truck.is_verified && (
              <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-brand-dark shadow-sm ring-1 ring-inset ring-brand/20">
                <CheckBadgeIcon />
                TruckTap Partner
              </span>
            )}
          </div>
        </div>
      </div>

      {openViewer === "hero" && truck.hero_image && (
        <GalleryLightbox
          photos={[truck.hero_image]}
          truckName={`${truck.name} hero photo`}
          initialIndex={0}
          onClose={handleClose}
        />
      )}
      {openViewer === "logo" && truck.logo && (
        <GalleryLightbox
          photos={[truck.logo]}
          truckName={`${truck.name} logo`}
          initialIndex={0}
          onClose={handleClose}
        />
      )}
    </div>
  );
}

function StarIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" className="h-3.5 w-3.5 text-star">
      <path d="M10 1.5l2.59 5.25 5.79.84-4.19 4.09.99 5.77L10 14.77l-5.18 2.68.99-5.77L1.62 7.6l5.79-.84L10 1.5Z" />
    </svg>
  );
}

function CheckBadgeIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
      <path
        fillRule="evenodd"
        d="M10 1.5a2.25 2.25 0 0 1 1.632.7l.29.303c.25.262.596.406.955.396l.42-.012a2.25 2.25 0 0 1 2.309 2.309l-.012.42a1.35 1.35 0 0 0 .396.955l.303.29a2.25 2.25 0 0 1 0 3.264l-.303.29a1.35 1.35 0 0 0-.396.955l.012.42a2.25 2.25 0 0 1-2.309 2.309l-.42-.012a1.35 1.35 0 0 0-.955.396l-.29.303a2.25 2.25 0 0 1-3.264 0l-.29-.303a1.35 1.35 0 0 0-.955-.396l-.42.012a2.25 2.25 0 0 1-2.309-2.309l.012-.42a1.35 1.35 0 0 0-.396-.955l-.303-.29a2.25 2.25 0 0 1 0-3.264l.303-.29a1.35 1.35 0 0 0 .396-.955l-.012-.42a2.25 2.25 0 0 1 2.309-2.309l.42.012a1.35 1.35 0 0 0 .955-.396l.29-.303A2.25 2.25 0 0 1 10 1.5Zm3.03 6.53a.75.75 0 0 0-1.06-1.06L9 9.94 7.53 8.47a.75.75 0 0 0-1.06 1.06l2 2a.75.75 0 0 0 1.06 0l3.5-3.5Z"
        clipRule="evenodd"
      />
    </svg>
  );
}
