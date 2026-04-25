import { type CSSProperties, useState } from 'react';
import Image from 'next/image';

import { cn } from '@/lib/utils';

const FALLBACK_SRC = '/images/qmark.png';

// Hosts we trust the Next image optimizer to fetch from (mirrors
// next.config.ts → images.remotePatterns). Donated NFTs can come from
// arbitrary marketplace CDNs (Art Blocks media-proxy, IPFS gateways, etc.)
// — for those we set `unoptimized` so next/image bypasses the allowlist
// instead of throwing at render time and exploding the page.
const ALLOWLISTED_HOSTS = new Set<string>([
  'nfts.cosmicsignature.com',
  'nfts-sepolia.cosmicsignature.com',
  'nfts-local.cosmicsignature.com',
]);

function isOptimizableHost(src: string): boolean {
  if (!src.startsWith('http')) return true; // local /public asset
  try {
    return ALLOWLISTED_HOSTS.has(new URL(src).hostname);
  } catch {
    return false;
  }
}

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

  const finalSrc = hasError ? FALLBACK_SRC : src || FALLBACK_SRC;
  const unoptimized = !isOptimizableHost(finalSrc);

  return (
    <Image
      src={finalSrc}
      onError={() => setHasError(true)}
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
