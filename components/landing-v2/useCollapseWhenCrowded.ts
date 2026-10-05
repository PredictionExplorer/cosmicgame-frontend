'use client';

import { useLayoutEffect, useRef, useState, type RefObject } from 'react';

/**
 * Priority+ for one inline row of links. True while `list` is wider than the
 * room `container` gives it; the caller then hides its lowest-priority items.
 * It turns false again only once the room fits the width the list needed
 * with everything shown, remembered from when it overflowed, so hiding items
 * never flips the answer back by itself. Measures in the browser only: the
 * server render shows everything its breakpoints allow.
 *
 * `container` must take the row's free space (e.g. `flex-1 min-w-0`), so its
 * width is the room, not the list's own width.
 */
export function useCollapseWhenCrowded(
  container: RefObject<HTMLElement | null>,
  list: RefObject<HTMLElement | null>,
): boolean {
  const [collapsed, setCollapsed] = useState(false);
  const collapsedNow = useRef(false);
  const needed = useRef(0);

  useLayoutEffect(() => {
    const box = container.current;
    const content = list.current;
    if (!box || !content || typeof ResizeObserver === 'undefined') return undefined;
    // ResizeObserver reports once on observe(), so the first check needs no call here.
    const observer = new ResizeObserver(() => {
      const room = box.clientWidth;
      if (room === 0) return; // Hidden below its breakpoint: nothing to decide.
      let next: boolean;
      if (collapsedNow.current) {
        next = room < needed.current;
      } else if (content.scrollWidth > room + 1) {
        needed.current = content.scrollWidth;
        next = true;
      } else {
        next = false;
      }
      if (next !== collapsedNow.current) {
        collapsedNow.current = next;
        setCollapsed(next);
      }
    });
    observer.observe(box);
    observer.observe(content);
    return () => observer.disconnect();
  }, [container, list]);

  return collapsed;
}
