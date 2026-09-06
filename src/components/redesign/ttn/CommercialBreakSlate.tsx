"use client";

import { useEffect, useRef, useState } from "react";
import type { Commercial } from "@/lib/redesign/commercial-break";
import styles from "./ttn.module.css";

/**
 * The TTN-86 programming panel running a commercial break instead of the
 * normal LIVE / NEXT ON TTN-86 slate. Sits in the exact same bordered
 * panel as <ProgrammingSlate> (same `.programming` box, red-bordered), so
 * the Guide rows below are untouched.
 *
 * Resting state is a facade: the spot's YouTube poster, dimmed and blurred
 * behind a broadcast COMMERCIAL BREAK bug and a clear play control. Audio
 * stays user-initiated — the first click builds the real YouTube player
 * with autoplay and its normal sound, and the view / watch time is
 * credited to the actual video. No YouTube code loads before that click.
 *
 * The player is the YouTube IFrame Player API (not a plain <iframe>) so we
 * can tell when the spot finishes and hand the panel back to normal
 * programming — like a real break returning to the show. End detection is
 * deliberately redundant, because some environments (content blockers,
 * strict cross-frame messaging) don't deliver a reliable ENDED event and
 * some replay the video at the end:
 *   - `onStateChange` ENDED,
 *   - a 500ms poll on player state / current time vs duration,
 *   - an ENDED-then-PLAYING transition (a replay) treated as "done".
 * The first of these to fire calls `finish()` once; `finish()` stops the
 * player immediately so a would-be auto-replay can't flash before React
 * unmounts. `loop: 0` and no `playlist` mean the player itself never loops.
 *
 * A subtle "Watch on YouTube ↗" link sits in the panel's top-right corner
 * in both states — the fallback for a visitor whose browser stops the
 * embedded stream. It's a sibling of the facade/player, not nested in the
 * facade <button>, so it opens the exact selected spot on youtube.com in a
 * new tab regardless of playback state.
 *
 * Uses the standard youtube.com embed (not youtube-nocookie.com): the
 * privacy domain is more often broken by content blockers / DNS filters /
 * strict third-party-storage settings, and reliable playback matters more.
 *
 * Whether a break runs at all, and which spot, is decided once per server
 * render in <Ttn86> (see `pickBroadcastBreak`); this component never
 * chooses or changes it.
 */

type YtPlayer = {
  destroy: () => void;
  playVideo: () => void;
  stopVideo: () => void;
  getPlayerState?: () => number;
  getCurrentTime?: () => number;
  getDuration?: () => number;
};
type YtPlayerCtor = new (
  el: HTMLElement,
  opts: {
    videoId: string;
    width: string;
    height: string;
    playerVars: Record<string, string | number>;
    events: {
      onReady?: (e: { target: YtPlayer }) => void;
      onStateChange?: (e: { data: number; target: YtPlayer }) => void;
    };
  },
) => YtPlayer;

declare global {
  interface Window {
    YT?: { Player: YtPlayerCtor; PlayerState: { ENDED: number } };
    onYouTubeIframeAPIReady?: () => void;
  }
}

const YT_PLAYING = 1;

/** Load https://www.youtube.com/iframe_api once, shared across mounts. */
let ytApiPromise: Promise<void> | null = null;
function loadYouTubeApi(): Promise<void> {
  if (window.YT?.Player) return Promise.resolve();
  if (ytApiPromise) return ytApiPromise;
  ytApiPromise = new Promise((resolve) => {
    const previous = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      previous?.();
      resolve();
    };
    const script = document.createElement("script");
    script.src = "https://www.youtube.com/iframe_api";
    script.async = true;
    document.head.appendChild(script);
  });
  return ytApiPromise;
}

