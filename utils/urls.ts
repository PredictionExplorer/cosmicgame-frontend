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

/** Seed as lower-case hex without a `0x` prefix, however the caller spelled it. */
const bareSeed = (seed: string | number): string =>
  String(seed).trim().toLowerCase().replace(/^0x/, '');

/**
 * Token metadata document (the ERC-721 `tokenURI` payload: traits, palette,
 * simulation record, media manifest). Served by the same rotated media origin
 * as the images. Always address it by token id: the seed form is not supported.
 */
export const getMetadataUrl = (tokenId: number | string): string => {
  return `${nftCdnOrigin()}/metadata/${tokenId}`;
};

/**
 * A file inside the per-seed asset package directory (`0x<seed>/...`). The
 * v2 pipeline publishes web-sized derivatives and videos there next to the
 * thumbnails; the paths are deterministic from the seed.
 */
export const getSeedPackageUrl = (seed: string | number, relativePath: string): string => {
  return getAssetsUrl(`cosmicsignature/0x${bareSeed(seed)}/${relativePath.replace(/^\/+/, '')}`);
};

/**
 * Full-resolution WebP of the artwork (same pixels as the source PNG at a
 * fraction of the bytes). Use it for hero / lightbox surfaces and fall back to
 * the PNG for tokens rendered before the WebP derivative existed.
 */
export const getWebImageUrl = (seed: string | number): string =>
  getSeedPackageUrl(seed, 'images/web/full.webp');

/** Web-encoded MP4 that sweeps through the spectral bins of the simulation. */
export const getSpectralSweepUrl = (seed: string | number): string =>
  getSeedPackageUrl(seed, 'videos/web/spectral_sweep.mp4');

/** High-quality (HEVC) master of the main animation. */
export const getHqVideoUrl = (seed: string | number): string =>
  getSeedPackageUrl(seed, 'videos/hq/main.mp4');

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
