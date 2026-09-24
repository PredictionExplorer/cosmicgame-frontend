import { useQuery } from '@tanstack/react-query';
import { erc721Abi } from 'viem';
import { usePublicClient } from 'wagmi';

import { normalizeHttpUrl } from './attachedNftLinks';
import {
  attachedNftMetadataPath,
  attachedNftMetadataQueryKey,
  fetchAttachedNftMetadata,
  type AttachedNftMetadata,
  type AttachedNftTokenRef,
} from './attachedNftMetadata';

export type { AttachedNftMetadata, AttachedNftTokenRef } from './attachedNftMetadata';

const SAME_ORIGIN_IMAGE_PREFIX = '/api/attached-nft/';

function optionalString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

/** An image URL the client may render: our image route, or an http(s) file. */
function displayableImage(value: unknown): string | undefined {
  const text = optionalString(value);
  if (!text) return undefined;
  if (text.startsWith(SAME_ORIGIN_IMAGE_PREFIX)) return text;
  return normalizeHttpUrl(text) ?? undefined;
}

/**
 * Reads the document the server resolved and cached for this token
 * (app/api/attached-nft). `null` when the server has none, for a token the
 * indexer does not list yet or a document it could not read, so the caller
 * falls back to reading the token URI itself.
 */
export async function fetchSameOriginAttachedNftMetadata(
  tokenAddr: string,
  tokenId: string,
  signal?: AbortSignal,
): Promise<AttachedNftMetadata | null> {
  try {
    const response = await fetch(attachedNftMetadataPath(tokenAddr, tokenId), {
      headers: { Accept: 'application/json' },
      signal,
    });
    if (!response.ok) return null;
    const body: unknown = await response.json();
    if (!body || typeof body !== 'object' || Array.isArray(body)) return null;
    const raw = body as Record<string, unknown>;
    return {
      ...raw,
      name: optionalString(raw.name),
      description: optionalString(raw.description),
      image: displayableImage(raw.image),
      imageFallback: displayableImage(raw.imageFallback),
      external_url: normalizeHttpUrl(raw.external_url) ?? undefined,
      collection_name: optionalString(raw.collection_name),
      artist: optionalString(raw.artist),
      platform: optionalString(raw.platform),
    };
  } catch (error) {
    if (signal?.aborted) throw error;
    return null;
  }
}

/**
 * Loads display metadata for an attached NFT. It asks our server first,
 * which resolves and caches the document and serves the image from our origin;
 * for a token the server has no record of yet it reads the indexed token URI
 * itself (racing IPFS gateways when applicable), then `tokenURI(tokenId)`
 * straight from the contract over RPC.
 *
 * The attached-NFTs page seeds this query from the server for its first page
 * (`attachedNftMetadataQueryKey`), so those plates render with the page.
 */
export function useAttachedNftMetadata(
  uri: string | null | undefined,
  token?: AttachedNftTokenRef,
) {
  const publicClient = usePublicClient();
  const queryKey = attachedNftMetadataQueryKey(uri, token);
  const [, metadataUri, tokenAddr, tokenId] = queryKey;
  const hasToken = tokenAddr !== null && tokenId !== null;

  return useQuery<AttachedNftMetadata | null>({
    queryKey,
    enabled: metadataUri.length > 0 || hasToken,
    staleTime: 10 * 60_000,
    gcTime: 30 * 60_000,
    retry: false,
    queryFn: async ({ signal }) => {
      if (tokenAddr && tokenId) {
        const resolved = await fetchSameOriginAttachedNftMetadata(tokenAddr, tokenId, signal);
        if (resolved) return resolved;
      }

      let indexedUriError: unknown = null;
      if (metadataUri) {
        try {
          const metadata = await fetchAttachedNftMetadata(metadataUri);
          if (metadata) return metadata;
        } catch (error) {
          indexedUriError = error;
        }
      }

      if (publicClient && tokenAddr && tokenId) {
        const onchainUri = (
          await publicClient.readContract({
            address: tokenAddr,
            abi: erc721Abi,
            functionName: 'tokenURI',
            args: [BigInt(tokenId)],
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
