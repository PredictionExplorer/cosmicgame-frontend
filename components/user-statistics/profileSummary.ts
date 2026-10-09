import { sumAllocatedEth } from '@/utils/allocationRecords';
import { toFiniteNumber } from '@/utils/finiteNumber';

/**
 * Pure summaries behind a participant's profile header: what they spent on
 * gestures next to what they received, and the titles their allocation
 * records carry. Spending and receipts are shown side by side, in neutral
 * figures, so a profile never shows only the upside.
 */

/** The gesture fields a spending summary reads (`GestureInfo` after normalization). */
export interface ProfileGesture {
  RoundNum?: number;
  TimeStamp?: number;
  GestureType?: number;
  /** ETH paid for an ETH gesture; absent (or negative) for a CST gesture. */
  GestureCostEth?: number;
  EthPriceEth?: number;
  /** CST paid for a CST gesture. */
  CstCost?: number;
  CstPriceEth?: number;
}

export interface GestureSummary {
  count: number;
  /** Distinct cycles the address gestured in. */
  cycles: number;
  /** The earliest cycle with a gesture, or null without gestures. */
  firstCycle: number | null;
  /** ETH paid across every ETH gesture in the list. */
  ethSpent: number;
  /** CST paid across every CST gesture in the list. */
  cstSpent: number;
}

/** A paid amount: finite and positive, else nothing (the API marks "none" with -1 or -1e-18). */
const paid = (...candidates: unknown[]): number => {
  for (const candidate of candidates) {
    const value = toFiniteNumber(candidate);
    if (value !== null) return value > 0 ? value : 0;
  }
  return 0;
};

/** Counts, cycles and spending across a participant's gestures. */
export function summarizeGestures(gestures: readonly ProfileGesture[]): GestureSummary {
  const cycles = new Set<number>();
  let ethSpent = 0;
  let cstSpent = 0;
  for (const gesture of gestures) {
    const cycle = toFiniteNumber(gesture.RoundNum);
    if (cycle !== null && cycle >= 0) cycles.add(cycle);
    ethSpent += paid(gesture.GestureCostEth, gesture.EthPriceEth);
    cstSpent += paid(gesture.CstCost, gesture.CstPriceEth);
  }
  return {
    count: gestures.length,
    cycles: cycles.size,
    firstCycle: cycles.size > 0 ? Math.min(...cycles) : null,
    ethSpent,
    cstSpent,
  };
}

/** The distinctions a participant's allocation records name, in the order a profile lists them. */
export const PROFILE_TITLES = [
  'signatureAllocation',
  'enduranceChampion',
  'chronoWarrior',
  'finalCstGesture',
] as const;

export type ProfileTitle = (typeof PROFILE_TITLES)[number];

/** Allocation record types (utils/allocationRecords) by the title they recognise. */
const TITLE_BY_RECORD_TYPE: Readonly<Record<number, ProfileTitle>> = {
  0: 'signatureAllocation',
  1: 'signatureAllocation',
  2: 'signatureAllocation',
  3: 'finalCstGesture',
  4: 'finalCstGesture',
  5: 'enduranceChampion',
  6: 'enduranceChampion',
  7: 'chronoWarrior',
  8: 'chronoWarrior',
  9: 'chronoWarrior',
};

export interface AllocationRecordLike {
  RecordType?: number;
  RoundNum?: number;
  AmountEth?: number;
}

export interface ProfileTitleEntry {
  title: ProfileTitle;
  /** The cycles it was held in, oldest first. */
  cycles: number[];
}

export interface AllocationSummary {
  /** Allocation records (every asset kind). */
  records: number;
  /** ETH received through allocations (retrieval rows excluded, so nothing counts twice). */
  ethReceived: number;
  titles: ProfileTitleEntry[];
}

/** What a participant received, and the titles behind it. */
export function summarizeAllocations(records: readonly AllocationRecordLike[]): AllocationSummary {
  const cyclesByTitle = new Map<ProfileTitle, Set<number>>();
  for (const record of records) {
    const title =
      typeof record.RecordType === 'number' ? TITLE_BY_RECORD_TYPE[record.RecordType] : undefined;
    const cycle = toFiniteNumber(record.RoundNum);
    if (!title || cycle === null) continue;
    const cycles = cyclesByTitle.get(title) ?? new Set<number>();
    cycles.add(cycle);
    cyclesByTitle.set(title, cycles);
  }
  return {
    records: records.length,
    ethReceived: sumAllocatedEth(records),
    titles: PROFILE_TITLES.flatMap((title) => {
      const cycles = cyclesByTitle.get(title);
      return cycles ? [{ title, cycles: [...cycles].sort((a, b) => a - b) }] : [];
    }),
  };
}

/** The fields a profile plate reads from an anchored Cosmic Signature NFT. */
export interface AnchoredArtwork {
  TokenId: number;
  TokenName?: string;
  RoundNum?: number;
  Seed?: string;
}

/**
 * The anchored Cosmic Signature NFTs of a `user/info` payload, as plates. The
 * anchoring wallet holds them, so the address's own token list leaves them
 * out; each row nests its token under `TokenInfo`.
 */
export function anchoredArtworks(rows: readonly unknown[]): AnchoredArtwork[] {
  return rows.flatMap((row) => {
    const nested =
      row && typeof row === 'object' ? (row as { TokenInfo?: unknown }).TokenInfo : null;
    const info = nested && typeof nested === 'object' ? (nested as Record<string, unknown>) : null;
    const id = toFiniteNumber(info?.TokenId);
    if (!info || id === null || id < 0) return [];
    const cycle = toFiniteNumber(info.RoundNum);
    return [
      {
        TokenId: id,
        TokenName: typeof info.TokenName === 'string' ? info.TokenName : undefined,
        RoundNum: cycle ?? undefined,
        Seed: typeof info.Seed === 'string' ? info.Seed : undefined,
      },
    ];
  });
}
