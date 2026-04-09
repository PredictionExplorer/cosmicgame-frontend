'use client';

import { useEffect, useRef } from 'react';

export function Stars() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const c = containerRef.current;
    if (!c) return;
    for (let i = 0; i < 120; i++) {
      const s = document.createElement('div');
      const size = Math.random() * 2.5 + 0.5;
      s.style.position = 'absolute';
      s.style.borderRadius = '50%';
      s.style.background = '#F0EDFF';
      s.style.width = `${size}px`;
      s.style.height = `${size}px`;
      s.style.left = `${Math.random() * 100}%`;
      s.style.top = `${Math.random() * 100}%`;
      s.style.animation = `twinkle ${Math.random() * 4 + 2}s ease-in-out ${Math.random() * 4}s infinite alternate`;
      c.appendChild(s);
    }
  }, []);

  return (
    <div ref={containerRef} className="fixed inset-0 pointer-events-none z-0" aria-hidden="true" />
  );
}
