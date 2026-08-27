import type { GestureInfo } from '@/services/api/types';

/**
 * Payment resolution for a recorded gesture. The indexer has shipped several
 * generations of field names for the same facts (see the fallback chains), so
 * every surface that says "what did this gesture pay" must resolve them the
 * same way — this module is that single source.
 */

function firstNonNegativeNumber(...values: unknown[]): number | undefined {
  return values.find(
    (value): value is number => typeof value === 'number' && Number.isFinite(value) && value >= 0,
  );
}

export function resolveGestureType(gesture: GestureInfo): number | undefined {
  if (typeof gesture.GestureType === 'number') return gesture.GestureType;
  const backendGestureType = (gesture as GestureInfo & { BidType?: unknown }).BidType;
  return typeof backendGestureType === 'number' ? backendGestureType : undefined;
}

export function formatGestureAmount(
  amount: number | undefined,
  unit: 'ETH' | 'CST',
  unavailable: string,
): string {
  if (amount === undefined) return unavailable;
  return `${amount.toFixed(amount > 0 && amount < 1 ? 7 : 4)} ${unit}`;
}

export function formatReceivedCstAmount(amount: number | undefined, unavailable: string): string {
  if (amount === undefined) return unavailable;
  return `${amount.toFixed(amount > 0 && amount < 1 ? 7 : 2)} CST`;
}

export function getCstGestureCost(gesture: GestureInfo): number | undefined {
  return firstNonNegativeNumber(
    gesture.CstCost,
    gesture.NumCSTokensEth,
    gesture.NumCSTTokensEth,
    gesture.CstPriceEth,
  );
}

export function getEthGestureCost(gesture: GestureInfo): number | undefined {
  return firstNonNegativeNumber(gesture.GestureCostEth, gesture.EthPriceEth);
}

export function getParticipationCST(gesture: GestureInfo): number | undefined {
  return firstNonNegativeNumber(
    gesture.ParticipationCST,
    gesture.CSTRewardEth,
    gesture.ERC20RewardAmountEth,
  );
}

/** "0.0004200 ETH" / "112.40 CST" — the exact cost the gesture paid. */
export function formatGesturePayment(gesture: GestureInfo, unavailable: string): string {
  return resolveGestureType(gesture) === 2
    ? formatGestureAmount(getCstGestureCost(gesture), 'CST', unavailable)
    : formatGestureAmount(getEthGestureCost(gesture), 'ETH', unavailable);
}

export function formatGestureMethod(gesture: GestureInfo, unknown: string): string {
  switch (resolveGestureType(gesture)) {
    case 0:
      return 'ETH';
    case 1:
      return 'Random Walk';
    case 2:
      return 'CST';
    default:
      return unknown;
  }
}

export function hasRandomWalkToken(gesture: GestureInfo): boolean {
  return typeof gesture.RWalkNFTId === 'number' && gesture.RWalkNFTId >= 0;
}

export function getAttachedAssetLabels(gesture: GestureInfo): string[] {
  return [
    gesture.NFTDonationTokenAddr && gesture.NFTDonationTokenId !== -1 ? 'NFT' : '',
    gesture.DonatedERC20TokenAddr ? 'ERC20' : '',
  ].filter(Boolean);
}

export function formatAttachedAssets(gesture: GestureInfo, none: string): string {
  const assets = getAttachedAssetLabels(gesture);
  if (assets.length === 0) return none;
  return assets.join(' + ');
}
