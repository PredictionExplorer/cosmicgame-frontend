import React, { useEffect, useState } from "react";
import { Box, Link, Typography } from "@mui/material";
import { MainWrapper } from "../../components/styled";
import { GetServerSidePropsContext } from "next";
import api from "../../services/api";
import { ethers } from "ethers";
import MarketingRewardsTable from "../../components/MarketingRewardsTable";
import { logoImgUrl } from "../../utils";

interface UserMarketingRewardsProps {
  address: string;
}

interface RewardItem {
  id: number;
  reward: string;
  date: string;
}

// Component for displaying user's marketing rewards based on Ethereum address
const UserMarketingRewards: React.FC<UserMarketingRewardsProps> = ({
  address,
}) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [invalidAddress, setInvalidAddress] = useState<boolean>(false);
  const [marketingRewards, setMarketingRewards] = useState<RewardItem[]>([]);

  useEffect(() => {
    const fetchRewards = async (userAddress: string) => {
      setLoading(true);
      try {
        const rewards = await api.get_marketing_rewards_by_user(userAddress);
        setMarketingRewards(rewards);
      } catch (error) {
        console.error("Error fetching user marketing rewards:", error);
      }
      setLoading(false);
    };

    if (address === "Invalid Address") {
      setInvalidAddress(true);
      setLoading(false);
    } else if (address) {
      fetchRewards(address);
    }
  }, [address]);

  return (
    <MainWrapper>
      {invalidAddress ? (
        <Typography variant="h6">Invalid Ethereum Address</Typography>
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

// Server-side function to validate Ethereum address and prepare SEO metadata
export async function getServerSideProps(context: GetServerSidePropsContext) {
  const param = context.params!.address;
  let address = Array.isArray(param) ? param[0] : param;

  if (ethers.utils.isAddress(address.toLowerCase())) {
    address = ethers.utils.getAddress(address.toLowerCase());
  } else {
    address = "Invalid Address";
  }

  const title = `Marketing Rewards for User ${address} | Cosmic Signature`;
  const description = `Marketing Rewards earned by User ${address}`;

  const openGraphData = [
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:image", content: logoImgUrl },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: logoImgUrl },
  ];

  return { props: { title, description, openGraphData, address } };
}

export default UserMarketingRewards;
