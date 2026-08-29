import Image from "next/image";
import Link from "next/link";
import { getRankedDirectoryTrucks } from "@/lib/trucks-directory";
import { getHeroBImages } from "@/lib/redesign/hero-b-images";
import { APP_STORE_URL, GOOGLE_PLAY_URL } from "@/lib/app-links";
import { BeaconKeyframes, LiveSignal, type LiveTruck } from "@/components/redesign/LiveBeacon";

/**
 * Option B, revision 2 (`/redesign/b`). Two real photos only — one
 * dominant truck, one food close-up — composed as a single field rather
 * than a left/right split:
 *
 *  - The truck bleeds off the top and right edges and is masked with a
 *    diagonal gradient so its lower-left simply dissolves into true black.
 *    No rectangular photo column, no drawn scrim.
 *  - The headline shares space with the dissolved (now-black) region of
 *    the truck image, so type and photo read as one composition.
 *  - The smashburger is large and collides only with the truck/photo
 *    zone — it never touches the headline, sentence, CTAs, or owner link.
 *  - The live signal sits borderless, directly on the black.
 *
 * Self-contained under components/redesign/. Motion is limited to the
 * live-only beacon pulse and a CSS-transition hover on the two images
 * (rest tilt -> straighten + lift); both reduced-motion-safe.
 */

async function getFeaturedLiveTruck(): Promise<LiveTruck | null> {
  try {
    const trucks = await getRankedDirectoryTrucks();
    // Ranking already puts the freshest live truck first.
    const live = trucks.find((t) => t.tier === "live");
    return live ? { name: live.name, slug: live.slug, basedNear: live.basedNear } : null;
  } catch (error) {
    console.error("RedesignHeroB: live truck lookup failed, omitting live signal", error);
    return null;
  }
}

// Rest tilt lives on the element; hover straightens and lifts it.
// globals.css collapses the transition to instant under prefers-reduced-motion.
const TILT = "transition-transform duration-300 ease-out hover:-translate-y-1.5 hover:rotate-0";

function LogoLockup({ className = "" }: { className?: string }) {
  return (
    <Link
      href="/"
      aria-label="TruckTap home"
      className={`inline-flex items-center gap-3 ${className}`}
    >
      <Image
        src="/brand/logo.png"
        alt=""
        width={58}
        height={68}
        priority
        className="h-12 w-auto drop-shadow-[0_10px_20px_rgba(0,0,0,0.55)] sm:h-14"
      />
      <span className="text-[1.85rem] font-black tracking-tighter text-white sm:text-4xl">
        Truck<span className="text-[#ff6b00]">Tap</span>
      </span>
    </Link>
  );
}

