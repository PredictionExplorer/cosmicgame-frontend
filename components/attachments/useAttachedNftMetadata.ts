import { useQuery } from '@tanstack/react-query';
import { erc721Abi, isAddress } from 'viem';
import { usePublicClient } from 'wagmi';

import { normalizeHttpUrl } from './attachedNftLinks';

export interface AttachedNftMetadata {
  name?: string;
  description?: string;
  image?: string;
  /** Same image on an alternate IPFS gateway, for the <NFTImage> fallback chain. */
  imageFallback?: string;
  external_url?: string;
  collection_name?: string;
  artist?: string;
  platform?: string;
  [key: string]: unknown;
}

/**
 * Public IPFS gateways raced in parallel until one serves the content.
 * ipfs.io alone proved unreliable for donated third-party collections
 * (timeouts), which left attached NFTs rendering the 404 placeholder.
 */
export const IPFS_GATEWAYS = [
  'https://ipfs.io/ipfs/',
  'https://gateway.pinata.cloud/ipfs/',
  'https://dweb.link/ipfs/',
  'https://nftstorage.link/ipfs/',
] as const;

export const IPFS_GATEWAY_ORIGIN = IPFS_GATEWAYS[0];

const FETCH_TIMEOUT_MS = 10_000;

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

/** Extracts the `<cid>/<path>` part of an `ipfs://` URI, or null for other schemes. */
function ipfsPath(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed.startsWith('ipfs://')) return null;

  const withoutProtocol = trimmed.replace(/^ipfs:\/\//, '').replace(/^ipfs\//, '');
  return withoutProtocol || null;
}

export function normalizeIpfsUrl(value: string, gateway: string = IPFS_GATEWAYS[0]): string | null {
  const path = ipfsPath(value);
  return path ? `${gateway}${path}` : null;
}

/** Returns the gateway prefix of `url` when it points at one of our IPFS gateways. */
function gatewayOf(url: string | undefined): string | null {
  if (!url) return null;
  return IPFS_GATEWAYS.find((gateway) => url.startsWith(gateway)) ?? null;
}

export function normalizeMetadataAssetUrl(
  value: unknown,
  metadataUri?: string,
): string | undefined {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;

  const ipfsUrl = normalizeIpfsUrl(trimmed, gatewayOf(metadataUri) ?? IPFS_GATEWAYS[0]);
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

  // Serve the image from the gateway that just served the metadata (it is
  // proven reachable), and keep a second gateway as an <img> onError fallback.
  const primaryGateway = gatewayOf(metadataUri) ?? IPFS_GATEWAYS[0];
  const fallbackGateway = IPFS_GATEWAYS.find((gateway) => gateway !== primaryGateway);
  const imagePath = ipfsPath(raw.image);

  return {
    ...raw,
    name: optionalString(raw.name),
    description: optionalString(raw.description),
    image: normalizeMetadataAssetUrl(raw.image, metadataUri),
    imageFallback: imagePath && fallbackGateway ? `${fallbackGateway}${imagePath}` : undefined,
    external_url: normalizeHttpUrl(raw.external_url) ?? undefined,
    collection_name: optionalString(raw.collection_name ?? raw.collectionName),
    artist: optionalString(raw.artist),
    platform: optionalString(raw.platform),
  };
}

/** All URLs worth trying for a metadata URI: every gateway for ipfs://, or the URL itself. */
export function metadataUrlCandidates(uri: string): string[] {
  const path = ipfsPath(uri);
  if (path) return IPFS_GATEWAYS.map((gateway) => `${gateway}${path}`);
  const httpUrl = normalizeHttpUrl(uri);
  return httpUrl ? [httpUrl] : [];
}

async function fetchMetadataFromUrl(url: string): Promise<AttachedNftMetadata> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch NFT metadata (${response.status})`);
    }
    const data: unknown = await response.json();
    const normalized = normalizeAttachedNftMetadata(data, url);
    if (!normalized) {
      throw new Error('Failed to fetch NFT metadata (unusable payload)');
    }
    return normalized;
  } finally {
    clearTimeout(timer);
  }
}

export async function fetchAttachedNftMetadata(uri: string): Promise<AttachedNftMetadata | null> {
  const candidates = metadataUrlCandidates(uri);
  if (candidates.length === 0) return null;
  if (candidates.length === 1) return fetchMetadataFromUrl(candidates[0]!);

  try {
    return await Promise.any(candidates.map((url) => fetchMetadataFromUrl(url)));
  } catch (error) {
    if (error instanceof AggregateError && error.errors.length > 0) {
      throw error.errors[0];
    }
    throw error;
  }
}

export interface AttachedNftTokenRef {
  tokenAddr?: string | null;
  tokenId?: string | number | null;
}

function normalizeTokenId(value: string | number | null | undefined): bigint | null {
  if (value == null) return null;
  const raw = String(value).trim();
  if (!/^\d+$/.test(raw)) return null;
  return BigInt(raw);
}

/**
 * Loads display metadata for an attached NFT. Tries the indexed token URI
 * first (racing IPFS gateways when applicable); if that fails or is absent
 * and a token reference is provided, reads `tokenURI(tokenId)` straight from
 * the contract over RPC and retries with the on-chain value.
 */
export function useAttachedNftMetadata(
  uri: string | null | undefined,
  token?: AttachedNftTokenRef,
) {
  const publicClient = usePublicClient();
  const metadataUri = typeof uri === 'string' ? uri.trim() : '';
  const tokenAddr =
    typeof token?.tokenAddr === 'string' && isAddress(token.tokenAddr) ? token.tokenAddr : null;
  const tokenId = normalizeTokenId(token?.tokenId);
  const canReadOnchain = Boolean(publicClient && tokenAddr && tokenId != null);

  return useQuery<AttachedNftMetadata | null>({
    queryKey: ['attachedNftMetadata', metadataUri, tokenAddr, tokenId?.toString() ?? null],
    enabled: metadataUri.length > 0 || canReadOnchain,
    staleTime: 10 * 60_000,
    gcTime: 30 * 60_000,
    retry: false,
    queryFn: async () => {
      let indexedUriError: unknown = null;
      if (metadataUri) {
        try {
          const metadata = await fetchAttachedNftMetadata(metadataUri);
          if (metadata) return metadata;
        } catch (error) {
          indexedUriError = error;
        }
      }

      if (publicClient && tokenAddr && tokenId != null) {
        const onchainUri = (
          await publicClient.readContract({
            address: tokenAddr as `0x${string}`,
            abi: erc721Abi,
            functionName: 'tokenURI',
            args: [tokenId],
          })
        ).trim();
        if (onchainUri && onchainUri !== metadataUri) {
          return fetchAttachedNftMetadata(onchainUri);
        }
      }

      if (indexedUriError) throw indexedUriError;
      return null;
    },
  });
}
