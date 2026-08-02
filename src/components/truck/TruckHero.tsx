import type { Truck } from "@/lib/types";
import { PlaceholderImage } from "./PlaceholderImage";

export function TruckHero({ truck }: { truck: Truck }) {
  return (
    <div className="relative">
      <div className="relative h-60 w-full overflow-hidden sm:h-80 lg:h-[26rem]">
        <PlaceholderImage
          seed={truck.hero_image ?? truck.id}
          label={`${truck.name} hero photo`}
          className="h-full w-full animate-ken-burns"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/0 to-black/10" />
      </div>

      <div className="mx-auto max-w-6xl px-4 lg:px-6">
        <div className="relative -mt-12 flex items-end gap-4 sm:-mt-16">
          <PlaceholderImage
            seed={truck.logo ?? `${truck.id}-logo`}
            label={`${truck.name} logo`}
            className="h-24 w-24 shrink-0 rounded-2xl border-4 border-white shadow-[var(--shadow-pop)] sm:h-28 sm:w-28"
          />

          <div className="min-w-0 animate-fade-up pb-1.5">
            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-2">
              <h1 className="text-balance text-2xl leading-tight font-black tracking-tight text-ink sm:text-4xl">
                {truck.name}
              </h1>
              {truck.is_verified && (
                <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-brand-dark shadow-sm ring-1 ring-inset ring-brand/20">
                  <CheckBadgeIcon />
                  TruckTap Partner
                </span>
              )}
            </div>
            {truck.cuisine_type && (
              <p className="mt-1.5 text-sm font-medium tracking-wide text-muted sm:text-base">
                {truck.cuisine_type}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
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
