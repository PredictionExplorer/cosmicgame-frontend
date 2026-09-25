import { cache } from 'react';

import { get_cst_list } from '@/services/api/tokens';

/** What a plate and its wall label need of one Signature. */
export interface SignatureSeedEntry {
  seed: string | number;
  /** The token's name, when it has one. */
  name?: string;
}

/** Entries by token id: a JSON object, so it crosses from the server to a page as a prop. */
export type SignatureSeedMap = Readonly<Record<string, SignatureSeedEntry>>;

/**
 * Every imprinted Signature's seed and name by token id, read once per
 * render: one collection read serves a page that draws a handful of
 * Signatures on the server (a cycle's recipients, a participant's Stellar
 * Selection NFTs), instead of a token read per plate, each of which embeds
 * its cycle's whole record. Those pages are cached renders (ISR), so the read
 * is not cached again across requests: a cached read would cut the page's
 * cache window to its own (`lib/cacheWindow`).
 */
const readAllSignatureSeeds = cache(async (): Promise<Record<string, SignatureSeedEntry>> => {
  const entries: Record<string, SignatureSeedEntry> = {};
  for (const token of await get_cst_list()) {
    const seed = token.Seed;
    if (
      typeof token.TokenId !== 'number' ||
      (typeof seed !== 'string' && typeof seed !== 'number')
    ) {
      continue;
    }
    const name = typeof token.TokenName === 'string' ? token.TokenName.trim() : '';
    entries[String(token.TokenId)] = name ? { seed, name } : { seed };
  }
  return entries;
});

/**
 * The seeds (and names) of the given Signatures, for a page's first HTML:
 * `undefined` when the collection could not be read (the page reads it in
 * the browser instead), else only the tokens asked for, so the prop stays
 * small.
 */
export async function readSignatureSeeds(
  tokenIds: readonly number[],
): Promise<SignatureSeedMap | undefined> {
  try {
    const all = await readAllSignatureSeeds();
    const entries: Record<string, SignatureSeedEntry> = {};
    for (const tokenId of tokenIds) {
      const entry = all[String(tokenId)];
      if (tokenId >= 0 && entry !== undefined) entries[String(tokenId)] = entry;
    }
    return entries;
  } catch {
    return undefined;
  }
}
