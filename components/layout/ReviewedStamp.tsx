import { useLocale, useTranslations } from 'next-intl';

import { toIntlLocale } from '@/utils/format';

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export interface ReviewedStampProps {
  /** The date as an ISO calendar date, `YYYY-MM-DD`. */
  date: string;
  /**
   * `reviewed` (default): "Last reviewed July 20, 2026", for a document
   * someone checked on that date. `updated`: "Last updated …", for a
   * document whose text changed on that date (terms, privacy).
   */
  kind?: 'reviewed' | 'updated';
  className?: string;
}

/**
 * A document date for `PageHeader`'s meta line on trust and legal pages, as a
 * `<time>` carrying the ISO date. The date is spelled out in the locale's long
 * calendar form (it is a document date, not a timestamp), in UTC so it never
 * shifts a day. Renders no client hooks.
 */
export function ReviewedStamp({ date, kind = 'reviewed', className }: ReviewedStampProps) {
  const t = useTranslations('common');
  const locale = useLocale();
  if (!ISO_DATE.test(date)) return null;
  const label = new Intl.DateTimeFormat(toIntlLocale(locale), {
    dateStyle: 'long',
    timeZone: 'UTC',
  }).format(new Date(`${date}T00:00:00Z`));
  return (
    <time dateTime={date} className={className}>
      {t(kind === 'updated' ? 'pageHeader.lastUpdated' : 'pageHeader.lastReviewed', {
        date: label,
      })}
    </time>
  );
}
