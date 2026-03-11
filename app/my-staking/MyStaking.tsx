'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import Image from 'next/image';
import { usePublicClient } from 'wagmi';
import { useQueryClient } from '@tanstack/react-query';

import { MainWrapper } from '@/components/styled';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useActiveWeb3React } from '@/hooks/web3';
import {
  useDashboardInfo,
  useStakingCSTActionsByUser,
  useCSTTokensByUser,
  useStakingRewardsByUser,
  useStakingRWLKActionsByUser,
  useStakingRWLKMintsByUser,
} from '@/hooks/useApiQuery';
import useStakingWalletCSTContract from '@/hooks/useStakingWalletCSTContract';
import useStakingWalletRWLKContract from '@/hooks/useStakingWalletRWLKContract';
import useCosmicSignatureContract from '@/hooks/useCosmicSignatureContract';
import { STAKING_WALLET_CST_ADDRESS, STAKING_WALLET_RWLK_ADDRESS } from '@/config/networks';
import { useStakedToken } from '@/contexts/StakedTokenContext';
import useRWLKNFTContract from '@/hooks/useRWLKNFTContract';
import { useNotification } from '@/contexts/NotificationContext';
import { isUserRejection, reportError, getEthErrorMessage } from '@/utils/errors';
import { CSTStakingPanel } from '@/components/staking/CSTStakingPanel';
import { RWLKStakingPanel } from '@/components/staking/RWLKStakingPanel';
import getErrorMessage from '@/utils/alert';
import { Spinner } from '@/components/ui/spinner';
import { EmptyState } from '@/components/ui/empty-state';
import { PageHeader } from '@/components/layout/PageHeader';

