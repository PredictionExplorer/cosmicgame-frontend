import { type CSSProperties, useState } from 'react';
import Image from 'next/image';

import { cn } from '@/lib/utils';

const FALLBACK_SRC = '/images/qmark.png';

interface NFTImageProps {
  src?: string;
  alt?: string;
  style?: CSSProperties;
  className?: string;
}

const NFTImage = ({ src, alt = 'NFT', style, className }: NFTImageProps) => {
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
      unoptimized
      loading="eager"
      className={cn('w-full aspect-video object-contain align-middle', className)}
      style={{ ...style, width: 'auto', height: 'auto' }}
    />
  );
};

export default NFTImage;
