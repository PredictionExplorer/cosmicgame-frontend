'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Tr, Tbody } from 'react-super-responsive-table';
import 'react-super-responsive-table/dist/SuperResponsiveTableStyle.css';
import { parseUnits } from 'viem';

import { getExplorerUrl, convertTimestampToDateTime, formatSeconds, shortenHex } from '@/utils';

import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  MainWrapper,
  TablePrimary,
  TablePrimaryCell,
  TablePrimaryContainer,
  TablePrimaryHead,
  TablePrimaryHeadCell,
  TablePrimaryRow,
} from '@/components/styled';
import { isUserRejection, reportError, getEthErrorMessage } from '@/utils/errors';
import { CustomPagination } from '@/components/common/CustomPagination';
import getErrorMessage from '@/utils/alert';
import { useActiveWeb3React } from '@/hooks/web3';
import useRaffleWalletContract from '@/hooks/useRaffleWalletContract';
import { useApiData } from '@/contexts/ApiDataContext';
import { useNotification } from '@/contexts/NotificationContext';
import api from '@/services/api';
import DonatedNFTTable from '@/components/donations/DonatedNFTTable';
import { UncollectedCSTStakingRewardsTable } from '@/components/staking/UncollectedCSTStakingRewardsTable';
import DonatedERC20Table from '@/components/donations/DonatedERC20Table';

/* ------------------------------------------------------------------
  Types
------------------------------------------------------------------ */
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

interface RaffleWinning {
  EvtLogId: number;
  TxHash: string;
  TimeStamp: number;
  RoundNum: number;
  Amount: number;
  WinnerAddr: string;
  Claimed: boolean;
}

