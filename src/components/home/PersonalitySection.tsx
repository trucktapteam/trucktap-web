import { SectionHead } from "./SectionHead";

export function PersonalitySection() {
  return (
    <section className="px-4 py-14 sm:py-20 lg:px-6">
      <div className="mx-auto max-w-6xl">
        <SectionHead
          kicker="TruckTap personality"
          title="Helpful, local, and a little bit rowdy."
          description="Food truck culture is fast-moving and human. TruckTap should feel the same: useful first, playful always, and never too polished to understand a pop-up rush."
        />

        <div className="mt-10 grid gap-4 sm:grid-cols-3 sm:gap-5">
          <article className="-rotate-1 rounded-[1.9rem] border border-navy/10 bg-gold p-6 shadow-[0_14px_34px_rgba(17,24,39,0.1)] transition duration-200 hover:-translate-y-1 hover:rotate-[-0.3deg] hover:shadow-[0_24px_60px_rgba(17,24,39,0.14)] sm:p-7">
            <h3 className="text-xl font-black tracking-tight text-navy sm:text-2xl">No stale-post scavenger hunts.</h3>
            <p className="mt-2.5 font-bold text-brand-ink">
              The promise is simple: help people find trucks that are open, nearby, and worth the trip.
            </p>
          </article>

          <article className="rotate-1 rounded-[1.9rem] border border-navy/10 bg-navy p-6 text-white shadow-[0_14px_34px_rgba(17,24,39,0.1)] transition duration-200 hover:-translate-y-1 hover:rotate-[0.3deg] hover:shadow-[0_24px_60px_rgba(17,24,39,0.14)] sm:p-7">
            <h3 className="text-xl font-black tracking-tight sm:text-2xl">Made for real truck chaos.</h3>
            <p className="mt-2.5 text-white/72">
              Moving locations, changing hours, weather calls, sellouts, surprise stops, and everything else that
              makes food trucks food trucks.
            </p>
          </article>

          <article className="-rotate-[0.5deg] rounded-[1.9rem] border border-navy/10 bg-brand p-6 shadow-[0_14px_34px_rgba(17,24,39,0.1)] transition duration-200 hover:-translate-y-1 hover:rotate-0 hover:shadow-[0_24px_60px_rgba(17,24,39,0.14)] sm:p-7">
            <h3 className="text-xl font-black tracking-tight text-white sm:text-2xl">Community over corporate.</h3>
            <p className="mt-2.5 font-bold text-brand-ink">
              Customers, owners, sightings, favorites, and updates all make the local food scene easier to follow.
            </p>
          </article>
        </div>
      </div>
    </section>
  );
}
