'use client';

import * as React from 'react';

/**
 * Whether a compact phone table still fits its container.
 *
 * Column kinds decide compact up front (`phoneLayoutFor`), but a panel's
 * padding, a long header or a locale's longer words can still push three
 * short columns past a 320px screen. While `active` (a phone, and a table
 * the kinds made compact), this measures the table as laid out. When it is
 * wider than its container, the table turns into records, and it stays
 * records at that width or narrower, so the two layouts never flip back and
 * forth. A container that grows wider (a rotated phone) tries the table
 * again. The measurement runs before paint, so the wide table is never seen.
 *
 * `contentKey` changes with the rows on show (a new page, new data), which
 * can be wider than the last.
 */
export function useCompactFit(
  container: React.RefObject<HTMLElement | null>,
  active: boolean,
  contentKey: unknown,
): boolean {
  // The container width at which the compact table was found too wide.
  const [tooWideAt, setTooWideAt] = React.useState<number | null>(null);
  const fits = tooWideAt === null;

  React.useLayoutEffect(() => {
    const element = container.current;
    if (!active || !element) return;
    const check = () => {
      const width = element.clientWidth;
      setTooWideAt((current) => {
        if (current !== null) return width > current ? null : current;
        return element.scrollWidth > width + 1 ? width : null;
      });
    };
    check();
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(check);
    observer.observe(element);
    return () => observer.disconnect();
  }, [container, active, fits, contentKey]);

  return !active || fits;
}
