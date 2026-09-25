'use client';

import { useTranslations } from 'next-intl';

import { DateTime, useTimeZoneLabel } from '@/components/ui/date-time';

export interface SnapshotStampProps {
  /**
   * When the figures were read (epoch ms): the moment the server's reads
   * resolved, never the time the page happens to render.
   */
  at: number;
  className?: string;
}

/**
 * "Snapshot · Sep 23, 04:20 UTC" for `PageHeader`'s meta line: the time the
 * header's server-read figures were taken, with its zone (the ledgers below
 * name theirs too), as a `<time>` with the reader's own time on hover.
 * Figures that poll live use `LiveStatus` instead.
 */
export function SnapshotStamp({ at, className }: SnapshotStampProps) {
  const t = useTranslations('common');
  const zone = useTimeZoneLabel();
  return (
    <DateTime timestamp={Math.floor(at / 1000)} className={className}>
      {(date) => t('pageHeader.snapshot', { date: `${date} ${zone}` })}
    </DateTime>
  );
}
