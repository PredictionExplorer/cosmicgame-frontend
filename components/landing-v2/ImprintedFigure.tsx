'use client';

import { useLocale, useTranslations } from 'next-intl';

import { formatCount } from '@/utils/format/numbers';
import { UnknownValue } from '@/components/ui/unknown-value';

import { imprintedCount, useLandingShowcaseTokens } from './useLandingShowcaseTokens';

/**
 * How many Signatures have been imprinted so far, read from the collection
 * with the rest of the page's art. A skeleton bar holds the figure's place
 * while it loads (named by a visually hidden text node: a role-less span
 * cannot carry an aria-label), and an unreadable count is an unknown value,
 * never 0.
 */
export function ImprintedFigure() {
  const locale = useLocale();
  const t = useTranslations('common');
  const showcase = useLandingShowcaseTokens();
  const count = imprintedCount(showcase);

  if (showcase.status === 'loading') {
    return (
      <>
        <span
          aria-hidden="true"
          className="inline-block h-[0.8em] w-[3ch] animate-pulse rounded-edge bg-surface-raised align-middle motion-reduce:animate-none"
        />
        <span className="sr-only">{t('status.loading')}</span>
      </>
    );
  }
  if (count === null) return <UnknownValue label={t('status.unavailable')} />;
  return <>{formatCount(count, locale)}</>;
}
