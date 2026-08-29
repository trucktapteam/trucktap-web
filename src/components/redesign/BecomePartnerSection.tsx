import { APP_STORE_URL, GOOGLE_PLAY_URL } from "@/lib/app-links";

/**
 * The final owner chapter — the signature at the bottom of everything the
 * visitor just saw. Replaces the old `#owners` placeholder and keeps that
 * id, so the hero's "Own a food truck? Get found →" (href="#owners")
 * lands here.
 *
 * The Partner Network section above already did the selling (the real
 * roster). This is deliberately bare: true black, the largest type on the
 * page, restrained orange, massive negative space. No cards, no pricing
 * box, no feature list, no screenshots, no logo wall, no QR, no gradients.
 *
 * Truth constraints (confirmed against the product):
 *  - Owner onboarding is self-serve IN THE APP → the primary action links
 *    straight to the real App Store / Google Play listings via the
 *    centralized constants. No web signup is faked.
 *  - Truck participation is free today → one factual line, "Free to get
 *    started today." Nothing about plans, trials, future pricing, or
 *    "forever".
 *  - The verified TruckTap Partner badge is controlled separately → it is
 *    never presented as an automatic result of installing the app; the
 *    "becoming a Partner" question routes to a real person by email.
 *
 * No motion beyond color-on-hover (the same treatment the hero buttons
 * use; the global prefers-reduced-motion rule makes it instant). Store
 * links and the mailto are real, plain anchors — no JS needed to reach
 * them.
 */

const STORE_LINK_CLASS =
  "inline-flex w-full items-center justify-center gap-2 rounded-md bg-[#ff6b00] px-8 py-4 text-sm font-black tracking-[0.08em] text-black uppercase transition-colors duration-150 hover:bg-[#ff7f2a] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:w-auto";

export function BecomePartnerSection() {
  return (
    <section
      id="owners"
      aria-labelledby="become-partner-heading"
      className="border-t border-white/10 bg-[#0a0a0a] text-white overflow-x-clip"
    >
      <div className="mx-auto max-w-[1400px] px-5 pt-14 pb-32 sm:px-8 lg:px-14 lg:pt-20 lg:pb-48 xl:px-20">
        <p className="flex items-center gap-2.5 text-xs font-black tracking-[0.3em] text-white/50 uppercase sm:text-sm">
          <span aria-hidden="true">&uarr;</span>
          Your truck should be here.
        </p>

        <h2
          id="become-partner-heading"
          className="mt-12 text-[clamp(3.75rem,13vw,10rem)] leading-[0.82] font-black tracking-[-0.03em] text-white uppercase lg:mt-16"
        >
          Become a
          <br />
          TruckTap
          <br />
          Partner.
        </h2>

        <p className="mt-10 text-lg leading-[1.65] text-white/70 sm:text-xl lg:mt-12">
          Put your truck on the network.
          <br />
          Get found when you&rsquo;re serving.
          <br />
          Give customers a way to find you again.
        </p>

        {/* PRIMARY — owner onboarding happens in the app */}
        <div className="mt-14 lg:mt-20">
          <p className="text-xl font-black tracking-tight text-white uppercase sm:text-2xl">
            Put your truck on TruckTap <span aria-hidden="true">&rarr;</span>
          </p>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:gap-4">
            <a
              href={APP_STORE_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Put your truck on TruckTap — get the app on the App Store"
              className={STORE_LINK_CLASS}
            >
              App Store
            </a>
            <a
              href={GOOGLE_PLAY_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Put your truck on TruckTap — get the app on Google Play"
              className={STORE_LINK_CLASS}
            >
              Google Play
            </a>
          </div>
        </div>

        {/* SECONDARY — the verified Partner badge is a separate, human process */}
        <p className="mt-16 text-sm leading-relaxed text-white/55 lg:mt-24">
          Questions about becoming a Partner?{" "}
          <a
            href="mailto:TruckTapTeam@gmail.com"
            className="font-black tracking-[0.06em] text-white uppercase underline decoration-white/30 underline-offset-4 transition-colors duration-150 hover:text-[#ff6b00] hover:decoration-[#ff6b00] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            Email the TruckTap team <span aria-hidden="true">&rarr;</span>
          </a>
        </p>
      </div>
    </section>
  );
}
