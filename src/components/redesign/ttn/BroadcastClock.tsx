"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import {
  formatNetworkClock,
  formatNetworkDate,
  NETWORK_TIME_ZONE_LABEL,
} from "@/lib/redesign/broadcast-time";
import styles from "./ttn.module.css";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const mq = window.matchMedia(REDUCED_MOTION_QUERY);
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    },
    () => window.matchMedia(REDUCED_MOTION_QUERY).matches,
    () => false
  );
}

/**
 * The master network clock — always Eastern Time, always labelled ET.
 * Seeded from a server-provided ISO string so the first client render
 * matches SSR exactly (no hydration mismatch), then it ticks once a
 * second.
 *
 * Under prefers-reduced-motion it drops to minute precision and does not
 * tick — a running seconds display is continuous motion; a quiet
 * minute-resolution timestamp is still useful.
 */
export function BroadcastClock({ serverNowIso }: { serverNowIso: string }) {
  const [nowIso, setNowIso] = useState(serverNowIso);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const catchUp = window.setTimeout(() => setNowIso(new Date().toISOString()), 0);
    const interval = reduced
      ? undefined
      : window.setInterval(() => setNowIso(new Date().toISOString()), 1000);
    return () => {
      window.clearTimeout(catchUp);
      if (interval !== undefined) window.clearInterval(interval);
    };
  }, [reduced]);

  return (
    <time className={styles.clock} dateTime={nowIso}>
      <span className={styles.clockRow}>
        <span className={styles.clockTime}>
          {formatNetworkClock(nowIso, { seconds: !reduced })}
        </span>
        <span className={styles.clockZone}>{NETWORK_TIME_ZONE_LABEL}</span>
      </span>
      <span className={styles.clockDate}>{formatNetworkDate(nowIso)}</span>
    </time>
  );
}
