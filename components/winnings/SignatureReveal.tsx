'use client';

import { useCallback, useRef } from 'react';

import { ArtFrame, type ArtFrameProps, type ArtStatus } from '@/components/ui/art-frame';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

/** The imprint reveal: slow, with no overshoot (--ease-gallery, --duration-slow × 3). */
const REVEAL: KeyframeAnimationOptions = {
  duration: 1200,
  easing: 'cubic-bezier(0.2, 0, 0, 1)',
};

interface SignatureRevealProps extends ArtFrameProps {
  /** Play the reveal when the artwork arrives (the moment a Signature is received). */
  reveal: boolean;
}

/**
 * A Signature on its plate that, on the moment it was received, rises out of
 * the plate's black as its render arrives: the orbit mark holds the plate
 * while the image loads, then the art fades in once. Nothing is layered
 * over it, and with reduced motion (or `reveal` off) it simply appears.
 */
export function SignatureReveal({ reveal, onStatusChange, ...frame }: SignatureRevealProps) {
  const plateRef = useRef<HTMLDivElement>(null);
  const reducedMotion = usePrefersReducedMotion();

  const handleStatusChange = useCallback(
    (status: ArtStatus) => {
      onStatusChange?.(status);
      if (status !== 'loaded' || !reveal || reducedMotion) return;
      const image = plateRef.current?.querySelector('img');
      // Web Animations: absent in some embedded browsers (and jsdom); the art then just appears.
      if (typeof image?.animate === 'function')
        image.animate([{ opacity: 0 }, { opacity: 1 }], REVEAL);
    },
    [onStatusChange, reducedMotion, reveal],
  );

  return (
    <div ref={plateRef}>
      <ArtFrame {...frame} onStatusChange={handleStatusChange} />
    </div>
  );
}
