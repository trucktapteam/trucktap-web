import Image from "next/image";
import Link from "next/link";

/**
 * Sits above TruckHero on every public truck profile — a visitor who lands
 * directly on a truck page from a Google search should be able to tell
 * they're on TruckTap without scrolling, and get back into the rest of the
 * site if they want to. Two links, not a full header: the homepage's
 * SiteHeader carries a lot more (anchor nav, Facebook link, mobile menu)
 * that only makes sense in the homepage's own context, so this reuses just
 * the brand mark from it — same /brand/logo.png asset, same wordmark
 * markup/colors — rather than pulling in navigation that would compete
 * with the vendor's own identity on this page. Kept deliberately small
 * (no background, no border, no sticky positioning) so it reads as a
 * light identification strip, not a second hero.
 */
export function TruckProfileTopBar() {
  return (
    <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-3 gap-y-1.5 px-4 pt-4 lg:px-6">
      <Link href="/" className="inline-flex items-center gap-1.5" aria-label="TruckTap home">
        <Image src="/brand/logo.png" alt="" width={58} height={68} className="h-6 w-auto sm:h-7" />
        <span className="text-base font-black tracking-tight text-navy sm:text-lg">
          Truck<span className="text-brand">Tap</span>
        </span>
      </Link>

      <Link
        href="/trucks"
        className="inline-flex items-center gap-1.5 text-sm font-bold text-muted transition duration-200 hover:translate-x-0.5 hover:text-brand-dark"
      >
        Find More Food Trucks
        <ArrowRightIcon />
      </Link>
    </div>
  );
}

function ArrowRightIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" className="h-3.5 w-3.5 shrink-0">
      <path
        fillRule="evenodd"
        d="M3 10a.75.75 0 0 1 .75-.75h10.69l-3.72-3.72a.75.75 0 1 1 1.06-1.06l5 5a.75.75 0 0 1 0 1.06l-5 5a.75.75 0 1 1-1.06-1.06l3.72-3.72H3.75A.75.75 0 0 1 3 10Z"
        clipRule="evenodd"
      />
    </svg>
  );
}
