'use client';

import 'react-super-responsive-table/dist/SuperResponsiveTableStyle.css';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { getAddress, isAddress } from 'viem';
import { Tr } from 'react-super-responsive-table';

import { getExplorerUrl, convertTimestampToDateTime } from '@/utils';

import { useActiveWeb3React } from '@/hooks/web3';
import { useApiData } from '@/contexts/ApiDataContext';
import useRaffleWalletContract from '@/hooks/useRaffleWalletContract';
import { useNotification } from '@/contexts/NotificationContext';
import { useRaffleDepositsByUser } from '@/hooks/useApiQuery';
import getErrorMessage from '@/utils/alert';
import {
  isUserRejection,
  reportError,
  getEthErrorMessage,
  WALLET_TRANSACTION_CANCELLED_MESSAGE,
} from '@/utils/errors';
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
import { Spinner } from '@/components/ui/spinner';

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
        <Link
          href={`/allocation/${RoundNum}`}
          className="text-inherit"
          target="_blank"
          rel="noopener noreferrer"
        >
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
    return <p>No Stellar Selection ETH yet.</p>;
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
              <TablePrimaryHeadCell>Cycle</TablePrimaryHeadCell>
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

const UserRaffleETHPage = ({ address: rawAddress }: { address: string }) => {
  const { account } = useActiveWeb3React();
  const { apiData: status, fetchData: fetchStatusData } = useApiData();
  const raffleWalletContract = useRaffleWalletContract();
  const { setNotification } = useNotification();

  const validatedAddress =
    rawAddress && isAddress(rawAddress.toLowerCase())
      ? getAddress(rawAddress.toLowerCase())
      : 'Invalid Address';

  const invalidAddress = !validatedAddress || validatedAddress === 'Invalid Address';
  const [isClaiming, setIsClaiming] = useState(false);

  const {
    data: depositsRaw,
    isLoading: depositsLoading,
    refetch: refetchDeposits,
  } = useRaffleDepositsByUser(invalidAddress ? null : validatedAddress);

  const raffleETHToClaim = useMemo(
    () => ({
      data: [...((depositsRaw as RaffleETHDeposit[] | undefined) ?? [])].sort(
        (a, b) => b.TimeStamp - a.TimeStamp,
      ),
      loading: depositsLoading,
    }),
    [depositsRaw, depositsLoading],
  );

  const handleAllETHClaim = async () => {
    if (!raffleWalletContract) return;
    setIsClaiming(true);
    try {
      await raffleWalletContract.write.withdrawEth?.();
      setTimeout(() => {
        fetchStatusData();
        refetchDeposits();
        setIsClaiming(false);
      }, 2000);
    } catch (err: unknown) {
      if (isUserRejection(err)) {
        setNotification({
          text: WALLET_TRANSACTION_CANCELLED_MESSAGE,
          type: 'info',
          visible: true,
        });
      } else {
        reportError(err, 'claim raffle ETH');
        const rawMsg = getEthErrorMessage(err, 'An error occurred');
        const msg = getErrorMessage(rawMsg) || rawMsg;
        setNotification({ text: msg, type: 'error', visible: true });
      }
      setIsClaiming(false);
    }
  };

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
          <h4 className="text-lg font-semibold leading-none">
            Stellar Selection ETH allocated to this participant
          </h4>

          {status?.ETHRaffleToClaim > 0 && account === validatedAddress && (
            <div className="flex items-center gap-4">
              <span className="mr-4">
                Your retrievable allocations are {status.ETHRaffleToClaim.toFixed(6)} ETH
              </span>
              <Button onClick={handleAllETHClaim} disabled={isClaiming}>
                Retrieve All
              </Button>
            </div>
          )}
        </div>

        {raffleETHToClaim.loading ? (
          <div className="flex justify-center py-8">
            <Spinner />
          </div>
        ) : (
          <RaffleWinningsTable list={raffleETHToClaim.data} />
        )}
      </div>
    </MainWrapper>
  );
};

export default UserRaffleETHPage;