/* ------------------------------------------------------------------
  Custom Hook: useUnclaimedWinnings
------------------------------------------------------------------ */
function useUnclaimedWinnings(account: string | null | undefined) {
  const [donatedNFTs, setDonatedNFTs] = useState<UnclaimedDonatedNFT[] | null>(null);
  const [raffleETHWinnings, setRaffleETHWinnings] = useState<RaffleWinning[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUnclaimedData = async () => {
    setLoading(true);
    setError(null);

    try {
      const [nfts, deposits] = await Promise.all([
        api.get_unclaimed_donated_nft_by_user(account!),
        api.get_unclaimed_raffle_deposits_by_user(account!),
      ]);
      setDonatedNFTs(
        (nfts as UnclaimedDonatedNFT[]).slice().sort((a, b) => a.TimeStamp - b.TimeStamp),
      );
      setRaffleETHWinnings(
        (deposits as RaffleWinning[]).slice().sort((a, b) => b.TimeStamp - a.TimeStamp),
      );
    } catch (err) {
      reportError(err, 'fetch unclaimed winnings');
      setError('Failed to load unclaimed winnings data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (account) {
      fetchUnclaimedData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account]);

  return {
    donatedNFTs,
    raffleETHWinnings,
    loading,
    error,
    refetch: fetchUnclaimedData,
  };
}

/* ------------------------------------------------------------------
  Sub-Components
------------------------------------------------------------------ */

function RaffleWinningRow({
  winning,
  roundTimeout,
}: {
  winning: RaffleWinning;
  roundTimeout: number;
}) {
  const { TxHash, TimeStamp, RoundNum, Amount, WinnerAddr, Claimed } = winning;

  if (!winning) return <TablePrimaryRow />;

  /* eslint-disable react-hooks/purity */
  const isExpired = roundTimeout > 0 && roundTimeout < Date.now() / 1000;

  return (
    <TablePrimaryRow>
      <TablePrimaryCell>
        <a
          className="text-inherit text-[inherit]"
          href={getExplorerUrl('tx', TxHash)}
          target="_blank"
          rel="noreferrer"
        >
          {convertTimestampToDateTime(TimeStamp)}
        </a>
      </TablePrimaryCell>
      <TablePrimaryCell align="center">
        <Link href={`/prize/${RoundNum}`} className="text-inherit text-[inherit]" target="_blank">
          {RoundNum}
        </Link>
      </TablePrimaryCell>
      <TablePrimaryCell align="center">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link href={`/user/${WinnerAddr}`} className="text-inherit text-[inherit]">
                {shortenHex(WinnerAddr, 6)}
              </Link>
            </TooltipTrigger>
            <TooltipContent>{WinnerAddr}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </TablePrimaryCell>
      <TablePrimaryCell align="center">
        {roundTimeout ? (
          <>
            {convertTimestampToDateTime(roundTimeout)}{' '}
            {isExpired
              ? '(Expired)'
              : `(${formatSeconds(roundTimeout - Math.ceil(Date.now() / 1000))})`}
          </>
        ) : (
          ' '
        )}
      </TablePrimaryCell>
      <TablePrimaryCell align="center">{Amount.toFixed(7)}</TablePrimaryCell>
      <TablePrimaryCell align="center">{Claimed ? 'Yes' : 'No'}</TablePrimaryCell>
    </TablePrimaryRow>
  );
  /* eslint-enable react-hooks/purity */
}

function RaffleWinningsTable({ list }: { list: RaffleWinning[] }) {
  const raffleWalletContract = useRaffleWalletContract();
  const [roundTimeouts, setRoundTimeouts] = useState<Record<number, number>>({});

  useEffect(() => {
    if (!raffleWalletContract || list.length === 0) return;

    const uniqueRounds = Array.from(new Set(list.map((w) => w.RoundNum)));

    const fetchTimeouts = async () => {
      const results = await Promise.allSettled(
        uniqueRounds.map((r) => raffleWalletContract.read.roundTimeoutTimesToWithdrawPrizes?.([r])),
      );
      const map: Record<number, number> = {};
      results.forEach((res, i) => {
        if (res.status === 'fulfilled') {
          map[uniqueRounds[i]!] = Number(res.value);
        }
      });
      setRoundTimeouts(map);
    };

    fetchTimeouts();
  }, [raffleWalletContract, list]);

  return (
    <TablePrimaryContainer>
      <TablePrimary>
        <TablePrimaryHead>
          <Tr>
            <TablePrimaryHeadCell align="left">Datetime</TablePrimaryHeadCell>
            <TablePrimaryHeadCell>Round</TablePrimaryHeadCell>
            <TablePrimaryHeadCell>Winner</TablePrimaryHeadCell>
            <TablePrimaryHeadCell>Expiration Date</TablePrimaryHeadCell>
            <TablePrimaryHeadCell>Amount (ETH)</TablePrimaryHeadCell>
            <TablePrimaryHeadCell>Claimed</TablePrimaryHeadCell>
          </Tr>
        </TablePrimaryHead>
        <Tbody>
          {list.map((winning) => (
            <RaffleWinningRow
              key={winning.EvtLogId}
              winning={winning}
              roundTimeout={roundTimeouts[winning.RoundNum] ?? 0}
            />
          ))}
        </Tbody>
      </TablePrimary>
    </TablePrimaryContainer>
  );
}

/* ------------------------------------------------------------------
  Main Component: MyWinnings
------------------------------------------------------------------ */
export default function MyWinnings() {
  const { account } = useActiveWeb3React();
  const { setNotification } = useNotification();
  const { apiData: status, fetchData: fetchStatusData } = useApiData();
  const router = useRouter();

  const { donatedNFTs, raffleETHWinnings, loading, error, refetch } = useUnclaimedWinnings(account);
  const raffleWalletContract = useRaffleWalletContract();

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isClaiming, setIsClaiming] = useState({
    donatedNFT: false,
    raffleETH: false,
  });
  const [claimingDonatedNFTs, setClaimingDonatedNFTs] = useState<number[]>([]);
  const [donatedERC20Tokens, setDonatedERC20Tokens] = useState<{
    data: import('@/components/donations/DonatedERC20Table').DonatedERC20Token[];
    loading: boolean;
  }>({
    data: [],
    loading: false,
  });
  const perPage = 5;

  /* ------------------------------------------------------------------
    Handlers
  ------------------------------------------------------------------ */

  const fetchDonatedERC20Tokens = async (reload = true) => {
    if (!account) return;
    setDonatedERC20Tokens((prev) => ({ ...prev, loading: reload }));
    try {
      const donatedERC20Tokens = await api.get_donations_erc20_by_user(account!);
      setDonatedERC20Tokens({
        data: donatedERC20Tokens as import('@/components/donations/DonatedERC20Table').DonatedERC20Token[],
        loading: false,
      });
    } catch (err) {
      reportError(err, 'fetch donated ERC20 tokens');
      setNotification({
        text: 'Failed to fetch donated NFTs',
        type: 'error',
        visible: true,
      });
      setDonatedERC20Tokens((prev) => ({ ...prev, loading: false }));
    }
  };

  useEffect(() => {
    fetchDonatedERC20Tokens();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account]);

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
        fetchDonatedERC20Tokens(false);
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
      const donatedTokensToClaim = donatedERC20Tokens.data
        .filter((x) => !x.Claimed)
        .map((x) => ({
          roundNum: x.RoundNum,
          tokenAddress: x.TokenAddr,
          amount: x.AmountEth,
        }));
      await raffleWalletContract!.write.claimManyDonatedTokens?.([donatedTokensToClaim]);
      setTimeout(() => {
        fetchDonatedERC20Tokens(false);
      }, 3000);
    } catch (err: unknown) {
      if (isUserRejection(err)) return;
      reportError(err, 'claim all donated ERC20 tokens');
      const rawMsg = getEthErrorMessage(err, 'An error occurred');
      const msg = getErrorMessage(rawMsg) || rawMsg;
      setNotification({ text: msg, type: 'error', visible: true });
    }
  };

  /* ------------------------------------------------------------------
    Render
  ------------------------------------------------------------------ */

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

      {/* Raffle ETH Section */}
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

      {/* CST Staking Rewards Section */}
      <div className="mt-12">
        <h5 className="text-xl font-bold mb-4">Claimable CST Staking Rewards</h5>
        <UncollectedCSTStakingRewardsTable user={account} />
      </div>

      {/* Donated NFTs Section */}
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

      {/* Donated ERC20 Section */}
      <div className="mt-16">
        <div className="flex justify-between items-center mb-4">
          <h5 className="text-xl font-bold">Donated ERC20 Tokens</h5>
          {donatedERC20Tokens.data.filter((x) => !x.Claimed).length > 0 && (
            <Button onClick={handleAllDonatedERC20Claim}>Claim All</Button>
          )}
        </div>

        {donatedERC20Tokens.loading ? (
          <h6 className="text-lg font-semibold">Loading...</h6>
        ) : (
          <DonatedERC20Table list={donatedERC20Tokens.data} handleClaim={handleDonatedERC20Claim} />
        )}
      </div>

      {/* Bottom Link Section */}
      <div className="mt-12">
        <Button variant="outline" onClick={() => router.push('/winning-history')}>
          Go to my winning history page.
        </Button>
      </div>
    </MainWrapper>
  );
}
