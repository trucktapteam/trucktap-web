import Image from "next/image";
import { rollingTrucks } from "@/lib/home-data";
import { rollingPanelGradient, panelGridOverlay } from "@/lib/home-gradients";

export function RollingTrucksSection() {
  return (
    <section className="px-4 py-14 sm:py-20 lg:px-6">
      <div className="mx-auto max-w-6xl">
        <div
          className="relative overflow-hidden rounded-[2rem] p-7 shadow-[0_24px_60px_rgba(17,24,39,0.14)] sm:p-10 lg:p-12"
          style={{ backgroundImage: rollingPanelGradient }}
        >
          <div
            className="pointer-events-none absolute inset-0"
            style={{ backgroundImage: panelGridOverlay, backgroundSize: "42px 42px", opacity: 0.11 }}
          />

          <div className="relative z-10 mb-7 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <span className="mb-3 inline-flex text-sm font-black tracking-[0.08em] text-brand/80 uppercase">
                Local trucks, live momentum
              </span>
              <h2 className="text-balance text-4xl leading-[0.95] font-black tracking-tight text-white sm:text-5xl">
                Already Rolling with TruckTap
              </h2>
              <p className="mt-3.5 max-w-[660px] text-pretty text-lg text-white/74">
                More than 40 food trucks are already using TruckTap to help customers find them.
              </p>
            </div>
            <span className="inline-flex w-fit shrink-0 items-center gap-2 rounded-full border-[3px] border-hardline bg-gold px-3.5 py-2.5 font-black text-brand-ink shadow-[6px_6px_0_var(--color-hardline)]">
              <span className="h-2.5 w-2.5 rounded-full bg-success shadow-[0_0_0_5px_rgba(76,175,80,0.18)]" />
              40 trucks and growing
            </span>
          </div>

          <div
            className="group relative z-10 -mx-7 overflow-hidden py-2 sm:-mx-10 lg:-mx-12"
            style={{
              WebkitMaskImage: "linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent)",
              maskImage: "linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent)",
            }}
          >
            <div className="animate-logo-scroll flex w-max group-hover:[animation-play-state:paused] group-focus-within:[animation-play-state:paused]">
              {[false, true].map((duplicate) => (
                <div key={String(duplicate)} className="flex gap-4 pr-4" aria-hidden={duplicate}>
                  {rollingTrucks.map((truck) => (
                    <div
                      key={truck.file}
                      className="relative grid h-28 w-40 shrink-0 place-items-center overflow-hidden rounded-[1.35rem] border border-white/72 bg-white/96 p-4 shadow-[0_18px_40px_rgba(0,0,0,0.24),inset_0_1px_0_rgba(255,255,255,0.85)] transition duration-200 hover:z-10 hover:-translate-y-1.5 hover:border-brand/56 hover:shadow-[0_24px_52px_rgba(0,0,0,0.32),0_0_34px_rgba(255,107,0,0.2)] sm:h-32 sm:w-44"
                    >
                      <Image
                        src={`/home/trucks/${truck.file}`}
                        alt={duplicate ? "" : truck.alt}
                        fill
                        className="object-contain p-1"
                        sizes="180px"
                      />
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
          <p className="relative z-10 mt-4 font-extrabold text-white/68">New trucks join every week.</p>
        </div>
      </div>
    </section>
  );
}
