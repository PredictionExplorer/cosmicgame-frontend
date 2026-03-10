'use client';

import { Box, Typography } from '@mui/material';

import { MainWrapper } from '@/components/styled';
import {
  GlobalMarketingRewardsTable,
  type MarketingReward,
} from '@/components/tables/GlobalMarketingRewardsTable';
import { useMarketingRewards } from '@/hooks/useApiQuery';

// Main component for displaying marketing rewards
const MarketingRewards = () => {
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

export default MarketingRewards;
