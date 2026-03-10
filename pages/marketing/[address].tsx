import React from 'react';
import { Box, Link, Typography } from '@mui/material';
import { GetServerSidePropsContext } from 'next';
import { getAddress, isAddress } from 'viem';

import { MainWrapper } from '../../components/styled';
import MarketingRewardsTable, {
  type MarketingReward,
} from '../../components/tables/MarketingRewardsTable';
import { createOpenGraphProps } from '../../utils/seo';
import { useMarketingRewardsByUser } from '../../hooks/useApiQuery';

interface UserMarketingRewardsProps {
  address: string;
}

// Component for displaying user's marketing rewards based on Ethereum address
const UserMarketingRewards: React.FC<UserMarketingRewardsProps> = ({ address }) => {
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

// Server-side function to validate Ethereum address and prepare SEO metadata
export async function getServerSideProps(context: GetServerSidePropsContext) {
  const param = context.params!.address;
  let address = Array.isArray(param) ? param[0] : param;

  if (isAddress(address!.toLowerCase())) {
    address = getAddress(address!.toLowerCase());
  } else {
    address = 'Invalid Address';
  }

  const title = `Marketing Rewards for User ${address} | Cosmic Signature`;
  const description = `Marketing Rewards earned by User ${address}`;

  return { props: { ...createOpenGraphProps(title, description), address } };
}

export default UserMarketingRewards;
