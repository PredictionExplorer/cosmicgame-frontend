import React, { useEffect, useState } from "react";
import { Typography } from "@mui/material";
import { MainWrapper } from "../components/styled";
import api from "../services/api";
import { GlobalStakingRewardsTable } from "../components/GlobalStakingRewardsTable";
import { GetServerSideProps } from "next";
import { logoImgUrl } from "../utils";

/**
 * Staking Component
 *
 * Displays the global staking rewards for the Cosmic Signature Token.
 */
const Staking = () => {
  /**
   * State to hold the staking rewards fetched from the API.
   */
  const [stakingRewards, setStakingRewards] = useState<any>(null);

  /**
   * Fetch the staking rewards when the component mounts.
   */
  useEffect(() => {
    const fetchStakingRewards = async () => {
      try {
        const rewards = await api.get_staking_cst_rewards();
        setStakingRewards(rewards);
      } catch (error) {
        console.error("Error fetching staking rewards:", error);
      }
    };

    fetchStakingRewards();
  }, []);

  /**
   * Render the component.
   */
  return (
    <MainWrapper>
      {/* Heading Section */}
      <Typography variant="h4" color="primary" gutterBottom textAlign="center">
        Rewards for staking Cosmic Signature Token
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

      {/* Content: Display a loading indicator or the rewards table */}
      {stakingRewards === null ? (
        <Typography variant="h6">Loading...</Typography>
      ) : (
        <GlobalStakingRewardsTable list={stakingRewards} />
      )}
    </MainWrapper>
  );
};

/**
 * Server-Side Rendering (SSR) function
 *
 * Provides metadata for SEO (Open Graph and Twitter cards).
 */
export const getServerSideProps: GetServerSideProps = async () => {
  const title = "Staking | Cosmic Signature";
  const description = "Staking";

  const openGraphData = [
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:image", content: logoImgUrl },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: logoImgUrl },
  ];

  return { props: { title, description, openGraphData } };
};

export default Staking;
