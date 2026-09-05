import { formatEther } from 'viem';

import type { CTPriceInfo } from '@/services/api/types';

export interface CstAuctionDurations {
  AuctionDuration: number;
  SecondsElapsed: number;
  updatedAtMs?: number;
}

export interface CstGestureData extends CstAuctionDurations {
  CSTPrice: number;
  CSTPriceWei: bigint;
  isFree: boolean;
  source: 'api' | 'contract' | 'empty';
  /** Independent of quote availability. Optional for legacy snapshots;
   * mapCTPriceInfo always supplies it, including valid zero-duration windows. */
  timingAvailable?: boolean;
  apiAuctionDuration?: number;
  apiSecondsElapsed?: number;
}

export interface CstAuctionProgress {
  auctionDuration: number;
  secondsElapsed: number;
  secondsRemaining: number;
  percentComplete: number;
  percentCompleteRounded: number;
  isEnded: boolean;
}

export interface CstLiveDisplayOptions {
  nowMs: number;
}

const EMPTY_CST_GESTURE_DATA: CstGestureData = {
  AuctionDuration: 0,
  CSTPrice: 0,
  CSTPriceWei: 0n,
  SecondsElapsed: 0,
  isFree: false,
  source: 'empty',
  timingAvailable: false,
};

function parseDuration(value: unknown): number | null {
  if (typeof value !== 'number' && typeof value !== 'string') return null;
  if (typeof value === 'string' && !/^\d+$/.test(value.trim())) return null;
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed >= 0 ? parsed : null;
}

function parseWei(value: unknown): bigint | null {
  if (typeof value !== 'string' || !/^\d+$/.test(value.trim())) return null;
  try {
    return BigInt(value);
  } catch {
    return null;
  }
}

export function isCstGestureFree({
  AuctionDuration,
  CSTPrice,
  CSTPriceWei,
  SecondsElapsed,
  source,
}: Pick<
  CstGestureData,
  'AuctionDuration' | 'CSTPrice' | 'CSTPriceWei' | 'SecondsElapsed' | 'source'
>): boolean {
  if (source === 'empty') return false;
  return CSTPriceWei === 0n || CSTPrice <= 0 || SecondsElapsed > AuctionDuration;
}

export function mapCTPriceInfo(
  raw: CTPriceInfo | null | undefined,
  contractDurations?: CstAuctionDurations | null,
  contractCstPriceWei?: bigint | null,
): CstGestureData {
  if (!raw && !contractDurations && contractCstPriceWei == null) return EMPTY_CST_GESTURE_DATA;

  const apiAuctionDuration = parseDuration(raw?.AuctionDuration);
  const apiSecondsElapsed = parseDuration(raw?.SecondsElapsed);
  const contractAuctionDuration = parseDuration(contractDurations?.AuctionDuration);
  const contractSecondsElapsed = parseDuration(contractDurations?.SecondsElapsed);
  const hasContractTiming = contractAuctionDuration !== null && contractSecondsElapsed !== null;
  const hasApiTiming = apiAuctionDuration !== null && apiSecondsElapsed !== null;
  const cstPriceWei = contractCstPriceWei ?? parseWei(raw?.CSTPrice);
  // Keep duration and elapsed time from one coherent sample. An absent or
  // malformed pair must not turn into a real zero-duration calibration.
  const auctionDuration = hasContractTiming
    ? contractAuctionDuration
    : hasApiTiming
      ? apiAuctionDuration
      : 0;
  const secondsElapsed = hasContractTiming
    ? contractSecondsElapsed
    : hasApiTiming
      ? apiSecondsElapsed
      : 0;
  const cstPrice = cstPriceWei != null ? Number(formatEther(cstPriceWei)) : 0;
  const hasQuote = cstPriceWei != null && cstPriceWei >= 0n && Number.isFinite(cstPrice);
  const data: CstGestureData = {
    AuctionDuration: auctionDuration,
    CSTPrice: hasQuote ? cstPrice : 0,
    CSTPriceWei: hasQuote ? cstPriceWei : 0n,
    SecondsElapsed: secondsElapsed,
    timingAvailable: hasContractTiming || hasApiTiming,
    isFree: false,
    // Timing and price reads resolve independently. A duration sample alone
    // must not promote a missing (or malformed) quote into a free gesture.
    source: !hasQuote
      ? 'empty'
      : hasContractTiming || contractCstPriceWei != null
        ? 'contract'
        : 'api',
    apiAuctionDuration: apiAuctionDuration ?? undefined,
    apiSecondsElapsed: apiSecondsElapsed ?? undefined,
    updatedAtMs: hasContractTiming ? contractDurations?.updatedAtMs : undefined,
  };
  return { ...data, isFree: isCstGestureFree(data) };
}

export function formatCstAmount(value: number | null | undefined, digits = 4): string {
  if (value == null || !Number.isFinite(value)) return '--';
  if (value === 0) return '0';
  return value >= 1 ? value.toFixed(digits).replace(/\.?0+$/, '') : value.toFixed(6);
}

export function getCstAuctionProgress({
  AuctionDuration,
  SecondsElapsed,
}: Pick<CstAuctionDurations, 'AuctionDuration' | 'SecondsElapsed'>): CstAuctionProgress {
  const auctionDuration =
    Number.isFinite(AuctionDuration) && AuctionDuration > 0 ? AuctionDuration : 0;
  const secondsElapsed = Number.isFinite(SecondsElapsed) && SecondsElapsed > 0 ? SecondsElapsed : 0;
  const rawPercent = auctionDuration > 0 ? (secondsElapsed / auctionDuration) * 100 : 0;
  const percentComplete = Math.min(100, Math.max(0, rawPercent));

  return {
    auctionDuration,
    secondsElapsed,
    secondsRemaining: Math.max(auctionDuration - secondsElapsed, 0),
    percentComplete,
    percentCompleteRounded: Math.round(percentComplete),
    isEnded: auctionDuration > 0 && secondsElapsed > auctionDuration,
  };
}

export function deriveLiveCstGestureData(
  data: CstGestureData,
  { nowMs }: CstLiveDisplayOptions,
): CstGestureData {
  if (!data.updatedAtMs || !Number.isFinite(nowMs) || nowMs <= data.updatedAtMs) return data;

  const elapsedDelta = Math.floor((nowMs - data.updatedAtMs) / 1000);
  if (elapsedDelta <= 0) return data;

  const next: CstGestureData = {
    ...data,
    SecondsElapsed: Math.max(0, data.SecondsElapsed + elapsedDelta),
  };
  return { ...next, isFree: isCstGestureFree(next) };
}

export function formatCstProgressPercent(value: number): string {
  if (!Number.isFinite(value)) return '0%';
  const clamped = Math.min(100, Math.max(0, value));
  if (clamped === 0 || clamped === 100 || Number.isInteger(clamped))
    return `${clamped.toFixed(0)}%`;
  return `${clamped.toFixed(1)}%`;
}
