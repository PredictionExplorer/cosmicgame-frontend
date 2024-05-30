import React, { useEffect, useState } from "react";

import {
  Box,
  Button,
  Link,
  Pagination,
  TableBody,
  Typography,
} from "@mui/material";

import Head from "next/head";

import {
  MainWrapper,
  TablePrimary,
  TablePrimaryCell,
  TablePrimaryContainer,
  TablePrimaryHead,
  TablePrimaryHeadCell,
  TablePrimaryRow,
} from "../components/styled";
import { convertTimestampToDateTime } from "../utils";
import DonatedNFTTable from "../components/DonatedNFTTable";
import { useActiveWeb3React } from "../hooks/web3";
import useCosmicGameContract from "../hooks/useCosmicGameContract";
import useRaffleWalletContract from "../hooks/useRaffleWalletContract";
import router from "next/router";
import { useApiData } from "../contexts/ApiDataContext";
import api from "../services/api";
import { UnclaimedStakingRewardsTable } from "../components/UnclaimedStakingRewardsTable";
import { Tr } from "react-super-responsive-table";
import "react-super-responsive-table/dist/SuperResponsiveTableStyle.css";

const MyWinningsRow = ({ winning }) => {
  if (!winning) {
    return <TablePrimaryRow />;
  }

  return (
    <TablePrimaryRow>
      <TablePrimaryCell>
        <Link
          color="inherit"
          fontSize="inherit"
          href={`https://arbiscan.io/tx/${winning.TxHash}`}
          target="__blank"
        >
          {convertTimestampToDateTime(winning.TimeStamp)}
        </Link>
      </TablePrimaryCell>
      <TablePrimaryCell align="center">
        <Link
          href={`/prize/${winning.RoundNum}`}
          style={{
            color: "inherit",
            fontSize: "inherit",
          }}
          target="_blank"
        >
          {winning.RoundNum}
        </Link>
      </TablePrimaryCell>
      <TablePrimaryCell align="right">
        {winning.Amount.toFixed(7)}
      </TablePrimaryCell>
    </TablePrimaryRow>
  );
};

