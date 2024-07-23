import React, { useEffect, useState } from "react";
import { Typography } from "@mui/material";
import { MainWrapper } from "../components/styled";
import api from "../services/api";
import { GlobalStakingRewardsTable } from "../components/GlobalStakingRewardsTable";
import { GetServerSideProps } from "next";

const Staking = () => {
  const [stakingRewards, setStakingRewards] = useState(null);
  useEffect(() => {
    const fetchStakingRewards = async () => {
      const rewards = await api.get_staking_cst_rewards();
      setStakingRewards(rewards);
    };
    fetchStakingRewards();
  }, []);

  return (
    <>
      <MainWrapper>
        <Typography
          variant="h4"
          color="primary"
          gutterBottom
          textAlign="center"
        >
          Staking Rewards for staking Cosmic Signature Token
        </Typography>
        <Typography
          variant="h5"
          color="primary"
          gutterBottom
          textAlign="center"
          mb={6}
        >
          (for all the stakers)
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

export const getServerSideProps: GetServerSideProps = async () => {
  const title = "Staking | Cosmic Signature";
  const description = "Staking";
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

export default Staking;
