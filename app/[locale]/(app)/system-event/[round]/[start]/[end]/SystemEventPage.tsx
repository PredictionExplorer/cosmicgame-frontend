'use client';

import { useEffect } from 'react';
import { useLocale, useTranslations } from 'next-intl';

import { detailPanelClass } from '@/components/detail-page/DetailPageChrome';
import { PageHeader } from '@/components/layout/PageHeader';
import { PageShell } from '@/components/ui/page-shell';
import { useSystemEvents } from '@/hooks/useApiQuery';
import { AdminEventsTable } from '@/components/tables/AdminEventsTable';
import { reportError } from '@/utils/errors';
import { cn } from '@/lib/utils';

interface SystemEventPageProps {
  start: number;
  end: number;
  round: number;
}

const SystemEventPage = ({ start, end, round }: SystemEventPageProps) => {
  const t = useTranslations('statistics');
  const locale = useLocale();
  const { data: eventsRaw, isLoading: loading, error } = useSystemEvents(start, end);
  const events = eventsRaw ?? [];

  useEffect(() => {
    if (error) {
      reportError(error, 'fetch system events');
    }
  }, [error]);

  const title =
    round > 0
      ? t('systemEvent.titleBeforeCycle', { cycle: round })
      : t('systemEvent.titleBeforeDeployment');

  return (
    <PageShell variant="data" backdrop="signature" className="max-sm:pb-16">
      <div className="mx-auto max-w-6xl">
        <PageHeader
          title={title}
          subtitle={t('systemEvent.range', { start, end })}
          breadcrumbs={[
            { label: t('systemEvent.breadcrumbs.home'), href: '/' },
            {
              label: t('systemEvent.breadcrumbs.coordination'),
              href: '/coordination-changes',
            },
            {
              label:
                round > 0
                  ? t('systemEvent.breadcrumbs.beforeCycle', { cycle: round })
                  : t('systemEvent.breadcrumbs.deployment'),
            },
          ]}
          className="mb-10 text-left sm:max-w-none [&_p]:mx-0 [&_p]:max-w-none"
          align="left"
        />

        {loading ? (
          <div className={cn(detailPanelClass, 'p-10 text-center')}>
            <p className="text-sm font-medium text-muted-foreground">{t('systemEvent.loading')}</p>
          </div>
        ) : error ? (
          <div className={cn(detailPanelClass, 'p-10 text-center')}>
            <p className="text-lg font-semibold text-destructive">
              {locale === 'zh'
                ? t('systemEvent.loadError')
                : error.message || t('systemEvent.loadError')}
            </p>
          </div>
        ) : (
          <div className={cn(detailPanelClass, 'overflow-x-auto p-2 sm:p-4')}>
            <AdminEventsTable list={events} />
          </div>
        )}
      </div>
    </PageShell>
  );
};

export default SystemEventPage;
