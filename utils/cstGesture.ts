import { formatEther } from 'viem';

import type { CTPriceInfo } from '@/services/api/types';

export interface CstAuctionDurations {
  AuctionDuration: number;
  SecondsElapsed: number;
}

export interface CstGestureData extends CstAuctionDurations {
  CSTPrice: number;
  CSTPriceWei: bigint;
  isFree: boolean;
  source: 'api' | 'contract' | 'empty';
  apiAuctionDuration?: number;
  apiSecondsElapsed?: number;
}

const EMPTY_CST_GESTURE_DATA: CstGestureData = {
  AuctionDuration: 0,
  CSTPrice: 0,
  CSTPriceWei: 0n,
  SecondsElapsed: 0,
  isFree: false,
  source: 'empty',
};

function parseDuration(value: unknown): number {
  const parsed = Number.parseInt(String(value ?? '0'), 10);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
}

function parseWei(value: unknown): bigint {
  try {
    return BigInt(String(value ?? '0'));
  } catch {
    return 0n;
  }
}

export function isCstGestureFree({
  AuctionDuration,
  CSTPrice,
  CSTPriceWei,
  SecondsElapsed,
}: Pick<
  CstGestureData,
  'AuctionDuration' | 'CSTPrice' | 'CSTPriceWei' | 'SecondsElapsed'
>): boolean {
  return CSTPriceWei === 0n || CSTPrice <= 0 || SecondsElapsed > AuctionDuration;
}

export function mapCTPriceInfo(
  raw: CTPriceInfo | null | undefined,
  contractDurations?: CstAuctionDurations | null,
): CstGestureData {
  if (!raw) return EMPTY_CST_GESTURE_DATA;

  const apiAuctionDuration = parseDuration(raw.AuctionDuration);
  const apiSecondsElapsed = parseDuration(raw.SecondsElapsed);
  const cstPriceWei = parseWei(raw.CSTPrice);
  const auctionDuration = contractDurations?.AuctionDuration ?? apiAuctionDuration;
  const secondsElapsed = contractDurations?.SecondsElapsed ?? apiSecondsElapsed;
  const cstPrice = Number(formatEther(cstPriceWei));
  const data: CstGestureData = {
    AuctionDuration: auctionDuration,
    CSTPrice: Number.isFinite(cstPrice) ? cstPrice : 0,
    CSTPriceWei: cstPriceWei,
    SecondsElapsed: secondsElapsed,
    isFree: false,
    source: contractDurations ? 'contract' : 'api',
    apiAuctionDuration,
    apiSecondsElapsed,
  };
  return { ...data, isFree: isCstGestureFree(data) };
}

export function formatCstAmount(value: number | null | undefined, digits = 4): string {
  if (value == null || !Number.isFinite(value)) return '--';
  if (value === 0) return '0';
  return value >= 1 ? value.toFixed(digits).replace(/\.?0+$/, '') : value.toFixed(6);
}
