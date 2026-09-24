'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { getAssetsUrl } from '@/utils';

import { cn } from '@/lib/utils';

export interface ReelToken {
  /** `0x`-prefixed seed; also the identity of the clip. */
  seed: string;
  id: number;
}

/** Fade between clips, in ms. Must match the Tailwind duration below. */
export const REEL_FADE_MS = 600;

/**
 * How long a clip may sit without reaching `playing` before the reel gives
 * up on it (refused autoplay, a stalled download, a decoder that never
 * starts). Without this the plate would hold the still forever: the parent
 * disables its timer rotation while the reel is active.
 */
export const REEL_START_TIMEOUT_MS = 10_000;

export function getReelClipUrl(seed: string): string {
  return getAssetsUrl(`cosmicsignature/${seed}.mp4`);
}

interface ArtReelProps {
  current: ReelToken;
  /** Pre-loaded silently while `current` plays so the hand-off has no gap. */
  next: ReelToken | null;
  /** Held on its current frame: the viewer paused the artwork. */
  paused?: boolean;
  /** Called after the end-of-clip fade completes; the parent then swaps tokens. */
  onEnded: () => void;
  /** Called when the current clip cannot be played; the parent shows the still. */
  onError: () => void;
  className?: string;
}

/**
 * The generation reel: each imprinted Signature is drawn by a seeded
 * three-body simulation, and the server keeps a 30-second clip of that
 * drawing beside every still. The reel is a transparent layer laid over the
 * still on its plate: each clip stays invisible until it is actually
 * `playing`, then fades in over the still at the art's own ratio
 * (object-fit: contain, nothing cropped). So the still the server rendered is
 * never replaced, only covered once the motion is ready. The next token's
 * clip is pre-loaded in a hidden sibling; when a clip ends it fades out to
 * the still beneath and hands control back to the parent to advance. Because
 * the hidden sibling is keyed by seed it simply becomes the visible one — no
 * reload — and fades in once it plays.
 *
 * Playback stops while the viewer has paused the artwork, while the reel is
 * scrolled out of view and while the tab is hidden, so a page left open does
 * not decode 60fps video for nobody.
 *
 * Failure paths all end in `onError` so the parent can drop the reel and
 * resume timer rotation over the still: a clip that errors (current, or the
 * pre-loaded next once it is promoted), a `play()` that rejects, or a clip
 * that never reaches `playing` within REEL_START_TIMEOUT_MS.
 */
export function ArtReel({
  current,
  next,
  paused = false,
  onEnded,
  onError,
  className,
}: ArtReelProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef(new Map<string, HTMLVideoElement>());
  const inViewRef = useRef(true);
  const pausedRef = useRef(paused);
  const failedSeeds = useRef(new Set<string>());
  const fadeTimer = useRef<number | null>(null);
  const startTimer = useRef<number | null>(null);
  // Which clip is mid fade-out. Keyed by seed rather than a boolean so a
  // token change naturally resets it — no effect needed.
  const [fadingSeed, setFadingSeed] = useState<string | null>(null);
  const fading = fadingSeed === current.seed;
  // The clip that has shown a moving frame. Until then the still beneath
  // shows through, so the page's first paint is never swapped for a poster.
  const [playingSeed, setPlayingSeed] = useState<string | null>(null);

  const hasNext = next != null && next.seed !== current.seed;

  const clearStartTimer = useCallback(() => {
    if (startTimer.current != null) {
      window.clearTimeout(startTimer.current);
      startTimer.current = null;
    }
  }, []);

  const handlePlaying = useCallback(
    (seed: string) => {
      clearStartTimer();
      setPlayingSeed(seed);
    },
    [clearStartTimer],
  );

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
      const shouldPlay =
        !pausedRef.current && inViewRef.current && document.visibilityState !== 'hidden';
      if (!shouldPlay) {
        clearStartTimer();
        video.pause();
        return;
      }
      // jsdom has no media pipeline and browsers may refuse autoplay: both
      // surface here. A refusal is a failure for the reel (the still would
      // otherwise sit without its motion forever), so the parent drops it.
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

  // The viewer's pause holds the clip on its current frame; play resumes it.
  useEffect(() => {
    pausedRef.current = paused;
    syncPlayback(current.seed);
  }, [paused, current.seed, syncPlayback]);

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

  // End of clip: fade out to the still, then let the parent advance. With
  // nothing to advance to (a single imprinted token) the clip simply replays.
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
    <div
      ref={containerRef}
      className={cn('absolute inset-0', className)}
      data-testid="deck-art-reel"
      data-playing={playingSeed === current.seed && !fading ? 'true' : undefined}
    >
      {tokens.map((token) => {
        const isCurrent = token.seed === current.seed;
        const visible = isCurrent && !fading && playingSeed === token.seed;
        return (
          <video
            key={token.seed}
            ref={(el) => {
              if (el) videoRefs.current.set(token.seed, el);
              else videoRefs.current.delete(token.seed);
            }}
            src={getReelClipUrl(token.seed)}
            muted
            playsInline
            preload="auto"
            autoPlay={isCurrent && !paused}
            aria-hidden
            tabIndex={-1}
            data-testid={isCurrent ? 'deck-art-reel-current' : 'deck-art-reel-next'}
            onEnded={isCurrent ? handleEnded : undefined}
            onPlaying={isCurrent ? () => handlePlaying(token.seed) : undefined}
            onError={() => handleClipError(token.seed)}
            className={cn(
              'absolute inset-0 h-full w-full bg-art-ground object-contain transition-opacity duration-[600ms] ease-out motion-reduce:transition-none',
              visible ? 'opacity-100' : 'opacity-0',
            )}
          />
        );
      })}
    </div>
  );
}
