'use client';

import { useCallback, useRef, useState } from 'react';

import { cn } from '@/lib/utils';
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
 * while the image loads, then the art fades in once. The image stays hidden
 * until then, so a progressively decoded rendition never paints ahead of the
 * fade. Nothing is layered over it, and with reduced motion (or `reveal` off)
 * it simply appears.
 */
export function SignatureReveal({ reveal, onStatusChange, ...frame }: SignatureRevealProps) {
  const plateRef = useRef<HTMLDivElement>(null);
  const reducedMotion = usePrefersReducedMotion();
  const [revealed, setRevealed] = useState(false);
  const holding = reveal && !reducedMotion && !revealed;

  const handleStatusChange = useCallback(
    (status: ArtStatus) => {
      onStatusChange?.(status);
      if (status !== 'loaded' || !reveal || reducedMotion) return;
      const image = plateRef.current?.querySelector('img');
      // Web Animations: absent in some embedded browsers (and jsdom); the art then just appears.
      // The animation starts at opacity 0 before the hold is lifted, so no frame shows it early.
      if (typeof image?.animate === 'function')
        image.animate([{ opacity: 0 }, { opacity: 1 }], REVEAL);
      setRevealed(true);
    },
    [onStatusChange, reducedMotion, reveal],
  );

  return (
    <div ref={plateRef} className={cn(holding && '[&_img]:opacity-0')} data-revealing={holding}>
      <ArtFrame {...frame} onStatusChange={handleStatusChange} />
    </div>
  );
}
