import { getMetadataUrl } from '@/utils/urls';

import { parseCosmicSignatureMetadata, type CosmicSignatureMetadata } from './types';

/**
 * Loads and parses one token's metadata document from the media origin.
 * Resolves to `null` for a confirmed missing token (404); rejects on
 * transport errors and unusable payloads so callers can distinguish
 * "no such token" from "could not read".
 */
export async function fetchNftMetadata(
  tokenId: number,
  init?: { signal?: AbortSignal; next?: { revalidate?: number } },
): Promise<CosmicSignatureMetadata | null> {
  const response = await fetch(getMetadataUrl(tokenId), {
    headers: { Accept: 'application/json' },
    ...init,
  });
  if (response.status === 404) return null;
  if (!response.ok) {
    throw new Error(`Failed to load token metadata (${response.status})`);
  }
  const raw: unknown = await response.json();
  const parsed = parseCosmicSignatureMetadata(raw);
  if (!parsed) {
    throw new Error('Token metadata payload is unusable');
  }
  return parsed;
}
