import { getExplorerUrl } from '@/utils';

import { networkConfig } from '@/config/networks';
import type { AttachedNFT } from '@/services/api/types';

export interface AttachedNftLinkMetadata {
  external_url?: string;
}

export type AttachedNftLinkKind = 'project' | 'opensea' | 'explorer' | 'none';

export interface AttachedNftResolvedLink {
  kind: AttachedNftLinkKind;
  href: string | null;
  label: string;
}

export interface AttachedNftLinkLabels {
  viewNft: string;
  viewOpenSea: string;
  viewContract: string;
  detailsUnavailable: string;
  contractUnavailable: string;
}

const DEFAULT_LABELS: AttachedNftLinkLabels = {
  viewNft: 'View NFT',
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

export function resolveAttachedNftLink({
  nft,
  metadata,
  chainId = networkConfig.chainId,
  labels = DEFAULT_LABELS,
}: {
  nft: Partial<Pick<AttachedNFT, 'TokenAddr' | 'NFTTokenId' | 'TokenId'>>;
  metadata?: AttachedNftLinkMetadata | null;
  chainId?: number;
  labels?: AttachedNftLinkLabels;
}): AttachedNftResolvedLink {
  const projectUrl = normalizeHttpUrl(metadata?.external_url);
  if (projectUrl) {
    return { kind: 'project', href: projectUrl, label: labels.viewNft };
  }

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
