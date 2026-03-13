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
        <p className="text-sm text-muted-foreground leading-relaxed mb-8 max-w-3xl">
          The Cosmic Signature game parameters can be adjusted by the contract owner during round
          activation windows. This log provides full transparency into every change, including bid
          increments, time additions, and reward distributions. Once ownership is renounced, all
          parameters become permanently immutable.
        </p>
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
      <p className="text-sm text-muted-foreground leading-relaxed mb-8 max-w-3xl">
        The Cosmic Signature game parameters can be adjusted by the contract owner during round
        activation windows. This log provides full transparency into every change, including bid
        increments, time additions, and reward distributions. Once ownership is renounced, all
        parameters become permanently immutable.
      </p>
      {loading ? (
        <h6 className="text-lg font-semibold">Loading...</h6>
      ) : (
        <AdminEventsTable list={events as AdminEventRow[]} />
      )}
    </MainWrapper>
  );
}

export default ChangedParameters;
