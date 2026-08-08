import Image from "next/image";
import { screenshots } from "@/lib/home-data";
import { ownerPanelGradient, ownerVisualGradient, panelGridOverlay } from "@/lib/home-gradients";

const OWNER_LIST = [
  "Your truck moves. TruckTap keeps up.",
  "Go live the moment the window opens.",
  "Help nearby customers find you now.",
  "Turn today's stop into the next favorite.",
];

export function OwnersSection() {
  return (
    <section id="owners" className="px-4 py-14 sm:py-20 lg:px-6">
      <div className="mx-auto max-w-6xl">
        <div
          className="relative overflow-hidden rounded-[2rem] p-7 shadow-[0_24px_60px_rgba(17,24,39,0.14)] sm:p-10 lg:grid lg:grid-cols-[minmax(280px,0.82fr)_minmax(0,1.18fr)] lg:items-center lg:gap-11 lg:p-14"
          style={{ backgroundImage: ownerPanelGradient }}
        >
          <div
            className="pointer-events-none absolute inset-0"
            style={{ backgroundImage: panelGridOverlay, backgroundSize: "44px 44px", opacity: 0.12 }}
          />

          <div
            className="relative z-10 mx-auto grid max-w-[420px] place-items-center overflow-hidden rounded-[2rem] border border-white/12 p-5 shadow-[0_30px_70px_rgba(0,0,0,0.34),0_0_0_1px_rgba(255,107,0,0.18),0_0_54px_rgba(255,107,0,0.22)]"
            style={{ backgroundImage: ownerVisualGradient }}
          >
            <span className="absolute top-4 left-4 z-20 -rotate-[5deg] rounded-full border-[3px] border-hardline bg-brand px-2.5 py-2 text-xs font-black tracking-[0.08em] text-white shadow-[5px_5px_0_var(--color-hardline)]">
              GO LIVE
            </span>
            <div className="relative z-10 w-full max-w-[280px] overflow-hidden rounded-[1.75rem] border-[8px] border-hardline shadow-[0_24px_55px_rgba(0,0,0,0.38)]">
              <Image
                src={`/home/screenshots/${screenshots.ownerDashboard.file}`}
                alt={screenshots.ownerDashboard.alt}
                width={1440}
                height={3088}
                className="h-auto w-full"
              />
            </div>
          </div>

          <div className="relative z-10 mt-9 lg:mt-0">
            <span className="mb-3 inline-flex text-sm font-black tracking-[0.08em] text-brand/80 uppercase">
              For food truck owners
            </span>
            <div className="mb-4 inline-flex w-fit items-center gap-2.5 rounded-full border border-brand/34 bg-white/10 px-3.5 py-2.5 text-sm font-extrabold text-cream-2 shadow-[0_12px_28px_rgba(0,0,0,0.12)]">
              <span className="h-2.5 w-2.5 rounded-full bg-success shadow-[0_0_0_5px_rgba(76,175,80,0.2)]" />
              Customers can see you now
            </div>
            <h2 className="max-w-[700px] text-balance text-4xl leading-[0.95] font-black tracking-tight text-white sm:text-5xl">
              Tap GO LIVE. Start feeding people.
            </h2>
            <p className="mt-4 text-pretty text-white/74">
              Customers cannot eat what they cannot find. Go live when you open, stay visible while you serve, and
              let nearby people know where the truck actually is.
            </p>

            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              {OWNER_LIST.map((item) => (
                <li
                  key={item}
                  className="rounded-2xl border border-white/14 bg-white/10 p-3.5 font-extrabold text-white/82 backdrop-blur-md"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
