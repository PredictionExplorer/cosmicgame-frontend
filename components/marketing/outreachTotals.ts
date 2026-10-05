import type { DateTimeZone } from '@/utils/format';
import type { MarketingReward } from '@/services/api/types';

/**
 * Below this many CST an allocation reads "<0.01" in a table (a test
 * transfer of a few base units, say), so tables mute it and say why.
 */
export const SMALL_ALLOCATION_CST = 0.01;

/**
 * An allocation too small to show at table precision ("<0.01"). A true zero
 * is not one: it prints as a plain zero.
 */
export const isSmallAllocation = (amountCst: number) =>
  amountCst > 0 && amountCst < SMALL_ALLOCATION_CST;

/** One outreach contributor's totals, ranked. */
export interface OutreachContributor {
  rank: number;
  address: string;
  /** CST received for outreach. */
  totalCst: number;
  allocations: number;
  /** Their part of all outreach CST sent so far, in percent (0–100). */
  sharePercent: number;
}

/** A finite amount, or 0 for a malformed one, so one bad row cannot poison a sum. */
const amountOf = (reward: MarketingReward) =>
  Number.isFinite(reward.AmountEth) ? reward.AmountEth : 0;

/**
 * Totals per contributor (addresses compared case-insensitively), ranked by
 * CST received, with each one's share of everything allocated so far.
 */
export function rankOutreachContributors(
  rewards: readonly MarketingReward[],
): OutreachContributor[] {
  const totals = new Map<string, { address: string; totalCst: number; allocations: number }>();
  let all = 0;
  for (const reward of rewards) {
    const amount = amountOf(reward);
    all += amount;
    const key = reward.MarketerAddr.toLowerCase();
    const entry = totals.get(key);
    if (entry) {
      entry.totalCst += amount;
      entry.allocations += 1;
    } else {
      totals.set(key, { address: reward.MarketerAddr, totalCst: amount, allocations: 1 });
    }
  }
  return [...totals.values()]
    .sort((a, b) => b.totalCst - a.totalCst)
    .map((entry, index) => ({
      ...entry,
      rank: index + 1,
      sharePercent: all > 0 ? (entry.totalCst / all) * 100 : 0,
    }));
}

/** What one contributor's allocations add up to. */
export interface OutreachSummary {
  /** CST received across every allocation. */
  totalCst: number;
  allocations: number;
  /** Allocations too small to show at table precision (see `isSmallAllocation`). */
  smallAllocations: number;
  /** Unix seconds of the earliest and latest allocation; `null` with none. */
  first: number | null;
  latest: number | null;
}

/** Totals and date range of one contributor's allocations, in any order. */
export function summarizeOutreachAllocations(rewards: readonly MarketingReward[]): OutreachSummary {
  let totalCst = 0;
  let smallAllocations = 0;
  let first: number | null = null;
  let latest: number | null = null;
  for (const reward of rewards) {
    const amount = amountOf(reward);
    totalCst += amount;
    if (isSmallAllocation(amount)) smallAllocations += 1;
    if (Number.isFinite(reward.TimeStamp) && reward.TimeStamp > 0) {
      if (first === null || reward.TimeStamp < first) first = reward.TimeStamp;
      if (latest === null || reward.TimeStamp > latest) latest = reward.TimeStamp;
    }
  }
  return { totalCst, allocations: rewards.length, smallAllocations, first, latest };
}

/** The calendar day (YYYY-MM-DD) of a Unix time in a zone. */
function calendarDay(seconds: number, timeZone: DateTimeZone): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: timeZone === 'local' ? undefined : timeZone === 'utc' ? 'UTC' : timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(seconds * 1000));
}

/**
 * Whether every allocation arrived on one calendar day in the zone the page
 * shows its dates in (`<DateTime>`: UTC until hydration, then the reader's
 * zone): the header then dates them once instead of a first and a latest a
 * few minutes apart, and never gives one date to two of the reader's days.
 */
export function allocatedOnOneDay(
  { first, latest }: Pick<OutreachSummary, 'first' | 'latest'>,
  timeZone: DateTimeZone = 'utc',
) {
  if (first === null || latest === null) return false;
  return calendarDay(first, timeZone) === calendarDay(latest, timeZone);
}
