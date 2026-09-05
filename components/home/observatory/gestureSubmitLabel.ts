import type { useTranslations } from 'next-intl';

import type { CstGestureData } from '@/utils/cstGesture';
import { formatFixed } from '@/utils/format';

type HomeTranslator = ReturnType<typeof useTranslations>;

export interface GestureSubmitLabelInput {
  t: HomeTranslator;
  gestureType: string;
  ethPrice: number | null | undefined;
  gestureCostPlus: number;
  rwlkId: number;
  cstGestureData: Pick<CstGestureData, 'isFree' | 'CSTPrice' | 'source'>;
}

/**
 * The one label used by every gesture submit button (full console, monument,
 * chat composer), so the shown cost can never drift between surfaces.
 */
export function getGestureSubmitLabel({
  t,
  gestureType,
  ethPrice,
  gestureCostPlus,
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
  const adj = (ethPrice ?? 0) * (1 + gestureCostPlus / 100);
  const fmt = (v: number, threshold: number) => (v > threshold ? v.toFixed(2) : v.toFixed(5));
  if (gestureType === 'ETH') return t('form.submit.eth', { cost: fmt(adj, 0.1) });
  if (gestureType === 'RandomWalk' && rwlkId !== -1)
    return t('form.submit.randomWalkWithToken', {
      tokenId: String(rwlkId),
      cost: fmt(adj * 0.5, 0.2),
    });
  if (gestureType === 'CST') {
    if (cstGestureData.isFree) return t('form.submit.cstFree');
    return t('form.submit.cst', { cost: formatFixed(cstGestureData.CSTPrice, 2) });
  }
  if (gestureType === 'RandomWalk') return t('form.submit.randomWalk');
  return t('form.submit.generic', { method: gestureType });
}
