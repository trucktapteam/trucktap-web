import Link from "next/link";
import type { AreaLink, AreaLinks } from "@/lib/geography";

const CHIP = {
  light:
    "shrink-0 whitespace-nowrap rounded-full border border-border bg-white px-3.5 py-1.5 text-sm font-semibold text-ink shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-brand hover:text-brand-dark",
  dark: "shrink-0 whitespace-nowrap rounded-full border border-white/20 px-3.5 py-1.5 text-sm font-semibold text-white/80 transition-colors duration-150 hover:border-[#ff6b00] hover:text-white",
};

function Chips({ links, tone }: { links: AreaLink[]; tone: keyof typeof CHIP }) {
  return (
    <>
      {links.map((link) => (
        <Link key={link.href} href={link.href} className={CHIP[tone]}>
          {link.label}
        </Link>
      ))}
    </>
  );
}

/** Plain server-rendered links to the state and city pages that exist. Renders nothing when there are none. */
export function AreaLinksNav({
  links,
  tone = "light",
  className = "",
}: {
  links: AreaLinks;
  tone?: keyof typeof CHIP;
  className?: string;
}) {
  if (links.states.length === 0 && links.cities.length === 0) return null;

  return (
    <nav aria-label="Browse food trucks by area" className={className}>
      <p className={tone === "dark" ? "text-sm font-bold text-white/60" : "text-sm font-bold text-navy/60"}>
        Browse food trucks by area
      </p>
      {/* One swipeable row on phones so the links don't push content down; wraps from `sm` up. */}
      <div className="mt-1 flex gap-2 overflow-x-auto py-1 [scrollbar-width:none] sm:flex-wrap sm:overflow-visible">
        <Chips links={links.states} tone={tone} />
        <Chips links={links.cities} tone={tone} />
      </div>
    </nav>
  );
}
