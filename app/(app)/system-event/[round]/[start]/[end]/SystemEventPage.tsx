'use client';

import { useEffect } from 'react';

import { MainWrapper } from '@/components/styled';
import { useSystemEvents } from '@/hooks/useApiQuery';
import { AdminEventsTable } from '@/components/tables/AdminEventsTable';
import { reportError } from '@/utils/errors';

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

  return (
    <MainWrapper>
      {round > 0 ? (
        <h2 className="mb-8 text-center text-2xl font-bold tracking-wide text-primary">
          System Configuration Made Before Round {round}
        </h2>
      ) : (
        <h2 className="mb-8 text-center text-2xl font-bold tracking-wide text-primary">
          System Configuration Made Before Deployment
        </h2>
      )}
      {loading ? (
        <p className="text-lg font-semibold">Loading...</p>
      ) : error ? (
        <p className="text-lg font-semibold text-destructive">
          {error.message || 'Failed to load system events'}
        </p>
      ) : (
        <AdminEventsTable list={events} />
      )}
    </MainWrapper>
  );
};

export default SystemEventPage;
