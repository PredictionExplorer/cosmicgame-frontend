import { type CSSProperties, useState } from 'react';
import Image from 'next/image';

import { cn } from '@/lib/utils';

const FALLBACK_SRC = '/images/qmark-preview.png';

function shouldBypassOptimizer(src: string): boolean {
  return src.startsWith('http');
}

interface NFTImageProps {
  src?: string;
  /**
   * Optional next source to try if `src` fails to load (e.g. the full-resolution
   * image when a thumbnail has not been generated yet). On failure the chain is
   * `src → fallbackSrc → placeholder`.
   */
  fallbackSrc?: string;
  alt?: string;
  style?: CSSProperties;
  className?: string;
  /** Above-the-fold images should set priority to hint the image loader. */
  priority?: boolean;
  /** Override loading behavior. Defaults to 'lazy' for below-the-fold. */
  loading?: 'lazy' | 'eager';
  /**
   * Responsive size hint for the image optimizer so it can pick the right
   * source from the srcset. Defaults to a reasonable home/gallery value.
   */
  sizes?: string;
}

const NFTImage = ({
  src,
  fallbackSrc,
  alt = 'NFT',
  style,
  className,
  priority = false,
  loading,
  sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 800px',
}: NFTImageProps) => {
  // Resolution chain: primary src, optional fallback, then the placeholder.
  const chain = [src, fallbackSrc, FALLBACK_SRC].filter(
    (s): s is string => typeof s === 'string' && s.length > 0,
  );
  if (chain[chain.length - 1] !== FALLBACK_SRC) {
    chain.push(FALLBACK_SRC);
  }

  const [step, setStep] = useState(0);
  const [prevKey, setPrevKey] = useState(`${src}|${fallbackSrc}`);

  const key = `${src}|${fallbackSrc}`;
  if (prevKey !== key) {
    setPrevKey(key);
    if (step !== 0) setStep(0);
  }

  const safeStep = Math.min(step, chain.length - 1);
  const finalSrc = chain[safeStep] ?? FALLBACK_SRC;
  const unoptimized = shouldBypassOptimizer(finalSrc);

  return (
    <Image
      src={finalSrc}
      onError={() => setStep((s) => Math.min(s + 1, chain.length - 1))}
      alt={alt}
      width={800}
      height={450}
      priority={priority}
      loading={loading ?? (priority ? 'eager' : 'lazy')}
      sizes={sizes}
      unoptimized={unoptimized}
      className={cn('w-full aspect-video object-contain align-middle', className)}
      style={style}
    />
  );
};

export default NFTImage;
