import Link from "next/link";
import type { DirectoryTruckCard } from "@/lib/trucks-directory";
import { PlaceholderImage } from "@/components/truck/PlaceholderImage";

/**
 * One row in the `/trucks` directory. Always links to the canonical
 * `/truck/<slug>` route — never the legacy `/truck/<uuid>` form — and
 * renders one of exactly three status treatments (`tier`), matching the
 * wording StatusBar already uses on the profile page ("Live now" / "Not
 * live right now") so the two surfaces read as the same product rather
 * than inventing new language here.
 */
export function TruckListingCard({ truck }: { truck: DirectoryTruckCard }) {
  return (
    <Link
      href={`/truck/${truck.slug}`}
      className={
        truck.tier === "live"
          ? "flex items-center gap-3.5 rounded-2xl border-2 border-success/30 bg-gradient-to-br from-success/[0.06] to-white p-3.5 shadow-[var(--shadow-card)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-card-hover)] sm:gap-4 sm:p-4"
          : "flex items-center gap-3.5 rounded-2xl border border-border bg-white p-3.5 shadow-[var(--shadow-card)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-card-hover)] sm:gap-4 sm:p-4"
      }
    >
      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl sm:h-20 sm:w-20">
        <PlaceholderImage
          seed={truck.logo ?? truck.hero_image ?? truck.id}
          label={`${truck.name} logo`}
          className="h-full w-full"
          sizes="80px"
        />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-1.5">
          <p className="truncate text-base font-bold text-ink">{truck.name}</p>
          {truck.is_verified && (
            <span
              className="inline-flex shrink-0 items-center rounded-full bg-brand/10 px-2 py-0.5 text-[11px] font-semibold text-brand-dark"
              title="TruckTap Partner"
            >
              Partner
            </span>
          )}
        </div>

        {truck.cuisine_type && <p className="truncate text-sm text-muted">{truck.cuisine_type}</p>}

        <StatusLine truck={truck} />
      </div>
    </Link>
  );
}

function StatusLine({ truck }: { truck: DirectoryTruckCard }) {
  if (truck.tier === "live") {
    return (
      <p className="mt-1 flex items-center gap-1.5 text-sm">
        <LiveDot />
        <span className="font-semibold text-ink">Live now</span>
        {truck.basedNear && <span className="truncate text-muted">near {truck.basedNear}</span>}
      </p>
    );
  }

  if (truck.tier === "upcoming" && truck.nextStop) {
    return (
      <p className="mt-1 flex flex-wrap items-center gap-x-1.5 text-sm">
        <span className="h-2 w-2 shrink-0 rounded-full bg-warning" aria-hidden="true" />
        <span className="font-semibold text-ink">Upcoming</span>
        <span className="truncate text-muted">
          {truck.nextStop.whenLabel} · {truck.nextStop.locationText}
        </span>
      </p>
    );
  }

  return (
    <p className="mt-1 flex items-center gap-1.5 text-sm">
      <span className="h-2 w-2 shrink-0 rounded-full bg-border" aria-hidden="true" />
      <span className="truncate text-muted">
        Not live right now{truck.freshnessLabel ? ` · ${truck.freshnessLabel}` : ""}
      </span>
    </p>
  );
}

function LiveDot() {
  return (
    <span className="relative flex h-2.5 w-2.5 shrink-0">
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
      <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-success" />
    </span>
  );
}
