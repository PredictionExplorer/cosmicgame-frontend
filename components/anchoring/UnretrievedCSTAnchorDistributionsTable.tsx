import 'react-super-responsive-table/dist/SuperResponsiveTableStyle.css';

import { useCallback, useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Loader2 } from 'lucide-react';
import { usePublicClient } from 'wagmi';
import { Tbody, Tr } from 'react-super-responsive-table';

import { HydrationSafeDateTime } from '@/components/common/HydrationSafeDateTime';
import {
  TablePrimary,
  TablePrimaryCell,
  TablePrimaryContainer,
  TablePrimaryHead,
  TablePrimaryHeadCell,
  TablePrimaryRow,
} from '@/components/styled';
import { CustomPagination } from '@/components/common/CustomPagination';
import { useActiveWeb3React } from '@/hooks/web3';
import api from '@/services/api';
import useAnchoringWalletCSTContract from '@/hooks/useAnchoringWalletCSTContract';
import { useNotification } from '@/contexts/NotificationContext';
import { useApiData } from '@/contexts/ApiDataContext';
import getErrorMessage from '@/utils/alert';
import { isUserRejection, reportError, getEthErrorMessage } from '@/utils/errors';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { CSTAnchorDistribution } from '@/services/api';
import { assertSuccessfulTransactionReceipt, assertTransactionHash } from '@/utils/transactions';

const UncollectedRewardsRow = ({ row, locale }: { row: CSTAnchorDistribution; locale: string }) => {
  if (!row) return <TablePrimaryRow />;

  const {
    DepositTimeStamp = 0,
    DepositId,
    YourTokensStaked,
    NumStakedNFTs,
    NumUnclaimedTokens,
    DepositAmountEth,
    YourRewardAmountEth,
    PendingToClaimEth,
  } = row;

  return (
    <TablePrimaryRow>
      <TablePrimaryCell>
        <HydrationSafeDateTime timestamp={DepositTimeStamp} locale={locale} />
      </TablePrimaryCell>
      <TablePrimaryCell align="center">{DepositId}</TablePrimaryCell>
      <TablePrimaryCell align="center">{`${YourTokensStaked} / ${NumStakedNFTs}`}</TablePrimaryCell>
      <TablePrimaryCell align="center">{NumUnclaimedTokens}</TablePrimaryCell>
      <TablePrimaryCell align="center">{(DepositAmountEth ?? 0).toFixed(6)}</TablePrimaryCell>
      <TablePrimaryCell align="center">{(YourRewardAmountEth ?? 0).toFixed(6)}</TablePrimaryCell>
      <TablePrimaryCell align="center">{(PendingToClaimEth ?? 0).toFixed(6)}</TablePrimaryCell>
    </TablePrimaryRow>
  );
};

