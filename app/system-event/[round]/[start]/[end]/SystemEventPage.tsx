'use client';

import { useEffect } from 'react';

import { detailPanelClass } from '@/components/detail-page/DetailPageChrome';
import { PageHeader } from '@/components/layout/PageHeader';
import { MainWrapper } from '@/components/styled';
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
  const { data: eventsRaw, isLoading: loading, error } = useSystemEvents(start, end);
  const events = eventsRaw ?? [];

  useEffect(() => {
    if (error) {
      reportError(error, 'fetch system events');
    }
  }, [error]);

  const title =
    round > 0
      ? `System Configuration Made Before Round ${round}`
      : 'System Configuration Made Before Deployment';

  return (
    <MainWrapper className="max-sm:pb-16">
      <div className="mx-auto max-w-6xl">
        <PageHeader
          title={title}
          subtitle={`Event log range ${start}–${end}`}
          breadcrumbs={[
            { label: 'Home', href: '/' },
            { label: 'Changed parameters', href: '/coordination-changes' },
            { label: round > 0 ? `Before round ${round}` : 'Deployment' },
          ]}
          className="mb-10 text-left sm:max-w-none [&_p]:mx-0 [&_p]:max-w-none"
          align="left"
        />

        {loading ? (
          <div className={cn(detailPanelClass, 'p-10 text-center')}>
            <p className="text-sm font-medium text-muted-foreground">Loading...</p>
          </div>
        ) : error ? (
          <div className={cn(detailPanelClass, 'p-10 text-center')}>
            <p className="text-lg font-semibold text-destructive">
              {error.message || 'Failed to load system events'}
            </p>
          </div>
        ) : (
          <div className={cn(detailPanelClass, 'overflow-x-auto p-2 sm:p-4')}>
            <AdminEventsTable list={events} />
          </div>
        )}
      </div>
    </MainWrapper>
  );
};

export default SystemEventPage;
