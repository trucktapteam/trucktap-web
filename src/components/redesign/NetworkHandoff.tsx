/**
 * Punctuation between the GOOD FOOD MOVES hero and TTN-86 — not a section.
 *
 * A short, quiet "the signal is being tuned" beat on the same black,
 * left-aligned to the hero's text column and set in the hero's own type.
 * No card, no border, no heading, ~17vh tall on desktop. The actual
 * channel-change flash lives in <ChannelTransition> inside TTN-86; this is
 * only the setup that makes that flash read as the site changing channels.
 *
 * Static markup — no client JS. Nothing here animates, so there is nothing
 * for prefers-reduced-motion to turn off.
 */
export function NetworkHandoff() {
  return (
    <div className="bg-[#0a0a0a] px-5 sm:px-8 lg:px-14 xl:px-20">
      <div className="flex min-h-[15vh] flex-col justify-center py-7 sm:py-9 lg:min-h-[17vh]">
        <p className="text-[11px] leading-[1.55] font-black tracking-[0.3em] text-white/50 uppercase sm:text-xs">
          See what&rsquo;s happening
          <br />
          across the network
        </p>
        <p className="mt-4 flex items-center gap-3 text-2xl font-black tracking-tight text-white uppercase sm:text-3xl">
          CH 86
          <span aria-hidden="true" className="text-xl text-[#ff6b00] sm:text-2xl">
            &rarr;
          </span>
        </p>
      </div>
    </div>
  );
}
