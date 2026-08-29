import type { GuideRowData } from "@/lib/redesign/ttn-guide";
import { GuideRow } from "./GuideRow";
import styles from "./ttn.module.css";

/**
 * The continuously-scrolling listings. Pure CSS transform loop (the track
 * holds two copies of the rows and translates -50%); pauses on hover /
 * focus-within. `prefers-reduced-motion` (handled in ttn.module.css) stops
 * the loop, hides the duplicate copy, and makes the viewport a normal
 * scroll area.
 *
 * The loop only runs when there are enough rows to fill past the viewport;
 * a short listing on a quiet day renders static so it doesn't visibly
 * "jump" back to the top.
 */

const MIN_ROWS_TO_SCROLL = 6;
const SECONDS_PER_ROW = 6;

export function TruckTapGuide({ rows }: { rows: GuideRowData[] }) {
  if (rows.length === 0) {
    return (
      <section className={styles.guide} aria-label="The TruckTap Guide">
        <GuideHead />
        <div className={styles.guideViewport}>
          <p className={styles.guideEmpty}>NO TRUCKS BROADCASTING RIGHT NOW — STAND BY</p>
        </div>
      </section>
    );
  }

  const animate = rows.length >= MIN_ROWS_TO_SCROLL;
  const durationSeconds = Math.max(28, rows.length * SECONDS_PER_ROW);

  return (
    <section className={styles.guide} aria-label="The TruckTap Guide">
      <GuideHead />
      <div className={styles.guideViewport}>
        <div
          className={`${styles.guideTrack} ${animate ? styles.guideTrackAnimated : ""}`}
          style={animate ? { animationDuration: `${durationSeconds}s` } : undefined}
        >
          <div className={styles.guideCopy}>
            {rows.map((row) => (
              <GuideRow key={row.key} entry={row} />
            ))}
          </div>
          {animate && (
            <div className={`${styles.guideCopy} ${styles.guideDuplicate}`} aria-hidden="true">
              {rows.map((row) => (
                <GuideRow key={`dup-${row.key}`} entry={row} />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function GuideHead() {
  return (
    <div className={styles.guideHead}>
      <span>The TruckTap Guide</span>
      <span className={styles.guideHeadNote} aria-hidden="true">
        What&apos;s on across the network
      </span>
    </div>
  );
}
