import { networkConfig } from '@/config/networks';
import { LANDING_ORIGIN } from '@/lib/hostRouting';
import { getApiOrigin } from '@/lib/serverRotation';

const EXPLORER_BASE = networkConfig.explorerUrl.replace(/\/$/, '');

/**
 * NFT media origin (no path). The rotated API servers serve the media too
 * (`/images/...`), so media follows the same hourly rotation and failover as
 * API calls instead of pinning a dedicated single-server media host.
 * Falls back to the per-environment `nftApiUrl` when no API base is
 * configured.
 */
function nftCdnOrigin(): string {
  return getApiOrigin() || (networkConfig.nftApiUrl || '').replace(/\/+$/, '');
}

/** Returns a block-explorer URL for a tx hash, address, or token. */
export const getExplorerUrl = (type: 'tx' | 'address' | 'token', value: string): string =>
  `${EXPLORER_BASE}/${type}/${value}`;

/** Returns the URL directly (no proxy; for compatibility with code that previously used getProxiedUrl). */
export const getProxiedUrl = (url: string): string => {
  return url;
};

/** Returns direct CST asset URL (images) from the NFT server. */
export const getAssetsUrl = (url: string): string => {
  return `${nftCdnOrigin()}/images/new/${url}`;
};

/** Pre-rendered thumbnail size served from the per-seed package directory. */
export type ThumbVariant = 'card' | 'micro';

/**
 * Returns the WebP thumbnail URL for a Cosmic Signature token. Thumbnails live
 * inside the per-seed package dir (`0x<seed>/thumb_<variant>.webp`) and are
 * generated server-side; callers should fall back to the full image when a
 * thumbnail is not present yet.
 */
export const getThumbUrl = (seed: string | number, variant: ThumbVariant): string => {
  return getAssetsUrl(`cosmicsignature/0x${seed}/thumb_${variant}.webp`);
};

/** Returns direct RandomWalk NFT image URL. */
export const getRWLKImageUrl = (fileName: string, variant: string = 'black_thumb.jpg'): string => {
  return `${nftCdnOrigin()}/images/randomwalk/${fileName}_${variant}`;
};

/** Decodes the original URL (handles legacy proxied format for backwards compatibility). */
export const getOriginUrl = (url: string): string => {
  if (url.startsWith('/api/proxy?url=')) {
    return decodeURIComponent(url.replace('/api/proxy?url=', ''));
  }
  return url;
};

/** Same origin as root `metadataBase` — marketing/branding, not chain-specific. */
const CANONICAL_SITE_ORIGIN = LANDING_ORIGIN;

/** Site branding logo (`public/images/logo.svg`). Not on the NFT CDN. */
export const logoImgUrl = `${CANONICAL_SITE_ORIGIN}/images/logo.svg`;
