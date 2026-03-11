'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { parseUnits } from 'viem';
import { Wallet, Trophy, Gift, Coins } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { MainWrapper } from '@/components/styled';
import { PageHeader } from '@/components/layout/PageHeader';
import { SectionDivider } from '@/components/ui/section-divider';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { Spinner } from '@/components/ui/spinner';
import { isUserRejection, reportError, getEthErrorMessage } from '@/utils/errors';
import { CustomPagination } from '@/components/common/CustomPagination';
import getErrorMessage from '@/utils/alert';
import { useActiveWeb3React } from '@/hooks/web3';
import useRaffleWalletContract from '@/hooks/useRaffleWalletContract';
import { useApiData } from '@/contexts/ApiDataContext';
import { useNotification } from '@/contexts/NotificationContext';
import {
  useUnclaimedDonatedNFTByUser,
  useUnclaimedRaffleDepositsByUser,
  useDonationsERC20ByUser,
} from '@/hooks/useApiQuery';
import DonatedNFTTable from '@/components/donations/DonatedNFTTable';
import { UncollectedCSTStakingRewardsTable } from '@/components/staking/UncollectedCSTStakingRewardsTable';
import DonatedERC20Table from '@/components/donations/DonatedERC20Table';
import { RaffleWinningsTable, type RaffleWinning } from '@/components/winnings/RaffleWinningsTable';

interface UnclaimedDonatedNFT {
  Index: number;
  RecordId: string | number;
  TxHash: string;
  TimeStamp: number;
  DonorAddr: string;
  RoundNum: number;
  TokenAddr: string;
  NFTTokenURI?: string;
  NFTTokenId?: number;
  TokenId?: number;
  [key: string]: unknown;
}

