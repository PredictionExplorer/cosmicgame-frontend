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
  /**
   * Final fallback image after all real sources fail. Set to `null` for showcase
   * surfaces that should render a neutral state instead of placeholder artwork.
   */
  terminalFallbackSrc?: string | null;
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
  terminalFallbackSrc = FALLBACK_SRC,
  alt = 'NFT',
  style,
  className,
  priority = false,
  loading,
  sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 800px',
}: NFTImageProps) => {
  // Resolution chain: primary src, optional fallback, then the configured terminal fallback.
  const chain = [src, fallbackSrc, terminalFallbackSrc ?? undefined].filter(
    (s): s is string => typeof s === 'string' && s.length > 0,
  );
  if (terminalFallbackSrc && chain[chain.length - 1] !== terminalFallbackSrc) {
    chain.push(terminalFallbackSrc);
  }

  const [step, setStep] = useState(0);
  const [prevKey, setPrevKey] = useState(`${src}|${fallbackSrc}|${terminalFallbackSrc ?? 'none'}`);
  const [exhausted, setExhausted] = useState(chain.length === 0);

  const key = `${src}|${fallbackSrc}|${terminalFallbackSrc ?? 'none'}`;
  if (prevKey !== key) {
    setPrevKey(key);
    if (step !== 0) setStep(0);
    const nextExhausted = chain.length === 0;
    if (exhausted !== nextExhausted) setExhausted(nextExhausted);
  }

  const safeStep = Math.min(step, chain.length - 1);
  const finalSrc = chain[safeStep] ?? FALLBACK_SRC;
  const unoptimized = shouldBypassOptimizer(finalSrc);

  if (exhausted || (terminalFallbackSrc === null && step >= chain.length)) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={cn(
          'flex w-full aspect-video items-center justify-center rounded-inherit border border-white/[0.08] bg-white/[0.03] text-center text-xs uppercase tracking-[0.22em] text-muted-foreground',
          className,
        )}
        style={style}
      >
        Artwork unavailable
      </div>
    );
  }

  return (
    <Image
      src={finalSrc}
      onError={() => {
        setStep((s) => {
          const next = s + 1;
          if (next >= chain.length && terminalFallbackSrc === null) {
            setExhausted(true);
          }
          return Math.min(next, Math.max(chain.length - 1, 0));
        });
      }}
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
