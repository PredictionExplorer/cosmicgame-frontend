'use client';

import { useEffect, type RefObject } from 'react';

/** The custom property `html { scroll-padding-top }` adds under the site header. */
export const STICKY_CLEARANCE_PROPERTY = '--sticky-bar-clearance';

/** A CSS length (`72px`, `4.5rem`) in pixels, against the root font size for rem. */
export function cssLengthToPx(value: string, rootFontSizePx: number): number {
  const length = value.trim();
  const amount = Number.parseFloat(length);
  if (!Number.isFinite(amount)) return 0;
  return length.endsWith('rem') ? amount * rootFontSizePx : amount;
}

/**
 * How far a bar stuck under the site header reaches below it: its height
 * plus any gap between the header and its sticky top, in whole pixels.
 */
export function stickyClearancePx({
  height,
  stickyTop,
  headerHeight,
}: {
  height: number;
  stickyTop: number;
  headerHeight: number;
}): number {
  return Math.max(0, Math.ceil(height + stickyTop - headerHeight));
}

/**
 * Publishes how much of the viewport a sticky bar under the site header
 * covers (a sub-navigation, the gallery toolbar) as `--sticky-bar-clearance`,
 * which `html { scroll-padding-top }` adds to the header's own offset. Focus
 * moved backwards, an anchor jump or `scrollIntoView` then stops below the
 * bar instead of under it (WCAG 2.4.11 Focus Not Obscured).
 *
 * The value follows the bar's size and is published only while the bar is
 * sticky and `media` (when given) matches, for bars that stick only at some
 * widths or become a side column. One bar per page publishes at a time.
 */
export function useStickyClearance(
  ref: RefObject<HTMLElement | null>,
  { media }: { media?: string } = {},
): void {
  useEffect(() => {
    const bar = ref.current;
    if (!bar || typeof window === 'undefined') return;
    const root = document.documentElement;
    const query =
      media && typeof window.matchMedia === 'function' ? window.matchMedia(media) : null;

    const update = () => {
      const style = window.getComputedStyle(bar);
      if (style.position !== 'sticky' || (query && !query.matches)) {
        root.style.removeProperty(STICKY_CLEARANCE_PROPERTY);
        return;
      }
      const rootStyle = window.getComputedStyle(root);
      const rootFontSize = Number.parseFloat(rootStyle.fontSize) || 16;
      const clearance = stickyClearancePx({
        height: bar.getBoundingClientRect().height,
        stickyTop: cssLengthToPx(style.top, rootFontSize),
        headerHeight: cssLengthToPx(rootStyle.getPropertyValue('--header-height'), rootFontSize),
      });
      root.style.setProperty(STICKY_CLEARANCE_PROPERTY, `${clearance}px`);
    };

    update();
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(update);
    observer?.observe(bar);
    window.addEventListener('resize', update);
    query?.addEventListener?.('change', update);
    return () => {
      observer?.disconnect();
      window.removeEventListener('resize', update);
      query?.removeEventListener?.('change', update);
      root.style.removeProperty(STICKY_CLEARANCE_PROPERTY);
    };
  }, [ref, media]);
}
