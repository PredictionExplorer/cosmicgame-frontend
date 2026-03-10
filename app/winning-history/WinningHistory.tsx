'use client';

import { MainWrapper } from '@/components/styled';
import { useActiveWeb3React } from '@/hooks/web3';
import WinningHistoryTable from '@/components/tables/WinningHistoryTable';
import { useClaimHistoryByUser } from '@/hooks/useApiQuery';

function WinningHistory() {
  const { account } = useActiveWeb3React();
  const { data, isLoading: loading, error: queryError } = useClaimHistoryByUser(account);
  const winningHistory =
    (data as unknown as
      | import('@/components/tables/WinningHistoryTable').WinningHistoryEntry[]
      | null) ?? null;
  const error = queryError?.message ?? null;

  if (!account) {
    return (
      <MainWrapper>
        <h2 className="mb-8 text-center text-2xl font-bold text-primary">History of My Winnings</h2>
        <p className="text-base">Please login to Metamask to see your winnings.</p>
      </MainWrapper>
    );
  }

  return (
    <MainWrapper>
      <h2 className="mb-8 text-center text-2xl font-bold text-primary">History of My Winnings</h2>

      {loading ? (
        <p className="text-lg font-semibold">Loading...</p>
      ) : error ? (
        <p className="text-lg font-semibold text-destructive">{error}</p>
      ) : !winningHistory || winningHistory.length === 0 ? (
        <p className="text-base">You currently have no recorded winnings.</p>
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
