import Image from "next/image";
import Link from "next/link";
import { getRollingTrucksOrFallback } from "@/lib/rolling-trucks";
import { PlaceholderImage } from "@/components/truck/PlaceholderImage";

/**
 * "THIS IS THE TRUCKTAP / PARTNER NETWORK." — the moment the page names the
 * thing the previous sections demonstrated (TTN-86 = the network alive,
 * RetentionSection = the customer side, OwnerStorySection = the truck
 * side). A charter, then the real roster as proof.
 *
 * Editorial + physical, same Modern TruckTap grammar as the sections
 * above: true black, huge white type, restrained orange, hairline rules,
 * no cards, no icons, no screenshots, no QR visual, no TTN styling.
 *
 * The roster reuses the real data helper `getRollingTrucksOrFallback()`
 * (same source the production homepage marquee reads) but NONE of the
 * production RollingTrucksSection component — it's rendered here as a
 * static, dense, edge-to-edge contact sheet on warm paper so real logos
 * keep their own colour and read as independent businesses, not a
 * SaaS logo carousel. No marquee, no animation.
 *
 * Copy is deliberately hedged — "can follow", "find their way back",
 * "part of how people discover" — no guaranteed reach / notifications /
 * ranking / analytics / follower-count claims. "New trucks join every
 * week" is existing production copy (RollingTrucksSection), kept small.
 *
 * No motion. Pricing / the "Become a TruckTap Partner" CTA is a later
 * section — the existing #owners placeholder stays after this one.
 */

const CHARTER = [
  {
    n: "01",
    title: "Be there when you're serving",
    body: "Go LIVE and put your truck in front of the customers looking right now.",
  },
  {
    n: "02",
    title: "Give your truck a home",
    body: "Your menu, photos, hours, upcoming stops and announcements all live on one TruckTap page.",
  },
  {
    n: "03",
    title: "Keep the connection",
    body: "Customers can follow the trucks they love and find their way back.",
  },
  {
    n: "04",
    title: "Put your stops on the network",
    body: "An upcoming stop isn't a post that scrolls away — it becomes part of how people discover trucks on TruckTap.",
  },
  {
    n: "05",
    title: "Take TruckTap with you",
    body: "Your real TruckTap QR poster gives customers at the window a direct path back to your truck.",
  },
  {
    n: "06",
    title: "Be a TruckTap Partner",
    body: "Verified Partners carry the TruckTap Partner badge and show up as part of the network across TruckTap.",
  },
] as const;

const MAX_ROSTER_LOGOS = 48;

export async function PartnerNetworkSection() {
  const roster = await getRollingTrucksOrFallback();

  return (
    <section
      aria-labelledby="partner-network-heading"
      className="bg-[#0a0a0a] text-white"
    >
      {/* ---------- CHARTER ---------- */}
      <div className="mx-auto max-w-[1400px] px-5 pt-24 pb-20 sm:px-8 lg:px-14 lg:pt-32 lg:pb-28 xl:px-20">
        <h2
          id="partner-network-heading"
          className="text-[clamp(2.6rem,7vw,6rem)] leading-[0.86] font-black tracking-[-0.02em] text-white uppercase"
        >
          This is the TruckTap
          <br />
          Partner Network.
        </h2>
        <p className="mt-6 max-w-[34ch] text-lg font-medium text-white/70 sm:text-xl">
          More than an app. A network your truck joins.
        </p>

        <ol className="mt-14 max-w-[52rem] divide-y divide-white/12 border-y border-white/12 sm:mt-16">
          {CHARTER.map((item) => (
            <li
              key={item.n}
              className="grid grid-cols-[2.5rem_1fr] gap-x-4 py-7 sm:grid-cols-[4.5rem_1fr] sm:gap-x-8 sm:py-9"
            >
              <span
                aria-hidden="true"
                className="text-2xl leading-none font-black text-[#ff6b00] tabular-nums sm:text-4xl"
              >
                {item.n}
              </span>
              <div>
                <h3 className="text-base font-black tracking-tight text-white uppercase sm:text-lg">
                  {item.title}
                </h3>
                <p className="mt-2 max-w-[48ch] text-sm leading-relaxed text-white/55 sm:text-[0.95rem]">
                  {item.body}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>

      {/* ---------- REAL ROSTER (full-bleed contact sheet on warm paper) ---------- */}
      <RosterField roster={roster} />
    </section>
  );
}

function RosterField({
  roster,
}: {
  roster: Awaited<ReturnType<typeof getRollingTrucksOrFallback>>;
}) {
  const cells =
    roster.source === "live"
      ? roster.trucks.slice(0, MAX_ROSTER_LOGOS).map((t) => ({
          key: t.id,
          name: t.name,
          href: `/truck/${t.slug}`,
          logo: (
            <PlaceholderImage
              seed={t.logo}
              label={t.name}
              fit="contain"
              fallback="hide"
              className="h-full w-full"
              sizes="150px"
            />
          ),
        }))
      : roster.trucks.map((t) => ({
          key: t.file,
          name: t.alt,
          href: null,
          logo: (
            <div className="relative h-full w-full">
              <Image
                src={`/home/trucks/${t.file}`}
                alt={t.alt}
                fill
                sizes="150px"
                className="object-contain"
              />
            </div>
          ),
        }));

  if (cells.length === 0) return null;

  return (
    <div className="bg-[#e7e2d7] text-[#161616]">
      <div className="mx-auto max-w-[1600px] px-4 py-12 sm:px-6 lg:px-10 lg:py-16">
        <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-3 border-b-2 border-[#161616]/25 pb-5">
          <h3 className="text-[clamp(1.5rem,3.6vw,2.6rem)] leading-[0.92] font-black tracking-tight text-[#161616] uppercase">
            Independent trucks.
            <br />
            One growing network.
          </h3>
          <p className="text-[11px] font-black tracking-[0.2em] text-[#4a4639] uppercase">
            New trucks join every week
          </p>
        </div>

        <ul className="mt-5 grid grid-cols-3 gap-px bg-[#161616]/15 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10">
          {cells.map((cell) =>
            cell.href ? (
              <li key={cell.key} className="bg-[#efeae0]">
                <Link
                  href={cell.href}
                  aria-label={cell.name}
                  className="relative flex aspect-square items-center justify-center p-3 hover:bg-white sm:p-4"
                >
                  {cell.logo}
                </Link>
              </li>
            ) : (
              <li
                key={cell.key}
                className="relative flex aspect-square items-center justify-center bg-[#efeae0] p-3 sm:p-4"
              >
                {cell.logo}
              </li>
            )
          )}
        </ul>
      </div>
    </div>
  );
}
