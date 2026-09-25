import { lookup } from 'node:dns/promises';
import { BlockList, isIP } from 'node:net';

import { cache } from 'react';
import { unstable_cache } from 'next/cache';
import {
  ContractFunctionExecutionError,
  ContractFunctionRevertedError,
  ContractFunctionZeroDataError,
  createPublicClient,
  erc721Abi,
  http,
} from 'viem';

import { activeChain } from '@/config/chains';
import { networkConfig } from '@/config/networks';
import { get_donations_nft_list } from '@/services/api/donations';
import type { AttachedNFT } from '@/services/api/types';

import {
  IPFS_GATEWAYS,
  attachedNftImagePath,
  attachedNftRef,
  fetchAttachedNftMetadata,
  readCappedBytes,
  type AttachedNftMetadata,
} from './attachedNftMetadata';

/*
 * Server-side resolution of attached-NFT display metadata. The browser used to
 * race public IPFS gateways itself on every visit: several no longer send CORS
 * headers, the one that works takes 3–7 s per file, and nothing was cached, so
 * the attached-NFT wall painted its art 8–11 s after the page. The server
 * reads each document once a day, the image once a week, and hands the page
 * the result.
 *
 * Only records the indexer lists are resolved, and only over https to a
 * public DNS name whose every address is public, checked again at each
 * redirect (`fetchPublicHttps`). The connection resolves the name once more,
 * so a host that changes its answer in between (DNS rebinding) could still
 * aim one connection at a private address; what keeps that connection from
 * reading anything is TLS, since a private service cannot present a
 * certificate for the public name.
 *
 * Every body is read under a size cap and a deadline that covers the whole
 * transfer, and the request is aborted on every way out, so nothing keeps
 * reading once the reader has stopped. That is also why these reads bypass
 * Next's fetch data cache: it tees each body it caches and reads its copy
 * to the end with no cap, and when it revalidates a stale entry in the
 * background it drops the request's signal, so not even an abort would stop
 * an endless body. The small results (a normalized document, an image of at
 * most 1.5 MB) are cached with `unstable_cache` instead, whose revalidation
 * runs these same capped reads.
 */

/** How long a resolved metadata document is reused. */
const METADATA_REVALIDATE_SECONDS = 24 * 60 * 60;
/** How long the indexer's attached-NFT list is reused for lookups. */
const RECORDS_REVALIDATE_SECONDS = 5 * 60;
/** One metadata read on the server; the page seed also caps its total wait. */
const SERVER_METADATA_TIMEOUT_MS = 8_000;
/** One image read on the server, body included. */
const IMAGE_FETCH_TIMEOUT_MS = 15_000;
/**
 * How long an upstream image is kept in the data cache. The optimizer asks
 * the image route once per rendered width; without the cache every width
 * waited 4-6 s on a public IPFS gateway again (a phone thumbnail stayed a
 * black plate).
 */
const IMAGE_REVALIDATE_SECONDS = 7 * 24 * 60 * 60;
/** Larger files are left to the browser: the optimizer would only shrink them. */
export const MAX_IMAGE_BYTES = 25 * 1024 * 1024;
/**
 * Images up to this size are kept in the data cache. Its entries stop at
 * 2 MB and hold the bytes as base64, which grows them by a third; larger
 * images are read again for each width.
 */
export const MAX_CACHED_IMAGE_BYTES = 1_500_000;
/** One DNS lookup before a request; a resolver that hangs fails the read. */
const DNS_LOOKUP_TIMEOUT_MS = 3_000;
/** How long a contract's `name()` is reused: collections rarely rename. */
const CONTRACT_NAME_REVALIDATE_SECONDS = 7 * 24 * 60 * 60;
/** One `name()` read over RPC. */
const CONTRACT_NAME_TIMEOUT_MS = 4_000;
/** Longer contract names are cut, with an ellipsis. */
const MAX_CONTRACT_NAME_LENGTH = 64;

/**
 * Raster formats the image route serves. SVG is refused on purpose: an SVG
 * served from our origin can run script when opened directly, so it stays on
 * its own host and the browser loads it there, inside an <img>.
 */
const RASTER_IMAGE_TYPES = new Set([
  'image/png',
  'image/jpeg',
  'image/gif',
  'image/webp',
  'image/avif',
]);

const IPV4_HOST = /^\d{1,3}(?:\.\d{1,3}){3}$/;
const PRIVATE_HOST_SUFFIXES = ['.localhost', '.local', '.internal', '.lan', '.home.arpa'];

/**
 * Whether the server may fetch `value`: https on a public DNS name. IP
 * literals, single-label names, credentials and private suffixes are
 * refused. Attached NFTs are arbitrary contracts, so their token URIs are
 * untrusted input.
 */
