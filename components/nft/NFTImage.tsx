import { type CSSProperties, useState } from 'react';
import Image from 'next/image';

import { cn } from '@/lib/utils';

const FALLBACK_SRC = '/images/qmark.png';

interface NFTImageProps {
  src?: string;
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
  alt = 'NFT',
  style,
  className,
  priority = false,
  loading,
  sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 800px',
}: NFTImageProps) => {
  const [hasError, setHasError] = useState(false);
  const [prevSrc, setPrevSrc] = useState(src);

  if (prevSrc !== src) {
    setPrevSrc(src);
    if (hasError) setHasError(false);
  }

  return (
    <Image
      src={hasError ? FALLBACK_SRC : src || FALLBACK_SRC}
      onError={() => setHasError(true)}
      alt={alt}
      width={800}
      height={450}
      priority={priority}
      loading={loading ?? (priority ? 'eager' : 'lazy')}
      sizes={sizes}
      className={cn('w-full aspect-video object-contain align-middle', className)}
      style={style}
    />
  );
};

export default NFTImage;
