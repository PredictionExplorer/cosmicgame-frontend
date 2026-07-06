'use client';

import Link from 'next/link';
import { getAddress, isAddress } from 'viem';

import { PageShell } from '@/components/ui/page-shell';
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
    <PageShell variant="marketing" backdrop="signature">
      {invalidAddress ? (
        <p className="text-lg font-semibold">Invalid Ethereum Address</p>
      ) : (
        <>
          <div className="mb-8">
            <span className="text-lg font-semibold text-primary mr-2">
              Marketing Rewards for User
            </span>
            <span className="text-lg font-semibold font-mono break-all">
              <Link
                href={`/user/${address}`}
                className="text-inherit text-[length:inherit] font-mono"
              >
                {address}
              </Link>
            </span>
          </div>
          {loading ? (
            <p className="text-lg font-semibold">Loading...</p>
          ) : (
            <MarketingRewardsTable list={(marketingRewards ?? []) as MarketingReward[]} />
          )}
        </>
      )}
    </PageShell>
  );
};

export default MarketingRewardsPage;
