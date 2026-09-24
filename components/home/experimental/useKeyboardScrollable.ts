'use client';

import { useEffect, type RefObject } from 'react';

/**
 * A scroller whose content holds nothing focusable cannot be scrolled from
 * the keyboard (axe `scrollable-region-focusable`, WCAG 2.1.1). While the
 * element really overflows, it takes a tab stop and a name, so the arrow keys
 * scroll it; once everything fits (a wide screen) it gives both back, so a
 * rail that no longer scrolls is not an empty stop in the tab order.
 */
export function useKeyboardScrollable(ref: RefObject<HTMLElement | null>, label: string): void {
  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;

    const sync = () => {
      if (node.scrollWidth > node.clientWidth + 1) {
        node.tabIndex = 0;
        node.setAttribute('role', 'group');
        node.setAttribute('aria-label', label);
      } else {
        node.removeAttribute('tabindex');
        node.removeAttribute('role');
        node.removeAttribute('aria-label');
      }
    };

    sync();
    if (typeof ResizeObserver === 'undefined') return undefined;
    const observer = new ResizeObserver(sync);
    observer.observe(node);
    if (node.firstElementChild) observer.observe(node.firstElementChild);
    return () => observer.disconnect();
  }, [ref, label]);
}
