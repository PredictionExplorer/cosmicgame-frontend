'use client';

import { MainWrapper } from '@/components/styled';
import { useActiveWeb3React } from '@/hooks/web3';
import WinningHistoryTable from '@/components/tables/WinningHistoryTable';
import { useClaimHistoryByUser } from '@/hooks/useApiQuery';
import { Spinner } from '@/components/ui/spinner';
import { ErrorState } from '@/components/ui/error-state';
import { EmptyState } from '@/components/ui/empty-state';
import { PageHeader } from '@/components/layout/PageHeader';

function WinningHistory() {
  const { account } = useActiveWeb3React();
  const { data, isLoading: loading, error: queryError } = useClaimHistoryByUser(account);
  const winningHistory = data ?? null;
  const error = queryError?.message ?? null;

  if (!account) {
    return (
      <MainWrapper>
        <PageHeader
          title="My Allocation History"
          subtitle="View your past allocation retrievals and distributions"
        />
        <p className="text-sm text-muted-foreground leading-relaxed mb-8 max-w-3xl">
          Track your complete allocation history across all Cosmic Signature Performance Cycles.
          This includes Signature Allocation retrievals, ETH Stellar Selection distributions, Cosmic
          Signature NFT allocations, and Anchor Distributions.
        </p>
        <EmptyState
          title="Wallet not connected"
          description="Please connect your wallet to see your allocation history."
        />
      </MainWrapper>
    );
  }

  return (
    <MainWrapper>
      <PageHeader
        title="History of My Winnings"
        subtitle="View your past prize claims and rewards"
      />
      <p className="text-sm text-muted-foreground leading-relaxed mb-8 max-w-3xl">
        Track your complete winning history across all Cosmic Signature game rounds. This includes
        main prize claims, raffle ETH winnings, NFT prizes, and staking reward distributions.
      </p>

      {loading ? (
        <div className="flex justify-center py-8">
          <Spinner />
        </div>
      ) : error ? (
        <ErrorState title="Failed to load allocation history" message={error} />
      ) : !winningHistory || winningHistory.length === 0 ? (
        <EmptyState
          title="No allocations yet"
          description="You currently have no recorded allocations."
        />
      ) : (
        <WinningHistoryTable
          winningHistory={winningHistory}
          showClaimedStatus={true}
          showWinnerAddr={false}
        />
      )}
    </MainWrapper>
  );
}

export default WinningHistory;
