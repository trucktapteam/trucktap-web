import Link from "next/link";

/**
 * The bottom-of-profile counterpart to DiscoverTrucksLink at the top: a
 * visitor who scrolled through this whole profile (rather than bouncing
 * immediately) gets a second, more deliberate invitation into the wider
 * TruckTap directory instead of the page just ending. Light card styling
 * (matches TrustFooter/QuickActions) rather than AppDownloadCta's dark
 * gradient — this is a different, non-competing kind of next step
 * ("see more trucks" vs. "get the app"), not a restyled duplicate of it.
 */
export function DiscoverTrucksCta() {
  return (
    <section className="flex flex-col items-start gap-2 rounded-3xl border border-border bg-white p-6 shadow-sm">
      <p className="text-base font-bold tracking-tight text-ink">Hungry for something else?</p>
      <p className="text-sm text-muted">Find food trucks, trailers, carts, and mobile vendors near you.</p>
      <Link
        href="/trucks"
        className="mt-2 inline-flex items-center gap-1.5 text-sm font-bold text-brand-dark transition duration-200 hover:translate-x-0.5"
      >
        Find Trucks Near Me
        <ArrowRightIcon />
      </Link>
    </section>
  );
}

function ArrowRightIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" className="h-3.5 w-3.5">
      <path
        fillRule="evenodd"
        d="M3 10a.75.75 0 0 1 .75-.75h10.69l-3.72-3.72a.75.75 0 1 1 1.06-1.06l5 5a.75.75 0 0 1 0 1.06l-5 5a.75.75 0 1 1-1.06-1.06l3.72-3.72H3.75A.75.75 0 0 1 3 10Z"
        clipRule="evenodd"
      />
    </svg>
  );
}
