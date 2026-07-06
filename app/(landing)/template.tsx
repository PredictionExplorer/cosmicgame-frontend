'use client';

import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

import { motionTokens, useMotionVariants } from '@/lib/motion';

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
 */
export default function Template({ children }: { children: ReactNode }) {
  const variants = useMotionVariants(pageEnter);
  return (
    <motion.div variants={variants} initial="initial" animate="animate">
      {children}
    </motion.div>
  );
}
