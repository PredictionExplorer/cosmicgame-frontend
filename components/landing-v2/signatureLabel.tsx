import type { ReactNode } from 'react';
import { useLocale } from 'next-intl';

import { getLocaleConfig } from '@/i18n/localeConfig';
import { useSignatureLabel as useWallLabel } from '@/components/ui/signature-label';

import type { ShowcaseArtwork } from './showcase-art';

type LabelledArtwork = Pick<ShowcaseArtwork, 'TokenId' | 'TokenName' | 'RoundNum' | 'ImprintedAt'>;

/**
 * The landing's plates read their wall label from the one rule every art
 * surface follows (`components/ui/signature-label`): the name, or
 * "Signature #000023" with the number in mono; then the number (only when a
 * name took the title), the cycle and the month it was imprinted.
 */
export function useSignatureLabel() {
  const locale = useLocale();
  const label = useWallLabel();
  const month = new Intl.DateTimeFormat(getLocaleConfig(locale).intlLocale, {
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  });
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
