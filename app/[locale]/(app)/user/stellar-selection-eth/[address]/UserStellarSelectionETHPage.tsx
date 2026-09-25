'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';

import type { PageHeaderFigure } from '@/components/layout/PageHeader';
import { Amount } from '@/components/ui/amount';
import { Button } from '@/components/ui/button';
import { PageShell } from '@/components/ui/page-shell';
import { Skeleton } from '@/components/ui/skeleton';
import { TxStatus } from '@/components/ui/tx-status';
import { ChainGuard } from '@/components/wallet/NetworkGuard';
import {
  EthAllocationsTable,
  type EthAllocationRow,
} from '@/components/winnings/EthAllocationsTable';
import { StellarSelectionEmpty } from '@/components/winnings/StellarSelectionEmpty';
import {
  InvalidParticipantState,
  StellarSelectionHeader,
} from '@/components/winnings/StellarSelectionHeader';
import { participantAddress } from '@/components/winnings/participantAddress';
import { useStellarSelectionDepositsByUser } from '@/hooks/useApiQuery';
import { useClaimAllocations } from '@/hooks/useClaimAllocations';
import { useFormat } from '@/hooks/useFormat';
import { useTxStageLabel } from '@/hooks/useTxStageLabel';
import { useActiveWeb3React } from '@/hooks/web3';
import { RetrieveIcon } from '@/lib/conceptIcons';
import { toFiniteNumber } from '@/utils/finiteNumber';
import { sameAddress } from '@/utils/format';

/** The ETH total of rows, or `null` when an amount could not be read. */
function totalEth(rows: readonly EthAllocationRow[]): number | null {
  let total = 0;
  for (const row of rows) {
    const amount = toFiniteNumber(row.Amount);
    if (amount === null) return null;
    total += amount;
  }
  return total;
}

/**
 * A participant's Stellar Selection ETH: the total, how many allocations and
 * how much is still waiting, then every allocation with its cycle and
 * whether it was retrieved. On the connected wallet's own page, the ETH
 * still waiting can be retrieved from here, through the same retrieval as
 * My Allocations.
 */
const UserStellarSelectionETHPage = ({ address: rawAddress }: { address: string }) => {
  const t = useTranslations('statistics');
  const format = useFormat();
  const stageLabel = useTxStageLabel();
  const address = participantAddress(rawAddress);
  const { account } = useActiveWeb3React();

  const { data, isLoading, isError, refetch } = useStellarSelectionDepositsByUser(address);
  const { retrieveAllStellarSelectionETH, isClaiming, txStage } = useClaimAllocations(refetch);

  const rows = useMemo(() => (data ?? []) as EthAllocationRow[], [data]);
  const waiting = useMemo(() => rows.filter((row) => row.Claimed === false), [rows]);
  const total = totalEth(rows);
  const waitingTotal = totalEth(waiting);
  const isOwnPage = sameAddress(account, address);

  if (!address) {
    return (
      <PageShell variant="data" backdrop="signature">
        <InvalidParticipantState />
      </PageShell>
    );
  }

  const pending = <Skeleton className="h-7 w-24" />;
  const figures: PageHeaderFigure[] = [
    {
      id: 'total',
      label: t('stellarSelectionEth.figures.total'),
      value: isLoading ? pending : total === null ? null : <Amount value={total} unit="ETH" />,
    },
    {
      id: 'count',
      label: t('stellarSelectionEth.figures.count'),
      value: isLoading ? pending : format.count(rows.length),
    },
    {
      id: 'waiting',
      label: t('stellarSelectionEth.figures.waiting'),
      value: isLoading ? (
        pending
      ) : waitingTotal === null ? null : (
        <Amount value={waitingTotal} unit="ETH" />
      ),
    },
  ];

  const canRetrieve = isOwnPage && waiting.length > 0;
  const empty = !isLoading && !isError && rows.length === 0;

  return (
    <PageShell variant="data" backdrop="signature">
      <StellarSelectionHeader
        kind="eth"
        address={address}
        // Confirmed zeros for an address with nothing selected yet, so the header never
        // collapses (and moves the page) once the read arrives; a failed read has no figures.
        figures={isError ? undefined : figures}
        empty={empty}
        actions={
          canRetrieve ? (
            <ChainGuard requireConnection>
              <Button
                variant="commit"
                loading={isClaiming.raffleETH}
                onClick={() =>
                  void retrieveAllStellarSelectionETH(waiting.map((row) => row.RoundNum ?? -1))
                }
              >
                <RetrieveIcon aria-hidden className="size-4" />
                {(isClaiming.raffleETH && stageLabel(txStage)) || t('stellarSelectionEth.retrieve')}
              </Button>
            </ChainGuard>
          ) : null
        }
      >
        {canRetrieve ? <TxStatus stage={txStage} className="mt-4" /> : null}
      </StellarSelectionHeader>

      {empty ? (
        <StellarSelectionEmpty kind="eth" address={address} />
      ) : (
        <EthAllocationsTable
          rows={rows}
          ariaLabel={t('stellarSelectionEth.tableLabel')}
          showSource={false}
          showStatus
          loading={isLoading}
          error={isError ? t('stellarSelectionPages.errorMessage') : undefined}
          errorTitle={t('stellarSelectionEth.errorTitle')}
          onRetry={() => void refetch()}
          headingLevel={2}
        />
      )}
    </PageShell>
  );
};

export default UserStellarSelectionETHPage;
