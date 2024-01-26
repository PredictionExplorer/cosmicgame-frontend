import React, { useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";
import Head from "next/head";
import { MainWrapper } from "../../components/styled";
import api from "../../services/api";
import { PrizeTable } from "../../components/PrizeTable";
import { GlobalMarketingRewardsTable } from "../../components/GlobalMarketingRewardsTable";

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
    <>
      <Head>
        <title>Marketing Rewards | Cosmic Signature</title>
        <meta name="description" content="" />
      </Head>
      <MainWrapper>
        <Typography
          variant="h4"
          color="primary"
          gutterBottom
          textAlign="center"
        >
          Marketing Rewards
        </Typography>
        <Box mt={6}>
          {loading ? (
            <Typography variant="h6">Loading...</Typography>
          ) : (
            <GlobalMarketingRewardsTable list={marketingRewards} />
          )}
        </Box>
      </MainWrapper>
    </>
  );
};

export default MarketingRewards;
