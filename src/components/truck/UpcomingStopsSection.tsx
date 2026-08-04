"use client";

import { useState } from "react";
import type { Truck } from "@/lib/types";
import { formatDateTime, getUpcomingStops } from "@/lib/format";
import { PlaceholderImage } from "./PlaceholderImage";
import { SectionHeading } from "./SectionHeading";

const PREVIEW_COUNT = 5;

export function UpcomingStopsSection({ truck }: { truck: Truck }) {
  const stops = getUpcomingStops(truck);
  const [expanded, setExpanded] = useState(false);

  // No section at all when there's nothing scheduled — never an empty shell.
  if (stops.length === 0) return null;

  const hasMore = stops.length > PREVIEW_COUNT;
  const visibleStops = expanded ? stops : stops.slice(0, PREVIEW_COUNT);

  return (
    <section>
      <SectionHeading title="Upcoming Stops" />

      <ul id="upcoming-stops-list" className="mt-4 space-y-3">
        {visibleStops.map((stop) => (
          <li
            key={stop.id}
            className="flex gap-3.5 rounded-2xl border border-border bg-white p-3.5 shadow-[var(--shadow-card)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-card-hover)]"
          >
            {stop.flyer_image ? (
              <PlaceholderImage
                seed={stop.flyer_image}
                label="Event flyer"
                className="h-16 w-16 shrink-0 rounded-xl shadow-sm"
                sizes="64px"
              />
            ) : (
              <DateChip iso={stop.starts_at} />
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

      {hasMore && (
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          aria-expanded={expanded}
          aria-controls="upcoming-stops-list"
          className="mt-4 inline-flex min-h-11 items-center gap-1.5 rounded-full border border-border bg-white px-4 py-2 text-sm font-semibold text-ink shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-brand hover:text-brand-dark hover:shadow-md active:translate-y-0 active:scale-[0.97]"
        >
          {expanded ? "Show fewer" : `Show all ${stops.length} upcoming stops`}
          <ChevronIcon expanded={expanded} />
        </button>
      )}
    </section>
  );
}

/** Consistent left-anchor for stops without a flyer, so every row in the
 * list lines up the same way instead of alternating between a photo and
 * bare text — decorative/redundant with the date text next to it, so it's
 * hidden from assistive tech rather than announced twice. */
function DateChip({ iso }: { iso: string }) {
  const date = new Date(iso);
  const month = date.toLocaleDateString("en-US", { month: "short" });

  return (
    <div
      aria-hidden="true"
      className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-xl bg-surface"
    >
      <span className="text-[10px] font-bold tracking-wide text-brand-dark uppercase">{month}</span>
      <span className="text-xl leading-none font-black text-ink">{date.getDate()}</span>
    </div>
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

function ChevronIcon({ expanded }: { expanded: boolean }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="currentColor"
      className={`h-3.5 w-3.5 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
    >
      <path
        fillRule="evenodd"
        d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.168l3.71-3.938a.75.75 0 1 1 1.08 1.04l-4.25 4.5a.75.75 0 0 1-1.08 0l-4.25-4.5a.75.75 0 0 1 .02-1.06Z"
        clipRule="evenodd"
      />
    </svg>
  );
}
