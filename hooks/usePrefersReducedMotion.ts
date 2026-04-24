'use client';

import { useEffect, useState } from 'react';

const QUERY = '(prefers-reduced-motion: reduce)';

export function usePrefersReducedMotion(): boolean {
  const [prefers, setPrefers] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;

    const mq = window.matchMedia(QUERY);
    setPrefers(mq.matches);

    const onChange = (e: MediaQueryListEvent) => setPrefers(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  return prefers;
}
