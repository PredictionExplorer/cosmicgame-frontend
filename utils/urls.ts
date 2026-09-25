import { networkConfig } from '@/config/networks';
import { LANDING_ORIGIN } from '@/lib/hostRouting';
import { BRAND_ICON_PATHS } from '@/lib/og/brandIcons';
import { apiBaseUrls } from '@/lib/serverRotation';

const EXPLORER_BASE = networkConfig.explorerUrl.replace(/\/$/, '');

function originOf(url: string): string | null {
  try {
    return new URL(url).origin;
  } catch {
    return null;
  }
}

/**
 * Every server that serves the NFT media (`/images/...`, `/metadata/...`):
 * the configured API servers, which serve both, in their configured order.
 */
export const MEDIA_ORIGINS: readonly string[] = [
  ...new Set(apiBaseUrls.map(originOf).filter((origin): origin is string => !!origin)),
];

/**
 * The one origin media URLs are built on: the first media server, else the
 * per-environment `nftApiUrl`. Deliberately not the API's hourly rotation
 * pick. A media URL is rendered on the server and again while hydrating, and
 * a page cached in one hour and hydrated in the next would swap every
 * image's host after it painted, blanking the whole gallery while each file
 * downloaded a second time; a rotating host also defeats the browser cache
 * every hour. Failover happens only when an image actually fails, in the
 * art frame's source chain ({@link mediaFailoverUrl}).
 */
export const MEDIA_ORIGIN: string =
  MEDIA_ORIGINS[0] ?? (networkConfig.nftApiUrl || '').replace(/\/+$/, '');

function nftCdnOrigin(): string {
  return MEDIA_ORIGIN;
}

/**
 * The same media file on the next media server in the list, for an image
 * that failed to load (the art frame tries it once before its next source).
 * Null when the URL is not on a media server or there is no other server.
 */
export function mediaFailoverUrl(url: string): string | null {
  const index = MEDIA_ORIGINS.findIndex((origin) => url.startsWith(`${origin}/`));
  if (index === -1 || MEDIA_ORIGINS.length < 2) return null;
  const failed = MEDIA_ORIGINS[index]!;
  const next = MEDIA_ORIGINS[(index + 1) % MEDIA_ORIGINS.length]!;
  return `${next}${url.slice(failed.length)}`;
}

/**
 * A media URL without its server's origin (`/images/new/…`), so two copies of
 * one file on different media servers compare equal. Other URLs unchanged.
 */
export function mediaPathKey(url: string): string {
  const origin = MEDIA_ORIGINS.find((candidate) => url.startsWith(`${candidate}/`));
  return origin ? url.slice(origin.length) : url;
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
export const bareSeed = (seed: string | number): string =>
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

/**
 * A Random Walk NFT's render on the media server, by token id: the files are
 * named by the zero-padded id ("004079_black_thumb.jpg").
 */
export const randomWalkImageUrl = (
  tokenId: number | string,
  variant: string = 'black_thumb.jpg',
): string => getRWLKImageUrl(String(tokenId).padStart(6, '0'), variant);

/** A Random Walk NFT's page on the project's own site. */
export const randomWalkTokenUrl = (tokenId: number | string): string =>
  `https://www.randomwalknft.com/detail/${tokenId}`;

/** Decodes the original URL (handles legacy proxied format for backwards compatibility). */
export const getOriginUrl = (url: string): string => {
  if (url.startsWith('/api/proxy?url=')) {
    return decodeURIComponent(url.replace('/api/proxy?url=', ''));
  }
  return url;
};

/** Same origin as root `metadataBase` — marketing/branding, not chain-specific. */
const CANONICAL_SITE_ORIGIN = LANDING_ORIGIN;

/** Site logo: the orbit mark on the Midnight plate, a 512px PNG. Not on the NFT CDN. */
export const logoImgUrl = `${CANONICAL_SITE_ORIGIN}${BRAND_ICON_PATHS.logo512}`;
