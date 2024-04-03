import React, { useEffect, useState } from "react";
import { Box, Link, Typography } from "@mui/material";
import Head from "next/head";
import { MainWrapper } from "../../components/styled";
import { GetServerSidePropsContext } from "next";
import api from "../../services/api";
import { ethers } from "ethers";
import { MarketingRewardsTable } from "../../components/MarketingRewardsTable";

const UserMarketingRewards = ({ address }) => {
  const [loading, setLoading] = useState(true);
  const [invalidAddress, setInvalidAddress] = useState(false);
  const [marketingRewards, setMarketingRewards] = useState([]);

  useEffect(() => {
    const fetchData = async (addr: string) => {
      setLoading(true);
      const marketingRewards = await api.get_marketing_rewards_by_user(addr);
      setMarketingRewards(marketingRewards);
      setLoading(false);
    };
    if (address) {
      if (address !== "Invalid Address") {
        fetchData(address);
      } else {
        setInvalidAddress(true);
      }
    }
  }, [address]);

  return (
    <>
      <Head>
        <title>User Marketing Rewards | Cosmic Signature</title>
        <meta name="description" content="" />
      </Head>
      <MainWrapper>
        {invalidAddress ? (
          <Typography variant="h6">Invalid Address</Typography>
        ) : (
          <>
            <Box mb={4}>
              <Typography variant="h6" color="primary" component="span" mr={1}>
                Marketing Rewards for User
              </Typography>
              <Typography
                variant="h6"
                component="span"
                fontFamily="monospace"
                sx={{ wordBreak: "break-all" }}
              >
                <Link
                  href={`/user/${address}`}
                  style={{
                    color: "inherit",
                    fontSize: "inherit",
                    fontFamily: "monospace",
                  }}
                >
                  {address}
                </Link>
              </Typography>
            </Box>
            {loading ? (
              <Typography variant="h6">Loading...</Typography>
            ) : (
              <MarketingRewardsTable list={marketingRewards} />
            )}
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

export default UserMarketingRewards;
