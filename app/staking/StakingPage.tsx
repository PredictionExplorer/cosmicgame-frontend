'use client';

import Link from 'next/link';

import { MainWrapper } from '@/components/styled';
import { GlobalStakingRewardsTable } from '@/components/staking/GlobalStakingRewardsTable';
import { RwalkStakingRewardMintsTable } from '@/components/staking/RwalkStakingRewardMintsTable';
import { useStakingCSTRewards, useStakingRWLKMintsGlobal } from '@/hooks/useApiQuery';
import { Spinner } from '@/components/ui/spinner';
import { ErrorState } from '@/components/ui/error-state';
import { PageHeader } from '@/components/layout/PageHeader';
import { SectionDivider } from '@/components/ui/section-divider';

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
        <ErrorState title="Error loading staking data" message={error} />
      </MainWrapper>
    );
  }

  return (
    <MainWrapper>
      <PageHeader
        title="Staking Rewards"
        subtitle="Rewards earned by all stakers across token types"
      />

      <div>
        <SectionDivider title="CosmicSignature Token" />
        {loading ? (
          <div className="flex justify-center py-8">
            <Spinner />
          </div>
        ) : (
          <GlobalStakingRewardsTable list={cosmicSignatureRewards ?? []} />
        )}
      </div>

      <div>
        <SectionDivider title="RandomWalk NFT" />
        {loading ? (
          <div className="flex justify-center py-8">
            <Spinner />
          </div>
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
