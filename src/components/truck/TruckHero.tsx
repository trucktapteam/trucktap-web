import type { Truck } from "@/lib/types";
import { getRatingSummary } from "@/lib/format";
import { PlaceholderImage } from "./PlaceholderImage";

export function TruckHero({ truck }: { truck: Truck }) {
  const ratingSummary = getRatingSummary(truck);

  return (
    <div className="relative">
      {/* Mobile/sm height unchanged — only the lg height is trimmed, so
          desktop dominance eases off without weakening the mobile hero. */}
      <div className="relative h-60 w-full overflow-hidden sm:h-80 lg:h-96">
        <PlaceholderImage
          seed={truck.hero_image ?? truck.id}
          label={`${truck.name} hero photo`}
          className="h-full w-full animate-ken-burns"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/0 to-black/10" />
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
          <PlaceholderImage
            seed={truck.logo ?? `${truck.id}-logo`}
            label={`${truck.name} logo`}
            className="h-24 w-24 shrink-0 rounded-2xl border-4 border-white shadow-[var(--shadow-pop)] sm:h-28 sm:w-28 lg:h-32 lg:w-32"
            sizes="(min-width: 1024px) 128px, (min-width: 640px) 112px, 96px"
          />
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
