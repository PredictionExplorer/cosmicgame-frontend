'use client';

import { useCallback, useEffect, useState } from 'react';

import { useHydrated } from './useHydrated';

/**
 * Whether an element has come near the screen: `false` until its box is
 * within `margin` of the viewport (half a screen ahead by default), then
 * `true` for good. Attach the returned ref to the element. Gate work the
 * reader cannot see yet behind it, so a long page does not do it all at
 * load: it runs as the reader scrolls towards it instead. `false` on the
 * server and during hydration, so the first client render matches the
 * server's; a browser without IntersectionObserver gets `true` right after.
 */
export function useNearViewport<T extends Element>(
  margin = '50% 0px',
): [near: boolean, ref: (element: T | null) => void] {
  const hydrated = useHydrated();
  const [element, setElement] = useState<T | null>(null);
  const [near, setNear] = useState(false);
  const observable = typeof IntersectionObserver !== 'undefined';

  useEffect(() => {
    if (near || !element || !observable) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) setNear(true);
      },
      { rootMargin: margin },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [element, margin, near, observable]);

  const ref = useCallback((node: T | null) => setElement(node), []);
  return [near || (hydrated && !observable), ref];
}
