'use client';

import { useEffect, useState, useSyncExternalStore, type RefObject } from 'react';

import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

interface NetworkInformationLike {
  saveData?: boolean;
  effectiveType?: string;
}

/** Connections too slow to rotate full-size art every few seconds. */
const SLOW_CONNECTIONS: ReadonlySet<string> = new Set(['slow-2g', '2g', '3g']);

function subscribeNever(): () => void {
  return () => {};
}

/** False in the server HTML and during hydration, true once the page runs. */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    subscribeNever,
    () => true,
    () => false,
  );
}

function subscribeVisibility(onChange: () => void): () => void {
  document.addEventListener('visibilitychange', onChange);
  return () => document.removeEventListener('visibilitychange', onChange);
}

function readVisible(): boolean {
  return document.visibilityState !== 'hidden';
}

/** Save-Data, a slow connection, or the site's own motion preference set to reduced. */
function readConstrained(): boolean {
  const connection = (navigator as Navigator & { connection?: NetworkInformationLike }).connection;
  return (
    connection?.saveData === true ||
    SLOW_CONNECTIONS.has(connection?.effectiveType ?? '') ||
    document.documentElement.dataset.motion === 'reduced'
  );
}

/** Save-Data or a connection slower than 4G: fetch nothing the visitor has not asked for. */
function readDataConstrained(): boolean {
  const connection = (navigator as Navigator & { connection?: NetworkInformationLike }).connection;
  return connection?.saveData === true || SLOW_CONNECTIONS.has(connection?.effectiveType ?? '');
}

/** How long after the page loads the browser may wait for an idle moment. */
const IDLE_TIMEOUT_MS = 4_000;

/**
 * True once the page has loaded and the browser has had an idle moment:
 * the cue to fetch art further down the page ahead of the visitor, so a fast
 * scroll (or a jump to the end) never lands on empty plates. Never true under
 * Save-Data or on a connection slower than 4G.
 */
export function useIdleAfterLoad(): boolean {
  const [idle, setIdle] = useState(false);

  useEffect(() => {
    if (readDataConstrained()) return undefined;
    let idleId: number | undefined;
    let timeoutId: number | undefined;
    const arm = () => {
      if (typeof window.requestIdleCallback === 'function') {
        idleId = window.requestIdleCallback(() => setIdle(true), { timeout: IDLE_TIMEOUT_MS });
      } else {
        timeoutId = window.setTimeout(() => setIdle(true), 1_000);
      }
    };
    if (document.readyState === 'complete') arm();
    else window.addEventListener('load', arm, { once: true });
    return () => {
      window.removeEventListener('load', arm);
      if (idleId !== undefined) window.cancelIdleCallback(idleId);
      if (timeoutId !== undefined) window.clearTimeout(timeoutId);
    };
  }, []);

  return idle;
}

/**
 * Whether the art may move by itself: never under prefers-reduced-motion,
 * the site's reduced motion setting, Save-Data or a connection slower than
 * 4G (each rotation fetches a full-size image). The server render and the
 * first client render answer `false`, so the still always paints first.
 */
export function useArtMotionAllowed(): boolean {
  const reducedMotion = usePrefersReducedMotion();
  const constrained = useSyncExternalStore(subscribeNever, readConstrained, () => true);
  return !reducedMotion && !constrained;
}

/**
 * True while the element is on screen and the tab is visible: art that moves
 * by itself stops for nobody.
 */
export function useOnScreen(ref: RefObject<Element | null>, rootMargin = '0px'): boolean {
  const [inView, setInView] = useState(false);
  const visible = useSyncExternalStore(subscribeVisibility, readVisible, () => true);

  useEffect(() => {
    const element = ref.current;
    if (!element || typeof IntersectionObserver === 'undefined') return undefined;
    const observer = new IntersectionObserver(
      ([entry]) => setInView(Boolean(entry?.isIntersecting)),
      { rootMargin },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref, rootMargin]);

  return inView && visible;
}