export function CommercialBreakSlate({
  commercial,
  onEnded,
}: {
  commercial: Commercial;
  onEnded: () => void;
}) {
  const [playing, setPlaying] = useState(false);
  const { id, title, supporting } = commercial;

  const stageRef = useRef<HTMLDivElement>(null);

  // Kept in a ref so the player-building effect below depends only on
  // [playing, id] — the spot must never be torn down and rebuilt just
  // because a parent re-render handed us a new `onEnded` identity.
  const onEndedRef = useRef(onEnded);
  useEffect(() => {
    onEndedRef.current = onEnded;
  }, [onEnded]);

  useEffect(() => {
    if (!playing) return;
    const stage = stageRef.current;
    if (!stage) return;

    // The API replaces the element it's given with its <iframe>. Hand it a
    // detached-from-React host node so React never tries to reconcile the
    // element YouTube swapped out.
    const host = document.createElement("div");
    stage.appendChild(host);

    let player: YtPlayer | undefined;
    let cancelled = false;
    let finished = false;
    let sawEnded = false;
    let pollId: number | undefined;

    // One-way: the spot is over. Stop the player immediately (so a browser
    // / extension that wants to auto-replay can't flash a second play
    // before React unmounts us) and hand control back to <ProgrammingPanel>.
    const finish = () => {
      if (finished) return;
      finished = true;
      if (pollId) window.clearInterval(pollId);
      try {
        player?.stopVideo();
      } catch {
        /* player already gone */
      }
      onEndedRef.current();
    };

    loadYouTubeApi().then(() => {
      if (cancelled || !window.YT) return;
      player = new window.YT.Player(host, {
        videoId: id,
        width: "100%",
        height: "100%",
        playerVars: {
          autoplay: 1,
          rel: 0,
          playsinline: 1,
          modestbranding: 1,
          loop: 0,
          origin: window.location.origin,
        },
        events: {
          onReady: (e) => {
            e.target.playVideo();
            pollId = window.setInterval(() => {
              try {
                const state = player?.getPlayerState?.();
                const current = player?.getCurrentTime?.() ?? 0;
                const duration = player?.getDuration?.() ?? 0;
                if (state === window.YT?.PlayerState.ENDED) finish();
                else if (sawEnded && state === YT_PLAYING) finish();
                else if (duration > 0 && current >= duration - 0.5) finish();
              } catch {
                /* player torn down mid-poll */
              }
            }, 500);
          },
          onStateChange: (e) => {
            if (e.data === window.YT?.PlayerState.ENDED) {
              sawEnded = true;
              finish();
            } else if (sawEnded && e.data === YT_PLAYING) {
              // ENDED then PLAYING again === a replay. The spot is done.
              finish();
            }
          },
        },
      });
    });

    return () => {
      cancelled = true;
      if (pollId) window.clearInterval(pollId);
      try {
        player?.destroy();
      } catch {
        /* player may not have been created yet */
      }
      host.remove();
    };
  }, [playing, id]);

  return (
    <div className={`${styles.programming} ${styles.programmingBreak}`}>
      {playing ? (
        <div ref={stageRef} className={styles.breakStage} />
      ) : (
        <button
          type="button"
          className={styles.breakFacade}
          onClick={() => setPlaying(true)}
          aria-label={`Play TTN-86 commercial break: ${title}`}
        >
          {/* Decorative: the button's aria-label already names the action. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            key={id}
            className={styles.breakPoster}
            src={`https://i.ytimg.com/vi/${id}/maxresdefault.jpg`}
            alt=""
            loading="lazy"
            decoding="async"
            onError={(event) => {
              const img = event.currentTarget;
              if (img.dataset.fallback) return;
              img.dataset.fallback = "1";
              img.src = `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
            }}
          />
          <span className={styles.breakScan} aria-hidden="true" />
          <span className={styles.breakScrim} aria-hidden="true" />

          <span className={styles.breakBug}>
            <span className={styles.breakBugDot} aria-hidden="true" />
            Commercial Break
          </span>

          <span className={styles.breakCenter}>
            <span className={styles.breakDisc} aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
            </span>
            <span className={styles.breakPlayLabel}>Play Commercial</span>
            <span className={styles.breakTagline}>{supporting}</span>
          </span>

          <span className={styles.breakFoot}>
            <span className={styles.breakStation}>
              TTN<span>-86</span>
            </span>
            <span className={styles.breakTitle}>{title}</span>
          </span>
        </button>
      )}

      <a
        className={styles.breakWatch}
        href={`https://www.youtube.com/watch?v=${id}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        Watch on YouTube <span aria-hidden="true">&#8599;</span>
      </a>
    </div>
  );
}
