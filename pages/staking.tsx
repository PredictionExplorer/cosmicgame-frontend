import React, { useEffect, useState } from "react";
import { Typography } from "@mui/material";
import Head from "next/head";
import { MainWrapper } from "../components/styled";
import api from "../services/api";
import { GlobalStakingRewardsTable } from "../components/GlobalStakingRewardsTable";

const Staking = () => {
  const [stakingRewards, setStakingRewards] = useState(null);
  useEffect(() => {
    const fetchStakingRewards = async () => {
      const rewards = await api.get_staking_rewards();
      setStakingRewards(rewards);
    };
    fetchStakingRewards();
  }, []);

  return (
    <>
      <Head>
        <title>Staking | Cosmic Signature</title>
        <meta name="description" content="" />
      </Head>
      <MainWrapper>
        <Typography
          variant="h4"
          color="primary"
          gutterBottom
          textAlign="center"
          mb={6}
        >
          Staking Rewards
        </Typography>
        {stakingRewards === null ? (
          <Typography variant="h6">Loading...</Typography>
        ) : (
          <GlobalStakingRewardsTable list={stakingRewards} />
        )}
      </MainWrapper>
    </>
  );
};

export default Staking;
