'use client';

import { useMediaQuery } from '@/hooks/useMediaQuery';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

/**
 * Media query gating the WebGL hero. Lives in its own module — with NO
 * three.js imports — so consumers can evaluate the gate without pulling the
 * three.js stack into their chunk.
 */
export const HERO_CANVAS_MEDIA_QUERY = '(min-width: 1024px)';

/**
 * True when the visitor should get the WebGL hero: large viewport and no
 * reduced-motion preference.
 *
 * This must be checked OUTSIDE the dynamically imported HeroCanvas. The
 * previous in-component check ran after `import()` resolved, so phones
 * downloaded the ~320KB three.js chunk only to render the static gradient
 * fallback. Server render and the first client render return false (both
 * hooks snapshot to false on the server), which is correct: the canvas is
 * client-only and mounts right after hydration on qualifying desktops.
 */
export function useCanRenderHeroCanvas(): boolean {
  const reducedMotion = usePrefersReducedMotion();
  const highQuality = useMediaQuery(HERO_CANVAS_MEDIA_QUERY);
  return !reducedMotion && highQuality;
}
