import type { useTranslations } from 'next-intl';

import type { CstGestureData } from '@/utils/cstGesture';
import { formatFixed } from '@/utils/format';
import { ethGestureBaseCost, formatEthQuote } from '@/utils/gestureQuote';

type HomeTranslator = ReturnType<typeof useTranslations>;

export interface GestureSubmitLabelInput {
  t: HomeTranslator;
  gestureType: string;
  ethPrice: number | null | undefined;
  rwlkId: number;
  cstGestureData: Pick<CstGestureData, 'isFree' | 'CSTPrice' | 'source'>;
}

/**
 * The one label used by every gesture submit button (full console, monument,
 * chat composer), so the shown cost can never drift between surfaces. It quotes
 * the Gesture Cost itself, formatted like the method tabs; the collision buffer
 * the form adds on top is disclosed next to the button, not folded in here.
 */
export function getGestureSubmitLabel({
  t,
  gestureType,
  ethPrice,
  rwlkId,
  cstGestureData,
}: GestureSubmitLabelInput): string {
  const hasEthQuote = ethPrice != null && Number.isFinite(ethPrice) && ethPrice >= 0;
  if (
    ((gestureType === 'ETH' || gestureType === 'RandomWalk') && !hasEthQuote) ||
    (gestureType === 'CST' && cstGestureData.source === 'empty')
  ) {
    return t('form.submit.generic', { method: gestureType });
  }
  const price = ethPrice ?? 0;
  if (gestureType === 'ETH') {
    return t('form.submit.eth', { cost: formatEthQuote(ethGestureBaseCost(price, 'ETH')) });
  }
  if (gestureType === 'RandomWalk' && rwlkId !== -1)
    return t('form.submit.randomWalkWithToken', {
      tokenId: String(rwlkId),
      cost: formatEthQuote(ethGestureBaseCost(price, 'RandomWalk')),
    });
  if (gestureType === 'CST') {
    if (cstGestureData.isFree) return t('form.submit.cstFree');
    return t('form.submit.cst', { cost: formatFixed(cstGestureData.CSTPrice, 2) });
  }
  if (gestureType === 'RandomWalk') return t('form.submit.randomWalk');
  return t('form.submit.generic', { method: gestureType });
}
