import { isAddress } from 'viem';

import { normalizeHttpUrl } from './attachedNftLinks';

/*
 * Display metadata of an NFT attached to a gesture: parsing, the IPFS gateway
 * race, the query key and the same-origin paths. No hooks and no wallet code,
 * so the server resolver (attachedNftMetadata.server.ts), the route handlers
 * under app/api/attached-nft and the client hook (useAttachedNftMetadata)
 * share one implementation.
 */

export interface AttachedNftMetadata {
  name?: string;
  description?: string;
  image?: string;
  /** The same image from another source, for the <NFTImage> fallback chain. */
  imageFallback?: string;
  external_url?: string;
  collection_name?: string;
  artist?: string;
  platform?: string;
  [key: string]: unknown;
}

/** The contract and token an attached-NFT record points at. */
export interface AttachedNftTokenRef {
  tokenAddr?: string | null;
  tokenId?: string | number | null;
}

/**
 * Public IPFS gateways, raced in parallel until one serves the content, the
 * most reliable first. ipfs.io and dweb.link now answer most path requests
 * with 429 (they are moving to a service-worker gateway) but still serve some
 * CIDs. nftstorage.link is gone: it redirects to ipfs.io without CORS
 * headers, which the browser reports as a blocked request.
 */
export const IPFS_GATEWAYS = [
  'https://gateway.pinata.cloud/ipfs/',
  'https://ipfs.io/ipfs/',
  'https://dweb.link/ipfs/',
] as const;

/** Per-request timeout of one metadata read. */
export const METADATA_FETCH_TIMEOUT_MS = 10_000;

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

/** Extracts the `<cid>/<path>` part of an `ipfs://` URI, or null for other schemes. */
export function ipfsPath(value: unknown): string | null {
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

/** All URLs worth trying for a URI: every gateway for ipfs://, or the URL itself. */
export function metadataUrlCandidates(uri: string): string[] {
  const path = ipfsPath(uri);
  if (path) return IPFS_GATEWAYS.map((gateway) => `${gateway}${path}`);
  const httpUrl = normalizeHttpUrl(uri);
  return httpUrl ? [httpUrl] : [];
}

/** Extra `fetch` options for a metadata read (the server passes its cache policy). */
export type MetadataFetchInit = Omit<RequestInit, 'signal' | 'headers'> & {
  next?: { revalidate?: number | false };
};

/** A `fetch` stand-in: the server passes one that checks every redirect hop. */
export type MetadataFetcher = (url: string, init: RequestInit) => Promise<Response>;

async function fetchMetadataFromUrl(
  url: string,
  init: MetadataFetchInit | undefined,
  timeoutMs: number,
  fetcher: MetadataFetcher,
): Promise<AttachedNftMetadata> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetcher(url, {
      ...init,
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

export interface FetchAttachedNftMetadataOptions {
  /** `fetch` options for every candidate (the server's data-cache policy). */
  init?: MetadataFetchInit;
  /** Skips candidates that fail this check (the server's public-host guard). */
  allowUrl?: (url: string) => boolean;
  /** Reads each candidate (default: the global `fetch`). */
  fetcher?: MetadataFetcher;
  timeoutMs?: number;
}

/**
 * Reads a metadata URI: an `ipfs://` URI races every gateway and the first
 * usable document wins; an http(s) URI is read as is. Resolves to null for a
 * scheme it cannot read and rejects when every candidate failed.
 */
export async function fetchAttachedNftMetadata(
  uri: string,
  {
    init,
    allowUrl,
    fetcher = (url, requestInit) => fetch(url, requestInit),
    timeoutMs = METADATA_FETCH_TIMEOUT_MS,
  }: FetchAttachedNftMetadataOptions = {},
): Promise<AttachedNftMetadata | null> {
  const candidates = metadataUrlCandidates(uri).filter((url) => !allowUrl || allowUrl(url));
  if (candidates.length === 0) return null;
  const read = (url: string) => fetchMetadataFromUrl(url, init, timeoutMs, fetcher);
  if (candidates.length === 1) return read(candidates[0]!);

  try {
    return await Promise.any(candidates.map(read));
  } catch (error) {
    if (error instanceof AggregateError && error.errors.length > 0) {
      throw error.errors[0];
    }
    throw error;
  }
}

/** A token id as a decimal string, or null when it is not a whole number. */
export function normalizeTokenId(
  value: string | number | bigint | null | undefined,
): string | null {
  if (value == null) return null;
  const raw = String(value).trim();
  return /^\d+$/.test(raw) ? BigInt(raw).toString() : null;
}

/** The validated parts of an attached-NFT reference, as the query key and the API paths use them. */
export function attachedNftRef(token?: AttachedNftTokenRef): {
  tokenAddr: `0x${string}` | null;
  tokenId: string | null;
} {
  const address = typeof token?.tokenAddr === 'string' ? token.tokenAddr.trim() : '';
  return {
    tokenAddr: isAddress(address) ? address : null,
    tokenId: normalizeTokenId(token?.tokenId),
  };
}

/**
 * The React Query key of an attached NFT's metadata. The attached-NFTs page
 * seeds this key from the server and the client hook reads it, so both build
 * it here.
 */
export function attachedNftMetadataQueryKey(
  uri: string | null | undefined,
  token?: AttachedNftTokenRef,
): ['attachedNftMetadata', string, `0x${string}` | null, string | null] {
  const { tokenAddr, tokenId } = attachedNftRef(token);
  return ['attachedNftMetadata', typeof uri === 'string' ? uri.trim() : '', tokenAddr, tokenId];
}

/** Same-origin metadata of an attached NFT, resolved and cached by the server. */
export function attachedNftMetadataPath(tokenAddr: string, tokenId: string): string {
  return `/api/attached-nft/${tokenAddr.toLowerCase()}/${tokenId}`;
}

/**
 * Same-origin image of an attached NFT. Being local, it goes through the
 * Next image optimizer, which resizes it for the plate and caches the
 * result, so a wall of third-party art waits on a public IPFS gateway once
 * rather than on every visit.
 */
export function attachedNftImagePath(tokenAddr: string, tokenId: string): string {
  return `${attachedNftMetadataPath(tokenAddr, tokenId)}/image`;
}
