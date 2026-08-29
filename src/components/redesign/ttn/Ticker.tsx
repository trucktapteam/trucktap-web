import styles from "./ttn.module.css";

/**
 * The bottom station-identification crawl. Pure CSS translateX loop (two
 * copies of the line, -50%); pauses on hover / focus-within.
 * prefers-reduced-motion (ttn.module.css) freezes it — the opening of the
 * line stays readable.
 *
 * Every item is real: the station id and the names of trucks that are
 * genuinely live right now.
 */
export function Ticker({ items }: { items: string[] }) {
  const line = items.filter(Boolean).join("   •   ");

  return (
    <div className={styles.ticker} aria-label="Station identification">
      <div className={styles.tickerTrack}>
        <span>{line}</span>
        <span aria-hidden="true">{line}</span>
      </div>
    </div>
  );
}
