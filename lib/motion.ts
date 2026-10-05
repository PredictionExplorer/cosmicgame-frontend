import { useEffect, useState } from 'react';
import type { Easing, Variants } from 'framer-motion';

import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

const outExpo: Easing = [0.16, 1, 0.3, 1];
const gallery: Easing = [0.2, 0, 0, 1];
const outSoft: Easing = [0.25, 0.46, 0.45, 0.94];
const inOutSoft: Easing = [0.4, 0, 0.2, 1];

/**
 * The motion scale for framer-motion, in seconds: the same values as the
 * `--duration-*` and `--ease-*` tokens in styles/tokens.css, so CSS and JS
 * motion share one scale (lib/__tests__/motion.test.tsx parses the CSS and
 * fails on drift). `page` is the ceiling; there are no springs.
 */
export const motionTokens = {
  duration: {
    instant: 0.08,
    fast: 0.15,
    base: 0.24,
    slow: 0.4,
    page: 0.56,
    settle: 0.9,
  },
  ease: { outExpo, gallery, outSoft, inOutSoft },
  offset: {
    rise: 8,
    slide: 16,
    scaleFrom: 0.96,
  },
};

const { duration, ease, offset } = motionTokens;

export const fadeRise: Variants = {
  initial: { opacity: 0, y: offset.rise },
  animate: { opacity: 1, y: 0, transition: { duration: duration.base, ease: ease.outExpo } },
  exit: { opacity: 0, y: offset.rise, transition: { duration: duration.fast, ease: ease.outSoft } },
};

export const slideInRight: Variants = {
  initial: { opacity: 0, x: offset.slide },
  animate: { opacity: 1, x: 0, transition: { duration: duration.base, ease: ease.outExpo } },
  exit: {
    opacity: 0,
    x: offset.slide,
    transition: { duration: duration.fast, ease: ease.outSoft },
  },
};

const REDUCED: Variants = {
  // Viewport reveals must remain readable before an intersection event.
  // No transform: page templates contain controls fixed to the viewport.
  initial: { opacity: 1 },
  animate: { opacity: 1, transition: { duration: 0 } },
  exit: { opacity: 0, transition: { duration: 0 } },
};

/**
 * Returns the given variants, or an immediately visible fallback when the user
 * prefers reduced motion. Prefer this over raw variants in interactive
 * components so motion is always accessible.
 */
export function useMotionVariants(variants: Variants): Variants {
  const reduced = usePrefersReducedMotion();
  return reduced ? REDUCED : variants;
}

/**
 * Whether the current render belongs to the initial document load (server
 * render and hydration) rather than a client-side navigation.
 *
 * Route templates use this to SKIP their entrance animation on first load:
 * the server HTML must never hide content behind `opacity: 0`, or the
 * Largest Contentful Paint waits for the full JS bundle. Client-side
 * navigations still animate, so routing keeps its polish.
 *
 * The flag lives at module scope: on the server it is never consumed, so
 * SSR always renders the visible state; on the client the first committed
 * tree consumes it, and every later mount (i.e. navigation) animates.
 */
let documentEntranceConsumed = false;

export function useIsInitialDocumentLoad(): boolean {
  const [isInitialLoad] = useState(() => !documentEntranceConsumed);
  useEffect(() => {
    documentEntranceConsumed = true;
  }, []);
  return isInitialLoad;
}

/** Test-only: restores the pristine "document just loaded" state. */
export function resetDocumentEntranceForTesting(): void {
  documentEntranceConsumed = false;
}
