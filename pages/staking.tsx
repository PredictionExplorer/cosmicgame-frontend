import React, { useEffect, useState } from "react";
import { Box, Link, Typography } from "@mui/material";
import { MainWrapper } from "../components/styled";
import api from "../services/api";
import { GlobalStakingRewardsTable } from "../components/GlobalStakingRewardsTable";
import { RwalkStakingRewardMintsTable } from "../components/RwalkStakingRewardMintsTable";
import { GetServerSideProps } from "next";
import { logoImgUrl } from "../utils";

/**
 * Custom hook to fetch staking rewards data
 */
const useStakingData = () => {
  const [cosmicSignatureRewards, setCosmicSignatureRewards] = useState<any>(
    null
  );
  const [randomWalkRewards, setRandomWalkRewards] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStakingRewards = async () => {
      try {
        const [cosmicData, randomWalkData] = await Promise.all([
          api.get_staking_cst_rewards(),
          api.get_staking_rwalk_mints_global(),
        ]);

        setCosmicSignatureRewards(cosmicData);
        setRandomWalkRewards(randomWalkData);
      } catch (err) {
        console.error("Error fetching staking rewards:", err);
        setError(err?.message ?? "Failed to fetch staking rewards");
      } finally {
        setLoading(false);
      }
    };

    fetchStakingRewards();
  }, []);

  return { cosmicSignatureRewards, randomWalkRewards, loading, error };
};

/**
 * Staking Component
 *
 * Displays the global staking rewards for the Cosmic Signature Token
 * and the RandomWalk NFT.
 */
const Staking = () => {
  const {
    cosmicSignatureRewards,
    randomWalkRewards,
    loading,
    error,
  } = useStakingData();

  // Early return if there's an error
  if (error) {
    return (
      <MainWrapper>
        <Typography variant="h4" color="error" textAlign="center" gutterBottom>
          Error loading staking data
        </Typography>
        <Typography variant="body1" color="error">
          {error}
        </Typography>
      </MainWrapper>
    );
  }

  return (
    <MainWrapper>
      <Typography variant="h4" color="primary" gutterBottom textAlign="center">
        Staking Rewards for All Stakers
      </Typography>

      {/* Cosmic Signature Token Rewards */}
      <Box>
        <Typography variant="h6" mt={4}>
          CosmicSignature Token
        </Typography>
        {loading ? (
          <Typography variant="h6">Loading...</Typography>
        ) : (
          <GlobalStakingRewardsTable list={cosmicSignatureRewards} />
        )}
      </Box>

      {/* RandomWalk NFT Rewards */}
      <Box>
        <Typography variant="h6" mt={4}>
          RandomWalk NFT
        </Typography>
        {loading ? (
          <Typography variant="h6">Loading...</Typography>
        ) : (
          <RwalkStakingRewardMintsTable list={randomWalkRewards} />
        )}
      </Box>

      {/* Link to "My Staking" Page */}
      <Typography mt={6}>
        To participate in Staking, visit{" "}
        <Link href="/my-staking" sx={{ color: "inherit" }}>
          &quot;MY STAKING&quot;
        </Link>
        . (option available from the Account menu)
      </Typography>
    </MainWrapper>
  );
};

/**
 * Server-Side Rendering (SSR) function
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
