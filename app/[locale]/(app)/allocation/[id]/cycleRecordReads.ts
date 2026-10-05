import { cache } from 'react';

import type { CacheWindow } from '@/lib/cacheWindow';
import type { RoundInfo } from '@/services/api/types';
import { cycleRoles } from '@/components/winnings/cycleRoles';

import { cycleRecordSeeds, directCycleReaders } from '../../allocation-finalized/finalizedReads';
import { seedsDisabled, type QuerySeedEntry } from '../../QuerySeed';
import { readSignatureSeeds, type SignatureSeedMap } from '../signatureSeedReads';

export interface CycleRecordRead {
  /** The client queries the first HTML renders from: the record, its token and the cycle list. */
  seeds: QuerySeedEntry[];
  /** The recipients' Signature seeds, so their plates are in the first HTML too. */
  roleSeeds: SignatureSeedMap | undefined;
  /** How long the render built from these reads may be served (`lib/cacheWindow`). */
  cacheWindow: CacheWindow;
}

/** The newest cycle the list holds a record of, or null when it holds none or was not read. */
function newestFinalized(rounds: unknown): number | null {
  if (!Array.isArray(rounds)) return null;
  const cycles = (rounds as RoundInfo[])
    .map((round) => round.RoundNum)
    .filter((cycle): cycle is number => typeof cycle === 'number' && Number.isSafeInteger(cycle));
  return cycles.length > 0 ? Math.max(...cycles) : null;
}

/**
 * How long a cycle's page may be served. A finalized cycle's record never
 * changes, so its page keeps a day, except the newest one: its pager gains
 * the next cycle when that one finalizes, so it keeps five minutes. A cycle
 * with no record yet (open, or not started) and a render whose record read
 * failed keep a minute.
 */
function cycleCacheWindow(cycle: number, seeds: QuerySeedEntry[]): CacheWindow {
  const record = seeds.find((seed) => seed.queryKey[0] === 'roundInfo');
  if (!record || record.absent) return 'pending';
  const newest = newestFinalized(seeds.find((seed) => seed.queryKey[0] === 'roundList')?.data);
  return newest !== null && cycle < newest ? 'final' : 'live';
}

/**
 * The server reads behind a finalized cycle's record page, keyed like the
 * client hooks, so the header's figures, the recipients' plates, the split
 * and the grouped ledger are the first HTML rather than skeletons filled
 * after hydration (the gesture, anchoring and contribution tabs still load in
 * the browser):
 *
 * - the record and its Signature (`cycleRecordSeeds`), or, for a cycle with
 *   no record, the `null` its hook answers;
 * - the cycle list, which places the cycle among its neighbours;
 * - the seeds of the four roles' Signatures, handed to the page as a prop.
 *
 * The page is itself a cached render, so every read is made at the moment of
 * the render (`directCycleReaders`): a read cached across requests would cut
 * the page's cache window to its own. A failed read seeds nothing (the
 * browser reads it again); nothing is read under the e2e harness, whose
 * browser mocks must win.
 */
export const readCycleRecord = cache(async (cycle: number): Promise<CycleRecordRead> => {
  if (seedsDisabled()) return { seeds: [], roleSeeds: undefined, cacheWindow: 'pending' };
  const [recordSeeds, rounds] = await Promise.all([
    cycleRecordSeeds(cycle, directCycleReaders),
    directCycleReaders.rounds(),
  ]);
  const seeds = recordSeeds.some((seed) => seed.queryKey[0] === 'roundList')
    ? recordSeeds
    : [...recordSeeds, { queryKey: ['roundList'], data: rounds.data, at: rounds.at }];
  const cacheWindow = cycleCacheWindow(cycle, seeds);

  const record = recordSeeds.find((seed) => seed.queryKey[0] === 'roundInfo')?.data as
    | RoundInfo
    | null
    | undefined;
  if (!record) return { seeds, roleSeeds: undefined, cacheWindow };
  const roleSeeds = await readSignatureSeeds(cycleRoles(record).map((role) => role.tokenId));
  return { seeds, roleSeeds, cacheWindow };
});
