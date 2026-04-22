import { networkConfig } from '@/config/networks';

const EXPLORER_BASE = networkConfig.explorerUrl.replace(/\/$/, '');

/** NFT CDN origin (no path); from `networkConfig.nftApiUrl` per environment. */
function nftCdnOrigin(): string {
  return (networkConfig.nftApiUrl || 'https://nfts.cosmicsignature.com/').replace(/\/+$/, '');
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
const CANONICAL_SITE_ORIGIN = 'https://www.cosmicsignature.com';

/** Site branding logo (`public/images/logo.svg`). Not on the NFT CDN. */
export const logoImgUrl = `${CANONICAL_SITE_ORIGIN}/images/logo.svg`;
