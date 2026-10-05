'use client';

import { useEffect, type RefObject } from 'react';

/** The clearance each mounted bar needs, as a CSS length; the largest applies. */
const clearances = new Map<object, string>();

function applyClearance() {
  const root = document.documentElement;
  const values = [...clearances.values()];
  if (values.length === 0) {
    root.style.removeProperty('scroll-padding-bottom');
  } else {
    root.style.setProperty(
      'scroll-padding-bottom',
      values.length === 1 ? values[0]! : `max(${values.join(', ')})`,
    );
  }
}

/**
 * Keeps keyboard focus clear of a bar stuck to the bottom of the viewport
 * (WCAG 2.2 2.4.11, Focus Not Obscured). While the bar is mounted the root's
 * `scroll-padding-bottom` is the bar's measured height plus `offset` (its
 * distance from the viewport edge and a gap), so the browser scrolls a
 * control that receives focus under the bar up into view. The padding
 * follows the bar's size and is removed with it; several bars use the
 * tallest.
 */
export function useBottomScrollClearance(ref: RefObject<HTMLElement | null>, offset: string) {
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const key = {};
    const measure = () => {
      const height = Math.ceil(element.getBoundingClientRect().height);
      clearances.set(key, `calc(${height}px + ${offset})`);
      applyClearance();
    };
    measure();
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(measure);
    observer?.observe(element);
    return () => {
      observer?.disconnect();
      clearances.delete(key);
      applyClearance();
    };
  }, [ref, offset]);
}
