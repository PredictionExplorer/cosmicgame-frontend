'use client';

import { Typography } from '@mui/material';

import { MainWrapper } from '@/components/styled';
import { useActiveWeb3React } from '@/hooks/web3';
import { useSystemModelist, useSystemEvents } from '@/hooks/useApiQuery';
import { AdminEventsTable, type AdminEventRow } from '@/components/tables/AdminEventsTable';

function ChangedParameters() {
  const { account } = useActiveWeb3React();

  const { data: modeList, isLoading: isLoadingModeList } = useSystemModelist();
  const startId = modeList != null ? ((modeList as { EvtLogId: number }[])[0]?.EvtLogId ?? 0) : -1;
  const { data: events = [], isLoading: isLoadingEvents } = useSystemEvents(startId, 9999999999);
  const loading = isLoadingModeList || isLoadingEvents;

  // Render if no wallet is connected
  if (!account) {
    return (
      <MainWrapper>
        <Typography variant="h4" color="primary" textAlign="center" mb={4}>
          Changed Parameters
        </Typography>
        <Typography variant="subtitle1">Please login to Metamask to see your winnings.</Typography>
      </MainWrapper>
    );
  }

  // Render main content
  return (
    <MainWrapper>
      <Typography variant="h4" color="primary" textAlign="center" mb={4}>
        Changed Parameters
      </Typography>

      {/* Show loading message or data table */}
      {loading ? (
        <Typography variant="h6">Loading...</Typography>
      ) : (
        <AdminEventsTable list={events as AdminEventRow[]} />
      )}
    </MainWrapper>
  );
}

export default ChangedParameters;