export function isPublicHttpsUrl(value: string): boolean {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return false;
  }
  if (url.protocol !== 'https:' || url.username || url.password) return false;
  if (url.port && url.port !== '443') return false;
  // A fully qualified name ("localhost.") is the same host as without its dot.
  const host = url.hostname.toLowerCase().replace(/\.$/, '');
  if (host === 'localhost' || !host.includes('.')) return false;
  if (IPV4_HOST.test(host) || host.startsWith('[')) return false;
  return !PRIVATE_HOST_SUFFIXES.some((suffix) => host.endsWith(suffix));
}

/**
 * Address ranges a public host never resolves to: private, loopback,
 * link-local (cloud metadata), carrier-grade NAT, unique-local, multicast,
 * documentation and reserved space, and the IPv6 transition prefixes that
 * embed an IPv4 address. IPv4-mapped IPv6 addresses match the IPv4 rules.
 */
const NON_PUBLIC_ADDRESSES = (() => {
  const list = new BlockList();
  const ipv4: ReadonlyArray<readonly [string, number]> = [
    ['0.0.0.0', 8],
    ['10.0.0.0', 8],
    ['100.64.0.0', 10],
    ['127.0.0.0', 8],
    ['169.254.0.0', 16],
    ['172.16.0.0', 12],
    ['192.0.0.0', 24],
    ['192.0.2.0', 24],
    ['192.88.99.0', 24],
    ['192.168.0.0', 16],
    ['198.18.0.0', 15],
    ['198.51.100.0', 24],
    ['203.0.113.0', 24],
    ['224.0.0.0', 4],
    ['240.0.0.0', 4],
  ];
  const ipv6: ReadonlyArray<readonly [string, number]> = [
    ['::', 128],
    ['::1', 128],
    ['64:ff9b::', 96],
    ['64:ff9b:1::', 48],
    ['100::', 64],
    ['2001::', 32],
    ['2001:db8::', 32],
    ['2002::', 16],
    ['fc00::', 7],
    ['fe80::', 10],
    ['ff00::', 8],
  ];
  for (const [network, prefix] of ipv4) list.addSubnet(network, prefix, 'ipv4');
  for (const [network, prefix] of ipv6) list.addSubnet(network, prefix, 'ipv6');
  return list;
})();

/** Whether `address` is an IP address on the public internet. */
export function isPublicAddress(address: string): boolean {
  const family = isIP(address);
  if (family === 0) return false;
  return !NON_PUBLIC_ADDRESSES.check(address, family === 6 ? 'ipv6' : 'ipv4');
}

function withDeadline<T>(promise: Promise<T>, ms: number, message: string): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const deadline = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error(message)), ms);
  });
  return Promise.race([promise, deadline]).finally(() => clearTimeout(timer));
}

/**
 * Resolves `hostname` and rejects unless every address it answers with is
 * public, so a public-looking name (`127.0.0.1.nip.io`, or any name with an
 * A record in 10/8) cannot point a server read at a private service.
 */
export async function assertPublicHost(hostname: string): Promise<void> {
  const answers = await withDeadline(
    lookup(hostname, { all: true, verbatim: true }),
    DNS_LOOKUP_TIMEOUT_MS,
    'DNS lookup timed out',
  );
  if (answers.length === 0 || answers.some(({ address }) => !isPublicAddress(address))) {
    throw new Error('Refused a host with a non-public address');
  }
}

/** Redirects one server read may follow (IPFS gateways use one or two). */
const MAX_REDIRECTS = 3;

/**
 * `fetch` for untrusted URLs: redirects are followed by hand, and each hop
 * must pass `isPublicHttpsUrl` and resolve only to public addresses, so a
 * public host cannot bounce the server to a private one. Never through the
 * fetch data cache (see the top of this file): the caller's signal governs
 * the whole transfer. Rejects on a refused hop or too many redirects.
 */
export async function fetchPublicHttps(url: string, init: RequestInit = {}): Promise<Response> {
  // Next's `next` option would opt the read back into the data cache.
  const { next: _dataCache, ...requestInit } = init;
  let current = url;
  for (let hop = 0; hop <= MAX_REDIRECTS; hop += 1) {
    if (!isPublicHttpsUrl(current)) throw new Error('Refused a non-public URL');
    await assertPublicHost(new URL(current).hostname);
    const response = await fetch(current, {
      ...requestInit,
      cache: 'no-store',
      redirect: 'manual',
    });
    const location = response.headers.get('location');
    if (response.status < 300 || response.status > 399 || !location) return response;
    void response.body?.cancel().catch(() => {});
    current = new URL(location, current).toString();
  }
  throw new Error('Too many redirects');
}

const readAttachedRecords = unstable_cache(
  async (): Promise<AttachedNFT[]> => get_donations_nft_list(),
  ['attached-nft-records'],
  { revalidate: RECORDS_REVALIDATE_SECONDS },
);

