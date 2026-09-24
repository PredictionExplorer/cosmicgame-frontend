import { cache } from 'react';

import { get_donations_with_info_by_id } from '@/services/api/donations';
import type { ETHDonation } from '@/services/api/types';

import { seedsDisabled, type QuerySeedEntry } from '../../../QuerySeed';

/*
 * The server half of /eth-contribution/detail/[id]: one read of the record,
 * shared by the tab title and the page body. Server-only.
 */

/** What the server knows about a contribution record. */
export type ContributionRead =
  /** The record, and when it was read (epoch ms). */
  | { status: 'found'; record: ETHDonation; at: number }
  /** The API answered that there is no such record. */
  | { status: 'missing' }
  /** Not read (an invalid id, the e2e harness) or the read failed: the client reads it. */
  | { status: 'unknown' };

/**
 * The record behind a detail page, read once per render (React `cache`), so
 * the page arrives complete — or already saying the record does not exist —
 * instead of drawing figure skeletons that then vanish.
 */
export const readContribution = cache(async (id: number): Promise<ContributionRead> => {
  if (seedsDisabled() || !Number.isInteger(id) || id < 0) return { status: 'unknown' };
  try {
    const record = await get_donations_with_info_by_id(id);
    return record ? { status: 'found', record, at: Date.now() } : { status: 'missing' };
  } catch {
    return { status: 'unknown' };
  }
});

/** A found record as the seed of the page's client query (`useDonationsWithInfoById`). */
export function contributionSeeds(id: number, read: ContributionRead): QuerySeedEntry[] {
  if (read.status !== 'found') return [];
  return [{ queryKey: ['donationsWithInfoById', id], data: read.record, at: read.at }];
}
