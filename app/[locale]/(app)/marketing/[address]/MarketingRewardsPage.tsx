'use client';

import { useTranslations } from 'next-intl';
import { getAddress, isAddress } from 'viem';

import { Link } from '@/i18n/navigation';
import { PageShell } from '@/components/ui/page-shell';
import MarketingRewardsTable, {
  type MarketingReward,
} from '@/components/tables/MarketingRewardsTable';
import { useMarketingRewardsByUser } from '@/hooks/useApiQuery';

interface MarketingRewardsPageProps {
  address: string;
}

const MarketingRewardsPage = ({ address: rawAddress }: MarketingRewardsPageProps) => {
  const t = useTranslations('marketing');
  const invalidAddress = !isAddress(rawAddress.toLowerCase());
  const address = invalidAddress ? rawAddress : getAddress(rawAddress.toLowerCase());
  const { data: marketingRewards = [], isLoading: loading } = useMarketingRewardsByUser(
    invalidAddress ? undefined : address,
  );

  return (
    <PageShell variant="marketing" backdrop="signature">
      {invalidAddress ? (
        <p className="text-lg font-semibold">{t('address.invalid')}</p>
      ) : (
        <>
          <div className="mb-8">
            <span className="text-lg font-semibold text-primary mr-2">{t('address.heading')}</span>
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
            <p className="text-lg font-semibold" role="status">
              {t('address.loading')}
            </p>
          ) : (
            <MarketingRewardsTable list={(marketingRewards ?? []) as MarketingReward[]} />
          )}
        </>
      )}
    </PageShell>
  );
};

export default MarketingRewardsPage;
