'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { getAssetsUrl } from '@/utils';

import { cn } from '@/lib/utils';

export interface ReelToken {
  /** `0x`-prefixed seed; also the identity of the clip. */
  seed: string;
  id: number;
}

/** Fade-to-black between clips, in ms. Must match the Tailwind duration below. */
export const REEL_FADE_MS = 600;

/**
 * How long a clip may sit without reaching `playing` before the reel gives
 * up on it (refused autoplay, a stalled download, a decoder that never
 * starts). Without this the hero would freeze on the poster forever: the
 * parent disables its timer rotation while the reel is active.
 */
export const REEL_START_TIMEOUT_MS = 10_000;

export function getReelClipUrl(seed: string): string {
  return getAssetsUrl(`cosmicsignature/${seed}.mp4`);
}

interface ArtReelProps {
  current: ReelToken;
  /** Pre-loaded silently while `current` plays so the hand-off has no gap. */
  next: ReelToken | null;
  poster: string;
  /** Called after the end-of-clip fade completes; the parent then swaps tokens. */
  onEnded: () => void;
  /** Called when the current clip cannot be played; the parent shows the still. */
  onError: () => void;
}

/**
 * The hero's generation reel: each imprinted Signature is drawn by a seeded
 * three-body simulation, and the server keeps a 30-second clip of that
 * drawing beside every still. The reel plays the current token's clip,
 * pre-loads the next token's clip in a hidden sibling, fades to black when
 * the clip ends and hands control back to the parent to advance. Because the
 * hidden sibling is keyed by seed it simply becomes the visible one — no
 * reload — and fades in.
 *
 * Playback is paused while the reel is scrolled out of view or the tab is
 * hidden, so a page left open does not decode 60fps video for nobody.
 *
 * Failure paths all end in `onError` so the parent can fall back to the
 * still image and resume timer rotation: a clip that errors (current, or the
 * pre-loaded next once it is promoted), a `play()` that rejects, or a clip
 * that never reaches `playing` within REEL_START_TIMEOUT_MS.
 */
export function ArtReel({ current, next, poster, onEnded, onError }: ArtReelProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef(new Map<string, HTMLVideoElement>());
  const inViewRef = useRef(true);
  const failedSeeds = useRef(new Set<string>());
  const fadeTimer = useRef<number | null>(null);
  const startTimer = useRef<number | null>(null);
  // Which clip is mid fade-out. Keyed by seed rather than a boolean so a
  // token change naturally resets it — no effect needed.
  const [fadingSeed, setFadingSeed] = useState<string | null>(null);
  const fading = fadingSeed === current.seed;

  const hasNext = next != null && next.seed !== current.seed;

  const clearStartTimer = useCallback(() => {
    if (startTimer.current != null) {
      window.clearTimeout(startTimer.current);
      startTimer.current = null;
    }
  }, []);

  const failCurrent = useCallback(() => {
    clearStartTimer();
    if (fadeTimer.current != null) {
      window.clearTimeout(fadeTimer.current);
      fadeTimer.current = null;
    }
    onError();
  }, [clearStartTimer, onError]);

  const syncPlayback = useCallback(
    (seed: string) => {
      const video = videoRefs.current.get(seed);
      if (!video) return;
      const shouldPlay = inViewRef.current && document.visibilityState !== 'hidden';
      if (!shouldPlay) {
        clearStartTimer();
        video.pause();
        return;
      }
      // jsdom has no media pipeline and browsers may refuse autoplay: both
      // surface here. A refusal is a failure for the reel (the poster would
      // otherwise sit still forever), so it falls back to the still image.
      //
      // `paused` is read BEFORE play(): it flips synchronously. The start
      // watchdog is armed only when the clip actually needs starting — this
      // sync also runs on scroll/visibility callbacks that land after a
      // pre-loaded clip is already playing, and `playing` (which clears the
      // watchdog) will not fire again for a clip that never stopped.
      const needsStart = video.paused;
      const result = video.play() as Promise<void> | undefined;
      if (result && typeof result.catch === 'function') result.catch(() => failCurrent());
      if (needsStart && startTimer.current == null) {
        startTimer.current = window.setTimeout(() => {
          startTimer.current = null;
          failCurrent();
        }, REEL_START_TIMEOUT_MS);
      }
    },
    [clearStartTimer, failCurrent],
  );

  // A new current clip (first mount, or the pre-loaded sibling promoted):
  // drop any pending hand-off from the previous clip, refuse a clip that
  // already failed while hidden, else start it from the top.
  useEffect(() => {
    if (fadeTimer.current != null) {
      window.clearTimeout(fadeTimer.current);
      fadeTimer.current = null;
    }
    if (failedSeeds.current.has(current.seed)) {
      failCurrent();
      return;
    }
    const video = videoRefs.current.get(current.seed);
    if (video && video.currentTime > 0) video.currentTime = 0;
    syncPlayback(current.seed);
  }, [current.seed, failCurrent, syncPlayback]);

  useEffect(() => {
    const onVisibility = () => syncPlayback(current.seed);
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, [current.seed, syncPlayback]);

  useEffect(() => {
    const node = containerRef.current;
    if (!node || typeof IntersectionObserver === 'undefined') return undefined;
    const observer = new IntersectionObserver(([entry]) => {
      inViewRef.current = entry?.isIntersecting ?? true;
      syncPlayback(current.seed);
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, [current.seed, syncPlayback]);

  useEffect(
    () => () => {
      if (fadeTimer.current != null) window.clearTimeout(fadeTimer.current);
      if (startTimer.current != null) window.clearTimeout(startTimer.current);
    },
    [],
  );

  // End of clip: fade to black, then let the parent advance. With nothing to
  // advance to (a single imprinted token) the clip simply replays.
  const handleEnded = useCallback(() => {
    if (!hasNext) {
      const video = videoRefs.current.get(current.seed);
      if (video) {
        video.currentTime = 0;
        syncPlayback(current.seed);
      }
      return;
    }
    setFadingSeed(current.seed);
    fadeTimer.current = window.setTimeout(() => {
      fadeTimer.current = null;
      onEnded();
    }, REEL_FADE_MS);
  }, [current.seed, hasNext, onEnded, syncPlayback]);

  const handleClipError = useCallback(
    (seed: string) => {
      failedSeeds.current.add(seed);
      if (seed === current.seed) failCurrent();
    },
    [current.seed, failCurrent],
  );

  const tokens = hasNext ? [current, next] : [current];

  return (
    <div ref={containerRef} className="absolute inset-0 bg-black" data-testid="deck-art-reel">
      {tokens.map((token) => {
        const isCurrent = token.seed === current.seed;
        return (
          <video
            key={token.seed}
            ref={(el) => {
              if (el) videoRefs.current.set(token.seed, el);
              else videoRefs.current.delete(token.seed);
            }}
            src={getReelClipUrl(token.seed)}
            poster={isCurrent ? poster : undefined}
            muted
            playsInline
            preload="auto"
            autoPlay={isCurrent}
            aria-hidden
            tabIndex={-1}
            data-testid={isCurrent ? 'deck-art-reel-current' : 'deck-art-reel-next'}
            onEnded={isCurrent ? handleEnded : undefined}
            onPlaying={isCurrent ? clearStartTimer : undefined}
            onError={() => handleClipError(token.seed)}
            className={cn(
              'absolute inset-0 h-full w-full object-cover transition-opacity duration-[600ms] ease-out',
              isCurrent && !fading ? 'opacity-100' : 'opacity-0',
            )}
          />
        );
      })}
    </div>
  );
}
