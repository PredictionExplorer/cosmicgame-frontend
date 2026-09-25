'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { getAssetsUrl } from '@/utils';

import { motionTokens } from '@/lib/motion';
import { cn } from '@/lib/utils';

export interface ReelToken {
  /** `0x`-prefixed seed; also the identity of the clip. */
  seed: string;
  id: number;
}

/**
 * Fade between the clip and the still, in ms: the `duration-page` token, the
 * motion scale's ceiling, which the clip's class below uses too.
 */
export const REEL_FADE_MS = Math.round(motionTokens.duration.page * 1000);

/**
 * How long a clip may sit without reaching `playing` before the reel gives
 * up on it (refused autoplay, a stalled download, a decoder that never
 * starts), so the viewer who asked to watch is told rather than left waiting.
 */
export const REEL_START_TIMEOUT_MS = 10_000;

export function getReelClipUrl(seed: string): string {
  return getAssetsUrl(`cosmicsignature/${seed}.mp4`);
}

interface ArtReelProps {
  /** The Signature to draw; the parent keys the reel by its seed. */
  token: ReelToken;
  /** Held on its current frame: the viewer paused the artwork. */
  paused?: boolean;
  /** The clip shows its first moving frame: the drawing is under way. */
  onPlaying?: () => void;
  /** Called after the end-of-clip fade completes; the finished still shows again. */
  onEnded: () => void;
  /** Called when the clip cannot be played; the still stays. */
  onError: () => void;
  className?: string;
}

/**
 * The generation reel, played when the viewer asks for it. Each imprinted
 * Signature is drawn by a seeded three-body simulation, and the server keeps
 * a 30-second clip of that drawing beside every still. The clip starts from
 * an empty sky, so it never plays by itself over the finished still: it
 * mounts (and downloads) only on request, stays invisible until it is
 * actually `playing` while the still beneath shows, fades in at the art's
 * own ratio (object-fit: contain, nothing cropped), draws once from the first
 * stroke, and fades back out to the finished still, which is its last frame.
 *
 * Playback holds while the viewer has paused the artwork, while the reel is
 * scrolled out of view and while the tab is hidden, so a page left open does
 * not decode 60fps video for nobody.
 *
 * Every failure ends in `onError`: a clip that errors, a `play()` that
 * rejects, or a clip that never reaches `playing` within
 * REEL_START_TIMEOUT_MS.
 */
export function ArtReel({
  token,
  paused = false,
  onPlaying,
  onEnded,
  onError,
  className,
}: ArtReelProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const inViewRef = useRef(true);
  const pausedRef = useRef(paused);
  const fadeTimer = useRef<number | null>(null);
  const startTimer = useRef<number | null>(null);
  // The clip has shown a moving frame; until then the still shows through.
  const [playing, setPlaying] = useState(false);
  // The clip ended and is fading out to the still.
  const [fading, setFading] = useState(false);

  const clearStartTimer = useCallback(() => {
    if (startTimer.current != null) {
      window.clearTimeout(startTimer.current);
      startTimer.current = null;
    }
  }, []);

  const fail = useCallback(() => {
    clearStartTimer();
    if (fadeTimer.current != null) {
      window.clearTimeout(fadeTimer.current);
      fadeTimer.current = null;
    }
    onError();
  }, [clearStartTimer, onError]);

  const syncPlayback = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    const shouldPlay =
      !pausedRef.current && inViewRef.current && document.visibilityState !== 'hidden';
    if (!shouldPlay) {
      clearStartTimer();
      video.pause();
      return;
    }
    // jsdom has no media pipeline and browsers may refuse autoplay: both
    // surface here, and both are a failure the viewer is told about.
    //
    // `paused` is read BEFORE play(): it flips synchronously. The start
    // watchdog is armed only when the clip actually needs starting; this
    // sync also runs on scroll and visibility callbacks that land while the
    // clip already plays, and `playing` (which clears the watchdog) will not
    // fire again for a clip that never stopped.
    const needsStart = video.paused;
    const result = video.play() as Promise<void> | undefined;
    if (result && typeof result.catch === 'function') result.catch(() => fail());
    if (needsStart && startTimer.current == null) {
      startTimer.current = window.setTimeout(() => {
        startTimer.current = null;
        fail();
      }, REEL_START_TIMEOUT_MS);
    }
  }, [clearStartTimer, fail]);

  // The viewer's pause holds the clip on its current frame; play resumes it.
  useEffect(() => {
    pausedRef.current = paused;
    syncPlayback();
  }, [paused, syncPlayback]);

  useEffect(() => {
    document.addEventListener('visibilitychange', syncPlayback);
    return () => document.removeEventListener('visibilitychange', syncPlayback);
  }, [syncPlayback]);

  useEffect(() => {
    const node = containerRef.current;
    if (!node || typeof IntersectionObserver === 'undefined') return undefined;
    const observer = new IntersectionObserver(([entry]) => {
      inViewRef.current = entry?.isIntersecting ?? true;
      syncPlayback();
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, [syncPlayback]);

  useEffect(
    () => () => {
      if (fadeTimer.current != null) window.clearTimeout(fadeTimer.current);
      if (startTimer.current != null) window.clearTimeout(startTimer.current);
    },
    [],
  );

  const handlePlaying = useCallback(() => {
    clearStartTimer();
    setPlaying(true);
    onPlaying?.();
  }, [clearStartTimer, onPlaying]);

  // End of the drawing: fade out to the finished still, then hand back.
  const handleEnded = useCallback(() => {
    setFading(true);
    fadeTimer.current = window.setTimeout(() => {
      fadeTimer.current = null;
      onEnded();
    }, REEL_FADE_MS);
  }, [onEnded]);

  const visible = playing && !fading;

  return (
    <div
      ref={containerRef}
      className={cn('absolute inset-0', className)}
      data-testid="deck-art-reel"
      data-playing={visible ? 'true' : undefined}
    >
      <video
        ref={videoRef}
        src={getReelClipUrl(token.seed)}
        muted
        playsInline
        preload="auto"
        autoPlay={!paused}
        aria-hidden
        tabIndex={-1}
        data-testid="deck-art-reel-clip"
        onEnded={handleEnded}
        onPlaying={handlePlaying}
        onError={fail}
        className={cn(
          'absolute inset-0 h-full w-full bg-art-ground object-contain transition-opacity duration-page ease-gallery motion-reduce:transition-none',
          visible ? 'opacity-100' : 'opacity-0',
        )}
      />
    </div>
  );
}
