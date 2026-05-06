import 'react-super-responsive-table/dist/SuperResponsiveTableStyle.css';

import { useCallback, useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { usePublicClient } from 'wagmi';
import { Tbody, Tr } from 'react-super-responsive-table';

import { convertTimestampToDateTime } from '@/utils';

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
import {
  isUserRejection,
  reportError,
  getEthErrorMessage,
  WALLET_TRANSACTION_CANCELLED_MESSAGE,
} from '@/utils/errors';
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

const UncollectedRewardsRow = ({ row }: { row: CSTAnchorDistribution }) => {
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
      <TablePrimaryCell>{convertTimestampToDateTime(DepositTimeStamp)}</TablePrimaryCell>
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
      const hash = await cstAnchoringContract!.write.unstakeMany?.([cstWithRewards]);
      const res = hash ? await publicClient?.waitForTransactionReceipt({ hash }) : undefined;
      if (res) {
        setNotification({
          visible: true,
          text: 'The selected anchors were released successfully!',
          type: 'success',
        });
      }
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
          text: WALLET_TRANSACTION_CANCELLED_MESSAGE,
        });
      } else {
        reportError(err, 'unstaking CST');
        const msg = getEthErrorMessage(err);
        if (msg !== 'An error occurred') {
          setNotification({ visible: true, type: 'error', text: getErrorMessage(msg) });
        }
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
    return <p className="text-muted-foreground">Loading...</p>;
  }

  if (list.length === 0) {
    return <p className="text-muted-foreground">No distributions yet.</p>;
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
              <TablePrimaryHeadCell align="left">Deposit Datetime</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Deposit ID</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Anchored Tokens (You / Total)</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Unretrieved Tokens</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Deposit Amount (ETH)</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Distribution Amount (ETH)</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Unretrieved Amount (ETH)</TablePrimaryHeadCell>
            </Tr>
          </TablePrimaryHead>

          <Tbody>
            {currentPageData.map((row) => (
              <UncollectedRewardsRow key={row.EvtLogId} row={row} />
            ))}
          </Tbody>
        </TablePrimary>
      </TablePrimaryContainer>

      {isOwnAccount && (status?.UnretrievedAnchorDistribution ?? 0) > 0 && (
        <div className="flex justify-end items-center mt-4">
          <p className="mr-4">
            Your retrievable distributions are{' '}
            {`${(status?.UnretrievedAnchorDistribution ?? 0).toFixed(6)} ETH`}
          </p>
          <Button onClick={handleOpen} disabled={isUnstaking}>
            {isUnstaking ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Processing...
              </span>
            ) : (
              'Release & Retrieve All'
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
            <DialogTitle>Release Tokens &amp; Retrieve Distributions</DialogTitle>
            <DialogDescription>
              This will <strong>release all your anchored CST tokens</strong> and forward{' '}
              <strong>{(status?.UnretrievedAnchorDistribution ?? 0).toFixed(6)} ETH</strong> in
              accumulated distributions to your wallet.
            </DialogDescription>
          </DialogHeader>
          <Alert variant="warning">
            <AlertDescription>
              <strong>Permanent action:</strong> Once released, these tokens cannot be anchored
              again. Only proceed if you want to exit anchoring entirely.
            </AlertDescription>
          </Alert>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={releaseAllCST} disabled={isUnstaking}>
              {isUnstaking ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processing...
                </span>
              ) : (
                'Release & Retrieve'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
