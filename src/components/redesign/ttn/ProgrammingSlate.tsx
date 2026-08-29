import Image from "next/image";
import type { ProgrammingSlate as SlateData } from "@/lib/redesign/ttn-guide";
import styles from "./ttn.module.css";

/**
 * The upper programming panel. Cross-fades between two honest slates with
 * a pure-CSS animation (no JS, no interval): the primary slate (a real
 * LIVE feature, or the soonest real upcoming stop) and a secondary slate
 * (the other real thing if it exists, otherwise the station ID).
 *
 * Pauses on hover / focus-within. `prefers-reduced-motion` (ttn.module.css)
 * freezes it on the primary slate. Nothing here is fabricated — every
 * value comes from `getTtnGuide`.
 */
export function ProgrammingSlate({ slateA, slateB }: { slateA: SlateData; slateB: SlateData }) {
  const identical = slateA.kind === "stationId" && slateB.kind === "stationId";

  return (
    <div className={styles.programming}>
      <div className={styles.slate}>
        <div className={styles.slateLayer + " " + styles.slateLayerA}>
          <Slate data={slateA} />
        </div>
        {!identical && (
          <div className={styles.slateLayer + " " + styles.slateLayerB}>
            <Slate data={slateB} />
          </div>
        )}
      </div>
    </div>
  );
}

function Slate({ data }: { data: SlateData }) {
  if (data.kind === "stationId") {
    return (
      <div className={styles.slateStationId}>
        <span className={styles.call}>
          TTN<span>-86</span>
        </span>
        <span className={styles.network}>TRUCKTAP TELEVISION NETWORK</span>
        <span className={styles.slateMeta}>A SERVICE OF TRUCKTAP</span>
      </div>
    );
  }

  const kicker = data.kind === "live" ? "NOW BROADCASTING LIVE" : "NEXT ON TTN-86";
  const meta =
    data.kind === "live"
      ? `ON AIR ${data.onAirLabel}${data.basedNear ? ` · ${data.basedNear}` : ""}`
      : `${data.dayLabel} · ${data.timeLabel} ${data.zoneAbbr} · ${data.locationText}`;

  return (
    <div className={styles.slateInner}>
      {data.image && (
        <div className={styles.slateImageWrap}>
          <Image
            src={data.image}
            alt=""
            fill
            sizes="(min-width: 900px) 30vw, 46vw"
            className={styles.slateImage}
          />
          <div className={styles.slateImageBleed} aria-hidden="true" />
        </div>
      )}
      <div className={styles.slateBody}>
        <span className={styles.slateKicker}>{kicker}</span>
        <span className={styles.slateTitle}>{data.name}</span>
        <span className={styles.slateMeta}>{meta}</span>
      </div>
    </div>
  );
}
