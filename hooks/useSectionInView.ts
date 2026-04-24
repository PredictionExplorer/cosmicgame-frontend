'use client';

import { useEffect, useRef, useState } from 'react';

interface UseSectionInViewOptions {
  threshold?: number | number[];
  rootMargin?: string;
  once?: boolean;
}

export function useSectionInView<T extends HTMLElement = HTMLElement>(
  options: UseSectionInViewOptions = {},
) {
  const { threshold = 0.2, rootMargin = '0px 0px -10% 0px', once = true } = options;
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;

        if (entry.isIntersecting) {
          setInView(true);
          if (once) observer.unobserve(element);
        } else if (!once) {
          setInView(false);
        }
      },
      { threshold, rootMargin },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [threshold, rootMargin, once]);

  return { ref, inView };
}
