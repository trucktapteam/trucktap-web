import { ANTHEM_YOUTUBE_WATCH_URL, ANTHEM_YOUTUBE_EMBED_URL } from "@/lib/home-data";
import { anthemPanelGradient, panelGridOverlay } from "@/lib/home-gradients";

export function AnthemSection() {
  return (
    <section className="px-4 py-14 sm:py-20 lg:px-6" aria-labelledby="anthem-title">
      <div className="mx-auto max-w-6xl">
        <div
          className="relative overflow-hidden rounded-[2rem] p-7 shadow-[0_24px_60px_rgba(17,24,39,0.14)] sm:p-10 lg:grid lg:grid-cols-[minmax(0,0.9fr)_minmax(260px,360px)] lg:items-center lg:gap-11 lg:p-14"
          style={{ backgroundImage: anthemPanelGradient }}
        >
          <div
            className="pointer-events-none absolute inset-0"
            style={{ backgroundImage: panelGridOverlay, backgroundSize: "42px 42px", opacity: 0.1 }}
          />

          <div className="relative z-10">
            <span className="mb-4 inline-flex items-center gap-2 rounded-full border-[3px] border-hardline bg-gold px-3.5 py-2.5 text-xs font-black tracking-[0.08em] text-brand-ink uppercase shadow-[6px_6px_0_var(--color-hardline)]">
              <span className="h-2.5 w-2.5 rounded-full bg-brand" />
              Fresh out of the fryer
            </span>
            <h2
              id="anthem-title"
              className="max-w-[620px] text-balance text-4xl leading-[0.95] font-black tracking-tight text-white sm:text-5xl"
            >
              The TruckTap Anthem
            </h2>
            <p className="mt-3.5 max-w-[560px] text-pretty text-lg text-white/74">
              Yes, the food truck app has its own soundtrack.
            </p>
            <a
              href={ANTHEM_YOUTUBE_WATCH_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex min-h-[52px] items-center justify-center rounded-2xl bg-white px-6 font-black text-navy transition duration-200 hover:-translate-y-1 active:translate-y-0"
            >
              Watch on YouTube
            </a>
          </div>

          <div className="relative z-10 mt-9 overflow-hidden rounded-[1.75rem] border border-white/68 bg-gradient-to-br from-white/95 to-cream/90 p-2.5 shadow-[0_28px_64px_rgba(0,0,0,0.34),0_0_34px_rgba(255,107,0,0.18)] lg:mt-0">
            <div className="relative aspect-[9/16] w-full overflow-hidden rounded-[1.25rem] bg-black">
              <iframe
                src={ANTHEM_YOUTUBE_EMBED_URL}
                title="The TruckTap Anthem"
                loading="lazy"
                allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="absolute inset-0 h-full w-full border-0"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
