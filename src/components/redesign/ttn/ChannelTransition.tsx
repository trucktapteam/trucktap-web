"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./ttn.module.css";

/**
 * The short "the website changed channels" moment. Plays once, the first
 * time the TTN-86 section scrolls into view, then permanently gets out of
 * the way. `pointer-events: none` throughout — it never blocks navigation
 * or input, and the broadcast underneath is always live.
 *
 * ~520ms beat, then a hard ~130ms cut to the broadcast:
 *   1. snap  — black + static hit
 *   2. tear  — one horizontal sync tear rips down the frame
 *   3. ident — a large "86" flashes
 *   4. ghost — a faint "TTN-86" ghost settles vertically as the signal locks
 *   5. done  — hard reveal into the existing blue TTN-86 broadcast
 *
 * Driven entirely by CSS transform/opacity; a short setTimeout chain only
 * flips `data-phase`. No animation loop. Removing the single
 * <ChannelTransition /> line in Ttn86 drops it with zero other consequences.
 *
 * prefers-reduced-motion: ttn.module.css sets `.transition { display: none }`,
 * which also means this element is never "intersecting", so the schedule
 * never runs — the broadcast simply appears.
 */

type Phase = "idle" | "snap" | "tear" | "ident" | "ghost" | "done";

const SCHEDULE: readonly (readonly [Phase, number])[] = [
  ["snap", 0],
  ["tear", 80],
  ["ident", 180],
  ["ghost", 320],
  ["done", 520],
];

export function ChannelTransition() {
  const ref = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<Phase>("idle");

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const timers: number[] = [];
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        for (const [next, delay] of SCHEDULE) {
          timers.push(window.setTimeout(() => setPhase(next), delay));
        }
      },
      { threshold: 0.35 }
    );
    observer.observe(el);

    return () => {
      observer.disconnect();
      for (const id of timers) window.clearTimeout(id);
    };
  }, []);

  return (
    <div ref={ref} className={styles.transition} data-phase={phase} aria-hidden="true">
      <div className={styles.transitionNoise} />
      <div className={styles.transitionTear} />
      <div className={styles.transitionBig86}>86</div>
      <div className={styles.transitionIdent}>
        <span className={styles.identCall}>TTN-86</span>
        <span className={styles.identName}>TRUCKTAP TELEVISION NETWORK</span>
      </div>
    </div>
  );
}
