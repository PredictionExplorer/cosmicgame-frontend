'use client';

import { useTranslations } from 'next-intl';
import { getAddress, isAddress } from 'viem';

import { Link } from '@/i18n/navigation';
import { PageHeader } from '@/components/layout/PageHeader';
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
  // One contributor's outreach allocations sit under the Outreach ledger.
  const tNav = useTranslations('nav');
  const outreachTrail = [{ label: tNav('links.outreachReserve.label'), href: '/marketing' }];

  return (
    <PageShell variant="marketing" backdrop="signature">
      {invalidAddress ? (
        <PageHeader section="records" breadcrumbs={outreachTrail} title={t('address.invalid')} />
      ) : (
        <>
          <PageHeader section="records" breadcrumbs={outreachTrail} title={t('address.heading')}>
            <Link
              href={`/user/${address}`}
              className="mt-5 inline-block break-all font-mono text-sm text-muted-foreground transition-colors hover:text-primary"
            >
              {address}
            </Link>
          </PageHeader>
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
