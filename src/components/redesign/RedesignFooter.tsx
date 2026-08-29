import Link from "next/link";

/**
 * The smallest possible footer for the promoted homepage: a copyright line
 * and the Privacy link, nothing else — no nav, no social, no logo, no CTA.
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
      </p>
    </footer>
  );
}
