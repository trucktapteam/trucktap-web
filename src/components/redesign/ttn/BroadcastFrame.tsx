import type { ReactNode } from "react";
import styles from "./ttn.module.css";

/**
 * The CRT shell: black overscan border, a pillar-boxed 4:3-ish "screen" on
 * wide viewports (full-width on phones — no tiny-TV letterboxing), and the
 * static scanline / vignette / faint-flicker overlays. All texture is CSS;
 * the flicker and scanline drift stop under prefers-reduced-motion.
 */
export function BroadcastFrame({ children }: { children: ReactNode }) {
  return (
    <div className={styles.overscan}>
      <div className={styles.screen}>
        {children}
        <div className={styles.scanlines} aria-hidden="true" />
        <div className={styles.vignette} aria-hidden="true" />
        <div className={styles.flicker} aria-hidden="true" />
      </div>
    </div>
  );
}
