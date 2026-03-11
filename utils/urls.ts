import { networkConfig } from '@/config/networks';
import { proxyUrl } from '@/services/api/client';

const EXPLORER_BASE = networkConfig.explorerUrl.replace(/\/$/, '');

/** Returns a block-explorer URL for a tx hash, address, or token. */
export const getExplorerUrl = (type: 'tx' | 'address' | 'token', value: string): string =>
  `${EXPLORER_BASE}/${type}/${value}`;

/** Wraps a URL through the app proxy to avoid CORS. */
export const getProxiedUrl = (url: string): string => {
  return `${proxyUrl}${encodeURIComponent(url)}`;
};

/** Returns proxied CST asset URL (images) from the NFT server. */
export const getAssetsUrl = (url: string): string => {
  const imageServerUrl = 'https://nfts.cosmicsignature.com/images/new/';
  return `${proxyUrl}${encodeURIComponent(imageServerUrl + url)}`;
};

/** Returns proxied RandomWalk NFT image URL. */
export const getRWLKImageUrl = (fileName: string, variant: string = 'black_thumb.jpg'): string => {
  const imageServerUrl = 'https://nfts.cosmicsignature.com/images/randomwalk/';
  return `${proxyUrl}${encodeURIComponent(`${imageServerUrl}${fileName}_${variant}`)}`;
};

/** Decodes the original URL from a proxied URL. */
export const getOriginUrl = (url: string): string => {
  const strippedUrl = url.replace('/api/proxy?url=', '');
  return decodeURIComponent(strippedUrl);
};

/** Proxied URL to the Cosmic Signature site logo image. */
export const logoImgUrl = getAssetsUrl('cosmicsignature/logo.png');
