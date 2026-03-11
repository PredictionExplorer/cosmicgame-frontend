'use client';

import { MainWrapper } from '@/components/styled';
import {
  GlobalMarketingRewardsTable,
  type MarketingReward,
} from '@/components/tables/GlobalMarketingRewardsTable';
import { useMarketingRewards } from '@/hooks/useApiQuery';
import { Spinner } from '@/components/ui/spinner';
import { PageHeader } from '@/components/layout/PageHeader';

const MarketingRewards = () => {
  const { data: marketingRewards = [], isLoading: loading } = useMarketingRewards();

  return (
    <MainWrapper>
      <PageHeader
        title="Marketing Rewards"
        subtitle="Rewards earned through marketing and promotional activities"
      />
      <div className="mt-12">
        {loading ? (
          <div className="flex justify-center py-8">
            <Spinner />
          </div>
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
