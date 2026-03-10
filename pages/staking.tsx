import React from 'react';
import { Box, Link, Typography } from '@mui/material';
import { GetServerSideProps } from 'next';

import { MainWrapper } from '../components/styled';
import { GlobalStakingRewardsTable } from '../components/staking/GlobalStakingRewardsTable';
import { RwalkStakingRewardMintsTable } from '../components/staking/RwalkStakingRewardMintsTable';
import { createOpenGraphProps } from '../utils/seo';
import { useStakingCSTRewards, useStakingRWLKMintsGlobal } from '../hooks/useApiQuery';

/**
 * Staking Component
 *
 * Displays the global staking rewards for the Cosmic Signature Token
 * and the RandomWalk NFT.
 */
const Staking = () => {
  const {
    data: cosmicSignatureRewards,
    isLoading: isLoadingCST,
    error: cstError,
  } = useStakingCSTRewards();
  const {
    data: randomWalkRewards,
    isLoading: isLoadingRWLK,
    error: rwlkError,
  } = useStakingRWLKMintsGlobal();
  const loading = isLoadingCST || isLoadingRWLK;
  const error = cstError?.message || rwlkError?.message || null;

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
          <GlobalStakingRewardsTable
            list={
              (cosmicSignatureRewards ?? []) as unknown as React.ComponentProps<
                typeof GlobalStakingRewardsTable
              >['list']
            }
          />
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
          <RwalkStakingRewardMintsTable
            list={
              (randomWalkRewards ?? []) as unknown as React.ComponentProps<
                typeof RwalkStakingRewardMintsTable
              >['list']
            }
          />
        )}
      </Box>

      {/* Link to "My Staking" Page */}
      <Typography mt={6}>
        To participate in Staking, visit{' '}
        <Link href="/my-staking" sx={{ color: 'inherit' }}>
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
export const getServerSideProps: GetServerSideProps = async () => ({
  props: createOpenGraphProps('Staking | Cosmic Signature', 'Staking'),
});

export default Staking;
