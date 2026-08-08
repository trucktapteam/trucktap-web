import Image from "next/image";
import Link from "next/link";
import { FACEBOOK_URL, screenshots } from "@/lib/home-data";
import { APP_STORE_URL, GOOGLE_PLAY_URL } from "@/lib/app-links";
import { heroPanelGradient, panelGridOverlay } from "@/lib/home-gradients";

export function HeroSection() {
  return (
    <section id="download" className="px-4 pt-7 pb-14 sm:pt-9 lg:px-6">
      <div className="mx-auto max-w-6xl">
        <div
          className="relative overflow-hidden rounded-[2rem] border border-white/12 p-7 shadow-[0_34px_90px_rgba(17,24,39,0.34)] sm:p-10 lg:grid lg:grid-cols-[1.03fr_0.97fr] lg:items-center lg:gap-11 lg:p-16"
          style={{ backgroundImage: heroPanelGradient }}
        >
          <div className="pointer-events-none absolute inset-0" style={{ backgroundImage: panelGridOverlay, backgroundSize: "42px 42px", opacity: 0.11 }} />

          <div className="relative z-10">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-brand/28 bg-cream-2 px-3.5 py-2.5 text-xs font-black tracking-[0.04em] text-brand-ink uppercase">
              <span className="h-2.5 w-2.5 rounded-full bg-success shadow-[0_0_0_5px_rgba(76,175,80,0.18)]" />
              Built for live food truck chaos
            </div>

            <h1 className="max-w-[820px] text-balance text-5xl leading-[0.92] font-black tracking-tighter text-white sm:text-6xl lg:text-7xl">
              Find food trucks that are actually open.
            </h1>

            <p className="mt-4 max-w-[640px] text-pretty text-lg text-white/78">
              TruckTap helps you see real food truck locations, discover what is serving nearby, follow your
              favorites, and stop chasing stale posts across the internet.
            </p>

            <div className="mt-7">
              {/* The primary discovery action, now that /trucks is live: this
                  is deliberately the biggest, loudest thing in the hero — a
                  bigger box, a stronger orange (gradient + a glow ring on top
                  of the usual drop shadow), and bigger type than every other
                  CTA on the page, so "find a truck" reads as the homepage's
                  main job before "download the app" or "I'm an owner" do. */}
              <Link
                href="/trucks"
                className="inline-flex min-h-16 items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-b from-[#ff7a1a] to-brand px-7 py-4 text-lg font-black text-white shadow-[0_22px_50px_rgba(255,107,0,0.55),0_0_0_6px_rgba(255,107,0,0.16)] transition duration-200 hover:-translate-y-1 hover:shadow-[0_28px_60px_rgba(255,107,0,0.65),0_0_0_8px_rgba(255,107,0,0.22)] active:translate-y-0 sm:min-h-[72px] sm:px-10 sm:py-5 sm:text-xl lg:min-h-20 lg:px-12 lg:py-6 lg:text-2xl"
              >
                Find Food Trucks Near You
                <ArrowIcon className="h-5 w-5 sm:h-6 sm:w-6" />
              </Link>
            </div>

            <div className="mt-5 flex flex-wrap gap-3.5" aria-label="App download links">
              <a
                href={APP_STORE_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Download TruckTap on the App Store"
                className="w-[168px] shrink-0 overflow-hidden rounded-2xl shadow-[0_12px_28px_rgba(0,0,0,0.24)] transition duration-200 hover:-translate-y-1 hover:shadow-[0_18px_36px_rgba(0,0,0,0.34)] active:translate-y-0"
              >
                <Image
                  src="/brand/appstore-badge.svg"
                  alt="Download on the App Store"
                  width={168}
                  height={56}
                  className="h-auto w-full"
                />
              </a>
              <a
                href={GOOGLE_PLAY_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Get TruckTap on Google Play"
                className="w-[168px] shrink-0 overflow-hidden rounded-2xl shadow-[0_12px_28px_rgba(0,0,0,0.24)] transition duration-200 hover:-translate-y-1 hover:shadow-[0_18px_36px_rgba(0,0,0,0.34)] active:translate-y-0"
              >
                <Image
                  src="/brand/googleplay-badge.svg"
                  alt="Get it on Google Play"
                  width={168}
                  height={50}
                  className="h-auto w-full"
                />
              </a>
            </div>

            {/* Demoted a step further now that "Find Food Trucks Near You"
                is the loud primary action and the store badges above are
                the app download itself — these are just in-page jumps to
                more detail, so they read as quiet, secondary links now. */}
            <div className="mt-4 flex flex-wrap gap-2.5">
              <a
                href="#screens"
                className="inline-flex min-h-10 items-center justify-center rounded-xl border border-white/20 bg-white/5 px-4 text-sm font-bold text-white/85 transition duration-200 hover:-translate-y-0.5 hover:border-white/35 hover:bg-white/10 active:translate-y-0"
              >
                See the app
              </a>
              <a
                href="#owners"
                className="inline-flex min-h-10 items-center justify-center rounded-xl px-4 text-sm font-bold text-white/60 transition duration-200 hover:-translate-y-0.5 hover:text-white/90 active:translate-y-0"
              >
                For truck owners
              </a>
            </div>

            <div className="mt-6 flex flex-wrap gap-2.5 text-sm font-extrabold text-white/72" aria-label="TruckTap highlights">
              {["Real locations", "Open-now discovery", "Favorite updates"].map((t) => (
                <span key={t} className="rounded-full border border-white/10 bg-white/8 px-3 py-2">
                  {t}
                </span>
              ))}
            </div>

            <a
              href={FACEBOOK_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 flex max-w-[520px] items-center gap-3 rounded-2xl border border-brand/26 bg-white/8 p-3.5 backdrop-blur-md transition duration-200 hover:-translate-y-0.5 hover:border-brand/46 hover:bg-white/11"
            >
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border-2 border-white/22 bg-brand text-base font-black text-white shadow-[0_0_24px_rgba(255,107,0,0.32)]">
                f
              </span>
              <span>
                <strong className="block text-sm text-white">Follow the food truck chaos</strong>
                <span className="mt-0.5 block text-sm leading-tight text-white/78">
                  Daily truck finds, posters, memes &amp; local food truck energy.
                </span>
              </span>
            </a>
          </div>

          <div className="relative z-10 mt-14 h-[380px] sm:h-[460px] lg:mt-0 lg:h-[540px]">
            <PhoneCollage />
          </div>
        </div>
      </div>
    </section>
  );
}

function ArrowIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" className={className}>
      <path
        fillRule="evenodd"
        d="M3 10a.75.75 0 0 1 .75-.75h10.638L11.29 6.16a.75.75 0 1 1 1.02-1.1l5 4.25a.75.75 0 0 1 0 1.18l-5 4.25a.75.75 0 1 1-1.02-1.1l3.098-2.59H3.75A.75.75 0 0 1 3 10Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function PhoneCollage() {
  return (
    <div className="animate-phone-float relative h-full">
      <div className="absolute top-0 left-[8%] w-[64%] max-w-[290px] -rotate-[5deg] overflow-hidden rounded-[2rem] border-[7px] border-hardline shadow-[0_30px_70px_rgba(0,0,0,0.45)] transition duration-300 hover:-translate-y-1.5 hover:-rotate-3">
        <Image
          src={`/home/screenshots/${screenshots.heroDiscover.file}`}
          alt={screenshots.heroDiscover.alt}
          width={1440}
          height={3088}
          className="h-auto w-full"
          priority
        />
      </div>
      <div className="absolute top-[58px] right-[1%] w-[42%] rotate-[7deg] overflow-hidden rounded-3xl border-[5px] border-hardline shadow-[0_30px_70px_rgba(0,0,0,0.45)] transition duration-300 hover:-translate-y-1.5 hover:rotate-[5deg]">
        <Image
          src={`/home/screenshots/${screenshots.heroProfile.file}`}
          alt={screenshots.heroProfile.alt}
          width={1440}
          height={3088}
          className="h-auto w-full"
        />
      </div>
      <div className="absolute right-[8%] bottom-4 w-[46%] -rotate-3 overflow-hidden rounded-2xl border-[5px] border-hardline shadow-[0_30px_70px_rgba(0,0,0,0.45)] transition duration-300 hover:-translate-y-1.5 hover:-rotate-1">
        <Image
          src={`/home/screenshots/${screenshots.heroMenu.file}`}
          alt={screenshots.heroMenu.alt}
          width={1440}
          height={3088}
          className="h-auto w-full"
        />
      </div>
      <div className="absolute bottom-16 left-0 max-w-[210px] rotate-[4deg] rounded-3xl border-[3px] border-hardline bg-gold p-4 text-sm leading-tight font-black text-navy shadow-[9px_9px_0_var(--color-hardline)] transition duration-200 hover:-translate-y-1 hover:rotate-2">
        Tonight&apos;s dinner plan should not require detective work.
      </div>
    </div>
  );
}
