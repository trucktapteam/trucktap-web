import Image from "next/image";
import Link from "next/link";
import { PosterArtwork } from "@/components/truck/TruckQrPoster";
import type { RetentionTruck } from "@/lib/redesign/retention-truck";

/**
 * "LOVE THIS TRUCK? / DON'T LOSE IT." — the page settling back into Modern
 * TruckTap after the TTN-86 broadcast. Deliberately calm: true black, huge
 * type, one real photograph, one real printed poster, generous negative
 * space, restrained orange, a plain numbered three-step strip. No motion
 * beyond the poster's rest-tilt -> straighten on hover (globals.css's
 * prefers-reduced-motion rule collapses that to instant, same as the
 * Option B hero's two photos).
 *
 * Everything is one real truck: the staged poster is the actual
 * <PosterArtwork> the app and this site already generate (never redrawn),
 * its QR encodes that truck's real profile via the existing payload logic,
 * the photo is that truck's serving window, and the visible link points at
 * the same profile as an accessible text equivalent to the QR.
 *
 * Renders nothing when `truck` is null (data lookup failed): the prototype
 * page just runs hero -> handoff -> TTN-86 -> owners without this beat.
 */

const STEPS = [
  { n: "01", head: "Scan", body: "the code at the truck" },
  { n: "02", head: "Follow", body: "follow the truck on TruckTap" },
  { n: "03", head: "Find them again", body: "see when and where they’re serving next" },
] as const;

// Same rest-tilt -> straighten/lift hover the Option B hero uses on its
// photos; the global prefers-reduced-motion rule makes it instant.
const POSTER_MOTION =
  "transition-transform duration-300 ease-out hover:-translate-y-1 hover:rotate-0";

const MASK_STYLE = {
  maskImage: "var(--m)",
  WebkitMaskImage: "var(--m)",
  maskRepeat: "no-repeat",
  WebkitMaskRepeat: "no-repeat",
  maskSize: "100% 100%",
  WebkitMaskSize: "100% 100%",
} as const;

export function RetentionSection({ truck }: { truck: RetentionTruck | null }) {
  if (!truck) return null;

  const profileHref = `/truck/${truck.slug}`;

  return (
    <section
      aria-labelledby="retention-heading"
      className="relative overflow-hidden bg-[#0a0a0a] text-white"
    >
      <div className="mx-auto flex max-w-[1400px] flex-col gap-y-12 px-5 py-24 sm:px-8 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,42%)] lg:grid-rows-[auto_auto_auto] lg:gap-x-16 lg:gap-y-7 lg:px-14 lg:py-36 xl:px-20">
        {/* 1 — PRIMARY MESSAGE */}
        <div className="lg:col-start-1 lg:row-start-1 lg:max-w-[32ch] lg:self-end">
          <h2
            id="retention-heading"
            className="text-[clamp(2.6rem,7vw,6rem)] leading-[0.86] font-black tracking-[-0.02em] text-white uppercase"
          >
            Love this truck?
            <br />
            Don&rsquo;t lose it.
          </h2>
          <p className="mt-6 text-sm font-black tracking-[0.28em] text-white/55 uppercase sm:text-base">
            Scan. Follow. Find them again.
          </p>
        </div>

        {/* 2 — SCENE: serving-window photo + the real poster staged as a
               physical object (angled + hard shadow on desktop, upright and
               readable on mobile). Not a card. */}
        <div className="lg:col-start-2 lg:row-span-3 lg:row-start-1 lg:self-center">
          <div className="relative">
            {truck.windowImage && (
              <div
                className="relative h-[34vh] min-h-[15rem] w-full overflow-hidden [--m:linear-gradient(180deg,transparent,#000_16%,#000_84%,transparent)] sm:h-[38vh] lg:absolute lg:inset-y-[-3.5rem] lg:right-[-4rem] lg:left-[1.5rem] lg:h-auto lg:[--m:linear-gradient(100deg,transparent,#000_24%,#000_80%,transparent)]"
                style={MASK_STYLE}
              >
                <Image
                  src={truck.windowImage.src}
                  alt={truck.windowImage.alt}
                  fill
                  sizes="(min-width: 1024px) 44vw, 100vw"
                  className="object-cover object-[64%_42%] brightness-[0.58] contrast-[1.04] saturate-[0.9]"
                />
              </div>
            )}

            <div
              className={`relative z-10 mx-auto w-[min(18.5rem,72vw)] lg:mx-0 lg:-mr-6 lg:ml-auto lg:w-[18.5rem] lg:-rotate-[4deg] ${
                truck.windowImage ? "-mt-20 sm:-mt-24 lg:mt-12" : ""
              } ${POSTER_MOTION}`}
            >
              <div className="drop-shadow-[0_24px_42px_rgba(0,0,0,0.7)]">
                <PosterArtwork truck={truck.poster} qrSize={156} />
              </div>
            </div>
          </div>
        </div>

        {/* 3 — VISIBLE TEXT EQUIVALENT TO THE QR (same profile the QR encodes) */}
        <div className="lg:col-start-1 lg:row-start-2 lg:self-start">
          <Link
            href={profileHref}
            className="group -mx-1 inline-flex items-center gap-2 px-1 py-1.5 text-sm font-black tracking-[0.08em] text-[#ff6b00] uppercase underline-offset-4 transition-colors duration-150 hover:text-[#ff7f2a] hover:underline"
          >
            See {truck.poster.name} on TruckTap
            <span
              aria-hidden="true"
              className="transition-transform duration-150 group-hover:translate-x-0.5"
            >
              &rarr;
            </span>
          </Link>
        </div>

        {/* 4 — THREE-STEP STRIP (plain numbered rows, hairline rules, no cards) */}
        <ol className="max-w-md border-t border-white/12 lg:col-start-1 lg:row-start-3 lg:self-start">
          {STEPS.map((step) => (
            <li
              key={step.n}
              className="flex gap-4 border-b border-white/12 py-5 sm:gap-6"
            >
              <span className="shrink-0 text-sm font-black tracking-[0.1em] text-[#ff6b00] tabular-nums">
                {step.n}
              </span>
              <span className="flex flex-col gap-1">
                <span className="text-base font-black tracking-[0.02em] text-white uppercase">
                  {step.head}
                </span>
                <span className="text-sm leading-relaxed text-white/55">{step.body}</span>
              </span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
