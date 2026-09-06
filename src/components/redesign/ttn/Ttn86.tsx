import Link from "next/link";
import { Oswald } from "next/font/google";
import type { TtnGuide } from "@/lib/redesign/ttn-guide";
import { pickBroadcastBreak } from "@/lib/redesign/commercial-break";
import { BroadcastFrame } from "./BroadcastFrame";
import { BroadcastClock } from "./BroadcastClock";
import { ChannelTransition } from "./ChannelTransition";
import { ProgrammingPanel } from "./ProgrammingPanel";
import { TruckTapGuide } from "./TruckTapGuide";
import { Ticker } from "./Ticker";
import styles from "./ttn.module.css";

/**
 * TTN-86 — TruckTap Television Network. The first broadcast viewport:
 * masthead + LIVE bug + master ET clock, a programming panel, the
 * continuously-scrolling TruckTap Guide, a station-ID ticker, and a
 * FIND ALL TRUCKS bug. Everything presented as network activity is real
 * `getTtnGuide` data.
 *
 * Isolated under components/redesign/ttn/. The only shared thing it
 * touches is <LiveBeacon>-free — all TTN visual treatment is in
 * ttn.module.css, not globals.css. The condensed broadcast typeface
 * (Oswald) is scoped to this subtree via a CSS variable, so Modern
 * TruckTap keeps its own type.
 */

const oswald = Oswald({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-oswald",
});

export function Ttn86({ guide, serverNowIso }: { guide: TtnGuide; serverNowIso: string }) {
  const hasScheduled = guide.rows.some((row) => row.kind === "scheduled");

  // Once per server render: is the top programming panel a commercial
  // break this load, and if so which spot? null => the normal slate.
  const commercial = pickBroadcastBreak();

  const tickerItems = [
    "TTN-86",
    "TRUCKTAP TELEVISION NETWORK",
    commercial ? "WE'LL BE RIGHT BACK AFTER THIS" : "",
    ...guide.liveNames.map((name) => `${name} — NOW BROADCASTING LIVE`),
    hasScheduled ? "THE TRUCKTAP GUIDE — WHAT'S ON ACROSS THE NETWORK" : "",
    "FIND ALL TRUCKS AT TRUCKTAP",
  ];

  return (
    <section id="ttn-86" className={`${oswald.variable} ${styles.frame}`} aria-label="TTN-86 broadcast">
      <ChannelTransition />

      <BroadcastFrame>
        <header className={styles.masthead}>
          <div className={styles.identity}>
            <span className={styles.call}>
              TTN<span>-86</span>
            </span>
            <span className={styles.network}>TRUCKTAP TELEVISION NETWORK</span>
          </div>

          <div className={styles.mastRight}>
            <span className={`${styles.liveBug} ${guide.hasLive ? "" : styles.liveBugOff}`}>
              <span className={styles.liveBugDot} aria-hidden="true" />
              {guide.hasLive ? "LIVE" : "STAND BY"}
            </span>
            <BroadcastClock serverNowIso={serverNowIso} />
          </div>
        </header>

        {/* Normally the LIVE / NEXT ON TTN-86 slate. On a commercial-break
            load it starts on the spot facade and, once the spot's YouTube
            video actually ends, swaps itself back to this same slate data
            client-side — no reload, Guide rows below untouched. */}
        <ProgrammingPanel
          commercial={commercial}
          slateA={guide.slateA}
          slateB={guide.slateB}
        />

        <TruckTapGuide rows={guide.rows} />

        <div className={styles.bottomBar}>
          <Link href="/trucks" className={styles.findBug}>
            <span aria-hidden="true">▶</span> Find All Trucks
          </Link>
          <Ticker items={tickerItems} />
        </div>
      </BroadcastFrame>
    </section>
  );
}