export const UnretrievedCSTAnchorDistributionsTable = ({ user }: { user: string }) => {
  const t = useTranslations('anchoring');
  const toastT = useTranslations('toasts');
  const locale = useLocale();
  const { account } = useActiveWeb3React();
  const {
    apiData: status,
    fetchData: refetchApiData,
    unclaimedRewards: contextRewards,
  } = useApiData();

  const isOwnAccount = user?.toLowerCase() === account?.toLowerCase();

  const [localList, setLocalList] = useState<CSTAnchorDistribution[] | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isUnstaking, setIsUnstaking] = useState(false);
  const [cstWithRewards, setCstWithRewards] = useState<number[]>([]);
  const cstAnchoringContract = useAnchoringWalletCSTContract();
  const publicClient = usePublicClient();
  const { setNotification } = useNotification();

  const PER_PAGE = 5;
  const [open, setOpen] = useState<boolean>(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const startIndex = (currentPage - 1) * PER_PAGE;
  const endIndex = currentPage * PER_PAGE;

  const fetchCstWithRewards = useCallback(async () => {
    try {
      const res = await api.get_staking_cst_by_user_by_deposit_rewards(user);
      const lastEntry = res?.[res.length - 1] as
        | { Actions?: { Claimed?: boolean; Stake: { ActionId: number } }[] }
        | undefined;
      const actions = lastEntry?.Actions?.filter((x) => !x.Claimed) ?? [];
      const actionIds = actions.map((x) => x.Stake.ActionId);
      setCstWithRewards(actionIds);
    } catch (err) {
      reportError(err, 'fetch CST with rewards');
    }
  }, [user]);

  const fetchUnretrievedCstAnchorDistributions = useCallback(async () => {
    try {
      const res = await api.get_staking_cst_rewards_to_claim_by_user(user);
      setLocalList(res);
    } catch (err) {
      reportError(err, 'fetch uncollected CST anchor distributions');
    }
  }, [user]);

  const releaseAllCST = async () => {
    handleClose();
    setIsUnstaking(true);
    try {
      if (!cstAnchoringContract) {
        setNotification({
          visible: true,
          text: toastT('wallet.connectCorrectNetwork'),
          type: 'error',
        });
        return;
      }
      const hash = await cstAnchoringContract.write.unstakeMany?.([cstWithRewards]);
      assertTransactionHash(hash);
      const res = await publicClient?.waitForTransactionReceipt({ hash });
      assertSuccessfulTransactionReceipt(res);
      setNotification({
        visible: true,
        text: toastT('anchor.releasedWithDistributions', { count: cstWithRewards.length }),
        type: 'success',
      });
      setTimeout(() => {
        if (isOwnAccount) {
          refetchApiData();
        } else {
          fetchUnretrievedCstAnchorDistributions();
        }
        fetchCstWithRewards();
      }, 4000);
    } catch (err: unknown) {
      if (isUserRejection(err)) {
        setNotification({
          visible: true,
          type: 'info',
          text: toastT('walletTransactionCancelled'),
        });
      } else {
        reportError(err, 'releasing Cosmic Signature NFT anchors');
        const msg = getEthErrorMessage(err, toastT('anchor.failed'), { locale });
        setNotification({
          visible: true,
          type: 'error',
          text: getErrorMessage(msg) || msg,
        });
      }
    } finally {
      setIsUnstaking(false);
    }
  };

  useEffect(() => {
    if (!isOwnAccount) {
      // The first fetcher updates local state from an async API response.
      // Migrating to React Query is a separate refactor; this is a data-
      // fetch effect.
      fetchUnretrievedCstAnchorDistributions();
    }
    fetchCstWithRewards();
  }, [user, isOwnAccount, fetchUnretrievedCstAnchorDistributions, fetchCstWithRewards]);

  const list = isOwnAccount ? contextRewards : localList;

  if (list === null) {
    return <p className="text-muted-foreground">{t('common.loading')}</p>;
  }

  if (list.length === 0) {
    return <p className="text-muted-foreground">{t('common.empty.distributions')}</p>;
  }

  const currentPageData = list.slice(startIndex, endIndex);

  return (
    <>
      <TablePrimaryContainer>
        <TablePrimary>
          <colgroup>
            <col width="15%" />
            <col width="10%" />
            <col width="15%" />
            <col width="15%" />
            <col width="15%" />
            <col width="15%" />
            <col width="25%" />
          </colgroup>

          <TablePrimaryHead>
            <Tr>
              <TablePrimaryHeadCell align="left">
                {t('tables.unretrievedDistributions.columns.depositDatetime')}
              </TablePrimaryHeadCell>
              <TablePrimaryHeadCell>
                {t('tables.unretrievedDistributions.columns.depositId')}
              </TablePrimaryHeadCell>
              <TablePrimaryHeadCell>
                {t('tables.unretrievedDistributions.columns.anchoredTokens')}
              </TablePrimaryHeadCell>
              <TablePrimaryHeadCell>
                {t('tables.unretrievedDistributions.columns.unretrievedTokens')}
              </TablePrimaryHeadCell>
              <TablePrimaryHeadCell>
                {t('tables.unretrievedDistributions.columns.depositAmountEth')}
              </TablePrimaryHeadCell>
              <TablePrimaryHeadCell>
                {t('tables.unretrievedDistributions.columns.distributionAmountEth')}
              </TablePrimaryHeadCell>
              <TablePrimaryHeadCell>
                {t('tables.unretrievedDistributions.columns.unretrievedAmountEth')}
              </TablePrimaryHeadCell>
            </Tr>
          </TablePrimaryHead>

          <Tbody>
            {currentPageData.map((row) => (
              <UncollectedRewardsRow key={row.EvtLogId} row={row} locale={locale} />
            ))}
          </Tbody>
        </TablePrimary>
      </TablePrimaryContainer>

      {isOwnAccount && (status?.UnretrievedAnchorDistribution ?? 0) > 0 && (
        <div className="flex justify-end items-center mt-4">
          <p className="mr-4">
            {t('tables.unretrievedDistributions.summary', {
              amount: (status?.UnretrievedAnchorDistribution ?? 0).toFixed(6),
            })}
          </p>
          <Button onClick={handleOpen} disabled={isUnstaking}>
            {isUnstaking ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                {t('common.processing')}
              </span>
            ) : (
              t('tables.unretrievedDistributions.releaseAll')
            )}
          </Button>
        </div>
      )}

      <CustomPagination
        page={currentPage}
        setPage={setCurrentPage}
        totalLength={list.length}
        perPage={PER_PAGE}
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t('tables.unretrievedDistributions.dialog.title')}</DialogTitle>
            <DialogDescription>
              {t.rich('tables.unretrievedDistributions.dialog.description', {
                amount: (status?.UnretrievedAnchorDistribution ?? 0).toFixed(6),
                strong: (chunks) => <strong>{chunks}</strong>,
                amountStrong: (chunks) => <strong>{chunks}</strong>,
              })}
            </DialogDescription>
          </DialogHeader>
          <Alert variant="warning">
            <AlertDescription>
              {t.rich('tables.unretrievedDistributions.dialog.warning', {
                strong: (chunks) => <strong>{chunks}</strong>,
              })}
            </AlertDescription>
          </Alert>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={handleClose}>
              {t('common.actions.cancel')}
            </Button>
            <Button variant="destructive" onClick={releaseAllCST} disabled={isUnstaking}>
              {isUnstaking ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t('common.processing')}
                </span>
              ) : (
                t('tables.unretrievedDistributions.dialog.confirm')
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
