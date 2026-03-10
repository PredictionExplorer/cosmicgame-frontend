import React from 'react';
import { Box, Typography } from '@mui/material';
import { GetServerSideProps } from 'next';

import { MainWrapper } from '../../components/styled';
import {
  GlobalMarketingRewardsTable,
  type MarketingReward,
} from '../../components/tables/GlobalMarketingRewardsTable';
import { createOpenGraphProps } from '../../utils/seo';
import { useMarketingRewards } from '../../hooks/useApiQuery';

// Main component for displaying marketing rewards
const MarketingRewards: React.FC = () => {
  const { data: marketingRewards = [], isLoading: loading } = useMarketingRewards();

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
            <GlobalMarketingRewardsTable list={(marketingRewards ?? []) as MarketingReward[]} />
            <Typography mt={4}>
              To earn marketing rewards by promoting our project online, please contact our
              marketing team.
            </Typography>
          </>
        )}
      </Box>
    </MainWrapper>
  );
};

// Generate SEO and Open Graph metadata server-side
export const getServerSideProps: GetServerSideProps = async () => ({
  props: createOpenGraphProps(
    'Marketing Rewards | Cosmic Signature',
    'Earn marketing rewards by promoting our project online.',
  ),
});

export default MarketingRewards;
