import type { useTranslations } from 'next-intl';

import type { CstGestureData } from '@/utils/cstGesture';
import { NBSP, formatAmount } from '@/utils/format';
import { ethGestureBaseCost, formatEthQuote } from '@/utils/gestureQuote';

type HomeTranslator = ReturnType<typeof useTranslations>;

export interface GestureSubmitLabelInput {
  t: HomeTranslator;
  /** The page locale, for the quote's decimal separator. */
  locale: string;
  gestureType: string;
  ethPrice: number | null | undefined;
  rwlkId: number;
  cstGestureData: Pick<CstGestureData, 'isFree' | 'CSTPrice' | 'source'>;
}

/**
 * The submit label in two parts, for buttons that set the verb and the price
 * on their own lines (the phone dock) or side by side (the gesture form).
 */
export interface GestureSubmitParts {
  /** The verb and the method: "Gesture with ETH". */
  action: string;
  /**
   * The Gesture Cost with its unit ("0.10211 ETH", "#12 · 0.05105 ETH",
   * "363.44 CST", "0 CST"), or null while the quote is unknown: a missing
   * price is never shown as free.
   */
  cost: string | null;
}

type QuoteState =
  | { kind: 'unknown' }
  | { kind: 'eth'; eth: number }
  | { kind: 'cst'; cst: number; free: boolean };

function quote({
  gestureType,
  ethPrice,
  cstGestureData,
}: Pick<GestureSubmitLabelInput, 'gestureType' | 'ethPrice' | 'cstGestureData'>): QuoteState {
  const hasEthQuote = ethPrice != null && Number.isFinite(ethPrice) && ethPrice >= 0;
  if (gestureType === 'ETH' || gestureType === 'RandomWalk') {
    return hasEthQuote
      ? { kind: 'eth', eth: ethGestureBaseCost(ethPrice, gestureType) }
      : { kind: 'unknown' };
  }
  if (gestureType === 'CST' && cstGestureData.source !== 'empty') {
    return {
      kind: 'cst',
      cst: cstGestureData.isFree ? 0 : cstGestureData.CSTPrice,
      free: cstGestureData.isFree,
    };
  }
  return { kind: 'unknown' };
}

const ACTION_KEY: Record<string, string> = {
  ETH: 'form.submit.action.eth',
  RandomWalk: 'form.submit.action.randomWalk',
  CST: 'form.submit.action.cst',
};

/**
 * The submit label as verb and price. Built from the same quote as
 * `getGestureSubmitLabel`, so the two forms can never disagree.
 */
export function getGestureSubmitParts(input: GestureSubmitLabelInput): GestureSubmitParts {
  const { t, locale, gestureType, rwlkId } = input;
  const actionKey = ACTION_KEY[gestureType];
  const action = actionKey ? t(actionKey) : t('form.submit.generic', { method: gestureType });
  const state = quote(input);
  if (state.kind === 'unknown') return { action, cost: null };
  if (state.kind === 'cst') {
    return { action, cost: formatAmount(state.cst, { unit: 'CST', locale }) };
  }
  const eth = `${formatEthQuote(state.eth, locale)}${NBSP}ETH`;
  return {
    action,
    cost: gestureType === 'RandomWalk' && rwlkId !== -1 ? `#${rwlkId} · ${eth}` : eth,
  };
}

/**
 * The one label used by every gesture submit button (the home gesture panel and
 * action dock, and the experimental console, monument and chat composer), so the
 * shown cost can never drift between surfaces. It quotes the Gesture Cost itself,
 * formatted like the method tabs; the collision buffer the form adds on top is
 * disclosed next to the button, not folded in here.
 */
export function getGestureSubmitLabel(input: GestureSubmitLabelInput): string {
  const { t, locale, gestureType, rwlkId } = input;
  const state = quote(input);
  if (state.kind === 'unknown') return t('form.submit.generic', { method: gestureType });
  if (state.kind === 'cst') {
    if (state.free) return t('form.submit.cstFree');
    return t('form.submit.cst', {
      cost: formatAmount(state.cst, { unit: 'CST', locale, withUnit: false }),
    });
  }
  const cost = formatEthQuote(state.eth, locale);
  if (gestureType === 'ETH') return t('form.submit.eth', { cost });
  if (rwlkId !== -1) return t('form.submit.randomWalkWithToken', { tokenId: String(rwlkId), cost });
  return t('form.submit.randomWalk');
}
