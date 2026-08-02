import type { Truck } from "@/lib/types";
import { getLiveStatus, getTodayHours, getUpcomingStops } from "@/lib/format";

export function StatusBar({ truck }: { truck: Truck }) {
  const status = getLiveStatus(truck);
  const todayHours = getTodayHours(truck);
  const hasUpcomingStops = getUpcomingStops(truck).length > 0;

  if (status.kind === "live" && truck.currentLocation) {
    const directionsHref = `https://www.google.com/maps/search/?api=1&query=${truck.currentLocation.latitude},${truck.currentLocation.longitude}`;

    return (
      <section className="rounded-3xl border border-success/20 bg-gradient-to-br from-success/[0.06] to-white p-5 shadow-[var(--shadow-card)]">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-success shadow-[0_0_10px_2px_rgba(76,175,80,0.55)]" />
          </span>
          <p className="text-sm font-bold tracking-tight text-ink">Live now</p>
        </div>
        <p className="mt-1 text-xs text-muted">{status.freshnessLabel}</p>

        <p className="mt-4 text-sm font-medium text-ink">{truck.currentLocation.label}</p>

        <a
          href={directionsHref}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-brand px-4 py-3 text-sm font-semibold text-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:bg-brand-dark hover:shadow-md active:translate-y-0 active:scale-[0.98]"
        >
          Get Directions
          <ArrowIcon />
        </a>
      </section>
    );
  }

  // Not live: honest fallback — general area + today's hours, never a bare
  // "closed" badge with nothing else to go on.
  return (
    <section className="rounded-3xl border border-border bg-white p-5 shadow-[var(--shadow-card)]">
      <div className="flex items-center gap-2">
        <span className="h-2.5 w-2.5 rounded-full bg-border" />
        <p className="text-sm font-bold tracking-tight text-ink">Not live right now</p>
      </div>
      <p className="mt-1 text-xs text-muted">
        {status.kind === "not-live" && status.lastSeenLabel
          ? status.lastSeenLabel
          : hasUpcomingStops
            ? "This truck hasn't shared a live status yet — check their upcoming stops below."
            : "This truck hasn't shared a live status yet."}
      </p>

      {truck.service_area && (
        <p className="mt-4 text-sm font-medium text-ink">Usually serving: {truck.service_area}</p>
      )}

      {todayHours && (
        <p className="mt-1 text-sm text-muted">
          {todayHours.closed ? "Closed today" : `Today: ${todayHours.open} – ${todayHours.close}`}
        </p>
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
