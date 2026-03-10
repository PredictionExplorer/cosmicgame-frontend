'use client';

import { useState, useEffect } from 'react';
import { Box, Button, Link, TableBody, Typography } from '@mui/material';
import { getAddress, isAddress } from 'viem';
import { Tr } from 'react-super-responsive-table';

import { useActiveWeb3React } from '@/hooks/web3';
import { useApiData } from '@/contexts/ApiDataContext';
import useRaffleWalletContract from '@/hooks/useRaffleWalletContract';
import { useNotification } from '@/contexts/NotificationContext';
import api from '@/services/api';
import getErrorMessage from '@/utils/alert';
import { isUserRejection, reportError, getEthErrorMessage } from '@/utils/errors';
import { getExplorerUrl, convertTimestampToDateTime } from '@/utils';
import {
  MainWrapper,
  TablePrimary,
  TablePrimaryCell,
  TablePrimaryContainer,
  TablePrimaryHead,
  TablePrimaryHeadCell,
  TablePrimaryRow,
} from '@/components/styled';
import 'react-super-responsive-table/dist/SuperResponsiveTableStyle.css';

import { CustomPagination } from '@/components/common/CustomPagination';

/* ------------------------------------------------------------------
  Types
------------------------------------------------------------------ */
interface RaffleETHDeposit {
  EvtLogId: number;
  TxHash: string;
  TimeStamp: number;
  RoundNum: number;
  Amount: number;
}

/* ------------------------------------------------------------------
  Sub-Components
------------------------------------------------------------------ */

/** Renders a single row (Raffle ETH deposit record) */
const RaffleWinningsRow = ({ deposit }: { deposit: RaffleETHDeposit }) => {
  if (!deposit) return <TablePrimaryRow />;

  const { TxHash, TimeStamp, RoundNum, Amount } = deposit;
  return (
    <TablePrimaryRow>
      <TablePrimaryCell>
        <Link
          color="inherit"
          fontSize="inherit"
          href={getExplorerUrl('tx', TxHash)}
          target="_blank"
        >
          {convertTimestampToDateTime(TimeStamp)}
        </Link>
      </TablePrimaryCell>
      <TablePrimaryCell align="center">
        <Link
          href={`/prize/${RoundNum}`}
          style={{ color: 'inherit', fontSize: 'inherit' }}
          target="_blank"
        >
          {RoundNum}
        </Link>
      </TablePrimaryCell>
      <TablePrimaryCell align="right">{Amount.toFixed(4)}</TablePrimaryCell>
    </TablePrimaryRow>
  );
};

/** Renders the full table of Raffle ETH deposits (with pagination) */
const RaffleWinningsTable = ({ list }: { list: RaffleETHDeposit[] }) => {
  const PER_PAGE = 10;
  const [currentPage, setCurrentPage] = useState(1);

  if (list.length === 0) {
    return <Typography>No Raffle ETH yet.</Typography>;
  }

  const startIndex = (currentPage - 1) * PER_PAGE;
  const endIndex = currentPage * PER_PAGE;
  const currentPageItems = list.slice(startIndex, endIndex);

  return (
    <>
      <TablePrimaryContainer>
        <TablePrimary>
          <TablePrimaryHead>
            <Tr>
              <TablePrimaryHeadCell align="left">Date</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Round</TablePrimaryHeadCell>
              <TablePrimaryHeadCell align="right">Amount (ETH)</TablePrimaryHeadCell>
            </Tr>
          </TablePrimaryHead>
          <TableBody>
            {currentPageItems.map((deposit) => (
              <RaffleWinningsRow key={deposit.EvtLogId} deposit={deposit} />
            ))}
          </TableBody>
        </TablePrimary>
      </TablePrimaryContainer>

      <CustomPagination
        page={currentPage}
        setPage={setCurrentPage}
        totalLength={list.length}
        perPage={PER_PAGE}
      />
    </>
  );
};

