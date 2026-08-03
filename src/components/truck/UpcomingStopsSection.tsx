import type { Truck } from "@/lib/types";
import { formatDateTime, getUpcomingStops } from "@/lib/format";
import { PlaceholderImage } from "./PlaceholderImage";
import { SectionHeading } from "./SectionHeading";

export function UpcomingStopsSection({ truck }: { truck: Truck }) {
  const stops = getUpcomingStops(truck);

  // No section at all when there's nothing scheduled — never an empty shell.
  if (stops.length === 0) return null;

  return (
    <section>
      <SectionHeading title="Upcoming Stops" />

      <ul className="mt-4 space-y-3">
        {stops.map((stop) => (
          <li
            key={stop.id}
            className="flex gap-3.5 rounded-2xl border border-border bg-white p-3.5 shadow-[var(--shadow-card)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-card-hover)]"
          >
            {stop.flyer_image && (
              <PlaceholderImage
                seed={stop.flyer_image}
                label="Event flyer"
                className="h-16 w-16 shrink-0 rounded-xl shadow-sm"
                sizes="64px"
              />
            )}
            <div className="min-w-0">
              <p className="text-sm font-semibold text-ink">{formatDateTime(stop.starts_at)}</p>
              <p className="mt-0.5 flex items-center gap-1 text-sm text-muted">
                <PinIcon />
                {stop.location_text}
              </p>
              {stop.note && <p className="mt-1 text-xs text-muted">{stop.note}</p>}
              {stop.status === "delayed" && (
                <span className="mt-1.5 inline-block rounded-full bg-warning/15 px-2 py-0.5 text-xs font-medium text-warning">
                  Delayed
                </span>
              )}
              {stop.status === "sold_out" && (
                <span className="mt-1.5 inline-block rounded-full bg-danger/10 px-2 py-0.5 text-xs font-medium text-danger">
                  Sold out
                </span>
              )}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

function PinIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5 shrink-0 text-muted/70">
      <path
        fillRule="evenodd"
        d="M9.69 18.933a.75.75 0 0 0 .62 0c.246-.113 5.94-2.766 5.94-9.183a6.25 6.25 0 1 0-12.5 0c0 6.417 5.694 9.07 5.94 9.183ZM10 12.5a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
        clipRule="evenodd"
      />
    </svg>
  );
}
