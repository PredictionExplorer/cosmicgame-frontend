'use client';

import Link from 'next/link';

import { MainWrapper } from '@/components/styled';
import { GlobalStakingRewardsTable } from '@/components/staking/GlobalStakingRewardsTable';
import { RwalkStakingRewardMintsTable } from '@/components/staking/RwalkStakingRewardMintsTable';
import { useStakingCSTRewards, useStakingRWLKMintsGlobal } from '@/hooks/useApiQuery';

const StakingPage = () => {
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
        <h2 className="mb-3 text-center text-2xl font-bold text-destructive">
          Error loading staking data
        </h2>
        <p className="text-base text-destructive">{error}</p>
      </MainWrapper>
    );
  }

  return (
    <MainWrapper>
      <h2 className="mb-3 text-center text-2xl font-bold text-primary">
        Staking Rewards for All Stakers
      </h2>

      <div>
        <h4 className="mt-8 text-lg font-semibold">CosmicSignature Token</h4>
        {loading ? (
          <p className="text-lg font-semibold">Loading...</p>
        ) : (
          <GlobalStakingRewardsTable list={cosmicSignatureRewards ?? []} />
        )}
      </div>

      <div>
        <h4 className="mt-8 text-lg font-semibold">RandomWalk NFT</h4>
        {loading ? (
          <p className="text-lg font-semibold">Loading...</p>
        ) : (
          <RwalkStakingRewardMintsTable list={randomWalkRewards ?? []} />
        )}
      </div>

      <p className="mt-12">
        To participate in Staking, visit{' '}
        <Link href="/my-staking" className="text-inherit">
          &quot;MY STAKING&quot;
        </Link>
        . (option available from the Account menu)
      </p>
    </MainWrapper>
  );
};

export default StakingPage;
