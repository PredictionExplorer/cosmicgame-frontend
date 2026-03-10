'use client';

import { Box, Link, Typography } from '@mui/material';
import { getAddress, isAddress } from 'viem';

import { MainWrapper } from '@/components/styled';
import MarketingRewardsTable, {
  type MarketingReward,
} from '@/components/tables/MarketingRewardsTable';
import { useMarketingRewardsByUser } from '@/hooks/useApiQuery';

interface MarketingRewardsPageProps {
  address: string;
}

const MarketingRewardsPage = ({ address: rawAddress }: MarketingRewardsPageProps) => {
  let address = rawAddress;

  if (isAddress(address.toLowerCase())) {
    address = getAddress(address.toLowerCase());
  } else {
    address = 'Invalid Address';
  }

  const invalidAddress = address === 'Invalid Address';
  const { data: marketingRewards = [], isLoading: loading } = useMarketingRewardsByUser(
    invalidAddress ? undefined : address,
  );

  return (
    <MainWrapper>
      {invalidAddress ? (
        <Typography variant="h6">Invalid Ethereum Address</Typography>
      ) : (
        <>
          <Box mb={4}>
            <Typography variant="h6" color="primary" component="span" mr={1}>
              Marketing Rewards for User
            </Typography>
            <Typography
              variant="h6"
              component="span"
              fontFamily="monospace"
              sx={{ wordBreak: 'break-all' }}
            >
              <Link
                href={`/user/${address}`}
                style={{
                  color: 'inherit',
                  fontSize: 'inherit',
                  fontFamily: 'monospace',
                }}
              >
                {address}
              </Link>
            </Typography>
          </Box>
          {loading ? (
            <Typography variant="h6">Loading...</Typography>
          ) : (
            <MarketingRewardsTable list={(marketingRewards ?? []) as MarketingReward[]} />
          )}
        </>
      )}
    </MainWrapper>
  );
};

export default MarketingRewardsPage;
