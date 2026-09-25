'use client';

import { useLayoutEffect, useRef, type ReactNode } from 'react';

import { useIsInitialDocumentLoad } from '@/lib/motion';

/**
 * A CSS time in milliseconds ("560ms", or "0.56s" once the stylesheet is
 * minified), or null when it is not one.
 */
export function cssTimeToMs(value: string): number | null {
  const match = /^(-?[\d.]+)(ms|s)$/.exec(value.trim());
  if (!match) return null;
  const amount = Number.parseFloat(match[1]!);
  if (!Number.isFinite(amount) || amount <= 0) return null;
  return match[2] === 's' ? amount * 1000 : amount;
}

/** The page entrance's timing, from the motion tokens (styles/tokens.css). */
function entranceTiming(element: HTMLElement): KeyframeAnimationOptions {
  const styles = getComputedStyle(element);
  const easing = styles.getPropertyValue('--ease-out-expo').trim();
  return {
    duration: cssTimeToMs(styles.getPropertyValue('--duration-page')) ?? 560,
    easing: easing || 'cubic-bezier(0.16, 1, 0.3, 1)',
  };
}

/**
 * The route templates' page entrance: a client-side navigation fades the new
 * page in; the initial document load does not animate, so the server HTML is
 * never hidden behind `opacity: 0` and the Largest Contentful Paint does not
 * wait for script. Visitors who prefer reduced motion get the page at once.
 *
 * Opacity only, never a transform: any transform on this wrapper (even a
 * settled sub-pixel one) makes it the containing block for every
 * `position: fixed` descendant, re-anchoring the floating gesture action and
 * the reading pages' Contents button to the document.
 *
 * The Web Animations API, not framer-motion: the templates wrap every page,
 * and a `motion.div` here put the library's whole animation runtime (about
 * 43 KB gzip) into every page's first download.
 */
export function RouteEntrance({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInitialLoad = useIsInitialDocumentLoad();

  // Before paint, so a navigation never flashes the page at full opacity first.
  useLayoutEffect(() => {
    const element = ref.current;
    if (isInitialLoad || !element || typeof element.animate !== 'function') return undefined;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return undefined;
    const animation = element.animate([{ opacity: 0 }, { opacity: 1 }], entranceTiming(element));
    return () => animation.cancel();
  }, [isInitialLoad]);

  return <div ref={ref}>{children}</div>;
}