export async function RedesignHeroB() {
  const [images, liveTruck] = await Promise.all([getHeroBImages(), getFeaturedLiveTruck()]);
  const { dominantTruck, foodCloseup } = images;

  return (
    <section className="relative isolate min-h-[100svh] overflow-hidden bg-[#0a0a0a] text-white lg:min-h-[70svh]">
      <BeaconKeyframes />

      {/* ---------- DOMINANT TRUCK ----------
          One image, repositioned + re-masked per breakpoint via a CSS var.
          Mobile: full-width top band dissolving downward into the black
          content. Desktop: bleeds off the top and right, dissolving toward
          the lower-left where the headline lives. */}
      {dominantTruck && (
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-[54svh] [--m:linear-gradient(to_bottom,transparent_3%,#000_14%,#000_52%,transparent_88%)] lg:inset-y-0 lg:left-auto lg:right-[-5%] lg:h-full lg:w-[80%] lg:-rotate-2 lg:[--m:linear-gradient(177deg,transparent_2%,#000_15%,#000_40%,transparent_59%)]"
          style={{
            maskImage: "var(--m)",
            WebkitMaskImage: "var(--m)",
            maskRepeat: "no-repeat",
            WebkitMaskRepeat: "no-repeat",
            maskSize: "100% 100%",
            WebkitMaskSize: "100% 100%",
          }}
        >
          <Image
            src={dominantTruck.src}
            alt={dominantTruck.alt}
            fill
            priority
            sizes="(min-width: 1024px) 80vw, 100vw"
            className="object-cover object-[42%_46%] brightness-[0.72] contrast-[1.08] saturate-[0.9] lg:object-[40%_34%]"
          />
        </div>
      )}

      {/* ---------- FOOD CLOSE-UP ----------
          Large, aggressively square-cropped, colliding with the truck in
          the photo zone. Never positioned over the text column. */}
      {foodCloseup && (
        <div
          className={`absolute z-10 overflow-hidden rounded-[2px] shadow-[0_30px_80px_rgba(0,0,0,0.7)] ring-1 ring-white/10 ${TILT} top-[34svh] right-[-4%] w-[56%] max-w-[260px] rotate-3 lg:top-[8%] lg:right-[5%] lg:w-[38%] lg:max-w-[430px]`}
        >
          <Image
            src={foodCloseup.src}
            alt={foodCloseup.alt}
            width={860}
            height={860}
            sizes="(min-width: 1024px) 34vw, 56vw"
            className="aspect-square h-full w-full object-cover"
          />
        </div>
      )}

      {/* ---------- CONTENT ----------
          Mobile: pushed below the truck band, everything on flat black.
          Desktop: vertically centred; the headline's field overlaps the
          truck image's dissolved lower-left. */}
      <div className="relative z-20 flex min-h-[100svh] flex-col px-5 pt-[calc(52svh+1.5rem)] pb-14 sm:px-8 lg:min-h-[70svh] lg:justify-center lg:px-14 lg:pt-14 lg:pb-14 xl:px-20">
        <LogoLockup className="lg:absolute lg:top-12 lg:left-14 xl:left-20" />

        <div className="lg:max-w-[62%] lg:pt-14">
          <h1 className="mt-8 text-[clamp(2.9rem,8.5vw,7.5rem)] leading-[0.85] font-black tracking-[-0.02em] text-white uppercase lg:mt-0">
            Good food moves.
          </h1>

          <p className="mt-6 max-w-[34ch] text-pretty text-base leading-relaxed text-white/65 sm:max-w-[40ch] sm:text-lg lg:max-w-[34ch]">
            TruckTap shows you where food trucks are serving now — and helps you find your favorites
            again.
          </p>

          <div className="mt-8 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-7">
            <Link
              href="/trucks"
              className="inline-flex items-center gap-2 rounded-md bg-[#ff6b00] px-8 py-4 text-sm font-black tracking-[0.08em] text-black uppercase transition-colors duration-150 hover:bg-[#ff7f2a]"
            >
              Find trucks <span aria-hidden="true">&rarr;</span>
            </Link>
            <a
              href="#owners"
              className="group inline-flex items-center gap-1.5 text-sm font-black tracking-[0.08em] text-white/70 uppercase underline-offset-4 transition-colors duration-150 hover:text-white hover:underline"
            >
              Own a food truck? Get found
              <span
                aria-hidden="true"
                className="transition-transform duration-150 group-hover:translate-x-0.5"
              >
                &rarr;
              </span>
            </a>
          </div>

          {/* Customer app path — a clearly visible secondary action beneath
              the primary CTA: brighter than the owner link, quieter than the
              orange button. Two real store links. */}
          <div className="mt-6">
            <span className="block text-sm font-black tracking-[0.08em] text-white uppercase">
              Get the app <span aria-hidden="true">&rarr;</span>
            </span>
            <span className="mt-1.5 flex flex-wrap items-baseline gap-x-2.5 gap-y-1 text-[13px] font-semibold">
              <a
                href={APP_STORE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/75 underline decoration-white/30 underline-offset-4 transition-colors duration-150 hover:text-white hover:decoration-white"
              >
                App Store
              </a>
              <span aria-hidden="true" className="text-white/30">
                &middot;
              </span>
              <a
                href={GOOGLE_PLAY_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/75 underline decoration-white/30 underline-offset-4 transition-colors duration-150 hover:text-white hover:decoration-white"
              >
                Google Play
              </a>
            </span>
          </div>

          {/* Live signal — borderless, directly on the black, under the CTAs. */}
          <div className="mt-12">
            <LiveSignal truck={liveTruck} />
          </div>
        </div>
      </div>
    </section>
  );
}
