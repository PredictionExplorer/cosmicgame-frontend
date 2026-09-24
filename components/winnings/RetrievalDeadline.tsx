'use client';

import { useTranslations } from 'next-intl';

import { Badge } from '@/components/ui/badge';
import { DateTime } from '@/components/ui/date-time';
import { UnknownValue } from '@/components/ui/unknown-value';
import { useFormat } from '@/hooks/useFormat';
import { useNow } from '@/hooks/useNow';
import { cn } from '@/lib/utils';
import { deadlineState } from '@/utils/allocationRetrieval';

interface RetrievalDeadlineProps {
  /** The cycle's retrieval deadline, in Unix seconds; `undefined` while unknown. */
  deadline: number | null | undefined;
  className?: string;
}

/**
 * A retrieval deadline: the date, then how long is left. Within a week the
 * remaining time turns into an attention badge; once the date has passed it
 * reads "Expired", because anyone may then retrieve the item. The date
 * stays readable in every state, so the badge never carries it alone.
 */
export function RetrievalDeadline({ deadline, className }: RetrievalDeadlineProps) {
  const t = useTranslations('myPages');
  const format = useFormat();
  const nowSeconds = Math.floor(useNow(60_000) / 1000);
  const state = deadlineState(deadline, nowSeconds);

  if (!deadline || deadline <= 0) {
    return <UnknownValue label={t('shared.unavailable')} className={className} />;
  }

  return (
    <span
      className={cn('inline-flex flex-wrap items-center gap-x-2 gap-y-1', className)}
      data-deadline-state={state}
    >
      <DateTime timestamp={deadline} />
      {state === 'expired' ? (
        <Badge size="sm">{t('ethAllocations.deadline.expired')}</Badge>
      ) : state === 'soon' ? (
        <Badge size="sm" tone="attention" dot>
          {t('ethAllocations.deadline.remaining', {
            remaining: format.duration(deadline - nowSeconds, { maxUnits: 2 }),
          })}
        </Badge>
      ) : state === 'open' ? (
        <span className="type-caption text-subtle">
          {t('ethAllocations.deadline.remaining', {
            remaining: format.duration(deadline - nowSeconds, { maxUnits: 1 }),
          })}
        </span>
      ) : null}
    </span>
  );
}