/* ------------------------------------------------------------------
  Custom Hook: useRaffleETHDeposits
  Fetches and sorts a user's Raffle ETH deposits
------------------------------------------------------------------ */
function useRaffleETHDeposits(address: string) {
  const [raffleETHToClaim, setRaffleETHToClaim] = useState<{
    data: RaffleETHDeposit[];
    loading: boolean;
  }>({
    data: [],
    loading: false,
  });

  const fetchRaffleETHDeposits = async (reload = true) => {
    setRaffleETHToClaim((prev) => ({ ...prev, loading: reload }));
    try {
      const deposits = await api.get_raffle_deposits_by_user(address);
      const sorted = (deposits as RaffleETHDeposit[]).sort(
        (a: RaffleETHDeposit, b: RaffleETHDeposit) => b.TimeStamp - a.TimeStamp,
      );
      setRaffleETHToClaim({ data: sorted, loading: false });
    } catch (err) {
      reportError(err, 'fetch Raffle ETH deposits');
      setRaffleETHToClaim({ data: [], loading: false });
    }
  };

  return { raffleETHToClaim, fetchRaffleETHDeposits };
}

/* ------------------------------------------------------------------
  Main Component: UserRaffleETHPage
------------------------------------------------------------------ */
const UserRaffleETHPage = ({ address: rawAddress }: { address: string }) => {
  const { account } = useActiveWeb3React();
  const { apiData: status, fetchData: fetchStatusData } = useApiData();
  const raffleWalletContract = useRaffleWalletContract();
  const { setNotification } = useNotification();

  // Validate and normalize address
  const validatedAddress =
    rawAddress && isAddress(rawAddress.toLowerCase())
      ? getAddress(rawAddress.toLowerCase())
      : 'Invalid Address';

  // Data state
  const [invalidAddress, setInvalidAddress] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);

  // Custom Hook for fetching user deposits
  const { raffleETHToClaim, fetchRaffleETHDeposits } = useRaffleETHDeposits(validatedAddress);

  // Handler: Claim all user Raffle ETH
  const handleAllETHClaim = async () => {
    try {
      setIsClaiming(true);
      await raffleWalletContract!.write.withdrawEth?.();

      // Refresh data & statuses after short delay
      setTimeout(() => {
        fetchStatusData();
        fetchRaffleETHDeposits(false);
        setIsClaiming(false);
      }, 2000);
    } catch (err: unknown) {
      if (!isUserRejection(err)) {
        reportError(err, 'claim raffle ETH');
        const msg = getEthErrorMessage(err);
        if (msg !== 'An error occurred') {
          setNotification({ text: getErrorMessage(msg), type: 'error', visible: true });
        }
      }
      setIsClaiming(false);
    }
  };

  // Fetch data on mount if address is valid
  useEffect(() => {
    if (!validatedAddress || validatedAddress === 'Invalid Address') {
      setInvalidAddress(true);
      return;
    }
    fetchRaffleETHDeposits();
  }, [validatedAddress]);

  // If invalid address
  if (invalidAddress) {
    return (
      <MainWrapper>
        <Typography variant="h6">Invalid Address</Typography>
      </MainWrapper>
    );
  }

  return (
    <MainWrapper>
      <Box mb={4}>
        <Typography variant="h6" color="primary" component="span" mr={2}>
          User
        </Typography>
        <Typography variant="h6" component="span" fontFamily="monospace">
          {validatedAddress}
        </Typography>
      </Box>

      {/* Raffle ETH Section */}
      <Box mt={4}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            mb: 2,
          }}
        >
          <Typography variant="h6" lineHeight={1}>
            Raffle ETH User Won
          </Typography>

          {/* Show "Claim All" only if user matches & has ETH to claim */}
          {status?.ETHRaffleToClaim > 0 && account === validatedAddress && (
            <Box>
              <Typography component="span" mr={2}>
                Your claimable winnings are {status.ETHRaffleToClaim.toFixed(6)} ETH
              </Typography>
              <Button onClick={handleAllETHClaim} variant="contained" disabled={isClaiming}>
                Claim All
              </Button>
            </Box>
          )}
        </Box>

        {raffleETHToClaim.loading ? (
          <Typography variant="h6">Loading...</Typography>
        ) : (
          <RaffleWinningsTable list={raffleETHToClaim.data} />
        )}
      </Box>
    </MainWrapper>
  );
};

export default UserRaffleETHPage;
