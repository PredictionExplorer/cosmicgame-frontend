'use client';

import type { ReactNode } from 'react';
import { useTranslations } from 'next-intl';

import { PageHeader } from '@/components/layout/PageHeader';
import { PageShell } from '@/components/ui/page-shell';
import { useSystemModelist, useSystemEvents } from '@/hooks/useApiQuery';
import { AdminEventsTable, type AdminEventRow } from '@/components/tables/AdminEventsTable';
import { COORDINATION_EVENTS_END_ID, coordinationStartId } from '@/services/api/system';

/**
 * Lists the admin events from the latest system-mode change onward
 * (`coordinationStartId`), the same rows the server header counts.
 */
function ChangedParameters({
  seoSummary,
}: {
  /** The server-rendered page header, the page's only header. */
  seoSummary?: ReactNode;
}) {
  const t = useTranslations('coordination');
  const tTables = useTranslations('tables');
  const { data: modeList, isLoading: isLoadingModeList } = useSystemModelist();
  // -1 holds the events query until the mode list is read.
  const startId = modeList != null ? coordinationStartId(modeList) : -1;
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
      <AdminEventsTable
        list={events as AdminEventRow[]}
        loading={loading}
        title={tTables('names.parameterChanges')}
      />
    </PageShell>
  );
}

export default ChangedParameters;
