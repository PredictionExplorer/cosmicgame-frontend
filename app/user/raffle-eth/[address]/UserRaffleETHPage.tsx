'use client';

import 'react-super-responsive-table/dist/SuperResponsiveTableStyle.css';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getAddress, isAddress } from 'viem';
import { Tr } from 'react-super-responsive-table';

import { getExplorerUrl, convertTimestampToDateTime } from '@/utils';

import { useActiveWeb3React } from '@/hooks/web3';
import { useApiData } from '@/contexts/ApiDataContext';
import useRaffleWalletContract from '@/hooks/useRaffleWalletContract';
import { useNotification } from '@/contexts/NotificationContext';
import api from '@/services/api';
import getErrorMessage from '@/utils/alert';
import { isUserRejection, reportError, getEthErrorMessage } from '@/utils/errors';
import {
  MainWrapper,
  TablePrimary,
  TablePrimaryCell,
  TablePrimaryContainer,
  TablePrimaryHead,
  TablePrimaryHeadCell,
  TablePrimaryRow,
} from '@/components/styled';
import { CustomPagination } from '@/components/common/CustomPagination';
import { Button } from '@/components/ui/button';

interface RaffleETHDeposit {
  EvtLogId: number;
  TxHash: string;
  TimeStamp: number;
  RoundNum: number;
  Amount: number;
}

const RaffleWinningsRow = ({ deposit }: { deposit: RaffleETHDeposit }) => {
  if (!deposit) return <TablePrimaryRow />;

  const { TxHash, TimeStamp, RoundNum, Amount } = deposit;
  return (
    <TablePrimaryRow>
      <TablePrimaryCell>
        <a
          className="text-inherit"
          href={getExplorerUrl('tx', TxHash)}
          target="_blank"
          rel="noopener noreferrer"
        >
          {convertTimestampToDateTime(TimeStamp)}
        </a>
      </TablePrimaryCell>
      <TablePrimaryCell align="center">
        <Link href={`/prize/${RoundNum}`} className="text-inherit" target="_blank">
          {RoundNum}
        </Link>
      </TablePrimaryCell>
      <TablePrimaryCell align="right">{Amount.toFixed(4)}</TablePrimaryCell>
    </TablePrimaryRow>
  );
};

const RaffleWinningsTable = ({ list }: { list: RaffleETHDeposit[] }) => {
  const PER_PAGE = 10;
  const [currentPage, setCurrentPage] = useState(1);

  if (list.length === 0) {
    return <p>No Raffle ETH yet.</p>;
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
          <tbody>
            {currentPageItems.map((deposit) => (
              <RaffleWinningsRow key={deposit.EvtLogId} deposit={deposit} />
            ))}
          </tbody>
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

const UserRaffleETHPage = ({ address: rawAddress }: { address: string }) => {
  const { account } = useActiveWeb3React();
  const { apiData: status, fetchData: fetchStatusData } = useApiData();
  const raffleWalletContract = useRaffleWalletContract();
  const { setNotification } = useNotification();

  const validatedAddress =
    rawAddress && isAddress(rawAddress.toLowerCase())
      ? getAddress(rawAddress.toLowerCase())
      : 'Invalid Address';

  const [invalidAddress, setInvalidAddress] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);

  const { raffleETHToClaim, fetchRaffleETHDeposits } = useRaffleETHDeposits(validatedAddress);

  const handleAllETHClaim = async () => {
    try {
      setIsClaiming(true);
      await raffleWalletContract!.write.withdrawEth?.();

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

  useEffect(() => {
    if (!validatedAddress || validatedAddress === 'Invalid Address') {
      setInvalidAddress(true);
      return;
    }
    fetchRaffleETHDeposits();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [validatedAddress]);

  if (invalidAddress) {
    return (
      <MainWrapper>
        <p className="text-lg font-semibold">Invalid Address</p>
      </MainWrapper>
    );
  }

  return (
    <MainWrapper>
      <div className="mb-8">
        <span className="mr-4 text-lg font-semibold text-primary">User</span>
        <span className="font-mono text-lg font-semibold">{validatedAddress}</span>
      </div>

      <div className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <h4 className="text-lg font-semibold leading-none">Raffle ETH User Won</h4>

          {status?.ETHRaffleToClaim > 0 && account === validatedAddress && (
            <div className="flex items-center gap-4">
              <span className="mr-4">
                Your claimable winnings are {status.ETHRaffleToClaim.toFixed(6)} ETH
              </span>
              <Button onClick={handleAllETHClaim} disabled={isClaiming}>
                Claim All
              </Button>
            </div>
          )}
        </div>

        {raffleETHToClaim.loading ? (
          <p className="text-lg font-semibold">Loading...</p>
        ) : (
          <RaffleWinningsTable list={raffleETHToClaim.data} />
        )}
      </div>
    </MainWrapper>
  );
};

export default UserRaffleETHPage;
