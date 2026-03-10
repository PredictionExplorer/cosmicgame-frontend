'use client';

import { useEffect, useState } from 'react';
import { Typography } from '@mui/material';

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
      } catch (err) {
        setLoading(false);
      }
    };
    fetchTransfers();
  }, [start, end]);

  return (
    <MainWrapper>
      {round > 0 ? (
        <Typography variant="h4" color="primary" textAlign="center" mb={4} letterSpacing="1px">
          System Configuration Made Before Round {round}
        </Typography>
      ) : (
        <Typography variant="h4" color="primary" textAlign="center" mb={4} letterSpacing="1px">
          System Configuration Made Before Deployment
        </Typography>
      )}
      {loading ? (
        <Typography variant="h6">Loading...</Typography>
      ) : (
        <AdminEventsTable list={events} />
      )}
    </MainWrapper>
  );
};

export default SystemEventPage;