/** The indexer's record of an attached NFT, or null when it lists none for that token. */
export async function findAttachedNftRecord(
  tokenAddr: string,
  tokenId: string,
): Promise<AttachedNFT | null> {
  const address = tokenAddr.toLowerCase();
  const records = await readAttachedRecords();
  return (
    records.find((record) => {
      const ref = attachedNftRef({
        tokenAddr: record.TokenAddr,
        tokenId: record.NFTTokenId ?? record.TokenId,
      });
      return ref.tokenAddr?.toLowerCase() === address && ref.tokenId === tokenId;
    }) ?? null
  );
}

/**
 * The normalized document, kept a day. A failed read throws, so it is never
 * cached, and a stale entry keeps serving while its revalidation fails.
 */
const readMetadataDocumentCached = unstable_cache(
  async (uri: string): Promise<AttachedNftMetadata | null> =>
    fetchAttachedNftMetadata(uri, {
      allowUrl: isPublicHttpsUrl,
      fetcher: fetchPublicHttps,
      timeoutMs: SERVER_METADATA_TIMEOUT_MS,
    }),
  ['attached-nft-metadata'],
  { revalidate: METADATA_REVALIDATE_SECONDS },
);

/**
 * The metadata document behind a token URI, read over public https and kept
 * in the data cache for a day; `null` when it cannot be read.
 */
export const readAttachedNftMetadataDocument = cache(
  async (uri: string): Promise<AttachedNftMetadata | null> => {
    try {
      return await readMetadataDocumentCached(uri);
    } catch {
      return null;
    }
  },
);

/**
 * What the client renders: the document with its image moved to our origin
 * (`/api/attached-nft/<contract>/<id>/image`, which the image optimizer
 * resizes and caches) and the upstream file kept as the fallback.
 */
export function withSameOriginImage(
  metadata: AttachedNftMetadata,
  tokenAddr: string,
  tokenId: string,
): AttachedNftMetadata {
  const upstream = metadata.image;
  if (!upstream || !isPublicHttpsUrl(upstream)) return metadata;
  return {
    ...metadata,
    image: attachedNftImagePath(tokenAddr, tokenId),
    imageFallback: upstream,
  };
}

/**
 * A name a contract supplies, made safe to show in a caption: one line, no
 * control or bidirectional formatting characters, at most 64 characters.
 */
export function displayContractName(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const clean = value
    .replace(/[\p{Cc}\p{Cf}]/gu, '')
    .replace(/\s+/g, ' ')
    .trim();
  if (!clean) return undefined;
  const chars = Array.from(clean);
  return chars.length > MAX_CONTRACT_NAME_LENGTH
    ? `${chars.slice(0, MAX_CONTRACT_NAME_LENGTH - 1).join('')}…`
    : clean;
}

/** Whether a failed `name()` read is the contract's answer (it has none), not a network fault. */
function contractHasNoName(error: unknown): boolean {
  return (
    error instanceof ContractFunctionExecutionError &&
    (error.cause instanceof ContractFunctionRevertedError ||
      error.cause instanceof ContractFunctionZeroDataError)
  );
}

/**
 * The contract's ERC-721 `name()`, kept a week in the data cache (so is the
 * answer that it has none); a network failure is not cached.
 */
const readContractNameCached = unstable_cache(
  async (tokenAddr: `0x${string}`): Promise<string | null> => {
    if (!networkConfig.rpcUrl) return null;
    const client = createPublicClient({
      chain: activeChain,
      transport: http(networkConfig.rpcUrl, { timeout: CONTRACT_NAME_TIMEOUT_MS, retryCount: 1 }),
    });
    try {
      const name = await client.readContract({
        address: tokenAddr,
        abi: erc721Abi,
        functionName: 'name',
      });
      return displayContractName(name) ?? null;
    } catch (error) {
      if (contractHasNoName(error)) return null;
      throw error;
    }
  },
  ['attached-nft-contract-name'],
  { revalidate: CONTRACT_NAME_REVALIDATE_SECONDS },
);

/**
 * The collection name an attached NFT's contract reports, for a caption
 * whose metadata names no collection; undefined when it has none or the
 * chain cannot be read.
 */
export const readAttachedNftContractName = cache(
  async (tokenAddr: `0x${string}`): Promise<string | undefined> => {
    try {
      const name = await readContractNameCached(tokenAddr.toLowerCase() as `0x${string}`);
      return name ?? undefined;
    } catch {
      return undefined;
    }
  },
);

