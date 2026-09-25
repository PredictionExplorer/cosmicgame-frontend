'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Whether a sticky bar is stuck under its `top` offset: a sentinel just
 * above it has scrolled under the fixed header. Drives the glass band a
 * sub-navigation takes only once it floats over content. Render the
 * sentinel (`<div ref={sentinelRef} aria-hidden className="h-0" />`)
 * immediately before the bar that takes `stickyRef`.
 */
export function useStuck<T extends HTMLElement = HTMLElement>() {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<T>(null);
  const [stuck, setStuck] = useState(false);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    const sticky = stickyRef.current;
    if (!sentinel || !sticky || typeof IntersectionObserver === 'undefined') return;
    // The resolved `top` of a sticky element is in pixels.
    const top = Math.ceil(parseFloat(getComputedStyle(sticky).top) || 0);
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        // Stuck once the sentinel has scrolled up past the offset, not while it sits below the
        // fold. (Some observer shims report no box; treat that as not scrolled past.)
        const sentinelTop = entry.boundingClientRect?.top ?? Number.POSITIVE_INFINITY;
        setStuck(!entry.isIntersecting && sentinelTop <= top);
      },
      { rootMargin: `-${top}px 0px 0px 0px`, threshold: 0 },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  return { sentinelRef, stickyRef, stuck };
}
