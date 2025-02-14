import React, { useEffect, useState } from "react";
import { Box, Button, Link, TableBody, Typography } from "@mui/material";
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
import DonatedNFTTable from "../components/DonatedNFTTable";
import { useActiveWeb3React } from "../hooks/web3";
import useCosmicGameContract from "../hooks/useCosmicGameContract";
import useRaffleWalletContract from "../hooks/useRaffleWalletContract";
import router from "next/router";
import { useApiData } from "../contexts/ApiDataContext";
import api from "../services/api";
import { Tr } from "react-super-responsive-table";
import "react-super-responsive-table/dist/SuperResponsiveTableStyle.css";
import { CustomPagination } from "../components/CustomPagination";
import getErrorMessage from "../utils/alert";
import { useNotification } from "../contexts/NotificationContext";
import { GetServerSideProps } from "next";

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
const useUnclaimedWinnings = (account: string | null | undefined) => {
  const [donatedNFTs, setDonatedNFTs] = useState<any[] | null>(null);
  const [raffleETHWinnings, setRaffleETHWinnings] = useState<
    RaffleWinning[] | null
  >(null);
  const [cstStakingRewards, setCstStakingRewards] = useState<any[] | null>(
    null
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUnclaimedData = async () => {
    if (!account) return;
    setLoading(true);
    setError(null);
    try {
      const [nfts, deposits, cstRewards] = await Promise.all([
        api.get_unclaimed_donated_nft_by_user(account),
        api.get_unclaimed_raffle_deposits_by_user(account),
        api.get_staking_cst_rewards_to_claim_by_user(account),
      ]);

      // Sort data for consistent ordering
      setDonatedNFTs(nfts.sort((a: any, b: any) => a.TimeStamp - b.TimeStamp));
      setRaffleETHWinnings(
        deposits.sort((a: any, b: any) => b.TimeStamp - a.TimeStamp)
      );
      setCstStakingRewards(cstRewards);
    } catch (err) {
      console.error("Error fetching unclaimed data", err);
      setError("Failed to load unclaimed winnings data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnclaimedData();
  }, [account]);

  return {
    donatedNFTs,
    raffleETHWinnings,
    cstStakingRewards,
    loading,
    error,
    refetch: fetchUnclaimedData,
  };
};

/* ------------------------------------------------------------------
  Sub-Components
------------------------------------------------------------------ */

// Table row for Raffle Winnings
const MyWinningsRow = ({ winning }: { winning: RaffleWinning }) => {
  if (!winning) return <TablePrimaryRow />;

  const { TxHash, TimeStamp, RoundNum, Amount } = winning;
  return (
    <TablePrimaryRow>
      <TablePrimaryCell>
        <Link
          color="inherit"
          fontSize="inherit"
          href={`https://arbiscan.io/tx/${TxHash}`}
          target="__blank"
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
      <TablePrimaryCell align="right">{Amount.toFixed(7)}</TablePrimaryCell>
    </TablePrimaryRow>
  );
};

// Table for Raffle Winnings
const MyWinningsTable = ({ list }: { list: RaffleWinning[] }) => (
  <TablePrimaryContainer>
    <TablePrimary>
      <TablePrimaryHead>
        <Tr>
          <TablePrimaryHeadCell align="left">Datetime</TablePrimaryHeadCell>
          <TablePrimaryHeadCell>Round</TablePrimaryHeadCell>
          <TablePrimaryHeadCell align="right">
            Amount (ETH)
          </TablePrimaryHeadCell>
        </Tr>
      </TablePrimaryHead>
      <TableBody>
        {list.map((winning) => (
          <MyWinningsRow key={winning.EvtLogId} winning={winning} />
        ))}
      </TableBody>
    </TablePrimary>
  </TablePrimaryContainer>
);

/* ------------------------------------------------------------------
  Main Component
------------------------------------------------------------------ */
const MyWinnings = () => {
  const { account } = useActiveWeb3React();
  const { setNotification } = useNotification();
  const { apiData: status, fetchData: fetchStatusData } = useApiData();

  // Combine all "unclaimed" data into one custom hook
  const {
    donatedNFTs,
    raffleETHWinnings,
    cstStakingRewards,
    loading,
    error,
    refetch,
  } = useUnclaimedWinnings(account);

  // Contract Hooks
  const cosmicGameContract = useCosmicGameContract();
  const raffleWalletContract = useRaffleWalletContract();

  // UI State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isClaiming, setIsClaiming] = useState({
    donatedNFT: false,
    raffleETH: false,
  });
  const [claimingDonatedNFTs, setClaimingDonatedNFTs] = useState<number[]>([]);

  const perPage = 5;

  /* ------------------------------------------------------------------
    Handlers
  ------------------------------------------------------------------ */
  const handleAllETHClaim = async () => {
    setIsClaiming((prev) => ({ ...prev, raffleETH: true }));
    try {
      await raffleWalletContract.withdraw();
      // Re-fetch global statuses after short delay
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

  const handleDonatedNFTsClaim = async (tokenID: number) => {
    setClaimingDonatedNFTs((prev) => [...prev, tokenID]);
    try {
      await cosmicGameContract.claimDonatedNFT(tokenID);
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
      setClaimingDonatedNFTs((prev) => prev.filter((id) => id !== tokenID));
    }
  };

  const handleAllDonatedNFTsClaim = async () => {
    if (!donatedNFTs) return;
    setIsClaiming((prev) => ({ ...prev, donatedNFT: true }));
    try {
      // Indices for all unclaimed NFTs
      const indexList = donatedNFTs.map((item) => item.Index);
      await cosmicGameContract.claimManyDonatedNFTs(indexList);
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

  /* ------------------------------------------------------------------
    Render
  ------------------------------------------------------------------ */

  // Early return if user is not connected
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
            <MyWinningsTable
              list={raffleETHWinnings.slice(
                (currentPage - 1) * perPage,
                currentPage * perPage
              )}
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

      {/* CST Staking Rewards Section (Currently no claim functionality shown) */}
      <Box mt={6}>
        <Typography variant="h5" mb={2}>
          Claimable CST Staking Rewards
        </Typography>
        {loading && cstStakingRewards === null ? (
          <Typography>Loading...</Typography>
        ) : !cstStakingRewards || cstStakingRewards.length === 0 ? (
          <Typography>No winnings yet.</Typography>
        ) : (
          <Typography>Rewards are loaded. (Claim UI TBD)</Typography>
        )}
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
};

/* ------------------------------------------------------------------
  Server-Side Rendering (SEO Config)
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

export default MyWinnings;
