import React, { useState, useEffect } from "react";
import { Box, Button, Link, TableBody, Typography } from "@mui/material";
import router from "next/router";
import { Tr } from "react-super-responsive-table";
import "react-super-responsive-table/dist/SuperResponsiveTableStyle.css";
import { GetServerSideProps } from "next";

// Styled & Utilities
import {
  MainWrapper,
  TablePrimary,
  TablePrimaryCell,
  TablePrimaryContainer,
  TablePrimaryHead,
  TablePrimaryHeadCell,
  TablePrimaryRow,
} from "../components/styled";
import { convertTimestampToDateTime, logoImgUrl } from "../utils";
import { CustomPagination } from "../components/CustomPagination";
import getErrorMessage from "../utils/alert";

// Hooks & Context
import { useActiveWeb3React } from "../hooks/web3";
import useRaffleWalletContract from "../hooks/useRaffleWalletContract";
import { useApiData } from "../contexts/ApiDataContext";
import { useNotification } from "../contexts/NotificationContext";

// Services
import api from "../services/api";

// Components
import DonatedNFTTable from "../components/DonatedNFTTable";
import { UncollectedCSTStakingRewardsTable } from "../components/UncollectedCSTStakingRewardsTable";

/* ------------------------------------------------------------------
  Types
------------------------------------------------------------------ */
interface RaffleWinning {
  EvtLogId: number;
  TxHash: string;
  TimeStamp: number;
  RoundNum: number;
  Amount: number;
}

