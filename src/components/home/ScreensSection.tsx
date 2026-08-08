import Image from "next/image";
import Link from "next/link";
import { storeScreenshots } from "@/lib/home-data";
import { SectionHead } from "./SectionHead";

export function ScreensSection() {
  return (
    <section id="screens" className="px-4 py-14 sm:py-20 lg:px-6">
      <div className="mx-auto max-w-6xl">
        <SectionHead
          kicker="App screens"
          title="See it in action."
          description="The exact screens live on the App Store and Google Play today — real discovery, real profiles, real trucks."
        />

        {/* Each screenshot already carries its own headline/subcopy (the
            actual App Store marketing set) — a horizontal, snap-scrolling
            strip lets all 10 stay full-size and legible instead of
            cramming them into a fixed grid. */}
        <div
          className="mt-10 -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 sm:mx-0 sm:px-0 lg:gap-5"
          aria-label="TruckTap app screens"
        >
          {storeScreenshots.map((s) => (
            <figure
              key={s.file}
              className="w-[78vw] shrink-0 snap-center overflow-hidden rounded-[1.9rem] border border-navy/10 bg-white shadow-[0_24px_60px_rgba(17,24,39,0.14)] transition duration-300 hover:-translate-y-1.5 hover:shadow-[0_30px_70px_rgba(17,24,39,0.18)] sm:w-[300px] lg:w-[340px]"
            >
              <div className="relative aspect-[1290/2796] w-full overflow-hidden rounded-[1.9rem]">
                <Image
                  src={`/home/screenshots/${s.file}`}
                  alt={s.alt}
                  fill
                  className="object-cover"
                  sizes="(min-width: 1024px) 340px, (min-width: 640px) 300px, 78vw"
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
