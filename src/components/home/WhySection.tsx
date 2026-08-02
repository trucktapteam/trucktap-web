import { SectionHead } from "./SectionHead";

export function WhySection() {
  return (
    <section id="why" className="px-4 py-14 sm:py-20 lg:px-6">
      <div className="mx-auto max-w-6xl">
        <SectionHead
          kicker="The problem"
          title="Food trucks move. Most apps do not keep up."
          description="A truck can change lots, sell out early, skip a stop, or pop up somewhere better. TruckTap is built around the messy, delicious reality of mobile food."
        />

        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          <article className="-rotate-[0.8deg] rounded-[1.9rem] border border-navy/10 bg-navy p-7 text-white shadow-[0_14px_34px_rgba(17,24,39,0.1)] transition duration-200 hover:-translate-y-1 hover:rotate-[-0.2deg] hover:shadow-[0_24px_60px_rgba(17,24,39,0.14)] sm:p-9">
            <span className="mb-5 inline-flex rounded-full bg-white/18 px-3 py-2 text-xs font-black tracking-[0.06em] uppercase">
              The stale way
            </span>
            <h3 className="text-2xl leading-[1.05] font-black tracking-tight sm:text-[2.1rem]">
              Scroll old posts, trust old hours, hope the truck is still there.
            </h3>
            <p className="mt-3 text-white/72">
              Directory listings and social feeds are useful until they are not. One missed update can turn lunch
              into a parking lot tour.
            </p>
          </article>

          <article className="rotate-[0.8deg] rounded-[1.9rem] border border-navy/10 bg-brand p-7 shadow-[0_14px_34px_rgba(17,24,39,0.1)] transition duration-200 hover:-translate-y-1 hover:rotate-[0.2deg] hover:shadow-[0_24px_60px_rgba(17,24,39,0.14)] sm:p-9">
            <span className="mb-5 inline-flex rounded-full bg-white/52 px-3 py-2 text-xs font-black tracking-[0.06em] text-brand-ink uppercase">
              The TruckTap way
            </span>
            <h3 className="text-2xl leading-[1.05] font-black tracking-tight text-white sm:text-[2.1rem]">
              Open the app, check who is open, tap the real location, go eat.
            </h3>
            <p className="mt-3 font-bold text-brand-ink">
              Clear signals, fresh locations, favorite trucks, and community-powered sightings all in one place.
            </p>
          </article>
        </div>
      </div>
    </section>
  );
}
