import { useQuery } from '@tanstack/react-query';

import { normalizeHttpUrl } from './attachedNftLinks';

export interface AttachedNftMetadata {
  name?: string;
  description?: string;
  image?: string;
  external_url?: string;
  collection_name?: string;
  artist?: string;
  platform?: string;
  [key: string]: unknown;
}

export const IPFS_GATEWAY_ORIGIN = 'https://ipfs.io/ipfs/';

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

export function normalizeIpfsUrl(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed.startsWith('ipfs://')) return null;

  const withoutProtocol = trimmed.replace(/^ipfs:\/\//, '').replace(/^ipfs\//, '');
  if (!withoutProtocol) return null;
  return `${IPFS_GATEWAY_ORIGIN}${withoutProtocol}`;
}

export function normalizeMetadataAssetUrl(
  value: unknown,
  metadataUri?: string,
): string | undefined {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;

  const ipfsUrl = normalizeIpfsUrl(trimmed);
  if (ipfsUrl) return ipfsUrl;

  const directHttpUrl = normalizeHttpUrl(trimmed);
  if (directHttpUrl) return directHttpUrl;

  if (trimmed.startsWith('/')) {
    const metadataHttpUrl = normalizeHttpUrl(metadataUri);
    if (!metadataHttpUrl) return undefined;
    try {
      return new URL(trimmed, metadataHttpUrl).toString();
    } catch {
      return undefined;
    }
  }

  return undefined;
}

function optionalString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

export function normalizeAttachedNftMetadata(
  raw: unknown,
  metadataUri?: string,
): AttachedNftMetadata | null {
  if (!isRecord(raw)) return null;

  return {
    ...raw,
    name: optionalString(raw.name),
    description: optionalString(raw.description),
    image: normalizeMetadataAssetUrl(raw.image, metadataUri),
    external_url: normalizeHttpUrl(raw.external_url) ?? undefined,
    collection_name: optionalString(raw.collection_name ?? raw.collectionName),
    artist: optionalString(raw.artist),
    platform: optionalString(raw.platform),
  };
}

export async function fetchAttachedNftMetadata(uri: string): Promise<AttachedNftMetadata | null> {
  const metadataUrl = normalizeHttpUrl(uri) ?? normalizeIpfsUrl(uri);
  if (!metadataUrl) return null;

  const response = await fetch(metadataUrl, { headers: { Accept: 'application/json' } });
  if (!response.ok) {
    throw new Error(`Failed to fetch NFT metadata (${response.status})`);
  }

  const data: unknown = await response.json();
  return normalizeAttachedNftMetadata(data, metadataUrl);
}

export function useAttachedNftMetadata(uri: string | null | undefined) {
  const metadataUri = typeof uri === 'string' ? uri.trim() : '';
  return useQuery<AttachedNftMetadata | null>({
    queryKey: ['attachedNftMetadata', metadataUri],
    queryFn: () => fetchAttachedNftMetadata(metadataUri),
    enabled: metadataUri.length > 0,
    staleTime: 10 * 60_000,
    gcTime: 30 * 60_000,
    retry: false,
  });
}
