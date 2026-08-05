"use client";

import { useCallback, useRef, useState, useSyncExternalStore } from "react";
import type { UpcomingStopsInfo } from "@/lib/truck-view-models";
import { formatDateTime, getUpcomingStops } from "@/lib/format";
import { PlaceholderImage } from "./PlaceholderImage";
import { SectionHeading } from "./SectionHeading";
import { GalleryLightbox } from "./GalleryLightbox";

const PREVIEW_COUNT = 5;

// Never actually changes, so there's nothing to subscribe to — this only
// exists to give useSyncExternalStore a value that's deliberately
// different between its server snapshot and its (one-time) client
// snapshot: false while server-rendering / on the client's first paint,
// true from then on. That's the "has this client finished its first
// render" signal used below to keep the stop time hydration-safe.
const noopSubscribe = () => () => {};
function useMounted(): boolean {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false
  );
}

export function UpcomingStopsSection({ truck }: { truck: UpcomingStopsInfo }) {
  const stops = getUpcomingStops(truck);
  const [expanded, setExpanded] = useState(false);

  // Tracked by stop id (not array index) since the visible slice can
  // shrink/reorder independently — its own state and its own single-image
  // array, isolated from every other photo viewer on the page (gallery,
  // menu board, menu items).
  const [openStopId, setOpenStopId] = useState<string | null>(null);
  const triggerRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const handleClose = useCallback(() => {
    setOpenStopId((id) => {
      triggerRefs.current[id ?? ""]?.focus();
      return null;
    });
  }, []);

  // Stop date/times are formatted in the viewer's own local time zone once
  // mounted — but that very first render happens twice for a Client
  // Component (once on the server, once again in the browser during
  // hydration), and the server's zone and the visitor's browser zone are
  // often different. Rendering in a fixed, explicit zone (UTC) until after
  // mount guarantees those two passes agree — a real fix, not a suppressed
  // warning — then this upgrades to the visitor's own local time on the
  // very next paint, which is what everyone actually wants to read.
  const mounted = useMounted();
  const timeZone = mounted ? undefined : "UTC";

  // No section at all when there's nothing scheduled — never an empty shell.
  if (stops.length === 0) return null;

  const hasMore = stops.length > PREVIEW_COUNT;
  const visibleStops = expanded ? stops : stops.slice(0, PREVIEW_COUNT);
  const openStop = openStopId ? (stops.find((s) => s.id === openStopId) ?? null) : null;

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
              <button
                ref={(el) => {
                  triggerRefs.current[stop.id] = el;
                }}
                type="button"
                onClick={() => setOpenStopId(stop.id)}
                aria-label={`Open event flyer for ${stop.location_text}`}
                className="block h-16 w-16 shrink-0 overflow-hidden rounded-xl shadow-sm focus-visible:ring-2 focus-visible:ring-brand"
              >
                <PlaceholderImage
                  seed={stop.flyer_image}
                  label="Event flyer"
                  className="h-full w-full"
                  sizes="64px"
                />
              </button>
            ) : (
              <DateChip iso={stop.starts_at} timeZone={timeZone} />
            )}
            <div className="min-w-0">
              <p className="text-sm font-semibold text-ink">{formatDateTime(stop.starts_at, timeZone)}</p>
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

      {openStop?.flyer_image && (
        <GalleryLightbox
          photos={[openStop.flyer_image]}
          truckName={truck.name}
          initialIndex={0}
          onClose={handleClose}
        />
      )}
    </section>
  );
}

/** Consistent left-anchor for stops without a flyer, so every row in the
 * list lines up the same way instead of alternating between a photo and
 * bare text — decorative/redundant with the date text next to it, so it's
 * hidden from assistive tech rather than announced twice.
 *
 * `timeZone` follows the same fixed-until-mounted pattern as the date/time
 * text next to it (see the `mounted` comment above): `date.getDate()`
 * reads the runtime's own ambient zone same as `toLocaleDateString` does,
 * so it needs the same explicit-UTC-until-mounted treatment to avoid a
 * hydration mismatch on the day-of-month digit. */
function DateChip({ iso, timeZone }: { iso: string; timeZone?: string }) {
  const date = new Date(iso);
  const month = date.toLocaleDateString("en-US", { month: "short", ...(timeZone ? { timeZone } : {}) });
  const day = timeZone === "UTC" ? date.getUTCDate() : date.getDate();

  return (
    <div
      aria-hidden="true"
      className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-xl bg-surface"
    >
      <span className="text-[10px] font-bold tracking-wide text-brand-dark uppercase">{month}</span>
      <span className="text-xl leading-none font-black text-ink">{day}</span>
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
