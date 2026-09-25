import { cache } from 'react';

import type { RoundInfo } from '@/services/api/types';
import { cycleRoles } from '@/components/winnings/cycleRoles';

import { readFinalizedCycleSeeds } from '../../allocation-finalized/finalizedReads';
import { readRoundList } from '../../publicDataReads';
import { seedsDisabled, type QuerySeedEntry } from '../../QuerySeed';
import { readSignatureSeeds, type SignatureSeedMap } from '../signatureSeedReads';

export interface CycleRecordRead {
  /** The client queries the first HTML renders from: the record, its token and the cycle list. */
  seeds: QuerySeedEntry[];
  /** The recipients' Signature seeds, so their plates are in the first HTML too. */
  roleSeeds: SignatureSeedMap | undefined;
}

/**
 * The server reads behind a finalized cycle's record page, keyed like the
 * client hooks, so the header's figures, the recipients' plates, the split
 * and the grouped ledger are the first HTML rather than skeletons filled
 * after hydration (the gesture, anchoring and contribution tabs still load in
 * the browser):
 *
 * - the record and its Signature (`readFinalizedCycleSeeds`), or, for a cycle
 *   with no record, the `null` its hook answers;
 * - the cycle list, which places the cycle among its neighbours;
 * - the seeds of the four roles' Signatures, handed to the page as a prop.
 *
 * A failed read seeds nothing (the browser reads it again); nothing is read
 * under the e2e harness, whose browser mocks must win.
 */
export const readCycleRecord = cache(async (cycle: number): Promise<CycleRecordRead> => {
  if (seedsDisabled()) return { seeds: [], roleSeeds: undefined };
  const [recordSeeds, rounds] = await Promise.all([
    readFinalizedCycleSeeds(cycle),
    readRoundList(),
  ]);
  const seeds = recordSeeds.some((seed) => seed.queryKey[0] === 'roundList')
    ? recordSeeds
    : [...recordSeeds, { queryKey: ['roundList'], data: rounds.data, at: rounds.at }];

  const record = recordSeeds.find((seed) => seed.queryKey[0] === 'roundInfo')?.data as
    | RoundInfo
    | null
    | undefined;
  if (!record) return { seeds, roleSeeds: undefined };
  const roleSeeds = await readSignatureSeeds(cycleRoles(record).map((role) => role.tokenId));
  return { seeds, roleSeeds };
});
