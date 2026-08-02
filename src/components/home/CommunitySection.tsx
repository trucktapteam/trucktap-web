import Image from "next/image";
import { screenshots } from "@/lib/home-data";

const MINI_POINTS = [
  "Share sightings when you find something good.",
  "Help neighbors skip stale information.",
  "Keep favorite trucks easier to find next time.",
];

export function CommunitySection() {
  return (
    <section id="community" className="px-4 py-14 sm:py-20 lg:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-9">
          <div className="grid grid-cols-2 gap-3.5" aria-label="Food truck app photos">
            <div className="relative row-span-2 -rotate-2 overflow-hidden rounded-[1.75rem] border-[8px] border-white bg-black shadow-[0_14px_34px_rgba(17,24,39,0.1)] transition duration-200 hover:z-10 hover:-translate-y-1 hover:rotate-0 hover:shadow-[0_24px_60px_rgba(17,24,39,0.14)]">
              <Image
                src={`/home/screenshots/${screenshots.discoverMap.file}`}
                alt={screenshots.discoverMap.alt}
                fill
                className="object-contain"
                sizes="(min-width: 1024px) 22vw, 44vw"
              />
            </div>
            <div className="rotate-2 overflow-hidden rounded-[1.75rem] border-[8px] border-white bg-black shadow-[0_14px_34px_rgba(17,24,39,0.1)] transition duration-200 hover:z-10 hover:-translate-y-1 hover:rotate-0 hover:shadow-[0_24px_60px_rgba(17,24,39,0.14)]">
              <div className="relative aspect-[1242/2688] w-full">
                <Image
                  src={`/home/screenshots/${screenshots.truckProfile.file}`}
                  alt="TruckTap truck profile with real truck details"
                  fill
                  className="object-contain"
                  sizes="(min-width: 1024px) 22vw, 44vw"
                />
              </div>
            </div>
            <div className="-rotate-1 overflow-hidden rounded-[1.75rem] border-[8px] border-white bg-black shadow-[0_14px_34px_rgba(17,24,39,0.1)] transition duration-200 hover:z-10 hover:-translate-y-1 hover:rotate-0 hover:shadow-[0_24px_60px_rgba(17,24,39,0.14)]">
              <div className="relative aspect-[1242/2688] w-full">
                <Image
                  src={`/home/screenshots/${screenshots.notifications.file}`}
                  alt={screenshots.notifications.alt}
                  fill
                  className="object-contain"
                  sizes="(min-width: 1024px) 22vw, 44vw"
                />
              </div>
            </div>
          </div>

          <div className="rounded-[1.9rem] bg-navy p-7 text-white shadow-[0_24px_60px_rgba(17,24,39,0.14)] sm:p-10">
            <span className="mb-3 inline-flex text-sm font-black tracking-[0.08em] text-brand/80 uppercase">
              Real-world energy
            </span>
            <h2 className="text-balance text-4xl leading-[0.95] font-black tracking-tight sm:text-5xl">
              Built for the parking lot, the brewery, the festival, and the sudden craving.
            </h2>
            <p className="mt-4 text-pretty text-white/76">
              TruckTap is community-focused, not corporate. It is for people who spot a truck and want to share it,
              owners who need visibility today, and locals who know the best meals are sometimes on wheels.
            </p>
            <ul className="mt-6 grid gap-2.5">
              {MINI_POINTS.map((p) => (
                <li key={p} className="rounded-2xl bg-cream px-3.5 py-3 font-extrabold text-ink">
                  {p}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
