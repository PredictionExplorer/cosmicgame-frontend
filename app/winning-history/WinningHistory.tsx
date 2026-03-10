'use client';

import { Typography } from '@mui/material';

import { MainWrapper } from '@/components/styled';
import { useActiveWeb3React } from '@/hooks/web3';
import WinningHistoryTable from '@/components/tables/WinningHistoryTable';
import { useClaimHistoryByUser } from '@/hooks/useApiQuery';

/* ------------------------------------------------------------------
  Main Component: WinningHistory
------------------------------------------------------------------ */
function WinningHistory() {
  const { account } = useActiveWeb3React();
  const { data, isLoading: loading, error: queryError } = useClaimHistoryByUser(account);
  const winningHistory =
    (data as unknown as
      | import('@/components/tables/WinningHistoryTable').WinningHistoryEntry[]
      | null) ?? null;
  const error = queryError?.message ?? null;

  // If user is not connected
  if (!account) {
    return (
      <MainWrapper>
        <Typography variant="h4" color="primary" textAlign="center" mb={4}>
          History of My Winnings
        </Typography>
        <Typography variant="subtitle1">Please login to Metamask to see your winnings.</Typography>
      </MainWrapper>
    );
  }

  return (
    <MainWrapper>
      <Typography variant="h4" color="primary" textAlign="center" mb={4}>
        History of My Winnings
      </Typography>

      {loading ? (
        <Typography variant="h6">Loading...</Typography>
      ) : error ? (
        <Typography variant="h6" color="error">
          {error}
        </Typography>
      ) : !winningHistory || winningHistory.length === 0 ? (
        <Typography variant="subtitle1">You currently have no recorded winnings.</Typography>
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
