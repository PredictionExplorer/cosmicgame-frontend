'use client';

import 'react-super-responsive-table/dist/SuperResponsiveTableStyle.css';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { getAddress, isAddress } from 'viem';
import { Tr } from 'react-super-responsive-table';

import { getExplorerUrl, convertTimestampToDateTime } from '@/utils';

import { useActiveWeb3React } from '@/hooks/web3';
import { useApiData } from '@/contexts/ApiDataContext';
import useStellarSelectionWalletContract from '@/hooks/useStellarSelectionWalletContract';
import { useNotification } from '@/contexts/NotificationContext';
import { useStellarSelectionDepositsByUser } from '@/hooks/useApiQuery';
import getErrorMessage from '@/utils/alert';
import {
  isUserRejection,
  reportError,
  getEthErrorMessage,
  WALLET_TRANSACTION_CANCELLED_MESSAGE,
} from '@/utils/errors';
import {
  TablePrimary,
  TablePrimaryCell,
  TablePrimaryContainer,
  TablePrimaryHead,
  TablePrimaryHeadCell,
  TablePrimaryRow,
} from '@/components/styled';
import { CustomPagination } from '@/components/common/CustomPagination';
import { Button } from '@/components/ui/button';
import { PageShell } from '@/components/ui/page-shell';
import { Spinner } from '@/components/ui/spinner';

interface StellarSelectionETHDeposit {
  EvtLogId: number;
  TxHash: string;
  TimeStamp: number;
  RoundNum: number;
  Amount: number;
}

const StellarSelectionAllocationsRow = ({ deposit }: { deposit: StellarSelectionETHDeposit }) => {
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

const StellarSelectionAllocationsTable = ({ list }: { list: StellarSelectionETHDeposit[] }) => {
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
              <StellarSelectionAllocationsRow key={deposit.EvtLogId} deposit={deposit} />
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

const UserStellarSelectionETHPage = ({ address: rawAddress }: { address: string }) => {
  const { account } = useActiveWeb3React();
  const { apiData: status, fetchData: fetchStatusData } = useApiData();
  const stellarSelectionWalletContract = useStellarSelectionWalletContract();
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
  } = useStellarSelectionDepositsByUser(invalidAddress ? null : validatedAddress);

  const stellarSelectionETHToRetrieve = useMemo(
    () => ({
      data: [...((depositsRaw as StellarSelectionETHDeposit[] | undefined) ?? [])].sort(
        (a, b) => b.TimeStamp - a.TimeStamp,
      ),
      loading: depositsLoading,
    }),
    [depositsRaw, depositsLoading],
  );

  const handleAllETHClaim = async () => {
    if (!stellarSelectionWalletContract) return;
    setIsClaiming(true);
    try {
      await stellarSelectionWalletContract.write.withdrawEth?.();
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
        reportError(err, 'retrieve stellar selection ETH');
        const rawMsg = getEthErrorMessage(err, 'An error occurred');
        const msg = getErrorMessage(rawMsg) || rawMsg;
        setNotification({ text: msg, type: 'error', visible: true });
      }
      setIsClaiming(false);
    }
  };

  if (invalidAddress) {
    return (
      <PageShell variant="data" backdrop="signature">
        <p className="text-lg font-semibold">Invalid Address</p>
      </PageShell>
    );
  }

  return (
    <PageShell variant="data" backdrop="signature">
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

        {stellarSelectionETHToRetrieve.loading ? (
          <div className="flex justify-center py-8">
            <Spinner />
          </div>
        ) : (
          <StellarSelectionAllocationsTable list={stellarSelectionETHToRetrieve.data} />
        )}
      </div>
    </PageShell>
  );
};

export default UserStellarSelectionETHPage;
