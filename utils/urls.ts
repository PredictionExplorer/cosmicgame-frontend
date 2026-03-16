import { networkConfig } from '@/config/networks';

const EXPLORER_BASE = networkConfig.explorerUrl.replace(/\/$/, '');

/** Returns a block-explorer URL for a tx hash, address, or token. */
export const getExplorerUrl = (type: 'tx' | 'address' | 'token', value: string): string =>
  `${EXPLORER_BASE}/${type}/${value}`;

/** Returns the URL directly (no proxy; for compatibility with code that previously used getProxiedUrl). */
export const getProxiedUrl = (url: string): string => {
  return url;
};

/** Returns direct CST asset URL (images) from the NFT server. */
export const getAssetsUrl = (url: string): string => {
  const imageServerUrl = 'https://nfts.cosmicsignature.com/images/new/';
  return imageServerUrl + url;
};

/** Returns direct RandomWalk NFT image URL. */
export const getRWLKImageUrl = (fileName: string, variant: string = 'black_thumb.jpg'): string => {
  const imageServerUrl = 'https://nfts.cosmicsignature.com/images/randomwalk/';
  return `${imageServerUrl}${fileName}_${variant}`;
};

/** Decodes the original URL (handles legacy proxied format for backwards compatibility). */
export const getOriginUrl = (url: string): string => {
  if (url.startsWith('/api/proxy?url=')) {
    return decodeURIComponent(url.replace('/api/proxy?url=', ''));
  }
  return url;
};

/** Direct URL to the Cosmic Signature site logo image. */
export const logoImgUrl = getAssetsUrl('cosmicsignature/logo.png');
