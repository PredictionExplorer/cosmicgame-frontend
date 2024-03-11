import React, { useEffect, useState } from "react";
import { Box, Button, Typography } from "@mui/material";
import Head from "next/head";
import { GetServerSidePropsContext } from "next";
import { ethers } from "ethers";
import { useRouter } from "next/router";
import { useActiveWeb3React } from "../../../hooks/web3";
import { useApiData } from "../../../contexts/ApiDataContext";
import useRaffleWalletContract from "../../../hooks/useRaffleWalletContract";
import api from "../../../services/api";
import { MainWrapper } from "../../../components/styled";
import { MyWinningsTable } from "../../my-tokens";

const UserRaffleETH = ({ address }) => {
  const router = useRouter();
  const { account } = useActiveWeb3React();
  const { apiData: status } = useApiData();
  const [raffleETHToClaim, setRaffleETHToClaim] = useState({
    data: [],
    loading: false,
  });
  const [invalidAddress, setInvalidAddress] = useState(false);
  const [isClaiming, setIsClaiming] = useState({
    donatedNFT: false,
    raffleETH: false,
  });

  const raffleWalletContract = useRaffleWalletContract();

  const fetchRaffleETHDeposits = async () => {
    setRaffleETHToClaim((prev) => ({ ...prev, loading: true }));
    let deposits = await api.get_raffle_deposits_by_user(address);
    deposits = deposits.sort((a, b) => b.TimeStamp - a.TimeStamp);
    setRaffleETHToClaim({ data: deposits, loading: false });
  };

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

  useEffect(() => {
    if (address) {
      if (address !== "Invalid Address") {
        fetchRaffleETHDeposits();
      } else {
        setInvalidAddress(true);
      }
    }
  }, [address]);

  return (
    <>
      <Head>
        <title>Raffle ETH User Won | Cosmic Signature</title>
        <meta name="description" content="" />
      </Head>
      <MainWrapper>
        {invalidAddress ? (
          <Typography variant="h6">Invalid Address</Typography>
        ) : (
          <>
            <Box mb={4}>
              <Typography variant="h6" color="primary" component="span" mr={2}>
                User
              </Typography>
              <Typography variant="h6" component="span" fontFamily="monospace">
                {address}
              </Typography>
            </Box>
            <Box mt={4}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  mb: 2,
                }}
              >
                <Typography variant="h6" lineHeight={1}>
                  Raffle ETH User Won
                </Typography>
                {status?.ETHRaffleToClaim > 0 && account === address && (
                  <Box>
                    <Typography component="span" mr={2}>
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
              </Box>
              {raffleETHToClaim.loading ? (
                <Typography variant="h6">Loading...</Typography>
              ) : (
                <MyWinningsTable list={raffleETHToClaim.data} />
              )}
            </Box>
          </>
        )}
      </MainWrapper>
    </>
  );
};

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const params = context.params!.address;
  let address = Array.isArray(params) ? params[0] : params;
  if (ethers.utils.isAddress(address.toLowerCase())) {
    address = ethers.utils.getAddress(address.toLowerCase());
  } else {
    address = "Invalid Address";
  }
  return { props: { address } };
}

export default UserRaffleETH;