const MyWinningsTable = ({ list }) => {
  return (
    <TablePrimaryContainer>
      <TablePrimary>
        <TablePrimaryHead>
          <Tr>
            <TablePrimaryHeadCell align="left">Date</TablePrimaryHeadCell>
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
};

const MyWinnings = () => {
  const { account } = useActiveWeb3React();
  const [curPage, setCurPage] = useState(1);
  const { apiData: status } = useApiData();
  const perPage = 5;
  const [donatedNFTToClaim, setDonatedNFTToClaim] = useState(null);
  const [raffleETHToClaim, setRaffleETHToClaim] = useState(null);
  const [unclaimedStakingRewards, setUnclaimedStakingRewards] = useState(null);
  const [isClaiming, setIsClaiming] = useState({
    donatedNFT: false,
    raffleETH: false,
  });

  const cosmicGameContract = useCosmicGameContract();
  const raffleWalletContract = useRaffleWalletContract();

  const handleAllETHClaim = async () => {
    try {
      setIsClaiming({
        ...isClaiming,
        raffleETH: true,
      });
      const res = await raffleWalletContract.withdraw();
      console.log(res);
      setTimeout(() => {
        router.reload();
      }, 4000);
    } catch (err) {
      console.log(err);
      setIsClaiming({
        ...isClaiming,
        raffleETH: false,
      });
    }
  };
  const handleDonatedNFTsClaim = async (e, tokenID) => {
    try {
      e.target.disabled = true;
      e.target.classList.add("Mui-disabled");
      const res = await cosmicGameContract.claimDonatedNFT(tokenID);
      console.log(res);
      setTimeout(() => {
        router.reload();
      }, 4000);
    } catch (err) {
      console.log(err);
      e.target.disabled = false;
      e.target.classList.remove("Mui-disabled");
    }
  };
  const handleAllDonatedNFTsClaim = async () => {
    try {
      setIsClaiming({
        ...isClaiming,
        donatedNFT: true,
      });
      const indexList = donatedNFTToClaim.map((item) => item.Index);
      const res = await cosmicGameContract.claimManyDonatedNFTs(indexList);
      console.log(res);
      setTimeout(() => {
        router.reload();
      }, 4000);
    } catch (err) {
      console.log(err);
      setIsClaiming({
        ...isClaiming,
        donatedNFT: false,
      });
    }
  };
  const fetchUnclaimedStakingRewards = async () => {
    const unclaimedStakingRewards = await api.get_unclaimed_staking_cst_rewards_by_user(
      account
    );
    setUnclaimedStakingRewards(unclaimedStakingRewards);
  };
  const fetchUnclaimedDonatedNFTs = async () => {
    let nfts = await api.get_unclaimed_donated_nft_by_user(account);
    nfts = nfts.sort((a, b) => a.TimeStamp - b.TimeStamp);
    setDonatedNFTToClaim(nfts);
  };
  const fetchUnclaimedRaffleETHDeposits = async () => {
    let deposits = await api.get_unclaimed_raffle_deposits_by_user(account);
    deposits = deposits.sort((a, b) => b.TimeStamp - a.TimeStamp);
    setRaffleETHToClaim(deposits);
  };
  useEffect(() => {
    if (status?.UnclaimedStakingReward > 0) {
      fetchUnclaimedStakingRewards();
    }
    if (status?.NumDonatedNFTToClaim > 0) {
      fetchUnclaimedDonatedNFTs();
    }
    if (status?.ETHRaffleToClaim > 0) {
      fetchUnclaimedRaffleETHDeposits();
    }
  }, [status]);
  return (
    <>
      <Head>
        <title>Pending Winnings | Cosmic Signature</title>
        <meta name="description" content="" />
      </Head>
      <MainWrapper>
        <Typography
          variant="h4"
          color="primary"
          gutterBottom
          textAlign="center"
        >
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
              {!status?.ETHRaffleToClaim ? (
                <Typography>No winnings yet.</Typography>
              ) : status?.ETHRaffleToClaim > 0 && raffleETHToClaim === null ? (
                <Typography>Loading...</Typography>
              ) : raffleETHToClaim.length > 0 ? (
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
                  <Box display="flex" justifyContent="center" mt={2}>
                    <Pagination
                      color="primary"
                      page={curPage}
                      onChange={(_e, page) => setCurPage(page)}
                      count={Math.ceil(raffleETHToClaim.length / perPage)}
                      hideNextButton
                      hidePrevButton
                      shape="rounded"
                    />
                  </Box>
                </>
              ) : (
                <Typography>No winnings yet.</Typography>
              )}
            </Box>
            <Box mt={8}>
              <Typography variant="h5" mb={2}>
                Earned Staking Rewards
              </Typography>
              {status?.UnclaimedStakingReward === 0 ? (
                <Typography>No rewards yet.</Typography>
              ) : status?.UnclaimedStakingReward > 0 &&
                unclaimedStakingRewards === null ? (
                <Typography>Loading...</Typography>
              ) : (
                <UnclaimedStakingRewardsTable
                  list={unclaimedStakingRewards}
                  owner={account}
                  fetchData={fetchUnclaimedStakingRewards}
                />
              )}
            </Box>
            <Box mt={8}>
              <Box
                sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}
              >
                <Typography variant="h5">Donated NFTs</Typography>
                {donatedNFTToClaim?.length > 0 && (
                  <Button
                    onClick={handleAllDonatedNFTsClaim}
                    variant="contained"
                    disabled={isClaiming.donatedNFT}
                  >
                    Claim All
                  </Button>
                )}
              </Box>
              {!status?.NumDonatedNFTToClaim ? (
                <Typography>No NFTs yet.</Typography>
              ) : status?.NumDonatedNFTToClaim > 0 &&
                donatedNFTToClaim === null ? (
                <Typography>Loading...</Typography>
              ) : (
                donatedNFTToClaim !== null && (
                  <DonatedNFTTable
                    list={donatedNFTToClaim}
                    handleClaim={handleDonatedNFTsClaim}
                  />
                )
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
    </>
  );
};

export default MyWinnings;
