import { cache } from 'react';
import { unstable_cache } from 'next/cache';

import { get_donations_nft_list } from '@/services/api/donations';
import type { AttachedNFT } from '@/services/api/types';

import {
  IPFS_GATEWAYS,
  attachedNftImagePath,
  attachedNftRef,
  fetchAttachedNftMetadata,
  type AttachedNftMetadata,
} from './attachedNftMetadata';

/*
 * Server-side resolution of attached-NFT display metadata. The browser used to
 * race public IPFS gateways itself on every visit: several no longer send CORS
 * headers, the one that works takes 3–7 s per file, and nothing was cached, so
 * the attached-NFT wall painted its art 8–11 s after the page. The server
 * reads each document once a day (Next data cache), the image once per
 * optimizer cache period, and hands the page the result.
 *
 * Only records the indexer lists are resolved, and only over public https,
 * so a request can never make the server fetch an address of its choosing.
 */

/** How long a resolved metadata document is reused. */
const METADATA_REVALIDATE_SECONDS = 24 * 60 * 60;
/** How long the indexer's attached-NFT list is reused for lookups. */
const RECORDS_REVALIDATE_SECONDS = 5 * 60;
/** One metadata read on the server; the page seed also caps its total wait. */
const SERVER_METADATA_TIMEOUT_MS = 8_000;
/** One image read on the server. */
const IMAGE_FETCH_TIMEOUT_MS = 15_000;
/** Larger files are left to the browser: the optimizer would only shrink them. */
const MAX_IMAGE_BYTES = 25 * 1024 * 1024;

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

/** Redirects one server read may follow (IPFS gateways use one or two). */
const MAX_REDIRECTS = 3;

/**
 * `fetch` for untrusted URLs: redirects are followed by hand, and each hop
 * must pass `isPublicHttpsUrl` too, so a public host cannot bounce the
 * server to a private one. Rejects on a refused hop or too many redirects.
 */
export async function fetchPublicHttps(url: string, init: RequestInit = {}): Promise<Response> {
  let current = url;
  for (let hop = 0; hop <= MAX_REDIRECTS; hop += 1) {
    if (!isPublicHttpsUrl(current)) throw new Error('Refused a non-public URL');
    const response = await fetch(current, { ...init, redirect: 'manual' });
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
 * The metadata document behind a token URI, read over public https and kept
 * in the data cache for a day; `null` when it cannot be read.
 */
export const readAttachedNftMetadataDocument = cache(
  async (uri: string): Promise<AttachedNftMetadata | null> => {
    try {
      return await fetchAttachedNftMetadata(uri, {
        init: { next: { revalidate: METADATA_REVALIDATE_SECONDS } },
        allowUrl: isPublicHttpsUrl,
        fetcher: fetchPublicHttps,
        timeoutMs: SERVER_METADATA_TIMEOUT_MS,
      });
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
  const metadata = await readAttachedNftMetadataDocument(uri);
  return metadata ? withSameOriginImage(metadata, tokenAddr, tokenId) : null;
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

/** An upstream image the route can stream: its body and type. */
export interface AttachedNftImage {
  body: ReadableStream<Uint8Array>;
  contentType: string;
}

/**
 * Fetches an image from the first candidate that answers with a raster image
 * of an acceptable size, cancelling the others; `null` when none does.
 */
export async function fetchAttachedNftImage(url: string): Promise<AttachedNftImage | null> {
  const candidates = imageUrlCandidates(url);
  if (candidates.length === 0) return null;
  const controllers = candidates.map(() => new AbortController());
  const timer = setTimeout(() => {
    for (const controller of controllers) controller.abort();
  }, IMAGE_FETCH_TIMEOUT_MS);

  try {
    const served = await Promise.any(
      candidates.map(async (candidate, index) => {
        const response = await fetchPublicHttps(candidate, {
          cache: 'no-store',
          signal: controllers[index]!.signal,
        });
        const contentType = (response.headers.get('content-type') ?? '')
          .split(';')[0]!
          .trim()
          .toLowerCase();
        const contentLength = response.headers.get('content-length');
        const tooLarge = contentLength !== null && Number(contentLength) > MAX_IMAGE_BYTES;
        if (!response.ok || !response.body || !RASTER_IMAGE_TYPES.has(contentType) || tooLarge) {
          void response.body?.cancel().catch(() => {});
          throw new Error(`Unusable image response (${response.status} ${contentType})`);
        }
        return { index, body: response.body, contentType };
      }),
    );
    controllers.forEach((controller, index) => {
      if (index !== served.index) controller.abort();
    });
    return { body: served.body, contentType: served.contentType };
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}
