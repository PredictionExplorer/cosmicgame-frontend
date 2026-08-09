'use client';

import { useMemo, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { getAddress, isAddress } from 'viem';
import { usePublicClient } from 'wagmi';

import { getExplorerUrl } from '@/utils';

import { Link } from '@/i18n/navigation';
import { HydrationSafeDateTime } from '@/components/common/HydrationSafeDateTime';
import { useActiveWeb3React } from '@/hooks/web3';
import { useApiData } from '@/contexts/ApiDataContext';
import useStellarSelectionWalletContract from '@/hooks/useStellarSelectionWalletContract';
import { useNotification } from '@/contexts/NotificationContext';
import { useStellarSelectionDepositsByUser } from '@/hooks/useApiQuery';
import getErrorMessage from '@/utils/alert';
import { isUserRejection, reportError, getEthErrorMessage } from '@/utils/errors';
import {
  TablePrimary,
  TablePrimaryBody,
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
import { assertSuccessfulTransactionReceipt } from '@/utils/transactions';

interface StellarSelectionETHDeposit {
  EvtLogId: number;
  TxHash: string;
  TimeStamp: number;
  RoundNum: number;
  Amount: number;
}

const StellarSelectionAllocationsRow = ({ deposit }: { deposit: StellarSelectionETHDeposit }) => {
  const t = useTranslations('tables');
  const locale = useLocale();
  if (!deposit) return <TablePrimaryRow />;

  const { TxHash, TimeStamp, RoundNum, Amount } = deposit;
  return (
    <TablePrimaryRow>
      <TablePrimaryCell label={t('columns.date')}>
        <a
          className="text-inherit"
          href={getExplorerUrl('tx', TxHash)}
          target="_blank"
          rel="noopener noreferrer"
        >
          <HydrationSafeDateTime timestamp={TimeStamp} locale={locale} />
        </a>
      </TablePrimaryCell>
      <TablePrimaryCell label={t('columns.cycle')} align="center">
        <Link
          href={`/allocation/${RoundNum}`}
          className="text-inherit"
          target="_blank"
          rel="noopener noreferrer"
        >
          {RoundNum}
        </Link>
      </TablePrimaryCell>
      <TablePrimaryCell label={t('columns.amountEth')} align="right">
        {Amount.toFixed(4)}
      </TablePrimaryCell>
    </TablePrimaryRow>
  );
};

const StellarSelectionAllocationsTable = ({ list }: { list: StellarSelectionETHDeposit[] }) => {
  const t = useTranslations('tables');
  const tStatistics = useTranslations('statistics');
  const PER_PAGE = 10;
  const [currentPage, setCurrentPage] = useState(1);

  if (list.length === 0) {
    return <p>{tStatistics('stellarSelectionEth.empty')}</p>;
  }

  const startIndex = (currentPage - 1) * PER_PAGE;
  const endIndex = currentPage * PER_PAGE;
  const currentPageItems = list.slice(startIndex, endIndex);

  return (
    <>
      <TablePrimaryContainer>
        <TablePrimary>
          <TablePrimaryHead>
            <tr>
              <TablePrimaryHeadCell align="left">{t('columns.date')}</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>{t('columns.cycle')}</TablePrimaryHeadCell>
              <TablePrimaryHeadCell align="right">{t('columns.amountEth')}</TablePrimaryHeadCell>
            </tr>
          </TablePrimaryHead>
          <TablePrimaryBody>
            {currentPageItems.map((deposit) => (
              <StellarSelectionAllocationsRow key={deposit.EvtLogId} deposit={deposit} />
            ))}
          </TablePrimaryBody>
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
  const t = useTranslations('toasts');
  const tStatistics = useTranslations('statistics');
  const locale = useLocale();
  const { account } = useActiveWeb3React();
  const { apiData: status, fetchData: fetchStatusData } = useApiData();
  const stellarSelectionWalletContract = useStellarSelectionWalletContract();
  const publicClient = usePublicClient();
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
    if (!stellarSelectionWalletContract) {
      setNotification({
        text: t('claim.walletNotConnected'),
        type: 'error',
        visible: true,
      });
      return;
    }
    setIsClaiming(true);
    try {
      const hash = await stellarSelectionWalletContract.write.withdrawEth?.();
      if (!hash) throw new Error('Stellar Selection ETH retrieval returned no transaction hash.');
      const receipt = await publicClient?.waitForTransactionReceipt({ hash });
      assertSuccessfulTransactionReceipt(receipt);
      setNotification({
        text: t('claim.stellarEthSuccess'),
        type: 'success',
        visible: true,
      });
      setTimeout(() => {
        fetchStatusData();
        refetchDeposits();
        setIsClaiming(false);
      }, 2000);
    } catch (err: unknown) {
      if (isUserRejection(err)) {
        setNotification({
          text: t('walletTransactionCancelled'),
          type: 'info',
          visible: true,
        });
      } else {
        reportError(err, 'retrieve stellar selection ETH');
        const rawMsg = getEthErrorMessage(err, t('claim.failed'), { locale });
        const msg = getErrorMessage(rawMsg) || rawMsg;
        setNotification({ text: msg, type: 'error', visible: true });
      }
      setIsClaiming(false);
    }
  };

  if (invalidAddress) {
    return (
      <PageShell variant="data" backdrop="signature">
        <p className="text-lg font-semibold">{tStatistics('stellarSelectionEth.invalidAddress')}</p>
      </PageShell>
    );
  }

  return (
    <PageShell variant="data" backdrop="signature">
      <div className="mb-8">
        <span className="mr-4 text-lg font-semibold text-primary">
          {tStatistics('stellarSelectionEth.user')}
        </span>
        <span className="font-mono text-lg font-semibold">{validatedAddress}</span>
      </div>

      <div className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <h4 className="text-lg font-semibold leading-none">
            {tStatistics('stellarSelectionEth.heading')}
          </h4>

          {status?.ETHRaffleToClaim > 0 && account === validatedAddress && (
            <div className="flex items-center gap-4">
              <span className="mr-4">
                {tStatistics('stellarSelectionEth.retrievable', {
                  amount: status.ETHRaffleToClaim.toFixed(6),
                })}
              </span>
              <Button onClick={handleAllETHClaim} disabled={isClaiming}>
                {isClaiming
                  ? t('claim.retrieving')
                  : tStatistics('stellarSelectionEth.retrieveAll')}
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
