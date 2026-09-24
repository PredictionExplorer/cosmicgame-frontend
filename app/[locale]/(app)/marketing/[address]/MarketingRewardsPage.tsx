'use client';

import { useMemo } from 'react';
import { ArrowRight } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { getAddress, isAddress } from 'viem';

import { Link } from '@/i18n/navigation';
import { formatAmount, formatCount } from '@/utils/format';
import { useMarketingRewardsByUser } from '@/hooks/useApiQuery';
import type { MarketingReward } from '@/services/api/types';
import {
  SMALL_ALLOCATION_CST,
  summarizeOutreachAllocations,
} from '@/components/marketing/outreachTotals';
import { LedgerPage } from '@/components/ledger/LedgerPage';
import { PageHeader, type PageHeaderFigure } from '@/components/layout/PageHeader';
import { AddressChip } from '@/components/ui/address-chip';
import { Amount } from '@/components/ui/amount';
import { DateTime } from '@/components/ui/date-time';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import MarketingRewardsTable from '@/components/tables/MarketingRewardsTable';

const NO_REWARDS: MarketingReward[] = [];

interface MarketingRewardsPageProps {
  address: string;
}

/**
 * One contributor's outreach allocations, under the Outreach Reserve: an
 * identity header (the address with copy, a way to their profile), what the
 * allocations add up to and when they began and last arrived, then the
 * allocations themselves in one reading column.
 */
export default function MarketingRewardsPage({ address: rawAddress }: MarketingRewardsPageProps) {
  const t = useTranslations('marketing');
  const locale = useLocale();
  const address = isAddress(rawAddress.toLowerCase()) ? getAddress(rawAddress.toLowerCase()) : null;
  const query = useMarketingRewardsByUser(address ?? undefined);
  const rewards = query.data ?? NO_REWARDS;
  const summary = useMemo(() => summarizeOutreachAllocations(rewards), [rewards]);

  const trail = [{ label: t('address.parent'), href: '/marketing' }];

  // While the list loads a figure is a skeleton; when it fails, the header's
  // unavailable dash (`null`). With no allocations there are no dates to show.
  const ready = !query.isLoading && !query.isError;
  const pending = query.isLoading ? <Skeleton className="h-7 w-24" /> : null;
  const figures: PageHeaderFigure[] = [
    {
      id: 'total',
      label: t('address.figures.total'),
      value: ready ? <Amount value={summary.totalCst} unit="CST" /> : pending,
    },
    {
      id: 'allocations',
      label: t('address.figures.allocations'),
      value: ready ? formatCount(summary.allocations, locale) : pending,
    },
  ];
  if (!ready || summary.allocations > 0) {
    figures.push(
      {
        id: 'first',
        label: t('address.figures.first'),
        value: ready ? <DateTime timestamp={summary.first} year="always" /> : pending,
      },
      {
        id: 'latest',
        label: t('address.figures.latest'),
        value: ready ? <DateTime timestamp={summary.latest} year="always" /> : pending,
      },
    );
  }

  const header = (
    <PageHeader
      section="records"
      breadcrumbs={trail}
      title={t('address.title')}
      subtitle={t('address.lede')}
      figures={address ? figures : undefined}
      meta={
        address ? (
          <>
            <AddressChip address={address} display="responsive" label={false} href={false} />
            <Link
              href={`/user/${address}`}
              className="link-quiet inline-flex min-h-6 items-center gap-1 text-muted-foreground"
            >
              {t('address.profile')}
              <ArrowRight aria-hidden className="size-3.5 text-subtle" />
            </Link>
          </>
        ) : undefined
      }
    />
  );

  if (!address) {
    return (
      <LedgerPage header={header} width="narrow">
        <EmptyState
          variant="page"
          headingLevel={2}
          title={t('address.invalidAddress.title')}
          description={t('address.invalidAddress.description')}
          action={
            <Link href="/marketing" className="link inline-flex items-center gap-1.5 type-body-sm">
              {t('address.invalidAddress.action')}
              <ArrowRight aria-hidden className="size-3.5" />
            </Link>
          }
        />
      </LedgerPage>
    );
  }

  return (
    <LedgerPage header={header} width="narrow">
      <MarketingRewardsTable
        list={rewards}
        loading={query.isLoading}
        error={query.isError ? t('loadError') : undefined}
        onRetry={() => void query.refetch()}
        description={
          summary.smallAllocations > 0
            ? t('address.smallNote', {
                amount: formatAmount(SMALL_ALLOCATION_CST, {
                  unit: 'CST',
                  locale,
                  context: 'table',
                }),
              })
            : undefined
        }
        emptyDescription={t('address.emptyDescription')}
      />
    </LedgerPage>
  );
}
