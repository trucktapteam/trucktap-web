import Image from "next/image";
import { APP_STORE_URL, GOOGLE_PLAY_URL } from "@/lib/home-data";
import { panelGridOverlay } from "@/lib/home-gradients";

export function FinalCtaSection() {
  return (
    <section className="px-4 py-14 sm:py-20 lg:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="relative overflow-hidden rounded-[2.25rem] p-8 text-center shadow-[0_34px_90px_rgba(17,24,39,0.28)] sm:p-14 lg:p-[4.5rem]">
          <Image src="/home/cta-background.jpg" alt="" fill className="object-cover" sizes="100vw" />
          <div className="absolute inset-0 bg-gradient-to-br from-[#05080d]/70 to-[#05080d]/90" />
          <div
            className="pointer-events-none absolute inset-0"
            style={{ backgroundImage: panelGridOverlay, backgroundSize: "42px 42px", opacity: 0.15 }}
          />

          <div className="relative z-10">
            <h2 className="mx-auto max-w-[820px] text-balance text-4xl leading-[0.95] font-black tracking-tight text-white sm:text-5xl lg:text-6xl">
              Stop guessing. Start finding.
            </h2>
            <p className="mx-auto mt-4 max-w-[650px] text-pretty text-lg text-white/80">
              Download TruckTap and find food trucks that are actually open, actually nearby, and actually worth
              leaving the house for.
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-3.5" aria-label="App download links">
              <a
                href={APP_STORE_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Download TruckTap on the App Store"
                className="w-[168px] overflow-hidden rounded-2xl shadow-[0_12px_28px_rgba(0,0,0,0.24)] transition duration-200 hover:-translate-y-1 hover:shadow-[0_18px_36px_rgba(0,0,0,0.34)] active:translate-y-0"
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
                className="w-[168px] overflow-hidden rounded-2xl shadow-[0_12px_28px_rgba(0,0,0,0.24)] transition duration-200 hover:-translate-y-1 hover:shadow-[0_18px_36px_rgba(0,0,0,0.34)] active:translate-y-0"
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
          </div>
        </div>
      </div>
    </section>
  );
}