const MyStaking = () => {
  const { account } = useActiveWeb3React();
  const { setNotification } = useNotification();
  const publicClient = usePublicClient();
  const queryClient = useQueryClient();

  const cosmicSignatureContract = useCosmicSignatureContract();
  const rwalkContract = useRWLKNFTContract();
  const cstStakingContract = useStakingWalletCSTContract();
  const rwlkStakingContract = useStakingWalletRWLKContract();

  const { data: dashboardData, isLoading: loadingDashboard } = useDashboardInfo();
  const { data: stakingCSTActions = [], isLoading: loadingCSTActions } =
    useStakingCSTActionsByUser(account);
  const { data: cstTokensRaw = [], isLoading: loadingCST } = useCSTTokensByUser(account);
  const { data: stakingRewards = [], isLoading: loadingRewards } = useStakingRewardsByUser(account);
  const { data: stakingRWLKActions = [], isLoading: loadingRWLK } =
    useStakingRWLKActionsByUser(account);
  const { data: rwlkMints = [], isLoading: loadingMints } = useStakingRWLKMintsByUser(account);

  const CSTokens = useMemo(() => cstTokensRaw.filter((x) => !x.WasUnstaked), [cstTokensRaw]);

  const rewardPerCST = useMemo(() => {
    const totalStakedCST = dashboardData?.MainStats?.StakeStatisticsCST?.TotalTokensStaked || 0;
    if (totalStakedCST > 0) {
      return (dashboardData?.StakingAmountEth ?? 0) / totalStakedCST;
    }
    return 0;
  }, [dashboardData]);

  const loading =
    loadingDashboard ||
    loadingCSTActions ||
    loadingCST ||
    loadingRewards ||
    loadingRWLK ||
    loadingMints;

  const [rwlkTokens, setRwlkTokens] = useState<number[]>([]);

  const {
    cstokens: stakedCSTokens,
    rwlktokens: stakedRWLKTokens,
    fetchData: fetchStakedTokens,
  } = useStakedToken();

  const handleError = useCallback(
    (err: unknown) => {
      if (!isUserRejection(err)) {
        reportError(err, 'staking error');
        const msg = getEthErrorMessage(err);
        if (msg !== 'An error occurred') {
          setNotification({ text: getErrorMessage(msg), type: 'error', visible: true });
        }
      }
    },
    [setNotification],
  );

  const approveIfNeeded = async (
    nftContract: NonNullable<typeof cosmicSignatureContract | typeof rwalkContract>,
    walletAddress: string,
  ) => {
    if (!nftContract) {
      throw new Error('Contract not initialized');
    }
    const isApprovedForAll = await nftContract.read.isApprovedForAll?.([account, walletAddress]);
    if (!isApprovedForAll) {
      const hash = await nftContract.write.setApprovalForAll?.([walletAddress, true]);
      if (hash) await publicClient?.waitForTransactionReceipt({ hash });
    }
  };

  const handleStakeAction = useCallback(
    async (tokenIds: number | number[], isRwalk: boolean) => {
      try {
        const nftContract = isRwalk ? rwalkContract : cosmicSignatureContract;
        const stakingContract = isRwalk ? rwlkStakingContract : cstStakingContract;
        const STAKING_WALLET_ADDRESS = isRwalk
          ? STAKING_WALLET_RWLK_ADDRESS
          : STAKING_WALLET_CST_ADDRESS;

        if (!nftContract || !stakingContract) {
          setNotification({
            visible: true,
            text: 'Please connect your wallet and ensure you are on the correct network.',
            type: 'error',
          });
          return;
        }

        await approveIfNeeded(nftContract, STAKING_WALLET_ADDRESS);

        let hash;
        if (Array.isArray(tokenIds)) {
          hash = await stakingContract.write.stakeMany?.([tokenIds]);
        } else {
          hash = await stakingContract.write.stake?.([tokenIds]);
        }
        const res = hash ? await publicClient?.waitForTransactionReceipt({ hash }) : undefined;

        setTimeout(async () => {
          queryClient.invalidateQueries({ queryKey: ['dashboardInfo'] });
          queryClient.invalidateQueries({ queryKey: ['stakingCSTActionsByUser'] });
          queryClient.invalidateQueries({ queryKey: ['cstTokensByUser'] });
          queryClient.invalidateQueries({ queryKey: ['stakingRewardsByUser'] });
          queryClient.invalidateQueries({ queryKey: ['stakingRWLKActionsByUser'] });
          queryClient.invalidateQueries({ queryKey: ['stakingRWLKMintsByUser'] });
          fetchStakedTokens();

          if (res) {
            setNotification({
              visible: true,
              type: 'success',
              text: Array.isArray(tokenIds)
                ? 'The selected tokens were staked successfully!'
                : `You have successfully staked token ${tokenIds}!`,
            });
          }
        }, 2000);

        return res;
      } catch (err) {
        handleError(err);
        return err;
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      account,
      handleError,
      rwalkContract,
      cosmicSignatureContract,
      rwlkStakingContract,
      cstStakingContract,
      setNotification,
    ],
  );

  const handleUnstakeAction = useCallback(
    async (actionIds: number | number[], isRwalk: boolean) => {
      try {
        const stakingContract = isRwalk ? rwlkStakingContract : cstStakingContract;

        if (!stakingContract) {
          setNotification({
            visible: true,
            text: 'Please connect your wallet and ensure you are on the correct network.',
            type: 'error',
          });
          return;
        }

        let hash;
        if (Array.isArray(actionIds)) {
          hash = await stakingContract.write.unstakeMany?.([actionIds]);
        } else {
          hash = await stakingContract.write.unstake?.([actionIds]);
        }
        const res = hash ? await publicClient?.waitForTransactionReceipt({ hash }) : undefined;

        setTimeout(async () => {
          queryClient.invalidateQueries({ queryKey: ['dashboardInfo'] });
          queryClient.invalidateQueries({ queryKey: ['stakingCSTActionsByUser'] });
          queryClient.invalidateQueries({ queryKey: ['cstTokensByUser'] });
          queryClient.invalidateQueries({ queryKey: ['stakingRewardsByUser'] });
          queryClient.invalidateQueries({ queryKey: ['stakingRWLKActionsByUser'] });
          queryClient.invalidateQueries({ queryKey: ['stakingRWLKMintsByUser'] });
          fetchStakedTokens();

          if (res) {
            setNotification({
              visible: true,
              type: 'success',
              text: Array.isArray(actionIds)
                ? 'The selected tokens were unstaked successfully!'
                : 'You have successfully unstaked token!',
            });
          }
        }, 2000);

        return res;
      } catch (err) {
        handleError(err);
        return err;
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [account, handleError, rwlkStakingContract, cstStakingContract, setNotification],
  );

  useEffect(() => {
    const fetchRWLKTokens = async () => {
      if (!account || !rwalkContract) return;
      try {
        const stakedIds = stakedRWLKTokens.map((x) => x.StakedTokenId);
        const userOwned = await rwalkContract.read.walletOfOwner?.([account]);
        const rawIds = (userOwned as readonly bigint[]).map((t) => Number(t)).sort();
        const filteredIds = rawIds.filter(
          (id) =>
            !stakedIds.includes(id) &&
            !stakingRWLKActions.some((action) => action.ActionType !== 1 && action.TokenId === id),
        );
        setRwlkTokens(filteredIds);
      } catch (err) {
        handleError(err);
      }
    };
    fetchRWLKTokens();
  }, [account, rwalkContract, stakedRWLKTokens, stakingRWLKActions, handleError]);

  return (
    <MainWrapper>
      <PageHeader title="My Staking" subtitle="Manage your staked tokens and view rewards" />

      {!account ? (
        <EmptyState
          title="Wallet not connected"
          description="Please connect your wallet to manage your staking."
        />
      ) : loading ? (
        <div className="flex justify-center py-8">
          <Spinner />
        </div>
      ) : (
        <>
          <div className="flex">
            <p className="text-base mr-2">Number of globally staked CST tokens:</p>
            <p className="text-base">
              {dashboardData?.MainStats?.StakeStatisticsCST?.TotalTokensStaked}
            </p>
          </div>
          <div className="flex">
            <p className="text-base mr-2">Number of globally staked RandomWalk tokens:</p>
            <p className="text-base">
              {dashboardData?.MainStats?.StakeStatisticsRWalk?.TotalTokensStaked}
            </p>
          </div>

          {rewardPerCST > 0 && (
            <div className="flex">
              <p className="text-base mr-2">Reward (as of now) for staking 1 CST token:</p>
              <p className="text-base">{rewardPerCST.toFixed(6)}</p>
            </div>
          )}

          <Tabs defaultValue="cst" className="mt-8">
            <TabsList className="w-full h-auto">
              <TabsTrigger value="cst" className="flex-1 py-3">
                <div className="flex items-center">
                  <Image
                    src="/images/CosmicSignatureNFT.png"
                    width={94}
                    height={60}
                    alt="cosmic signature nft"
                  />
                  <span className="text-lg font-semibold whitespace-nowrap normal-case ml-4">
                    Cosmic Signature Staking
                  </span>
                </div>
              </TabsTrigger>
              <TabsTrigger value="rwlk" className="flex-1 py-3">
                <div className="flex items-center">
                  <Image src="/images/rwalk.jpg" width={94} height={60} alt="RandomWalk nft" />
                  <span className="text-lg font-semibold whitespace-nowrap normal-case ml-4">
                    Random Walk Staking
                  </span>
                </div>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="cst" className="p-6">
              <CSTStakingPanel
                account={account}
                stakingActions={stakingCSTActions}
                userTokens={CSTokens}
                stakedTokens={stakedCSTokens}
                stakingRewards={stakingRewards}
                handleStake={(tokenId) => handleStakeAction(tokenId, false)}
                handleStakeMany={(tokenIds) => handleStakeAction(tokenIds, false)}
                handleUnstake={(actionId) => handleUnstakeAction(actionId, false)}
                handleUnstakeMany={(actionIds) => handleUnstakeAction(actionIds, false)}
              />
            </TabsContent>

            <TabsContent value="rwlk" className="p-6">
              <RWLKStakingPanel
                account={account}
                stakingActions={stakingRWLKActions}
                rwlkMints={rwlkMints}
                userTokens={rwlkTokens}
                stakedTokens={stakedRWLKTokens}
                handleStake={(tokenId) => handleStakeAction(tokenId, true)}
                handleStakeMany={(tokenIds) => handleStakeAction(tokenIds, true)}
                handleUnstake={(actionId) => handleUnstakeAction(actionId, true)}
                handleUnstakeMany={(actionIds) => handleUnstakeAction(actionIds, true)}
              />
            </TabsContent>
          </Tabs>
        </>
      )}
    </MainWrapper>
  );
};

export default MyStaking;
