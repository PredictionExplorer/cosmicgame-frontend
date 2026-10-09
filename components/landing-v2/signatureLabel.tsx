import type { ReactNode } from 'react';
import { useLocale } from 'next-intl';

import { pickByLocale, type LocaleRecord } from '@/i18n/locale';
import { getLocaleConfig } from '@/i18n/localeConfig';
import { useSignatureLabel as useWallLabel } from '@/components/ui/signature-label';

import type { ShowcaseArtwork } from './showcase-art';

type LabelledArtwork = Pick<ShowcaseArtwork, 'TokenId' | 'TokenName' | 'RoundNum' | 'ImprintedAt'>;

/**
 * The month style of a wall label's date. CLDR's short month is a clipped
 * abbreviation in Ukrainian (черв. 2026 р.) and Vietnamese (thg 6 2026), so
 * those labels spell the month as their style guides write it (червень 2026 р.,
 * tháng 6 năm 2026); the CJK forms are the same either way.
 */
export const WALL_LABEL_MONTH: LocaleRecord<'short' | 'long'> = {
  en: 'short',
  zh: 'long',
  'zh-TW': 'long',
  'zh-HK': 'long',
  uk: 'long',
  ko: 'long',
  ja: 'long',
  vi: 'long',
};

/** "Jun 2026", "червень 2026 р.", "tháng 6 năm 2026": the month a Signature was imprinted. */
export function wallLabelMonthFormat(locale: string): Intl.DateTimeFormat {
  return new Intl.DateTimeFormat(getLocaleConfig(locale).intlLocale, {
    month: pickByLocale(WALL_LABEL_MONTH, locale),
    year: 'numeric',
    timeZone: 'UTC',
  });
}

/**
 * The landing's plates read their wall label from the one rule every art
 * surface follows (`components/ui/signature-label`): the name, or
 * "Signature #000023" with the number in mono; then the number (only when a
 * name took the title), the cycle and the month it was imprinted.
 */
export function useSignatureLabel() {
  const locale = useLocale();
  const label = useWallLabel();
  const month = wallLabelMonthFormat(locale);
  const facts = (art: LabelledArtwork) => ({ tokenId: art.TokenId, name: art.TokenName });

  return {
    /** The title as plain text, for announcements and accessible names. */
    text: (art: LabelledArtwork): string => label.text(facts(art)),
    /** Line 1 of the label. */
    title: (art: LabelledArtwork): ReactNode => label.title(facts(art)),
    /** Line 2 of the label, for WallLabelMeta. */
    meta: (art: LabelledArtwork): ReactNode[] =>
      label.meta({
        ...facts(art),
        cycle: art.RoundNum,
        date: art.ImprintedAt ? (
          <time key="date" dateTime={new Date(art.ImprintedAt * 1000).toISOString()}>
            {month.format(art.ImprintedAt * 1000)}
          </time>
        ) : null,
      }),
  };
}