/* ------------------------------------------------------------------
  Custom Hook: useUnclaimedWinnings
------------------------------------------------------------------ */
function useUnclaimedWinnings(account: string | null | undefined) {
  const [donatedNFTs, setDonatedNFTs] = useState<any[] | null>(null);
  const [raffleETHWinnings, setRaffleETHWinnings] = useState<
    RaffleWinning[] | null
  >(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUnclaimedData = async () => {
    if (!account) return;
    setLoading(true);
    setError(null);

    try {
      const [nfts, deposits] = await Promise.all([
        api.get_unclaimed_donated_nft_by_user(account),
        api.get_unclaimed_raffle_deposits_by_user(account),
      ]);
      // Sort data for consistency
      setDonatedNFTs(nfts.sort((a: any, b: any) => a.TimeStamp - b.TimeStamp));
      setRaffleETHWinnings(
        deposits.sort((a: any, b: any) => b.TimeStamp - a.TimeStamp)
      );
    } catch (err) {
      console.error("Error fetching unclaimed data:", err);
      setError("Failed to load unclaimed winnings data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnclaimedData();
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

/** Table Row for a single raffle winning */
function RaffleWinningRow({
  winning,
  timeoutDurationToWithdrawPrizes,
}: {
  winning: RaffleWinning;
  timeoutDurationToWithdrawPrizes: number;
}) {
  if (!winning) return <TablePrimaryRow />;

  const { TxHash, TimeStamp, RoundNum, Amount } = winning;

  return (
    <TablePrimaryRow>
      <TablePrimaryCell>
        <Link
          color="inherit"
          fontSize="inherit"
          href={`https://arbiscan.io/tx/${TxHash}`}
          target="_blank"
        >
          {convertTimestampToDateTime(TimeStamp)}
        </Link>
      </TablePrimaryCell>
      <TablePrimaryCell align="center">
        <Link
          href={`/prize/${RoundNum}`}
          style={{ color: "inherit", fontSize: "inherit" }}
          target="_blank"
        >
          {RoundNum}
        </Link>
      </TablePrimaryCell>
      <TablePrimaryCell align="center">
        {convertTimestampToDateTime(
          TimeStamp + timeoutDurationToWithdrawPrizes
        )}
      </TablePrimaryCell>
      <TablePrimaryCell align="right">{Amount.toFixed(7)}</TablePrimaryCell>
    </TablePrimaryRow>
  );
}

/** Table layout for raffle winnings */
function RaffleWinningsTable({
  list,
  timeoutDurationToWithdrawPrizes,
}: {
  list: RaffleWinning[];
  timeoutDurationToWithdrawPrizes: number;
}) {
  return (
    <TablePrimaryContainer>
      <TablePrimary>
        <TablePrimaryHead>
          <Tr>
            <TablePrimaryHeadCell align="left">Datetime</TablePrimaryHeadCell>
            <TablePrimaryHeadCell>Round</TablePrimaryHeadCell>
            <TablePrimaryHeadCell>Expiration Date</TablePrimaryHeadCell>
            <TablePrimaryHeadCell align="right">
              Amount (ETH)
            </TablePrimaryHeadCell>
          </Tr>
        </TablePrimaryHead>
        <TableBody>
          {list.map((winning) => (
            <RaffleWinningRow
              key={winning.EvtLogId}
              winning={winning}
              timeoutDurationToWithdrawPrizes={timeoutDurationToWithdrawPrizes}
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

  // Get unclaimed winnings data (donated NFTs, raffle ETH, CST staking rewards)
  const {
    donatedNFTs,
    raffleETHWinnings,
    loading,
    error,
    refetch,
  } = useUnclaimedWinnings(account);

  // Smart contract hooks
  const raffleWalletContract = useRaffleWalletContract();

  // Local UI states
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isClaiming, setIsClaiming] = useState({
    donatedNFT: false,
    raffleETH: false,
  });
  const [claimingDonatedNFTs, setClaimingDonatedNFTs] = useState<number[]>([]);
  const [
    timeoutDurationToWithdrawPrizes,
    setTimeoutDurationToWithdrawPrizes,
  ] = useState<number>(0);

  const perPage = 5;

  /* ------------------------------------------------------------------
    Handlers
  ------------------------------------------------------------------ */

  // Claim all ETH from raffle contract
  const handleAllETHClaim = async () => {
    setIsClaiming((prev) => ({ ...prev, raffleETH: true }));
    try {
      await raffleWalletContract["withdrawEth()"]();

      // Refresh status and unclaimed data after short delay
      setTimeout(() => {
        fetchStatusData();
        refetch();
      }, 3000);
    } catch (err) {
      console.error(err);
      if (err?.data?.message) {
        const msg = getErrorMessage(err.data.message);
        setNotification({ text: msg, type: "error", visible: true });
      }
    } finally {
      setIsClaiming((prev) => ({ ...prev, raffleETH: false }));
    }
  };

  // Claim a single donated NFT
  const handleDonatedNFTsClaim = async (tokenID: number) => {
    setClaimingDonatedNFTs((prev) => [...prev, tokenID]);
    try {
      await raffleWalletContract.claimDonatedNft(tokenID);

      // Refresh data
      setTimeout(() => {
        fetchStatusData();
        refetch();
      }, 3000);
    } catch (err) {
      console.error(err);
      if (err?.data?.message) {
        const msg = getErrorMessage(err.data.message);
        setNotification({ text: msg, type: "error", visible: true });
      }
    } finally {
      // Remove token from "claiming" state
      setClaimingDonatedNFTs((prev) => prev.filter((id) => id !== tokenID));
    }
  };

  // Claim all donated NFTs
  const handleAllDonatedNFTsClaim = async () => {
    if (!donatedNFTs) return;
    setIsClaiming((prev) => ({ ...prev, donatedNFT: true }));

    try {
      const indexList = donatedNFTs.map((item) => item.Index);
      await raffleWalletContract.claimManyDonatedNfts(indexList);

      setTimeout(() => {
        fetchStatusData();
        refetch();
      }, 3000);
    } catch (err) {
      console.error(err);
      if (err?.data?.message) {
        const msg = getErrorMessage(err.data.message);
        setNotification({ text: msg, type: "error", visible: true });
      }
    } finally {
      setIsClaiming((prev) => ({ ...prev, donatedNFT: false }));
    }
  };

  useEffect(() => {
    const fetchTimeoutDurationToWithdrawPrizes = async () => {
      const timeoutDurationToWithdrawPrizes = await raffleWalletContract.timeoutDurationToWithdrawPrizes();
      setTimeoutDurationToWithdrawPrizes(
        Number(timeoutDurationToWithdrawPrizes)
      );
    };

    if (raffleWalletContract) {
      fetchTimeoutDurationToWithdrawPrizes();
    }
  }, [raffleWalletContract]);

  /* ------------------------------------------------------------------
    Render
  ------------------------------------------------------------------ */

  // If user is not connected
  if (!account) {
    return (
      <MainWrapper>
        <Typography
          variant="h4"
          color="primary"
          gutterBottom
          textAlign="center"
        >
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
          Claimable Raffle ETH
        </Typography>
        {loading && raffleETHWinnings === null ? (
          <Typography>Loading...</Typography>
        ) : !raffleETHWinnings || raffleETHWinnings.length === 0 ? (
          <Typography>No winnings yet.</Typography>
        ) : (
          <>
            <RaffleWinningsTable
              list={raffleETHWinnings.slice(
                (currentPage - 1) * perPage,
                currentPage * perPage
              )}
              timeoutDurationToWithdrawPrizes={timeoutDurationToWithdrawPrizes}
            />

            {status?.ETHRaffleToClaim > 0 && (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "end",
                  alignItems: "center",
                  mt: 2,
                }}
              >
                <Typography mr={2}>
                  Your claimable winnings are{" "}
                  {`${status.ETHRaffleToClaim.toFixed(6)} ETH`}
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
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
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

      {/* Bottom Link Section */}
      <Box mt={6}>
        <Button
          variant="outlined"
          onClick={() => router.push("/winning-history")}
        >
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
  const title = "Pending Winnings | Cosmic Signature";
  const description = "Pending Winnings";

  const openGraphData = [
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:image", content: logoImgUrl },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: logoImgUrl },
  ];

  return { props: { title, description, openGraphData } };
};
