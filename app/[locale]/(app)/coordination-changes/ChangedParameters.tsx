'use client';

import type { ReactNode } from 'react';
import { useTranslations } from 'next-intl';

import { PageHeader } from '@/components/layout/PageHeader';
import { PageShell } from '@/components/ui/page-shell';
import { useSystemModelist, useSystemEvents } from '@/hooks/useApiQuery';
import { AdminEventsTable, type AdminEventRow } from '@/components/tables/AdminEventsTable';
import { COORDINATION_EVENTS_END_ID } from '@/services/api/system';

/**
 * Lists the same rows as `get_coordination_events` (the server summary's count): admin events
 * from the latest system-mode change onward.
 */
function ChangedParameters({
  seoSummary,
}: {
  /** The server-rendered page header, the page's only header. */
  seoSummary?: ReactNode;
}) {
  const t = useTranslations('coordination');
  const { data: modeList, isLoading: isLoadingModeList } = useSystemModelist();
  const startId = modeList != null ? ((modeList as { EvtLogId: number }[])[0]?.EvtLogId ?? 0) : -1;
  const { data: events = [], isLoading: isLoadingEvents } = useSystemEvents(
    startId,
    COORDINATION_EVENTS_END_ID,
  );
  const loading = isLoadingModeList || isLoadingEvents;

  return (
    <PageShell variant="data" backdrop="signature">
      {seoSummary ?? (
        <PageHeader section="records" title={t('page.title')} subtitle={t('page.subtitle')} />
      )}
      {/* Who can change these parameters, and until when: the context every row needs. */}
      <p className="mb-8 max-w-prose type-body-md text-muted-foreground">{t('page.description')}</p>
      {loading ? (
        <p className="text-lg font-semibold" role="status">
          {t('page.loading')}
        </p>
      ) : (
        <AdminEventsTable list={events as AdminEventRow[]} />
      )}
    </PageShell>
  );
}

export default ChangedParameters;
