'use client';

import { useEffect, useState } from 'react';

import { MainWrapper } from '@/components/styled';
import api from '@/services/api';
import { AdminEventsTable, type AdminEventRow } from '@/components/tables/AdminEventsTable';

interface SystemEventPageProps {
  start: number;
  end: number;
  round: number;
}

const SystemEventPage = ({ start, end, round }: SystemEventPageProps) => {
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<AdminEventRow[]>([]);

  useEffect(() => {
    const fetchTransfers = async () => {
      try {
        setLoading(true);
        const sys_events = await api.get_system_events(start, end);
        setEvents(sys_events as AdminEventRow[]);
        setLoading(false);
      } catch {
        setLoading(false);
      }
    };
    fetchTransfers();
  }, [start, end]);

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
      ) : (
        <AdminEventsTable list={events} />
      )}
    </MainWrapper>
  );
};

export default SystemEventPage;
