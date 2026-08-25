'use client';

import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

import { motionTokens, useIsInitialDocumentLoad, useMotionVariants } from '@/lib/motion';

const pageEnter = {
  initial: { opacity: 0, y: motionTokens.offset.slide },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: motionTokens.duration.page, ease: motionTokens.ease.outExpo },
  },
};

/**
 * Root template — runs on every route change. Wraps the route's children in
 * a fade-up motion so navigation feels animated rather than abrupt. Honors
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
