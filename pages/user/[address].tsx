import React, { useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";
import Head from "next/head";
import { MainWrapper } from "../../components/styled";
import { GetServerSidePropsContext } from "next";
import api from "../../services/api";
import BiddingHistoryTable from "../../components/BiddingHistoryTable";
import WinningHistoryTable from "../../components/WinningHistoryTable";
import useCosmicSignatureTokenContract from "../../hooks/useCosmicSignatureTokenContract";
import { ethers } from "ethers";

const UserInfo = ({ address }) => {
  const [claimHistory, setClaimHistory] = useState(null);
  const [bidHistory, setBidHistory] = useState([]);
  const [userInfo, setUserInfo] = useState(null);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const cosmicSignatureTokenContract = useCosmicSignatureTokenContract();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const history = await api.get_claim_history_by_user(address);
      setClaimHistory(history);
      const { Bids, UserInfo } = await api.get_user_info(address);
      setBidHistory(Bids);
      setUserInfo(UserInfo);
      const balance = await cosmicSignatureTokenContract.balanceOf(address);
      setBalance(Number(ethers.utils.formatEther(balance)));

      setLoading(false);
    };
    if (address) {
      fetchData();
    }
  }, [address]);

  return (
    <>
      <Head>
        <title>User Info | Cosmic Signature</title>
        <meta name="description" content="" />
      </Head>
      <MainWrapper>
        <Box mb={4}>
          <Typography variant="h6" color="primary" component="span" mr={2}>
            User
          </Typography>
          <Typography variant="h6" component="span">
            {address}
          </Typography>
        </Box>
        {loading ? (
          <Typography variant="h6">Loading...</Typography>
        ) : (
          <>
            {balance !== 0 && (
              <Box mb={1}>
                <Typography color="primary" component="span">
                  Cosmic Tokens Balance:
                </Typography>
                &nbsp;
                <Typography component="span">{balance.toFixed(2)}</Typography>
              </Box>
            )}
            <Box mb={1}>
              <Typography color="primary" component="span">
                Number of Bids:
              </Typography>
              &nbsp;
              <Typography component="span">{userInfo.NumBids}</Typography>
            </Box>
            <Box mb={1}>
              <Typography color="primary" component="span">
                Maximum Bid Amount:
              </Typography>
              &nbsp;
              <Typography component="span">
                {userInfo.MaxBidAmount.toFixed(6)} ETH
              </Typography>
            </Box>
            <Box mb={1}>
              <Typography color="primary" component="span">
                Number of Prizes taken:
              </Typography>
              &nbsp;
              <Typography component="span">{userInfo.NumPrizes}</Typography>
            </Box>
            <Box mb={1}>
              <Typography color="primary" component="span">
                Maximum amount gained (in prize winnings):
              </Typography>
              &nbsp;
              <Typography component="span">
                {userInfo.MaxWinAmount.toFixed(6)} ETH
              </Typography>
            </Box>
            <Box mb={1}>
              <Typography color="primary" component="span">
                Amount of winnings in ETH raffles:
              </Typography>
              &nbsp;
              <Typography component="span">
                {userInfo.SumRaffleEthWinnings.toFixed(6)} ETH
              </Typography>
            </Box>
            <Box mb={1}>
              <Typography color="primary" component="span">
                Amount withdrawn from ETH raffles:
              </Typography>
              &nbsp;
              <Typography component="span">
                {userInfo.SumRaffleEthWithdrawal.toFixed(6)} ETH
              </Typography>
            </Box>
            <Box mb={1}>
              <Typography color="primary" component="span">
                Unclaimed donated NFTs:
              </Typography>
              &nbsp;
              <Typography component="span">{userInfo.UnclaimedNFTs}</Typography>
            </Box>
            <Box mb={1}>
              <Typography color="primary" component="span">
                Total ETH won in raffles:
              </Typography>
              &nbsp;
              <Typography component="span">
                {(
                  userInfo.SumRaffleEthWinnings +
                  userInfo.SumRaffleEthWithdrawal
                ).toFixed(6)}{" "}
                ETH
              </Typography>
            </Box>
            <Box mb={1}>
              <Typography color="primary" component="span">
                Number of (ETH) raffles participated in:
              </Typography>
              &nbsp;
              <Typography component="span">
                {userInfo.NumRaffleEthWinnings}
              </Typography>
            </Box>
            <Box mb={1}>
              <Typography color="primary" component="span">
                Number of Raffle NFTs won:
              </Typography>
              &nbsp;
              <Typography component="span">{userInfo.RaffleNFTWon}</Typography>
            </Box>
            <Box mt={6}>
              <Typography variant="h6" lineHeight={1}>
                Bid History
              </Typography>
              <BiddingHistoryTable biddingHistory={bidHistory} />
            </Box>
            <Box>
              <Typography variant="h6" lineHeight={1} mt={8} mb={2}>
                History of Winnings
              </Typography>
              <WinningHistoryTable
                winningHistory={claimHistory}
                showClaimedStatus={true}
              />
            </Box>
          </>
        )}
      </MainWrapper>
    </>
  );
};

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const params = context.params!.address;
  const address = Array.isArray(params) ? params[0] : params;
  return { props: { address } };
}

export default UserInfo;
