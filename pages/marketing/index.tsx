import React, { useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";
import { MainWrapper } from "../../components/styled";
import api from "../../services/api";
import { GlobalMarketingRewardsTable } from "../../components/GlobalMarketingRewardsTable";
import { GetServerSideProps } from "next";

const MarketingRewards = () => {
  const [marketingRewards, setMarketingRewards] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      let marketingRewards = await api.get_marketing_rewards();
      setMarketingRewards(marketingRewards);
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

export const getServerSideProps: GetServerSideProps = async () => {
  const title = "Marketing Rewards | Cosmic Signature";
  const description = "Marketing Rewards";
  const imageUrl = "https://cosmic-game2.s3.us-east-2.amazonaws.com/logo.png";

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

export default MarketingRewards;
