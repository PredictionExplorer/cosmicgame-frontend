'use client';

import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

import { motionTokens, useMotionVariants } from '@/lib/motion';

/**
 * Opacity only — deliberately no `y`.
 *
 * Any transform on this element, including `translateY(0px)`, makes it the
 * containing block for every `position: fixed` descendant on the page. That
 * silently re-anchored the floating gesture CTA and the ambient backdrop to
 * the document instead of the viewport, so the CTA sat at the bottom of a
 * multi-thousand-pixel page rather than floating above it. Framer Motion also
 * settles on a sub-pixel residual (`matrix(1, 0, 0, 1, 0, 0.0117)`) rather
 * than clearing the transform, so the breakage outlived the animation.
 *
 * Opacity creates a stacking context but not a containing block, so fixed
 * positioning keeps resolving against the viewport.
 */
const pageEnter = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { duration: motionTokens.duration.page, ease: motionTokens.ease.outExpo },
  },
};

/**
 * Root template — runs on every route change, fading the route's children in
 * so navigation feels animated rather than abrupt. Honors
 * prefers-reduced-motion via lib/motion's useMotionVariants helper.
 *
 * Sits between layout (persistent) and page (per-route) per Next.js App
 * Router conventions, so the wrapping motion does not re-mount providers.
 */
export default function Template({ children }: { children: ReactNode }) {
  const variants = useMotionVariants(pageEnter);
  return (
    <motion.div variants={variants} initial="initial" animate="animate">
      {children}
    </motion.div>
  );
}
