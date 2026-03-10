'use client';

import { MainWrapper } from '@/components/styled';
import {
  GlobalMarketingRewardsTable,
  type MarketingReward,
} from '@/components/tables/GlobalMarketingRewardsTable';
import { useMarketingRewards } from '@/hooks/useApiQuery';

const MarketingRewards = () => {
  const { data: marketingRewards = [], isLoading: loading } = useMarketingRewards();

  return (
    <MainWrapper>
      <h2 className="text-2xl font-bold text-primary text-center mb-2">Marketing Rewards</h2>
      <div className="mt-12">
        {loading ? (
          <p className="text-lg font-semibold">Loading...</p>
        ) : (
          <>
            <GlobalMarketingRewardsTable list={(marketingRewards ?? []) as MarketingReward[]} />
            <p className="mt-8">
              To earn marketing rewards by promoting our project online, please contact our
              marketing team.
            </p>
          </>
        )}
      </div>
    </MainWrapper>
  );
};

export default MarketingRewards;
