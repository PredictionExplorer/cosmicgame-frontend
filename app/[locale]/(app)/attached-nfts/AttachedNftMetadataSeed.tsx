import type { ReactNode } from 'react';

import type { AttachedNFT } from '@/services/api/types';
import { attachedNftMetadataQueryKey } from '@/components/attachments/attachedNftMetadata';
import { resolveAttachedNftDisplay } from '@/components/attachments/attachedNftMetadata.server';

import { readAttachedNfts } from '../publicDataReads';
import { QuerySeed, seedsDisabled, type QuerySeedEntry } from '../QuerySeed';

import { ATTACHED_WALL_PAGE_SIZE, newestAttachedFirst } from './attachedWall';

/**
 * How long the page waits for the first page's metadata. Documents are
 * cached for a day, so only a cold regeneration waits; a plate still
 * unresolved then loads on the client as before.
 */
const SEED_BUDGET_MS = 6_000;

function withinBudget<T>(promise: Promise<T>): Promise<T | null> {
  return new Promise((resolve) => {
    const timer = setTimeout(() => resolve(null), SEED_BUDGET_MS);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      () => {
        clearTimeout(timer);
        resolve(null);
      },
    );
  });
}

/** The first page's display metadata, keyed as `useAttachedNftMetadata` reads it. */
async function firstPageSeeds(records: readonly AttachedNFT[]): Promise<QuerySeedEntry[]> {
  const firstPage = newestAttachedFirst(records).slice(0, ATTACHED_WALL_PAGE_SIZE);
  return Promise.all(
    firstPage.map(async (record) => {
      const data = await withinBudget(resolveAttachedNftDisplay(record));
      return {
        queryKey: attachedNftMetadataQueryKey(record.NFTTokenURI, {
          tokenAddr: record.TokenAddr,
          tokenId: record.NFTTokenId ?? record.TokenId,
        }),
        data,
        at: Date.now(),
      };
    }),
  );
}

/**
 * Resolves the first page of attached NFTs on the server (names, collections,
 * and images served from our origin) and hands it to the client's metadata
 * queries, so the static HTML already holds the plates' images and they load
 * while the page parses, instead of after a client-side race over public IPFS
 * gateways.
 */
export async function AttachedNftMetadataSeed({ children }: { children: ReactNode }) {
  if (seedsDisabled()) return <>{children}</>;
  const { data } = await readAttachedNfts();
  const seeds = data && data.length > 0 ? await firstPageSeeds(data) : [];
  return <QuerySeed seeds={seeds}>{children}</QuerySeed>;
}
