'use client';

import { useTranslations } from 'next-intl';

import { DateTime } from '@/components/ui/date-time';

/**
 * "Anchored Sep 23" for a card's caption line. Only the date is the
 * never-wrapping `<time>`: the phrase may break before it, so the narrow
 * two-up cards of a phone keep it inside their column.
 */
export function AnchoredOn({ timestamp }: { timestamp: number }) {
  const t = useTranslations('anchoring');
  return (
    <span className="min-w-0">
      {t.rich('picker.anchoredOn', { date: () => <DateTime timestamp={timestamp} /> })}
    </span>
  );
}