/** The display metadata of one indexed record, or null when its document cannot be read. */
export async function resolveAttachedNftDisplay(
  record: Pick<AttachedNFT, 'TokenAddr' | 'NFTTokenId' | 'TokenId' | 'NFTTokenURI'>,
): Promise<AttachedNftMetadata | null> {
  const uri = typeof record.NFTTokenURI === 'string' ? record.NFTTokenURI.trim() : '';
  const { tokenAddr, tokenId } = attachedNftRef({
    tokenAddr: record.TokenAddr,
    tokenId: record.NFTTokenId ?? record.TokenId,
  });
  if (!uri || !tokenAddr || !tokenId) return null;
  const [metadata, contractName] = await Promise.all([
    readAttachedNftMetadataDocument(uri),
    readAttachedNftContractName(tokenAddr),
  ]);
  if (!metadata) return null;
  return withSameOriginImage(
    contractName ? { ...metadata, contract_name: contractName } : metadata,
    tokenAddr,
    tokenId,
  );
}

/** Every URL worth trying for an image: the same file on each gateway, or the URL itself. */
export function imageUrlCandidates(url: string): string[] {
  const gateway = IPFS_GATEWAYS.find((prefix) => url.startsWith(prefix));
  if (!gateway) return isPublicHttpsUrl(url) ? [url] : [];
  const path = url.slice(gateway.length);
  return [gateway, ...IPFS_GATEWAYS.filter((prefix) => prefix !== gateway)].map(
    (prefix) => `${prefix}${path}`,
  );
}

/** An upstream image the route serves: its bytes and type. */
export interface AttachedNftImage {
  bytes: Uint8Array<ArrayBuffer>;
  contentType: string;
}

/** The type of a response the route may serve (a raster image of an acceptable declared size), else null. */
function usableImageType(response: Response): string | null {
  const contentType = (response.headers.get('content-type') ?? '')
    .split(';')[0]!
    .trim()
    .toLowerCase();
  const contentLength = response.headers.get('content-length');
  const tooLarge = contentLength !== null && Number(contentLength) > MAX_IMAGE_BYTES;
  return response.ok && response.body && RASTER_IMAGE_TYPES.has(contentType) && !tooLarge
    ? contentType
    : null;
}

/**
 * Downloads an image from the first candidate that answers with a raster
 * image of an acceptable size; `null` when none does. One deadline covers
 * the whole transfer, the body stops at 25 MB, declared or not, and every
 * request is aborted on the way out: a refused candidate at once, the others
 * as soon as one answers, the one read once it is done or given up.
 */
async function downloadAttachedNftImage(url: string): Promise<AttachedNftImage | null> {
  const candidates = imageUrlCandidates(url);
  if (candidates.length === 0) return null;
  const controllers = candidates.map(() => new AbortController());
  const abortAll = () => {
    for (const controller of controllers) controller.abort();
  };
  const timer = setTimeout(abortAll, IMAGE_FETCH_TIMEOUT_MS);

  try {
    const served = await Promise.any(
      candidates.map(async (candidate, index) => {
        const controller = controllers[index]!;
        try {
          const response = await fetchPublicHttps(candidate, { signal: controller.signal });
          const contentType = usableImageType(response);
          if (!contentType) {
            throw new Error(`Unusable image response (${response.status})`);
          }
          return { index, response, contentType };
        } catch (error) {
          controller.abort();
          throw error;
        }
      }),
    );
    controllers.forEach((controller, index) => {
      if (index !== served.index) controller.abort();
    });
    const bytes = await readCappedBytes(served.response, MAX_IMAGE_BYTES);
    return { bytes, contentType: served.contentType };
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
    abortAll();
  }
}

/** An image as the data cache keeps it (entries are JSON). */
interface CachedAttachedNftImage {
  contentType: string;
  base64: string;
}

/**
 * The image at `url` (see `downloadAttachedNftImage`), kept in the data
 * cache for a week when it is at most 1.5 MB, so each later width the
 * optimizer asks for is served at once; `null` when no source serves one.
 */
export async function fetchAttachedNftImage(url: string): Promise<AttachedNftImage | null> {
  // Only what the callback returns is cached, so a larger image leaves
  // through this variable, and the callback throws to keep it uncached.
  let uncached: AttachedNftImage | null = null;
  const readCached = unstable_cache(
    async (): Promise<CachedAttachedNftImage> => {
      const image = await downloadAttachedNftImage(url);
      if (!image) throw new Error('No source served a usable image');
      if (image.bytes.byteLength > MAX_CACHED_IMAGE_BYTES) {
        uncached = image;
        throw new Error('Too large for a data cache entry');
      }
      return {
        contentType: image.contentType,
        base64: Buffer.from(image.bytes).toString('base64'),
      };
    },
    ['attached-nft-image', url],
    { revalidate: IMAGE_REVALIDATE_SECONDS },
  );

  try {
    const cached = await readCached();
    return {
      bytes: new Uint8Array(Buffer.from(cached.base64, 'base64')),
      contentType: cached.contentType,
    };
  } catch {
    return uncached;
  }
}
