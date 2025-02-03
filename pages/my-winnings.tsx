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
import { convertTimestampToDateTime, getAssetsUrl } from "../utils";
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

const MyWinningsRow = ({ winning }) => {
  if (!winning) {
    return <TablePrimaryRow />;
  }

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
          style={{
            color: "inherit",
            fontSize: "inherit",
          }}
          target="_blank"
        >
          {RoundNum}
        </Link>
      </TablePrimaryCell>
      <TablePrimaryCell align="right">{Amount.toFixed(7)}</TablePrimaryCell>
    </TablePrimaryRow>
  );
};

const MyWinningsTable = ({ list }) => (
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

const MyWinnings = () => {
  const { account } = useActiveWeb3React();
  const [curPage, setCurPage] = useState(1);
  const { apiData: status, fetchData: fetchStatusData } = useApiData();
  console.log("status", status);
  const perPage = 5;
  const [donatedNFTToClaim, setDonatedNFTToClaim] = useState(null);
  const [raffleETHToClaim, setRaffleETHToClaim] = useState(null);
  const [cstRewardsToClaim, setCstRewardsToClaim] = useState(null);
  const [isClaiming, setIsClaiming] = useState({
    donatedNFT: false,
    raffleETH: false,
  });
  const [claimingDonatedNFTs, setClaimingDonatedNFTs] = useState([]);
  const { setNotification } = useNotification();

  const cosmicGameContract = useCosmicGameContract();
  const raffleWalletContract = useRaffleWalletContract();

  const handleAllETHClaim = async () => {
    setIsClaiming((prevState) => ({
      ...prevState,
      raffleETH: true,
    }));
    try {
      await raffleWalletContract.withdraw();
      setTimeout(() => {
        fetchStatusData();
      }, 3000);
    } catch (err) {
      console.log(err);
      if (err?.data?.message) {
        const msg = getErrorMessage(err?.data?.message);
        setNotification({ text: msg, type: "error", visible: true });
      }
    } finally {
      setIsClaiming((prevState) => ({
        ...prevState,
        raffleETH: false,
      }));
    }
  };

  const handleDonatedNFTsClaim = async (tokenID) => {
    setClaimingDonatedNFTs((prev) => [...prev, tokenID]);
    try {
      await cosmicGameContract.claimDonatedNFT(tokenID);
      setTimeout(() => {
        fetchStatusData();
      }, 3000);
    } catch (err) {
      console.log(err);
      if (err?.data?.message) {
        const msg = getErrorMessage(err?.data?.message);
        setNotification({ text: msg, type: "error", visible: true });
      }
    } finally {
      setClaimingDonatedNFTs((prev) => prev.filter((id) => id !== tokenID));
    }
  };

  const handleAllDonatedNFTsClaim = async () => {
    setIsClaiming((prevState) => ({
      ...prevState,
      donatedNFT: true,
    }));
    try {
      const indexList = donatedNFTToClaim.map((item) => item.Index);
      await cosmicGameContract.claimManyDonatedNFTs(indexList);
      setTimeout(() => {
        fetchStatusData();
      }, 3000);
    } catch (err) {
      console.log(err);
      if (err?.data?.message) {
        const msg = getErrorMessage(err?.data?.message);
        setNotification({ text: msg, type: "error", visible: true });
      }
    } finally {
      setIsClaiming((prevState) => ({
        ...prevState,
        donatedNFT: false,
      }));
    }
  };

  const fetchAllUnclaimedData = async () => {
    if (!account) return;

    try {
      const [nfts, deposits, cstRewardsToClaim] = await Promise.all([
        api.get_unclaimed_donated_nft_by_user(account),
        api.get_unclaimed_raffle_deposits_by_user(account),
        api.get_staking_cst_rewards_to_claim_by_user(account),
      ]);

      setDonatedNFTToClaim(nfts.sort((a, b) => a.TimeStamp - b.TimeStamp));
      setRaffleETHToClaim(deposits.sort((a, b) => b.TimeStamp - a.TimeStamp));
      setCstRewardsToClaim(cstRewardsToClaim);
      console.log(cstRewardsToClaim);
    } catch (error) {
      console.error("Error fetching unclaimed data", error);
    }
  };

  useEffect(() => {
    fetchAllUnclaimedData();
  }, [account, status]);

  return (
    <MainWrapper>
      <Typography variant="h4" color="primary" gutterBottom textAlign="center">
        Pending Winnings
      </Typography>
      {!account ? (
        <Typography variant="subtitle1" mt={4}>
          Please login to Metamask to see your winnings.
        </Typography>
      ) : (
        <>
          <Box mt={6}>
            <Typography variant="h5" mb={2}>
              Claimable Raffle ETH
            </Typography>
            {raffleETHToClaim !== null && raffleETHToClaim.length === 0 ? (
              <Typography>No winnings yet.</Typography>
            ) : raffleETHToClaim === null ? (
              <Typography>Loading...</Typography>
            ) : (
              <>
                <MyWinningsTable
                  list={raffleETHToClaim.slice(
                    (curPage - 1) * perPage,
                    curPage * perPage
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
                      {`${status?.ETHRaffleToClaim.toFixed(6)} ETH`}
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
                  page={curPage}
                  setPage={setCurPage}
                  totalLength={raffleETHToClaim.length}
                  perPage={perPage}
                />
              </>
            )}
          </Box>
          <Box mt={6}>
            <Typography variant="h5" mb={2}>
              Claimable CST Staking Rewards
            </Typography>
            {cstRewardsToClaim !== null && cstRewardsToClaim.length === 0 ? (
              <Typography>No winnings yet.</Typography>
            ) : cstRewardsToClaim === null ? (
              <Typography>Loading...</Typography>
            ) : (
              <></>
            )}
          </Box>
          <Box mt={8}>
            <Box
              sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}
            >
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
            {donatedNFTToClaim !== null && donatedNFTToClaim.length === 0 ? (
              <Typography>No NFTs yet.</Typography>
            ) : donatedNFTToClaim === null ? (
              <Typography>Loading...</Typography>
            ) : (
              <DonatedNFTTable
                list={donatedNFTToClaim}
                handleClaim={handleDonatedNFTsClaim}
                claimingTokens={claimingDonatedNFTs}
              />
            )}
          </Box>
          <Box mt={6}>
            <Button
              variant="outlined"
              onClick={() => router.push("/winning-history")}
            >
              Go to my winning history page.
            </Button>
          </Box>
        </>
      )}
    </MainWrapper>
  );
};

export const getServerSideProps: GetServerSideProps = async () => {
  const title = "Pending Winnings | Cosmic Signature";
  const description = "Pending Winnings";
  const imageUrl = getAssetsUrl("cosmicsignature/logo.png");

  const openGraphData = [
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:image", content: imageUrl },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: imageUrl },
  ];

  return { props: { title, description, openGraphData } };
};

export default MyWinnings;
