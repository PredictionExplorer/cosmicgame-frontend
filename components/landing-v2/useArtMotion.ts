'use client';

import { useEffect, useState, useSyncExternalStore, type RefObject } from 'react';

import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

interface NetworkInformationLike {
  saveData?: boolean;
}

function subscribeNever(): () => void {
  return () => {};
}

function subscribeVisibility(onChange: () => void): () => void {
  document.addEventListener('visibilitychange', onChange);
  return () => document.removeEventListener('visibilitychange', onChange);
}

function readVisible(): boolean {
  return document.visibilityState !== 'hidden';
}

/** Save-Data, or the site's own motion preference set to reduced. */
function readConstrained(): boolean {
  const connection = (navigator as Navigator & { connection?: NetworkInformationLike }).connection;
  return connection?.saveData === true || document.documentElement.dataset.motion === 'reduced';
}

/**
 * Whether the art may move by itself: never under prefers-reduced-motion,
 * the site's reduced motion setting or Save-Data. The server render and the
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