export default function MyWinnings() {
  const { account } = useActiveWeb3React();
  const { setNotification } = useNotification();
  const { apiData: status, fetchData: fetchStatusData } = useApiData();
  const router = useRouter();

  const {
    data: nftsRaw,
    isLoading: loadingNFTs,
    isError: nftError,
    refetch: refetchNFTs,
  } = useUnclaimedDonatedNFTByUser(account);
  const {
    data: raffleRaw,
    isLoading: loadingRaffle,
    isError: raffleError,
    refetch: refetchRaffle,
  } = useUnclaimedRaffleDepositsByUser(account);
  const {
    data: erc20Raw,
    isLoading: erc20Loading,
    refetch: refetchERC20,
  } = useDonationsERC20ByUser(account);

  const donatedNFTs = useMemo(
    () =>
      nftsRaw
        ? (nftsRaw as UnclaimedDonatedNFT[]).slice().sort((a, b) => a.TimeStamp - b.TimeStamp)
        : null,
    [nftsRaw],
  );
  const raffleETHWinnings = useMemo(
    () =>
      raffleRaw
        ? (raffleRaw as RaffleWinning[]).slice().sort((a, b) => b.TimeStamp - a.TimeStamp)
        : null,
    [raffleRaw],
  );
  const donatedERC20Data = (erc20Raw ??
    []) as import('@/components/donations/DonatedERC20Table').DonatedERC20Token[];

  const loading = loadingNFTs || loadingRaffle;
  const error = nftError || raffleError ? 'Failed to load unclaimed winnings data' : null;
  const refetch = () => {
    refetchNFTs();
    refetchRaffle();
  };

  const raffleWalletContract = useRaffleWalletContract();

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isClaiming, setIsClaiming] = useState({
    donatedNFT: false,
    raffleETH: false,
  });
  const [claimingDonatedNFTs, setClaimingDonatedNFTs] = useState<number[]>([]);
  const perPage = 5;

  const handleAllETHClaim = async () => {
    if (!raffleWalletContract) {
      setNotification({ text: 'Wallet not connected', type: 'error', visible: true });
      return;
    }
    setIsClaiming((prev) => ({ ...prev, raffleETH: true }));
    try {
      const roundNums = (raffleETHWinnings || []).filter((w) => !w.Claimed).map((w) => w.RoundNum);
      await raffleWalletContract.write.withdrawEverything?.([roundNums, [], []]);

      setTimeout(() => {
        fetchStatusData();
        refetch();
      }, 3000);
    } catch (err: unknown) {
      if (isUserRejection(err)) return;
      reportError(err, 'claim all raffle ETH');
      const rawMsg = getEthErrorMessage(err);
      if (rawMsg) {
        const msg = getErrorMessage(rawMsg) || rawMsg;
        setNotification({ text: msg, type: 'error', visible: true });
      }
    } finally {
      setIsClaiming((prev) => ({ ...prev, raffleETH: false }));
    }
  };

  const handleDonatedNFTsClaim = async (tokenID: number) => {
    if (!raffleWalletContract) {
      setNotification({ text: 'Wallet not connected', type: 'error', visible: true });
      return;
    }
    setClaimingDonatedNFTs((prev) => [...prev, tokenID]);
    try {
      await raffleWalletContract.write.claimDonatedNft?.([tokenID]);

      setTimeout(() => {
        fetchStatusData();
        refetch();
      }, 3000);
    } catch (err: unknown) {
      if (isUserRejection(err)) return;
      reportError(err, 'claim donated NFT');
      const rawMsg = getEthErrorMessage(err);
      if (rawMsg) {
        const msg = getErrorMessage(rawMsg) || rawMsg;
        setNotification({ text: msg, type: 'error', visible: true });
      }
    } finally {
      setClaimingDonatedNFTs((prev) => prev.filter((id) => id !== tokenID));
    }
  };

  const handleAllDonatedNFTsClaim = async () => {
    if (!raffleWalletContract) {
      setNotification({ text: 'Wallet not connected', type: 'error', visible: true });
      return;
    }
    if (!donatedNFTs) return;
    setIsClaiming((prev) => ({ ...prev, donatedNFT: true }));

    try {
      const indexList = donatedNFTs.map((item) => item.Index);
      await raffleWalletContract.write.claimManyDonatedNfts?.([indexList]);

      setTimeout(() => {
        fetchStatusData();
        refetch();
      }, 3000);
    } catch (err: unknown) {
      if (isUserRejection(err)) return;
      reportError(err, 'claim all donated NFTs');
      const rawMsg = getEthErrorMessage(err);
      if (rawMsg) {
        const msg = getErrorMessage(rawMsg) || rawMsg;
        setNotification({ text: msg, type: 'error', visible: true });
      }
    } finally {
      setIsClaiming((prev) => ({ ...prev, donatedNFT: false }));
    }
  };

  const handleDonatedERC20Claim = async (roundNum: number, tokenAddr: string, amount: string) => {
    try {
      await raffleWalletContract!.write.claimDonatedToken?.([
        roundNum,
        tokenAddr,
        parseUnits(amount.toString(), 18),
      ]);
      setTimeout(() => {
        refetchERC20();
      }, 3000);
    } catch (err: unknown) {
      if (isUserRejection(err)) return;
      reportError(err, 'claim donated ERC20 token');
      const rawMsg = getEthErrorMessage(err, 'An error occurred');
      const msg = getErrorMessage(rawMsg) || rawMsg;
      setNotification({ text: msg, type: 'error', visible: true });
    }
  };

  const handleAllDonatedERC20Claim = async () => {
    try {
      const donatedTokensToClaim = donatedERC20Data
        .filter((x) => !x.Claimed)
        .map((x) => ({
          roundNum: x.RoundNum,
          tokenAddress: x.TokenAddr,
          amount: x.AmountEth,
        }));
      await raffleWalletContract!.write.claimManyDonatedTokens?.([donatedTokensToClaim]);
      setTimeout(() => {
        refetchERC20();
      }, 3000);
    } catch (err: unknown) {
      if (isUserRejection(err)) return;
      reportError(err, 'claim all donated ERC20 tokens');
      const rawMsg = getEthErrorMessage(err, 'An error occurred');
      const msg = getErrorMessage(rawMsg) || rawMsg;
      setNotification({ text: msg, type: 'error', visible: true });
    }
  };

  if (!account) {
    return (
      <MainWrapper>
        <PageHeader title="My Rewards" />
        <EmptyState
          icon={<Wallet className="h-8 w-8 text-muted-foreground/50" />}
          title="Wallet not connected"
          description="Connect your wallet to view and claim your winnings."
        />
      </MainWrapper>
    );
  }

  if (error) {
    return (
      <MainWrapper>
        <PageHeader title="My Rewards" />
        <ErrorState title="Failed to load" message={error} onRetry={() => refetch()} />
      </MainWrapper>
    );
  }

  return (
    <MainWrapper>
      <PageHeader title="My Rewards" subtitle="View and claim all your pending winnings" />

      <div className="space-y-12">
        {/* ETH Rewards */}
        <section>
          <SectionDivider title="Claimable ETH Rewards" className="mb-6" />
          {loading && raffleETHWinnings === null ? (
            <div className="flex justify-center py-8">
              <Spinner />
            </div>
          ) : !raffleETHWinnings || raffleETHWinnings.length === 0 ? (
            <EmptyState
              icon={<Trophy className="h-8 w-8 text-muted-foreground/50" />}
              title="No ETH rewards yet"
              description="Win raffles by placing bids to earn ETH rewards."
            />
          ) : (
            <>
              <RaffleWinningsTable
                list={raffleETHWinnings.slice((currentPage - 1) * perPage, currentPage * perPage)}
              />
              {status?.ETHRaffleToClaim > 0 && (
                <div className="flex justify-end items-center mt-4 gap-4">
                  <p className="text-sm text-muted-foreground">
                    Claimable:{' '}
                    <span className="text-white font-medium">
                      {status.ETHRaffleToClaim.toFixed(6)} ETH
                    </span>
                  </p>
                  <Button onClick={handleAllETHClaim} disabled={isClaiming.raffleETH} size="sm">
                    {isClaiming.raffleETH ? (
                      <>
                        <Spinner size="sm" /> Claiming...
                      </>
                    ) : (
                      'Claim All'
                    )}
                  </Button>
                </div>
              )}
              <CustomPagination
                page={currentPage}
                setPage={setCurrentPage}
                totalLength={raffleETHWinnings.length}
                perPage={perPage}
              />
            </>
          )}
        </section>

        {/* CST Staking */}
        <section>
          <SectionDivider title="CST Staking Rewards" className="mb-6" />
          <UncollectedCSTStakingRewardsTable user={account} />
        </section>

        {/* Donated NFTs */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <SectionDivider title="Donated NFTs" className="flex-1" />
            {status?.NumDonatedNFTToClaim > 0 && (
              <Button
                onClick={handleAllDonatedNFTsClaim}
                disabled={isClaiming.donatedNFT}
                size="sm"
                className="ml-4"
              >
                {isClaiming.donatedNFT ? (
                  <>
                    <Spinner size="sm" /> Claiming...
                  </>
                ) : (
                  'Claim All'
                )}
              </Button>
            )}
          </div>
          {loading && donatedNFTs === null ? (
            <div className="flex justify-center py-8">
              <Spinner />
            </div>
          ) : !donatedNFTs || donatedNFTs.length === 0 ? (
            <EmptyState
              icon={<Gift className="h-8 w-8 text-muted-foreground/50" />}
              title="No donated NFTs"
              description="NFTs donated during bidding rounds will appear here."
            />
          ) : (
            <DonatedNFTTable
              list={donatedNFTs}
              handleClaim={handleDonatedNFTsClaim}
              claimingTokens={claimingDonatedNFTs}
            />
          )}
        </section>

        {/* Donated ERC20 */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <SectionDivider title="Donated ERC20 Tokens" className="flex-1" />
            {donatedERC20Data.filter((x) => !x.Claimed).length > 0 && (
              <Button onClick={handleAllDonatedERC20Claim} size="sm" className="ml-4">
                Claim All
              </Button>
            )}
          </div>
          {erc20Loading ? (
            <div className="flex justify-center py-8">
              <Spinner />
            </div>
          ) : donatedERC20Data.length === 0 ? (
            <EmptyState
              icon={<Coins className="h-8 w-8 text-muted-foreground/50" />}
              title="No donated tokens"
              description="ERC20 tokens donated during bidding rounds will appear here."
            />
          ) : (
            <DonatedERC20Table list={donatedERC20Data} handleClaim={handleDonatedERC20Claim} />
          )}
        </section>

        <div>
          <Button variant="outline" onClick={() => router.push('/winning-history')}>
            View Winning History
          </Button>
        </div>
      </div>
    </MainWrapper>
  );
}
