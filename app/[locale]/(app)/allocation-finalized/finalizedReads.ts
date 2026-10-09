import { cache } from 'react';
import { unstable_cache } from 'next/cache';

import { ApiReadError, isRecordNotFound } from '@/services/api/readError';
import { get_round_info, get_round_list } from '@/services/api/rounds';
import { get_cst_info } from '@/services/api/tokens';
import type { CSTTokenInfo, RoundInfo } from '@/services/api/types';

import { readRoundList, type TimedRead } from '../publicDataReads';
import { seedsDisabled, type QuerySeedEntry } from '../QuerySeed';

/** A finalized cycle's record never changes. */
const RECORD_SECONDS = 300;
/** A Signature may be named after its cycle, so its token read is kept for a minute. */
const TOKEN_SECONDS = 60;

/** A read that answered, and when (epoch ms). */
interface Timed<T> {
  data: T;
  at: number;
}

/**
 * The reads behind one cycle's record. `record` rejects with a not-found
 * `ApiReadError` for a cycle the API holds no record of.
 */
export interface CycleRecordReaders {
  record: (cycle: number) => Promise<Timed<RoundInfo>>;
  token: (tokenId: number) => Promise<Timed<CSTTokenInfo | null>>;
  rounds: () => Promise<TimedRead<RoundInfo[]>>;
}

async function readRecordNow(cycle: number): Promise<Timed<RoundInfo>> {
  const round = await get_round_info(cycle);
  if (!round) throw new ApiReadError('No record for this cycle', 404);
  return { data: round, at: Date.now() };
}

/**
 * The reads made at the moment of the render, for a page that is itself
 * cached (ISR): its render is the cache, and a cached read inside it would
 * only cut its cache window to the read's own.
 */
export const directCycleReaders: CycleRecordReaders = {
  record: readRecordNow,
  token: async (tokenId) => ({ data: await get_cst_info(tokenId), at: Date.now() }),
  // Once per render: the missing-cycle seeds and the page's neighbours share it.
  rounds: cache(async () => {
    try {
      return { data: await get_round_list(), at: Date.now() };
    } catch {
      return { data: null, at: Date.now() };
    }
  }),
};

/**
 * The reads shared across requests, for a page rendered on every request
 * (the query decides /allocation-finalized): every visit within the window
 * shares one answer instead of reading again. No record is not an answer to
 * keep: the cycle may be finalized, or indexed, a moment from now.
 */
const sharedCycleReaders: CycleRecordReaders = {
  record: unstable_cache(readRecordNow, ['allocation-finalized', 'record'], {
    revalidate: RECORD_SECONDS,
  }),
  token: unstable_cache(directCycleReaders.token, ['allocation-finalized', 'token'], {
    revalidate: TOKEN_SECONDS,
  }),
  rounds: readRoundList,
};

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
export async function cycleRecordSeeds(
  cycle: number,
  readers: CycleRecordReaders,
): Promise<QuerySeedEntry[]> {
  if (seedsDisabled()) return [];
  let record: Timed<RoundInfo>;
  try {
    record = await readers.record(cycle);
  } catch (error) {
    if (!isRecordNotFound(error)) return [];
    const rounds = await readers.rounds();
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
      const token = await readers.token(tokenId);
      seeds.push({ queryKey: ['cstInfo', tokenId], data: token.data, at: token.at });
    } catch {
      // The plate draws from the record's own seed; the client reads the name.
    }
  }
  return seeds;
}

/** {@link cycleRecordSeeds} with the reads shared across requests, once per render. */
export const readFinalizedCycleSeeds = cache(
  (cycle: number): Promise<QuerySeedEntry[]> => cycleRecordSeeds(cycle, sharedCycleReaders),
);
