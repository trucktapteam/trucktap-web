import Image from "next/image";
import Link from "next/link";
import { screenshots } from "@/lib/home-data";
import { SectionHead } from "./SectionHead";

const SCREENS = [
  { ...screenshots.liveMap, feature: true },
  { ...screenshots.truckProfile, feature: true },
  { ...screenshots.truckMenu, feature: false },
  { ...screenshots.favorites, feature: false },
  { ...screenshots.notifications, feature: false },
];

export function ScreensSection() {
  return (
    <section id="screens" className="px-4 py-14 sm:py-20 lg:px-6">
      <div className="mx-auto max-w-6xl">
        <SectionHead
          kicker="App screens"
          title="Real discovery, not a dusty list."
          description="Map view, discovery, profiles, and sightings work together so customers can find trucks and owners can be found."
        />

        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-6">
          {SCREENS.map((s, i) => (
            <figure
              key={s.file}
              className={`overflow-hidden rounded-[1.9rem] border border-navy/10 bg-white p-2.5 shadow-[0_24px_60px_rgba(17,24,39,0.14)] transition duration-300 hover:-translate-y-1.5 hover:rotate-[-0.4deg] hover:shadow-[0_30px_70px_rgba(17,24,39,0.18)] ${
                s.feature ? "lg:col-span-3" : "lg:col-span-2"
              } ${i === 1 || i === 4 ? "lg:mt-7" : ""}`}
            >
              <div className="relative aspect-[1242/2688] w-full overflow-hidden rounded-[1.5rem]">
                <Image
                  src={`/home/screenshots/${s.file}`}
                  alt={s.alt}
                  fill
                  className="object-cover"
                  sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 90vw"
                />
              </div>
            </figure>
          ))}
        </div>

        <div className="mt-8 flex justify-center">
          <Link
            href="/truck/smoky-wheels-bbq"
            className="inline-flex items-center gap-2 rounded-2xl border border-navy/15 bg-white px-5 py-3 font-black text-navy shadow-[0_14px_34px_rgba(17,24,39,0.1)] transition duration-200 hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(17,24,39,0.14)] active:translate-y-0"
          >
            Preview a sample truck profile
            <ArrowRightIcon />
          </Link>
        </div>
      </div>
    </section>
  );
}

function ArrowRightIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
      <path
        fillRule="evenodd"
        d="M3 10a.75.75 0 0 1 .75-.75h10.638L11.29 6.16a.75.75 0 1 1 1.02-1.1l5 4.25a.75.75 0 0 1 0 1.18l-5 4.25a.75.75 0 1 1-1.02-1.1l3.098-2.59H3.75A.75.75 0 0 1 3 10Z"
        clipRule="evenodd"
      />
    </svg>
  );
}
