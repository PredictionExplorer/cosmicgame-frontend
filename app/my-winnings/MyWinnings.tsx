'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { parseUnits } from 'viem';

import { Button } from '@/components/ui/button';
import { MainWrapper } from '@/components/styled';
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
        <h4 className="text-2xl font-bold text-primary text-center mb-2">Pending Winnings</h4>
        <p className="text-base mt-8">Please login to Metamask to see your winnings.</p>
      </MainWrapper>
    );
  }

  if (error) {
    return (
      <MainWrapper>
        <h4 className="text-2xl font-bold text-destructive text-center mb-2">
          Something went wrong!
        </h4>
        <p className="text-base text-destructive">{error}</p>
      </MainWrapper>
    );
  }

  return (
    <MainWrapper>
      <h4 className="text-2xl font-bold text-primary text-center mb-2">Pending Winnings</h4>

      <div className="mt-12">
        <h5 className="text-xl font-bold mb-4">Claimable ETH Rewards</h5>
        {loading && raffleETHWinnings === null ? (
          <p>Loading...</p>
        ) : !raffleETHWinnings || raffleETHWinnings.length === 0 ? (
          <p>No winnings yet.</p>
        ) : (
          <>
            <RaffleWinningsTable
              list={raffleETHWinnings.slice((currentPage - 1) * perPage, currentPage * perPage)}
            />
            {status?.ETHRaffleToClaim > 0 && (
              <div className="flex justify-end items-center mt-4">
                <p className="mr-4">
                  Your claimable winnings are {`${status.ETHRaffleToClaim.toFixed(6)} ETH`}
                </p>
                <Button onClick={handleAllETHClaim} disabled={isClaiming.raffleETH}>
                  Claim All
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
      </div>

      <div className="mt-12">
        <h5 className="text-xl font-bold mb-4">Claimable CST Staking Rewards</h5>
        <UncollectedCSTStakingRewardsTable user={account} />
      </div>

      <div className="mt-16">
        <div className="flex justify-between mb-4">
          <h5 className="text-xl font-bold">Donated NFTs</h5>
          {status?.NumDonatedNFTToClaim > 0 && (
            <Button onClick={handleAllDonatedNFTsClaim} disabled={isClaiming.donatedNFT}>
              Claim All
            </Button>
          )}
        </div>
        {loading && donatedNFTs === null ? (
          <p>Loading...</p>
        ) : !donatedNFTs || donatedNFTs.length === 0 ? (
          <p>No NFTs yet.</p>
        ) : (
          <DonatedNFTTable
            list={donatedNFTs}
            handleClaim={handleDonatedNFTsClaim}
            claimingTokens={claimingDonatedNFTs}
          />
        )}
      </div>

      <div className="mt-16">
        <div className="flex justify-between items-center mb-4">
          <h5 className="text-xl font-bold">Donated ERC20 Tokens</h5>
          {donatedERC20Data.filter((x) => !x.Claimed).length > 0 && (
            <Button onClick={handleAllDonatedERC20Claim}>Claim All</Button>
          )}
        </div>
        {erc20Loading ? (
          <h6 className="text-lg font-semibold">Loading...</h6>
        ) : (
          <DonatedERC20Table list={donatedERC20Data} handleClaim={handleDonatedERC20Claim} />
        )}
      </div>

      <div className="mt-12">
        <Button variant="outline" onClick={() => router.push('/winning-history')}>
          Go to my winning history page.
        </Button>
      </div>
    </MainWrapper>
  );
}
