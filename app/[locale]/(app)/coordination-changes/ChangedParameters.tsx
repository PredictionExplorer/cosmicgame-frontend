'use client';

import type { ReactNode } from 'react';
import { useTranslations } from 'next-intl';

import { useSystemModelist, useSystemEvents } from '@/hooks/useApiQuery';
import { COORDINATION_EVENTS_END_ID, coordinationStartId } from '@/services/api/system';
import { LedgerPage } from '@/components/ledger/LedgerPage';
import { PageHeader } from '@/components/layout/PageHeader';
import { AdminEventsTable } from '@/components/tables/AdminEventsTable';

/**
 * Lists the admin events from the latest system-mode change onward
 * (`coordinationStartId`), the same rows the server header counts, under
 * the sentence that says who can change them and until when.
 */
function ChangedParameters({
  seoSummary,
}: {
  /** The server-rendered page header, the page's only header. */
  seoSummary?: ReactNode;
}) {
  const t = useTranslations('coordination');
  const tTables = useTranslations('tables');
  const modes = useSystemModelist();
  // -1 holds the events query until the mode list is read.
  const startId = modes.data != null ? coordinationStartId(modes.data) : -1;
  const events = useSystemEvents(startId, COORDINATION_EVENTS_END_ID);
  const loading = modes.isLoading || events.isLoading;
  const failed = Boolean(modes.isError || events.isError);

  return (
    <LedgerPage
      header={
        seoSummary ?? (
          <PageHeader section="records" title={t('page.title')} subtitle={t('page.subtitle')} />
        )
      }
    >
      <AdminEventsTable
        list={events.data ?? []}
        loading={loading}
        error={failed ? t('page.loadError') : undefined}
        onRetry={() => void (modes.isError ? modes.refetch() : events.refetch())}
        title={tTables('names.parameterChanges')}
        description={t('page.description')}
      />
    </LedgerPage>
  );
}

export default ChangedParameters;
