import React, { useState, useEffect } from 'react';
import { Box, Button, Link, TableBody, Tooltip, Typography } from '@mui/material';
import router from 'next/router';
import { Tr } from 'react-super-responsive-table';
import 'react-super-responsive-table/dist/SuperResponsiveTableStyle.css';
import { GetServerSideProps } from 'next';

// Styled & Utilities
import { parseUnits } from 'viem';

import {
  MainWrapper,
  TablePrimary,
  TablePrimaryCell,
  TablePrimaryContainer,
  TablePrimaryHead,
  TablePrimaryHeadCell,
  TablePrimaryRow,
} from '../components/styled';
import {
  getExplorerUrl,
  convertTimestampToDateTime,
  formatSeconds,
  logoImgUrl,
  shortenHex,
} from '../utils';
import { CustomPagination } from '../components/common/CustomPagination';
import getErrorMessage from '../utils/alert';

// Hooks & Context
import { useActiveWeb3React } from '../hooks/web3';
import useRaffleWalletContract from '../hooks/useRaffleWalletContract';
import { useApiData } from '../contexts/ApiDataContext';
import { useNotification } from '../contexts/NotificationContext';

// Services
import api from '../services/api';

// Components
import DonatedNFTTable from '../components/donations/DonatedNFTTable';
import { UncollectedCSTStakingRewardsTable } from '../components/staking/UncollectedCSTStakingRewardsTable';
import DonatedERC20Table from '../components/donations/DonatedERC20Table';

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
      // Sort data for consistency
      setDonatedNFTs(
        (nfts as UnclaimedDonatedNFT[]).slice().sort((a, b) => a.TimeStamp - b.TimeStamp),
      );
      setRaffleETHWinnings(
        (deposits as RaffleWinning[]).slice().sort((a, b) => b.TimeStamp - a.TimeStamp),
      );
    } catch (err) {
      console.error('Error fetching unclaimed data:', err);
      setError('Failed to load unclaimed winnings data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (account) {
      fetchUnclaimedData();
    }
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

/** Table Row for a single raffle winning — receives pre-fetched timeout */
function RaffleWinningRow({
  winning,
  roundTimeout,
}: {
  winning: RaffleWinning;
  roundTimeout: number;
}) {
  const { TxHash, TimeStamp, RoundNum, Amount, WinnerAddr, Claimed } = winning;

  if (!winning) return <TablePrimaryRow />;

  const isExpired = roundTimeout > 0 && roundTimeout < Date.now() / 1000;

  return (
    <TablePrimaryRow>
      <TablePrimaryCell>
        <Link
          color="inherit"
          fontSize="inherit"
          href={getExplorerUrl('tx', TxHash)}
          target="_blank"
        >
          {convertTimestampToDateTime(TimeStamp)}
        </Link>
      </TablePrimaryCell>
      <TablePrimaryCell align="center">
        <Link
          href={`/prize/${RoundNum}`}
          style={{ color: 'inherit', fontSize: 'inherit' }}
          target="_blank"
        >
          {RoundNum}
        </Link>
      </TablePrimaryCell>
      <TablePrimaryCell align="center">
        <Tooltip title={WinnerAddr}>
          <Link href={`/user/${WinnerAddr}`} style={{ color: 'inherit', fontSize: 'inherit' }}>
            {shortenHex(WinnerAddr, 6)}
          </Link>
        </Tooltip>
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
}

/** Table layout for raffle winnings — fetches round timeouts once per unique round */
function RaffleWinningsTable({ list }: { list: RaffleWinning[] }) {
  const raffleWalletContract = useRaffleWalletContract();
  // Map of roundNum → timeout timestamp, fetched once per unique round
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
        <TableBody>
          {list.map((winning) => (
            <RaffleWinningRow
              key={winning.EvtLogId}
              winning={winning}
              roundTimeout={roundTimeouts[winning.RoundNum] ?? 0}
            />
          ))}
        </TableBody>
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

  const { donatedNFTs, raffleETHWinnings, loading, error, refetch } = useUnclaimedWinnings(account);
  // Smart contract hooks
  const raffleWalletContract = useRaffleWalletContract();

  // Local UI states
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isClaiming, setIsClaiming] = useState({
    donatedNFT: false,
    raffleETH: false,
  });
  const [claimingDonatedNFTs, setClaimingDonatedNFTs] = useState<number[]>([]);
  const [donatedERC20Tokens, setDonatedERC20Tokens] = useState<{
    data: import('../components/donations/DonatedERC20Table').DonatedERC20Token[];
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
        data: donatedERC20Tokens as import('../components/donations/DonatedERC20Table').DonatedERC20Token[],
        loading: false,
      });
    } catch (err) {
      console.error(err);
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
  }, [account]);

  // Claim all ETH from raffle contract
  const handleAllETHClaim = async () => {
    if (!raffleWalletContract) {
      setNotification({ text: 'Wallet not connected', type: 'error', visible: true });
      return;
    }
    setIsClaiming((prev) => ({ ...prev, raffleETH: true }));
    try {
      const roundNums = (raffleETHWinnings || []).filter((w) => !w.Claimed).map((w) => w.RoundNum);
      // Use direct method name — JSON ABI doesn't need string signature notation
      await raffleWalletContract.write.withdrawEverything?.([roundNums, [], []]);

      // Refresh status and unclaimed data after short delay
      setTimeout(() => {
        fetchStatusData();
        refetch();
      }, 3000);
    } catch (err: unknown) {
      console.error(err);
      const ethErr = err as { data?: { message?: string } };
      if (ethErr?.data?.message) {
        const msg = getErrorMessage(ethErr.data.message);
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
      console.error(err);
      const ethErr = err as { data?: { message?: string } };
      if (ethErr?.data?.message) {
        const msg = getErrorMessage(ethErr.data.message);
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
      console.error(err);
      const ethErr = err as { data?: { message?: string } };
      if (ethErr?.data?.message) {
        const msg = getErrorMessage(ethErr.data.message);
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
      console.error(err);
      const ethErr = err as { data?: { message?: string } };
      const msg = ethErr?.data?.message
        ? getErrorMessage(ethErr.data.message)
        : 'An error occurred';
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
      console.error(err);
      const ethErr = err as { data?: { message?: string } };
      const msg = ethErr?.data?.message
        ? getErrorMessage(ethErr.data.message)
        : 'An error occurred';
      setNotification({ text: msg, type: 'error', visible: true });
    }
  };

  /* ------------------------------------------------------------------
    Render
  ------------------------------------------------------------------ */

  // If user is not connected
  if (!account) {
    return (
      <MainWrapper>
        <Typography variant="h4" color="primary" gutterBottom textAlign="center">
          Pending Winnings
        </Typography>
        <Typography variant="subtitle1" mt={4}>
          Please login to Metamask to see your winnings.
        </Typography>
      </MainWrapper>
    );
  }

  // If there's an error loading data
  if (error) {
    return (
      <MainWrapper>
        <Typography variant="h4" color="error" gutterBottom textAlign="center">
          Something went wrong!
        </Typography>
        <Typography variant="body1" color="error">
          {error}
        </Typography>
      </MainWrapper>
    );
  }

  return (
    <MainWrapper>
      <Typography variant="h4" color="primary" gutterBottom textAlign="center">
        Pending Winnings
      </Typography>

      {/* Raffle ETH Section */}
      <Box mt={6}>
        <Typography variant="h5" mb={2}>
          Claimable ETH Rewards
        </Typography>
        {loading && raffleETHWinnings === null ? (
          <Typography>Loading...</Typography>
        ) : !raffleETHWinnings || raffleETHWinnings.length === 0 ? (
          <Typography>No winnings yet.</Typography>
        ) : (
          <>
            <RaffleWinningsTable
              list={raffleETHWinnings.slice((currentPage - 1) * perPage, currentPage * perPage)}
            />

            {status?.ETHRaffleToClaim > 0 && (
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'end',
                  alignItems: 'center',
                  mt: 2,
                }}
              >
                <Typography mr={2}>
                  Your claimable winnings are {`${status.ETHRaffleToClaim.toFixed(6)} ETH`}
                </Typography>
                <Button
                  onClick={handleAllETHClaim}
                  variant="contained"
                  disabled={isClaiming.raffleETH}
                >
                  Claim All
                </Button>
              </Box>
            )}

            <CustomPagination
              page={currentPage}
              setPage={setCurrentPage}
              totalLength={raffleETHWinnings.length}
              perPage={perPage}
            />
          </>
        )}
      </Box>

      {/* CST Staking Rewards Section */}
      <Box mt={6}>
        <Typography variant="h5" mb={2}>
          Claimable CST Staking Rewards
        </Typography>
        <UncollectedCSTStakingRewardsTable user={account} />
      </Box>

      {/* Donated NFTs Section */}
      <Box mt={8}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h5">Donated NFTs</Typography>
          {status?.NumDonatedNFTToClaim > 0 && (
            <Button
              onClick={handleAllDonatedNFTsClaim}
              variant="contained"
              disabled={isClaiming.donatedNFT}
            >
              Claim All
            </Button>
          )}
        </Box>
        {loading && donatedNFTs === null ? (
          <Typography>Loading...</Typography>
        ) : !donatedNFTs || donatedNFTs.length === 0 ? (
          <Typography>No NFTs yet.</Typography>
        ) : (
          <DonatedNFTTable
            list={donatedNFTs}
            handleClaim={handleDonatedNFTsClaim}
            claimingTokens={claimingDonatedNFTs}
          />
        )}
      </Box>

      {/* Donated ERC20 Section */}
      <Box mt={8}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 2,
          }}
        >
          <Typography variant="h5">Donated ERC20 Tokens</Typography>
          {donatedERC20Tokens.data.filter((x) => !x.Claimed).length > 0 && (
            <Button onClick={handleAllDonatedERC20Claim} variant="contained">
              Claim All
            </Button>
          )}
        </Box>

        {donatedERC20Tokens.loading ? (
          <Typography variant="h6">Loading...</Typography>
        ) : (
          <DonatedERC20Table list={donatedERC20Tokens.data} handleClaim={handleDonatedERC20Claim} />
        )}
      </Box>

      {/* Bottom Link Section */}
      <Box mt={6}>
        <Button variant="outlined" onClick={() => router.push('/winning-history')}>
          Go to my winning history page.
        </Button>
      </Box>
    </MainWrapper>
  );
}

/* ------------------------------------------------------------------
  getServerSideProps (SEO config)
------------------------------------------------------------------ */
export const getServerSideProps: GetServerSideProps = async () => {
  const title = 'Pending Winnings | Cosmic Signature';
  const description = 'Pending Winnings';

  const openGraphData = [
    { property: 'og:title', content: title },
    { property: 'og:description', content: description },
    { property: 'og:image', content: logoImgUrl },
    { name: 'twitter:title', content: title },
    { name: 'twitter:description', content: description },
    { name: 'twitter:image', content: logoImgUrl },
  ];

  return { props: { title, description, openGraphData } };
};
