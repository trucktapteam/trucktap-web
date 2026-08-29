import Image from "next/image";

/**
 * "YOU WORKED HARD / FOR THAT CUSTOMER." — turns the retention section's
 * customer promise around to the owner. Same Modern TruckTap grammar as
 * the section above it: true black, huge type, one real artifact used as
 * evidence, generous negative space, restrained orange.
 *
 * The one artifact is the real owner app screenshot
 * (public/home/screenshots/owner-dashboard.jpg), shown with a CSS-only
 * crop — an `aspect-[4/5]` window plus `object-position` — so only the
 * genuine Go Live control and the real "Nearby customers are only
 * notified while you're LIVE" opportunity text are visible. The test-truck
 * greeting ("TestTruck 7/25"), the "Today's Mission Complete" line, and
 * the "Put Your QR Code to Work" card all sit outside the window. No new
 * or edited asset — the crop is pure layout.
 *
 * No motion. A small resting tilt on desktop is a static transform, not an
 * animation. Nothing here observes scroll or transitions.
 *
 * "Follow" is website positioning language, consistent with the retention
 * section's "SCAN. FOLLOW. FIND THEM AGAIN." — it does not rename the
 * app's Favorites UI and does not imply the web profile has a follow
 * button. The payoff line is deliberately hedged ("can be notified"): the
 * app only notifies nearby followers while a truck is actually LIVE.
 */

const LOOP = ["Go live", "Get found", "Get followed"] as const;

export function OwnerStorySection() {
  return (
    <section
      aria-labelledby="owner-story-heading"
      className="relative overflow-hidden bg-[#0a0a0a] text-white"
    >
      <div className="mx-auto flex max-w-[1400px] flex-col gap-y-12 px-5 py-24 sm:px-8 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,40%)] lg:grid-rows-[auto_auto_auto] lg:gap-x-16 lg:gap-y-8 lg:px-14 lg:py-36 xl:px-20">
        {/* 1 — HEADLINE + SUPPORT */}
        <div className="lg:col-start-1 lg:row-start-1 lg:max-w-[26ch] lg:self-end">
          <h2
            id="owner-story-heading"
            className="text-[clamp(2.6rem,7vw,6rem)] leading-[0.86] font-black tracking-[-0.02em] text-white uppercase"
          >
            You worked hard
            <br />
            for that customer.
          </h2>
          <p className="mt-6 max-w-[32ch] text-lg font-medium text-white/70 sm:text-xl">
            Make it easy for them to find you again.
          </p>
        </div>

        {/* 2 — THE ONE ARTIFACT: real owner screenshot, CSS-cropped to the
               Go Live control + the "only notified while you're LIVE" text.
               Evidence, not a device — no frame, no card, bleeds off-right
               on desktop, upright and centered on mobile. */}
        <div className="lg:col-start-2 lg:row-span-3 lg:row-start-1 lg:self-center">
          <div className="mx-auto w-[min(20rem,74vw)] lg:mx-0 lg:-mr-10 lg:ml-auto lg:w-[24rem] lg:-rotate-[3deg]">
            <div className="relative aspect-[4/5] overflow-hidden drop-shadow-[0_24px_44px_rgba(0,0,0,0.72)]">
              <Image
                src="/home/screenshots/owner-dashboard.jpg"
                alt="The TruckTap owner app: a Go Live button, with a note that nearby customers are only notified while the truck is LIVE."
                fill
                sizes="(min-width: 1024px) 24rem, min(20rem, 74vw)"
                className="object-cover object-[50%_82%]"
              />
            </div>
          </div>
        </div>

        {/* 3 — OWNER LOOP */}
        <div className="border-t border-white/12 pt-6 lg:col-start-1 lg:row-start-2 lg:self-start">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-lg font-black tracking-tight text-white uppercase sm:text-xl">
            {LOOP.map((step, i) => (
              <span key={step} className="inline-flex items-center gap-x-3">
                {i > 0 && (
                  <span aria-hidden="true" className="text-[#ff6b00]">
                    &rarr;
                  </span>
                )}
                {step}
              </span>
            ))}
          </div>
        </div>

        {/* 4 — PAYOFF (hedged: nearby followers, only while LIVE) */}
        <p className="max-w-[44ch] text-sm leading-relaxed text-white/55 lg:col-start-1 lg:row-start-3 lg:self-start">
          When you go LIVE, customers who follow you can be notified that you&rsquo;re serving.
        </p>
      </div>
    </section>
  );
}
