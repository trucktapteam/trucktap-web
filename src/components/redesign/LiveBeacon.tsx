import Link from "next/link";

/**
 * The genuine "the network is live right now" signal, shared by the
 * redesign hero prototypes. Purely presentational — the caller fetches the
 * live truck (from the existing `/trucks` directory helper) and passes it
 * in, or passes `null` when nothing is actually live, in which case this
 * collapses to a static, non-pulsing beacon. Never fabricates a truck.
 *
 * The only motion is the beacon ring pulse, and it runs *only* when a real
 * truck is live. `prefers-reduced-motion` disables it (scoped rule below;
 * globals.css also neutralizes it globally).
 */

export type LiveTruck = { name: string; slug: string; basedNear: string | null };

/** Render once per page, above any <LiveSignal>. Scoped to `.tt-beacon`. */
export function BeaconKeyframes() {
  return (
    <style>{`
.tt-beacon { position: relative; display: inline-flex; height: 0.7rem; width: 0.7rem; flex: none; }
.tt-beacon span { position: absolute; inset: 0; border-radius: 9999px; display: block; }
.tt-beacon .tt-core {
  background: #ff6b00;
  box-shadow: 0 0 10px 2px rgba(255,107,0,0.65), 0 0 24px 7px rgba(255,107,0,0.32);
}
.tt-beacon .tt-ring { border: 1.5px solid rgba(255,107,0,0.6); opacity: 0; }
.tt-beacon[data-live="true"] .tt-ring { animation: tt-beacon-ping 2600ms cubic-bezier(0,0,0.2,1) infinite; }
.tt-beacon[data-live="true"] .tt-ring-2 { animation-delay: 1300ms; }
@keyframes tt-beacon-ping {
  0%   { transform: scale(1); opacity: 0.85; }
  70%  { opacity: 0; }
  100% { transform: scale(4); opacity: 0; }
}
@media (prefers-reduced-motion: reduce) {
  .tt-beacon .tt-ring { animation: none !important; opacity: 0 !important; }
}
`}</style>
  );
}

export function Beacon({ live }: { live: boolean }) {
  return (
    <span className="tt-beacon" data-live={live ? "true" : "false"} aria-hidden="true">
      <span className="tt-ring" />
      <span className="tt-ring tt-ring-2" />
      <span className="tt-core" />
    </span>
  );
}

/**
 * Borderless: the signal sits directly on the black background — no card,
 * border, fill, ring, or blur. It should read as a small network signal
 * embedded in the page, not another UI component.
 */
export function LiveSignal({ truck }: { truck: LiveTruck | null }) {
  if (!truck) {
    return (
      <span className="inline-flex opacity-55">
        <Beacon live={false} />
      </span>
    );
  }

  return (
    <Link
      href={`/truck/${truck.slug}`}
      aria-label={`${truck.name} is live right now${truck.basedNear ? ` near ${truck.basedNear}` : ""}. View truck profile.`}
      className="group inline-flex max-w-[18rem] items-center gap-2.5 text-white/70 transition-colors duration-200 hover:text-white"
    >
      <Beacon live />
      <span className="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-0.5 leading-tight">
        <span className="text-[10px] font-black tracking-[0.28em] text-[#ff6b00] uppercase">
          Live
        </span>
        <span className="truncate text-[13px] font-bold tracking-wide text-white uppercase">
          {truck.name}
        </span>
        {truck.basedNear && (
          <span className="truncate text-[11px] tracking-wide text-white/45 uppercase">
            {truck.basedNear}
          </span>
        )}
      </span>
    </Link>
  );
}
