import { useLocale, useTranslations } from 'next-intl';

import { formatYyyymmddLabel } from '@/utils/format';

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export interface ReviewedStampProps {
  /** The review date as an ISO calendar date, `YYYY-MM-DD`. */
  date: string;
  className?: string;
}

/**
 * "Last reviewed Jul 20, 2026" for `PageHeader`'s meta line on trust and
 * legal pages, as a `<time>` carrying the ISO date. Renders no client hooks.
 */
export function ReviewedStamp({ date, className }: ReviewedStampProps) {
  const t = useTranslations('common');
  const locale = useLocale();
  if (!ISO_DATE.test(date)) return null;
  const label = formatYyyymmddLabel(date.replaceAll('-', ''), locale);
  return (
    <time dateTime={date} className={className}>
      {t('pageHeader.lastReviewed', { date: label })}
    </time>
  );
}
