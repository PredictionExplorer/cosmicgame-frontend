'use client';

import { useTranslations } from 'next-intl';

import { DateTime } from '@/components/ui/date-time';

export interface SnapshotStampProps {
  /**
   * When the figures were read (epoch ms): the moment the server's reads
   * resolved, never the time the page happens to render.
   */
  at: number;
  className?: string;
}

/**
 * "Snapshot · Sep 23, 07:20" for `PageHeader`'s meta line: the time the
 * header's server-read figures were taken, as a `<time>` with the exact
 * instant on hover. UTC through hydration, then the reader's zone. Figures
 * that poll live use `LiveStatus` instead.
 */
export function SnapshotStamp({ at, className }: SnapshotStampProps) {
  const t = useTranslations('common');
  return (
    <DateTime timestamp={Math.floor(at / 1000)} className={className}>
      {(date) => t('pageHeader.snapshot', { date })}
    </DateTime>
  );
}
