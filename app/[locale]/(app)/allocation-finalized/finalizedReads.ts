import { cache } from 'react';
import { unstable_cache } from 'next/cache';

import { ApiReadError, isRecordNotFound } from '@/services/api/readError';
import { get_round_info } from '@/services/api/rounds';
import { get_cst_info } from '@/services/api/tokens';

import { readRoundList } from '../publicDataReads';
import { seedsDisabled, type QuerySeedEntry } from '../QuerySeed';

/** A finalized cycle's record never changes. */
const RECORD_SECONDS = 300;
/** A Signature may be named after its cycle, so its token read is kept for a minute. */
const TOKEN_SECONDS = 60;

/**
 * A finalized cycle's record, shared across requests (the route is dynamic, so
 * every visit would otherwise read it again). No record is not an answer to
 * keep: the cycle may be finalized, or indexed, a moment from now.
 */
const readRecord = unstable_cache(
  async (cycle: number) => {
    const round = await get_round_info(cycle);
    if (!round) throw new ApiReadError('No record for this cycle', 404);
    return { data: round, at: Date.now() };
  },
  ['allocation-finalized', 'record'],
  { revalidate: RECORD_SECONDS },
);

/** The cycle's Signature (its name and seed), shared across requests. */
const readToken = unstable_cache(
  async (tokenId: number) => ({ data: await get_cst_info(tokenId), at: Date.now() }),
  ['allocation-finalized', 'token'],
  { revalidate: TOKEN_SECONDS },
);

/**
 * The server reads behind one finalized cycle's page, keyed like the client
 * hooks, so the first HTML is the page in the state the browser will show:
 *
 * - The record: the cycle (`useRoundInfo`) and its Signature (`useCSTInfo`),
 *   so the art, the spec sheet and the title are there before hydration.
 * - No record (the API answers 400: the cycle is open, has not started, or is
 *   not indexed yet): the cycle is seeded as the `null` its hook answers, with
 *   the cycle list (`useRoundList`) the page reads to say which, so the short
 *   missing-cycle header is the server HTML too, not a record skeleton that
 *   collapses into it.
 * - A failed read seeds nothing: the page loads on the client, under the
 *   record's own header.
 *
 * Nothing is read under the e2e harness, whose seeds are off (the browser
 * mocks win there).
 */
export const readFinalizedCycleSeeds = cache(async (cycle: number): Promise<QuerySeedEntry[]> => {
  if (seedsDisabled()) return [];
  let record: Awaited<ReturnType<typeof readRecord>>;
  try {
    record = await readRecord(cycle);
  } catch (error) {
    if (!isRecordNotFound(error)) return [];
    const rounds = await readRoundList();
    return [
      { queryKey: ['roundInfo', cycle], data: null, at: Date.now(), absent: true },
      { queryKey: ['roundList'], data: rounds.data, at: rounds.at },
    ];
  }
  const seeds: QuerySeedEntry[] = [
    { queryKey: ['roundInfo', cycle], data: record.data, at: record.at },
  ];
  const tokenId = record.data.TokenId;
  if (typeof tokenId === 'number' && tokenId >= 0) {
    try {
      const token = await readToken(tokenId);
      seeds.push({ queryKey: ['cstInfo', tokenId], data: token.data, at: token.at });
    } catch {
      // The plate draws from the record's own seed; the client reads the name.
    }
  }
  return seeds;
});
