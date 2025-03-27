import React, { useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";
import { MainWrapper } from "../../components/styled";
import api from "../../services/api";
import { GlobalMarketingRewardsTable } from "../../components/GlobalMarketingRewardsTable";
import { GetServerSideProps } from "next";
import { logoImgUrl } from "../../utils";

// Define the structure for marketing reward items
interface MarketingReward {
  id: number;
  reward: string;
  description?: string;
}

// Main component for displaying marketing rewards
const MarketingRewards: React.FC = () => {
  const [marketingRewards, setMarketingRewards] = useState<MarketingReward[]>(
    []
  );
  const [loading, setLoading] = useState<boolean>(true);

  // Fetch marketing rewards data on component mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const rewards = await api.get_marketing_rewards();
        setMarketingRewards(rewards);
      } catch (error) {
        console.error("Error fetching marketing rewards:", error);
      }
      setLoading(false);
    };

    fetchData();
  }, []);

  return (
    <MainWrapper>
      <Typography variant="h4" color="primary" gutterBottom textAlign="center">
        Marketing Rewards
      </Typography>
      <Box mt={6}>
        {loading ? (
          <Typography variant="h6">Loading...</Typography>
        ) : (
          <>
            <GlobalMarketingRewardsTable list={marketingRewards} />
            <Typography mt={4}>
              To earn marketing rewards by promoting our project online, please
              contact our marketing team.
            </Typography>
          </>
        )}
      </Box>
    </MainWrapper>
  );
};

// Generate SEO and Open Graph metadata server-side
export const getServerSideProps: GetServerSideProps = async () => {
  const title = "Marketing Rewards | Cosmic Signature";
  const description = "Earn marketing rewards by promoting our project online.";

  const openGraphData = [
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:image", content: logoImgUrl },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: logoImgUrl },
  ];

  return {
    props: { title, description, openGraphData },
  };
};

export default MarketingRewards;
