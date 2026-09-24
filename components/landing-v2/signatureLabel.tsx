import type { ReactNode } from 'react';
import { useLocale, useTranslations } from 'next-intl';

import { formatId } from '@/utils/format/ids';
import { getLocaleConfig } from '@/i18n/localeConfig';

import type { ShowcaseArtwork } from './showcase-art';

/**
 * Sets the token number inside a line of text in the identifier face
 * ("Signature #000023"), wherever the locale's template puts it.
 */
export function withMonoId(text: string, tokenLabel: string): ReactNode {
  const at = text.indexOf(tokenLabel);
  if (at < 0) return text;
  return (
    <>
      {text.slice(0, at)}
      <span className="font-mono">{tokenLabel}</span>
      {text.slice(at + tokenLabel.length)}
    </>
  );
}

type LabelledArtwork = Pick<ShowcaseArtwork, 'TokenId' | 'TokenName' | 'RoundNum' | 'ImprintedAt'>;

/**
 * The landing's wall label for a Signature, one rule on every plate:
 *
 * - title: the token's name, or "Signature #000023" with the number in mono;
 * - meta: the number only when a name took the title (so it never appears
 *   twice), then the cycle and the month it was imprinted.
 */
export function useSignatureLabel() {
  const locale = useLocale();
  const t = useTranslations('landing.artwork');
  const timerT = useTranslations('landing.timer');
  const month = new Intl.DateTimeFormat(getLocaleConfig(locale).intlLocale, {
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  });
  const nameOf = (art: LabelledArtwork) => art.TokenName?.trim() || null;
  const untitled = (art: LabelledArtwork) => t('untitled', { tokenLabel: formatId(art.TokenId) });

  return {
    /** The title as plain text, for announcements and accessible names. */
    text: (art: LabelledArtwork): string => nameOf(art) ?? untitled(art),
    /** Line 1 of the label. */
    title: (art: LabelledArtwork): ReactNode =>
      nameOf(art) ?? withMonoId(untitled(art), formatId(art.TokenId)),
    /** Line 2 of the label, for WallLabelMeta. */
    meta: (art: LabelledArtwork): ReactNode[] => [
      nameOf(art) ? (
        <span key="id" className="type-mono">
          {formatId(art.TokenId)}
        </span>
      ) : null,
      art.RoundNum === undefined ? null : timerT('cycle.numbered', { number: art.RoundNum }),
      art.ImprintedAt ? (
        <time key="date" dateTime={new Date(art.ImprintedAt * 1000).toISOString()}>
          {month.format(art.ImprintedAt * 1000)}
        </time>
      ) : null,
    ],
  };
}
