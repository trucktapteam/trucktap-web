import type { StatusBarTruck } from "@/lib/truck-view-models";
import { getLiveStatus, getTodayHours, getUpcomingStops } from "@/lib/format";
import { formatBasedNearLocation } from "@/lib/location";

type PrimaryAction = { label: string; href: string; external: boolean; variant: "primary" | "secondary" };

/**
 * The one obvious customer action for this truck.
 *
 * `truck.currentLocation` (the `locations` table) is a last-known "went
 * LIVE from here" coordinate, not a stable "usual spot" — production data
 * shows it can be a commissary, a home base, a test address, or wherever
 * the truck last happened to go live, and can be a different city than
 * `service_area` for the same truck (e.g. El Taco Rico: service_area
 * "Morton, IL" vs. this row "Tremont, IL"). That's an acceptable, expected
 * thing to send a customer to while the truck is actually LIVE and
 * intentionally sharing it right now ("Get Directions") — it is not
 * acceptable to expose or link to once the truck goes offline, since at
 * that point it's just a private/historical coordinate with no owner
 * intent behind showing it. Offline, this falls through to the next most
 * useful thing we actually have: Call, then Website, then no button.
 */
function getPrimaryAction(truck: StatusBarTruck, isLive: boolean): PrimaryAction | null {
  if (isLive && truck.currentLocation) {
    const href = `https://www.google.com/maps/search/?api=1&query=${truck.currentLocation.latitude},${truck.currentLocation.longitude}`;
    return { label: "Get Directions", href, external: true, variant: "primary" };
  }
  if (truck.phone) {
    return { label: `Call ${truck.name}`, href: `tel:${truck.phone}`, external: false, variant: "primary" };
  }
  if (truck.website) {
    return { label: "Visit Website", href: truck.website, external: true, variant: "primary" };
  }
  return null;
}

export function StatusBar({ truck }: { truck: StatusBarTruck }) {
  const status = getLiveStatus(truck);
  const todayHours = getTodayHours(truck);
  const hasUpcomingStops = getUpcomingStops(truck).length > 0;
  const isLive = status.kind === "live";
  const primaryAction = getPrimaryAction(truck, isLive);
  const basedNear = formatBasedNearLocation(truck.service_area);

  // Location/hours is its own group only when it actually has something to
  // show — no divider floating above an empty gap.
  const hasLocationGroup = isLive ? Boolean(truck.currentLocation) : Boolean(basedNear || todayHours);

  return (
    <section
      className={
        isLive
          ? "rounded-3xl border-2 border-success/30 bg-gradient-to-br from-success/[0.07] to-white p-5 shadow-[var(--shadow-card)]"
          : "rounded-3xl border border-border bg-white p-5 shadow-[var(--shadow-card)]"
      }
    >
      <div className="flex items-center gap-2.5">
        {isLive ? (
          <span className="relative flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-success shadow-[0_0_10px_2px_rgba(76,175,80,0.55)]" />
          </span>
        ) : (
          <span className="h-2.5 w-2.5 rounded-full bg-border" />
        )}
        <p
          className={
            isLive
              ? "text-base font-black tracking-tight text-ink sm:text-lg"
              : "text-sm font-bold tracking-tight text-ink"
          }
        >
          {isLive ? "Live now" : "Not live right now"}
        </p>
      </div>

      {status.kind === "live" ? (
        <p className="mt-1 text-xs text-muted">{status.freshnessLabel}</p>
      ) : (
        <p className="mt-1 text-xs text-muted">
          {status.lastSeenLabel
            ? status.lastSeenLabel
            : hasUpcomingStops
              ? "LIVE status not recently updated — check their upcoming stops below."
              : "LIVE status not recently updated."}
        </p>
      )}

      {hasLocationGroup && (
        <div className="mt-3.5 border-t border-border/70 pt-3.5">
          {status.kind === "live" && truck.currentLocation && (
            <p className="text-sm font-medium text-ink">{truck.currentLocation.label}</p>
          )}
          {status.kind !== "live" && (
            <>
              {/* `service_area` is genuinely owner-entered for public display
                  (per its own column comment), but owners often fill it in
                  as a specific street address rather than a described
                  region — reducing it to city/state via formatBasedNearLocation
                  keeps a home/personal address off the public profile. "Based
                  near" reads naturally either way, where "Usually serving"
                  implies a coverage area this field doesn't always describe. */}
              {basedNear && <p className="text-sm font-medium text-ink">Based near: {basedNear}</p>}
              {todayHours && (
                <p className={basedNear ? "mt-1 text-sm text-muted" : "text-sm text-muted"}>
                  {todayHours.closed ? "Closed today" : `Today: ${todayHours.open} – ${todayHours.close}`}
                </p>
              )}
            </>
          )}
        </div>
      )}

      {primaryAction && (
        <div className="mt-4 border-t border-border/70 pt-4">
          <a
            href={primaryAction.href}
            target={primaryAction.external ? "_blank" : undefined}
            rel={primaryAction.external ? "noopener noreferrer" : undefined}
            className={
              primaryAction.variant === "primary"
                ? "inline-flex min-h-11 w-full items-center justify-center gap-1.5 rounded-xl bg-brand px-4 py-3.5 text-sm font-semibold text-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:bg-brand-dark hover:shadow-md active:translate-y-0 active:scale-[0.98]"
                : "inline-flex min-h-11 w-full items-center justify-center gap-1.5 rounded-xl border-2 border-border bg-white px-4 py-3.5 text-sm font-semibold text-ink transition duration-200 hover:-translate-y-0.5 hover:border-brand hover:text-brand-dark active:translate-y-0 active:scale-[0.98]"
            }
          >
            {primaryAction.label}
            <ArrowIcon />
          </a>
        </div>
      )}
    </section>
  );
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
      <path
        fillRule="evenodd"
        d="M3 10a.75.75 0 0 1 .75-.75h10.638L11.29 6.16a.75.75 0 1 1 1.02-1.1l5 4.25a.75.75 0 0 1 0 1.18l-5 4.25a.75.75 0 1 1-1.02-1.1l3.098-2.59H3.75A.75.75 0 0 1 3 10Z"
        clipRule="evenodd"
      />
    </svg>
  );
}
