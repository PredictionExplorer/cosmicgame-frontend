import { getExplorerUrl } from '@/utils';

import { networkConfig } from '@/config/networks';
import type { AttachedNFT } from '@/services/api/types';

export interface AttachedNftLinkMetadata {
  external_url?: string;
}

export type AttachedNftLinkKind = 'opensea' | 'explorer' | 'none';

export interface AttachedNftResolvedLink {
  kind: AttachedNftLinkKind;
  href: string | null;
  label: string;
}

export interface AttachedNftLinkLabels {
  viewOpenSea: string;
  viewContract: string;
  detailsUnavailable: string;
  contractUnavailable: string;
}

const DEFAULT_LABELS: AttachedNftLinkLabels = {
  viewOpenSea: 'View on OpenSea',
  viewContract: 'View contract',
  detailsUnavailable: 'NFT details unavailable',
  contractUnavailable: 'Contract unavailable',
};

export function getAttachedNftTokenId(
  nft: Partial<Pick<AttachedNFT, 'NFTTokenId' | 'TokenId'>>,
): string | null {
  const raw = nft.NFTTokenId ?? nft.TokenId;
  if (raw == null) return null;
  const value = String(raw).trim();
  return value === '' ? null : value;
}

/**
 * Whether a metadata name already carries the token number ("Random Walk
 * #004079" for token 4079), so a caption need not repeat it.
 */
export function nameCarriesTokenId(name: string, tokenId: string | null): boolean {
  if (!name || !tokenId || !/^\d+$/.test(tokenId)) return false;
  const digits = tokenId.replace(/^0+(?=\d)/, '');
  return new RegExp(`(^|\\D)0*${digits}(\\D|$)`).test(name);
}

export function normalizeHttpUrl(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed) return null;

  try {
    const url = new URL(trimmed);
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.toString() : null;
  } catch {
    return null;
  }
}

/**
 * An https URL, or null. Links a page shows for third-party metadata
 * (`external_url`) accept https only: a plain-http page can be rewritten in
 * transit, and anything else (`javascript:`, `data:`) is never a link.
 */
export function normalizeHttpsUrl(value: unknown): string | null {
  const url = normalizeHttpUrl(value);
  return url?.startsWith('https:') ? url : null;
}

/** A third-party site named by an attached NFT's own metadata. */
export interface AttachedNftProjectLink {
  href: string;
  /** The host a reader can check before following the link ("randomwalknft.com"). */
  host: string;
}

/**
 * The project site an attached NFT's metadata names (`external_url`), or
 * null. Whoever deploys the NFT's contract writes that document, so the site
 * is never the card's primary link: it is shown as a secondary link that
 * names its host, and only over https.
 */
export function resolveAttachedNftProjectLink(
  metadata?: AttachedNftLinkMetadata | null,
): AttachedNftProjectLink | null {
  const href = normalizeHttpsUrl(metadata?.external_url);
  if (!href) return null;
  const host = new URL(href).hostname.replace(/^www\./, '');
  return host ? { href, host } : null;
}

export function buildOpenSeaAssetUrl(
  tokenAddr: string | null | undefined,
  tokenId: string | number | null | undefined,
  chainId: number = networkConfig.chainId,
): string | null {
  const contract = typeof tokenAddr === 'string' ? tokenAddr.trim() : '';
  const id = tokenId == null ? '' : String(tokenId).trim();
  if (!contract || !id || !/^0x[a-fA-F0-9]{40}$/.test(contract)) return null;

  const chainSlug = chainId === 42161 ? 'arbitrum' : 'arbitrum-sepolia';
  return `https://opensea.io/assets/${chainSlug}/${contract}/${encodeURIComponent(id)}`.replace(
    'https://opensea.io/assets/arbitrum-sepolia/',
    'https://testnets.opensea.io/assets/arbitrum-sepolia/',
  );
}

/**
 * Where an attached NFT's plate and title link: its OpenSea page, else its
 * contract on the explorer. Both are derived from the contract address and
 * token id the protocol recorded, never from the NFT's own metadata, which
 * whoever deployed the contract controls (see `resolveAttachedNftProjectLink`).
 */
export function resolveAttachedNftLink({
  nft,
  chainId = networkConfig.chainId,
  labels = DEFAULT_LABELS,
}: {
  nft: Partial<Pick<AttachedNFT, 'TokenAddr' | 'NFTTokenId' | 'TokenId'>>;
  chainId?: number;
  labels?: AttachedNftLinkLabels;
}): AttachedNftResolvedLink {
  const tokenId = getAttachedNftTokenId(nft);
  const openSeaUrl = buildOpenSeaAssetUrl(nft.TokenAddr, tokenId, chainId);
  if (openSeaUrl) {
    return { kind: 'opensea', href: openSeaUrl, label: labels.viewOpenSea };
  }

  if (nft.TokenAddr) {
    return {
      kind: 'explorer',
      href: getExplorerUrl('address', nft.TokenAddr),
      label: labels.viewContract,
    };
  }

  return { kind: 'none', href: null, label: labels.detailsUnavailable };
}

export function resolveAttachedNftExplorerLink(
  nft: Partial<Pick<AttachedNFT, 'TokenAddr'>>,
  labels: AttachedNftLinkLabels = DEFAULT_LABELS,
): AttachedNftResolvedLink {
  if (!nft.TokenAddr) return { kind: 'none', href: null, label: labels.contractUnavailable };
  return {
    kind: 'explorer',
    href: getExplorerUrl('address', nft.TokenAddr),
    label: labels.viewContract,
  };
}
