"use client";

import { useMemo, useState } from "react";
import type { DirectoryTruckCard } from "@/lib/trucks-directory";
import { TruckListingCard } from "./TruckListingCard";

/**
 * Client-side filter over an already-ranked, server-fetched list — no
 * search API, no re-fetch, no re-ranking on type. Matches on name and
 * cuisine only: `service_area` (the only location field `public_trucks`
 * has) is free text that's frequently a street address, with no reliable
 * way to search it without either matching on address text we otherwise
 * never expose, or silently missing every truck whose address didn't
 * parse into a clean city/state — see formatBasedNearLocation. The
 * server's ranking order is always preserved within the filtered set.
 */
export function TrucksDirectory({ trucks }: { trucks: DirectoryTruckCard[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return trucks;
    return trucks.filter(
      (truck) =>
        truck.name.toLowerCase().includes(normalized) ||
        (truck.cuisine_type?.toLowerCase().includes(normalized) ?? false)
    );
  }, [trucks, query]);

  return (
    <div>
      <label htmlFor="truck-search" className="sr-only">
        Search trucks by name or cuisine
      </label>
      <div className="relative">
        <SearchIcon />
        <input
          id="truck-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name or cuisine — “tacos”, “BBQ”, “Papa Pasta”…"
          className="min-h-12 w-full rounded-2xl border border-border bg-white py-3 pr-4 pl-11 text-base text-ink shadow-[var(--shadow-card)] outline-none transition placeholder:text-muted focus:border-brand focus:ring-2 focus:ring-brand/20"
        />
      </div>

      <p className="mt-3 text-sm text-muted" aria-live="polite">
        {filtered.length === trucks.length
          ? `${trucks.length} truck${trucks.length === 1 ? "" : "s"}`
          : `${filtered.length} of ${trucks.length} trucks`}
      </p>

      {filtered.length === 0 ? (
        <p className="mt-8 rounded-2xl border border-dashed border-border bg-white p-8 text-center text-sm text-muted">
          No trucks match “{query}”. Try a different name or cuisine.
        </p>
      ) : (
        <ul className="mt-4 flex flex-col gap-3">
          {filtered.map((truck) => (
            <li key={truck.id}>
              <TruckListingCard truck={truck} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function SearchIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="pointer-events-none absolute top-1/2 left-4 h-4.5 w-4.5 -translate-y-1/2 text-muted"
    >
      <circle cx="9" cy="9" r="6.5" />
      <path d="m17 17-3.8-3.8" />
    </svg>
  );
}
