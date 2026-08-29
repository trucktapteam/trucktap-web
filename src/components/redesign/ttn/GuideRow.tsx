import Link from "next/link";
import type { GuideRowData } from "@/lib/redesign/ttn-guide";
import styles from "./ttn.module.css";

/**
 * One listing in THE TRUCKTAP GUIDE. A plain link to the truck's real
 * profile. Two column layout on phones (time | programme), three on wider
 * screens (time | programme | next), with the status/venue collapsing
 * under the name on phones rather than shrinking to nothing.
 *
 * LIVE rows never show a street address — only the sanitized "City, ST"
 * that already appears publicly elsewhere on the site.
 */
export function GuideRow({ entry }: { entry: GuideRowData }) {
  const meta = [entry.cuisine, entry.basedNear].filter(Boolean).join(" · ");

  return (
    <Link href={`/truck/${entry.slug}`} className={styles.row} data-kind={entry.kind}>
      <span className={styles.rowTime}>
        {entry.kind === "live" ? (
          <span className={styles.rowLiveTag}>
            <span className={styles.rowLiveDot} aria-hidden="true" />
            LIVE
          </span>
        ) : (
          <>
            <span className={styles.rowTimeMain}>{entry.timeLabel}</span>
            <span className={styles.rowTimeZone}>{entry.zoneAbbr}</span>
          </>
        )}
      </span>

      <span className={styles.rowMain}>
        <span className={styles.rowName}>{entry.name}</span>
        {meta && <span className={styles.rowMeta}>{meta}</span>}
        <span className={styles.rowMobileNext}>
          {entry.kind === "live"
            ? `ON AIR NOW · ${entry.onAirLabel}`
            : `${entry.dayLabel} · ${entry.locationText}`}
        </span>
      </span>

      <span className={styles.rowNext}>
        <span className={styles.rowStatus}>
          {entry.kind === "live" ? "ON AIR NOW" : entry.dayLabel}
        </span>
        <span className={styles.rowWhere}>
          {entry.kind === "live" ? `On air ${entry.onAirLabel}` : entry.locationText}
        </span>
      </span>
    </Link>
  );
}
