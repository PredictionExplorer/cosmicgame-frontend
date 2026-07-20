'use client';

import { useTranslations } from 'next-intl';

import { PageHeader } from '@/components/layout/PageHeader';
import { PageShell } from '@/components/ui/page-shell';
import { useSystemModelist, useSystemEvents } from '@/hooks/useApiQuery';
import { AdminEventsTable, type AdminEventRow } from '@/components/tables/AdminEventsTable';

function ChangedParameters() {
  const t = useTranslations('coordination');
  const { data: modeList, isLoading: isLoadingModeList } = useSystemModelist();
  const startId = modeList != null ? ((modeList as { EvtLogId: number }[])[0]?.EvtLogId ?? 0) : -1;
  const { data: events = [], isLoading: isLoadingEvents } = useSystemEvents(startId, 9999999999);
  const loading = isLoadingModeList || isLoadingEvents;

  return (
    <PageShell variant="data" backdrop="signature">
      <PageHeader title={t('page.title')} titleLevel={2} subtitle={t('page.subtitle')} />
      <p className="text-sm text-muted-foreground leading-relaxed mb-8 max-w-3xl">
        {t('page.description')}
      </p>
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
