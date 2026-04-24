'use client';

import { PageHeader } from '@/components/layout/PageHeader';
import { PageShell } from '@/components/ui/page-shell';
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
      <PageShell variant="data" backdrop="signature">
        <PageHeader
          title="Coordination Changes"
          subtitle="History of protocol parameter changes and admin events"
        />
        <p className="text-sm text-muted-foreground leading-relaxed mb-8 max-w-3xl">
          The Cosmic Signature protocol parameters can be adjusted by the contract owner during
          cycle activation windows. This log provides full transparency into every change, including
          Gesture Cost step-ups, time additions, and Anchor Distribution settings. Once ownership is
          renounced, all parameters become permanently immutable.
        </p>
        <p className="text-base font-medium">Please login to Metamask to see your allocations.</p>
      </PageShell>
    );
  }

  return (
    <PageShell variant="data" backdrop="signature">
      <PageHeader
        title="Changed Parameters"
        subtitle="History of system parameter changes and admin events"
      />
      <p className="text-sm text-muted-foreground leading-relaxed mb-8 max-w-3xl">
        The Cosmic Signature protocol parameters can be adjusted by the contract owner during cycle
        activation windows. This log provides full transparency into every change, including gesture
        cost increments, time additions, and allocation distributions. Once ownership is renounced,
        all parameters become permanently immutable.
      </p>
      {loading ? (
        <h6 className="text-lg font-semibold">Loading...</h6>
      ) : (
        <AdminEventsTable list={events as AdminEventRow[]} />
      )}
    </PageShell>
  );
}

export default ChangedParameters;
