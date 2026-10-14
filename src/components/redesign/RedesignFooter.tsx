import Link from "next/link";
import { FACEBOOK_URL } from "@/lib/home-data";

/**
 * The smallest possible footer for the promoted homepage: a copyright line,
 * the Privacy link and a single Facebook icon — no nav, no logo, no CTA.
 * Sized to dissolve into the black closing space beneath
 * BecomePartnerSection rather than read as a designed footer band.
 *
 * Rendered outside the page's <main> so it forms the `contentinfo`
 * landmark the composition otherwise lacks, and gives every page a
 * reachable link to /privacy.
 */
export function RedesignFooter() {
  return (
    <footer className="bg-[#0a0a0a] px-5 pb-8 text-[11px] text-white/50 sm:px-8 lg:px-14 xl:px-20">
      <p className="flex flex-wrap items-center gap-x-4 gap-y-1">
        <span>&copy; {new Date().getFullYear()} TruckTap</span>
        <Link
          href="/privacy"
          className="underline decoration-white/25 underline-offset-4 transition-colors duration-150 hover:text-white/75"
        >
          Privacy
        </Link>
        {/* Negative margin offsets the padding so the tap target grows without shifting the line. */}
        <a
          href={FACEBOOK_URL}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="TruckTap on Facebook (opens in a new tab)"
          className="-m-2 inline-flex p-2 transition-colors duration-150 hover:text-white/75"
        >
          <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" className="h-3.5 w-3.5">
            <path d="M11.5 4.5h1.5V2.1C12.7 2.03 11.85 2 10.87 2 8.83 2 7.5 3.24 7.5 5.6V7.5H5.25v2.7H7.5V18h2.85v-7.8h2.36l.38-2.7h-2.74V5.9c0-.78.21-1.4 1.15-1.4Z" />
          </svg>
        </a>
      </p>
    </footer>
  );
}
