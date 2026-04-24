import type { Easing, Transition, Variants } from 'framer-motion';

import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

const outExpo: Easing = [0.16, 1, 0.3, 1];
const outSoft: Easing = [0.25, 0.46, 0.45, 0.94];
const inOutSoft: Easing = [0.4, 0, 0.2, 1];
const spring: Easing = [0.68, -0.55, 0.265, 1.55];

export const motionTokens = {
  duration: {
    instant: 0.08,
    fast: 0.15,
    base: 0.3,
    slow: 0.5,
    page: 0.7,
  },
  ease: { outExpo, outSoft, inOutSoft, spring },
  offset: {
    rise: 8,
    slide: 16,
    scaleFrom: 0.96,
  },
  stagger: {
    children: 0.04,
    sections: 0.08,
  },
};

const { duration, ease, offset, stagger } = motionTokens;

const baseTransition: Transition = {
  duration: duration.base,
  ease: ease.outExpo,
};

export const fadeRise: Variants = {
  initial: { opacity: 0, y: offset.rise },
  animate: { opacity: 1, y: 0, transition: { duration: duration.base, ease: ease.outExpo } },
  exit: { opacity: 0, y: offset.rise, transition: { duration: duration.fast, ease: ease.outSoft } },
};

export const fadeRiseStagger: Variants = {
  initial: {},
  animate: { transition: { staggerChildren: stagger.children, delayChildren: 0.05 } },
  exit: { transition: { staggerChildren: stagger.children / 2, staggerDirection: -1 } },
};

export const scaleIn: Variants = {
  initial: { opacity: 0, scale: offset.scaleFrom },
  animate: {
    opacity: 1,
    scale: 1,
    transition: { duration: duration.base, ease: ease.outExpo },
  },
  exit: {
    opacity: 0,
    scale: offset.scaleFrom,
    transition: { duration: duration.fast, ease: ease.outSoft },
  },
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

export const pageTransition: Variants = {
  initial: { opacity: 0, y: offset.slide },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: duration.page, ease: ease.outExpo },
  },
  exit: {
    opacity: 0,
    y: offset.slide,
    transition: { duration: 0.25, ease: ease.outSoft },
  },
};

export const dialogMotion: Variants = {
  initial: { opacity: 0, scale: offset.scaleFrom },
  animate: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.25, ease: ease.outExpo },
  },
  exit: {
    opacity: 0,
    scale: offset.scaleFrom,
    transition: { duration: duration.fast, ease: ease.outSoft },
  },
};

export const hoverLift: Transition = {
  duration: duration.fast,
  ease: ease.outSoft,
};

const REDUCED: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0 } },
  exit: { opacity: 0, transition: { duration: 0 } },
};

const REDUCED_STAGGER: Variants = {
  initial: {},
  animate: { transition: { staggerChildren: 0 } },
  exit: {},
};

/**
 * Returns the given variants, or a no-op opacity-only fallback when the user
 * prefers reduced motion. Prefer this over raw variants in interactive
 * components so motion is always accessible.
 */
export function useMotionVariants(variants: Variants): Variants {
  const reduced = usePrefersReducedMotion();
  if (!reduced) return variants;
  if (variants === fadeRiseStagger) return REDUCED_STAGGER;
  return REDUCED;
}

export function useMotionTransition(transition: Transition = baseTransition): Transition {
  const reduced = usePrefersReducedMotion();
  return reduced ? { duration: 0 } : transition;
}
