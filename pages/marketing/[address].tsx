import React, { useEffect, useState } from "react";
import { Box, Link, Typography } from "@mui/material";
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
  const title = `Marketing Rewards for User ${address} | Cosmic Signature`;
  const description = `Marketing Rewards for User ${address}`;
  const imageUrl = "https://cosmic-game2.s3.us-east-2.amazonaws.com/logo.png";

  const openGraphData = [
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:image", content: imageUrl },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: imageUrl },
  ];

  return { props: { title, description, openGraphData, address } };
}

export default UserMarketingRewards;
