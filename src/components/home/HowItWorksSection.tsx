import { SectionHead } from "./SectionHead";

const STEPS = [
  {
    n: 1,
    title: "See what is open now.",
    body: "Start with trucks that are actually serving instead of guessing from schedules that may already be wrong.",
  },
  {
    n: 2,
    title: "Check the real location.",
    body: "Use the map and truck profiles to see where a truck is, what is nearby, and whether the update looks fresh.",
  },
  {
    n: 3,
    title: "Favorite the good stuff.",
    body: "Follow trucks you love so you do not miss the next pop-up, special, neighborhood stop, or late-night rescue.",
  },
];

export function HowItWorksSection() {
  return (
    <section id="how" className="px-4 py-14 sm:py-20 lg:px-6">
      <div className="mx-auto max-w-6xl">
        <SectionHead
          kicker="How it works"
          title="Three taps from hungry to handled."
          description="TruckTap keeps the experience simple because the hard part should be choosing tacos, barbecue, coffee, or dessert."
        />

        <div className="mt-10 grid gap-4 sm:grid-cols-3 sm:gap-5">
          {STEPS.map((s, i) => (
            <article
              key={s.n}
              className={`rounded-[1.9rem] border border-navy/10 bg-white p-6 shadow-[0_14px_34px_rgba(17,24,39,0.1)] transition duration-200 hover:-translate-y-1.5 hover:shadow-[0_24px_60px_rgba(17,24,39,0.14)] sm:p-7 ${
                i === 1 ? "sm:mt-6" : i === 2 ? "sm:mt-12" : ""
              }`}
            >
              <div className="mb-6 grid h-14 w-14 -rotate-[5deg] place-items-center rounded-2xl border-[3px] border-navy bg-brand text-2xl font-black text-white shadow-[6px_6px_0_#111827]">
                {s.n}
              </div>
              <h3 className="text-xl font-black tracking-tight text-navy sm:text-2xl">{s.title}</h3>
              <p className="mt-2 text-muted">{s.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
