'use client';

import { PageHeader } from '@/components/layout/PageHeader';
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

  if (!account) {
    return (
      <MainWrapper>
        <PageHeader
          title="Changed Parameters"
          subtitle="History of system parameter changes and admin events"
        />
        <p className="text-base font-medium">Please login to Metamask to see your winnings.</p>
      </MainWrapper>
    );
  }

  return (
    <MainWrapper>
      <PageHeader
        title="Changed Parameters"
        subtitle="History of system parameter changes and admin events"
      />
      {loading ? (
        <h6 className="text-lg font-semibold">Loading...</h6>
      ) : (
        <AdminEventsTable list={events as AdminEventRow[]} />
      )}
    </MainWrapper>
  );
}

export default ChangedParameters;
