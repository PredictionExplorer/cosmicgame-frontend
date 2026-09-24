'use client';

import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

import { motionTokens, useIsInitialDocumentLoad, useMotionVariants } from '@/lib/motion';

/**
 * Opacity only, as in the app template — deliberately no `y`. Any transform
 * on this element (framer-motion settles on a sub-pixel residual rather than
 * clearing it) makes it the containing block for every `position: fixed`
 * descendant, so the reading pages' fixed Contents button would anchor to
 * the document instead of the viewport after a client-side navigation.
 */
const pageEnter = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { duration: motionTokens.duration.page, ease: motionTokens.ease.outExpo },
  },
};

/**
 * Root template — runs on every route change. Fades the route's children in
 * so navigation feels animated rather than abrupt. Honors
 * prefers-reduced-motion via lib/motion's useMotionVariants helper.
 *
 * Sits between layout (persistent) and page (per-route) per Next.js App
 * Router conventions, so the wrapping motion does not re-mount providers.
 *
 * The entrance is SKIPPED on the initial document load (`initial={false}`):
 * animating from `opacity: 0` on first paint would server-render the whole
 * page invisible and hold the Largest Contentful Paint hostage to JS
 * download + hydration. Only client-side navigations animate.
 */
export default function Template({ children }: { children: ReactNode }) {
  const variants = useMotionVariants(pageEnter);
  const isInitialLoad = useIsInitialDocumentLoad();
  return (
    <motion.div variants={variants} initial={isInitialLoad ? false : 'initial'} animate="animate">
      {children}
    </motion.div>
  );
}
