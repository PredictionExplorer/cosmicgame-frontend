'use client';

import { useMemo } from 'react';
import { ArrowRight } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { getAddress, isAddress } from 'viem';

import { Link } from '@/i18n/navigation';
import { formatCount } from '@/utils/format';
import { useMarketingRewardsByUser } from '@/hooks/useApiQuery';
import { useHydrated } from '@/hooks/useHydrated';
import type { MarketingReward } from '@/services/api/types';
import {
  allocatedOnOneDay,
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
 * identity header (whose record it is, directly under the title: the address
 * with copy and a way to their profile), what the allocations add up to and
 * when they began and last arrived, then the allocations themselves in one
 * reading column (a two-column table on phones too). No allocations, or a
 * failed read, stand centred on the full width like every ledger state.
 */
export default function MarketingRewardsPage({ address: rawAddress }: MarketingRewardsPageProps) {
  const t = useTranslations('marketing');
  const tTables = useTranslations('tables');
  const locale = useLocale();
  const address = isAddress(rawAddress.toLowerCase()) ? getAddress(rawAddress.toLowerCase()) : null;
  const query = useMarketingRewardsByUser(address ?? undefined);
  const rewards = query.data ?? NO_REWARDS;
  const summary = useMemo(() => summarizeOutreachAllocations(rewards), [rewards]);
  // The zone <DateTime> shows the dates in: UTC until hydration, then the reader's.
  const dateZone = useHydrated() ? 'local' : 'utc';

  const trail = [{ label: t('address.parent'), href: '/marketing' }];

  // While the list loads a figure is a skeleton; when it fails, the header's
  // unavailable dash (`null`). With no allocations there are no dates to show.
  const ready = !query.isLoading && !query.isError;
  const empty = ready && rewards.length === 0;
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
  // Each date once, at figure-md and without the current year: allocations
  // that all arrived on one day get a single date, not a first and a latest
  // minutes apart that each wrap onto two lines on a phone.
  if (ready && summary.allocations > 0 && allocatedOnOneDay(summary, dateZone)) {
    figures.push({
      id: 'allocated',
      label: t('address.figures.allocated'),
      value: <DateTime timestamp={summary.latest} year="auto" />,
      size: 'md',
    });
  } else if (!ready || summary.allocations > 0) {
    figures.push(
      {
        id: 'first',
        label: t('address.figures.first'),
        value: ready ? <DateTime timestamp={summary.first} year="auto" /> : pending,
        size: 'md',
      },
      {
        id: 'latest',
        label: t('address.figures.latest'),
        value: ready ? <DateTime timestamp={summary.latest} year="auto" /> : pending,
        size: 'md',
      },
    );
  }

  const header = (
    <PageHeader
      section="records"
      breadcrumbs={trail}
      title={t('address.title')}
      identity={
        address ? (
          // Whose record this is, before any of its figures.
          <>
            <AddressChip
              address={address}
              variant="plain"
              display="responsive"
              label={false}
              href={false}
              className="text-foreground"
            />
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
      subtitle={t('address.lede')}
      figures={address ? figures : undefined}
    />
  );

  if (!address) {
    return (
      <LedgerPage header={header}>
        <EmptyState
          variant="page"
          headingLevel={2}
          title={t('address.invalidAddress.title')}
          description={t('address.invalidAddress.description')}
          action={
            <Link
              href="/marketing"
              className="link inline-flex min-h-11 items-center gap-1.5 type-body-sm sm:min-h-6"
            >
              {t('address.invalidAddress.action')}
              <ArrowRight aria-hidden className="size-3.5" />
            </Link>
          }
        />
      </LedgerPage>
    );
  }

  return (
    <LedgerPage header={header} width={empty || query.isError ? 'full' : 'narrow'}>
      <MarketingRewardsTable
        list={rewards}
        title={tTables('outreach.allocationsTitle')}
        // A date and an amount fit side by side on any phone: a table, not records.
        layout="compact"
        loading={query.isLoading}
        error={query.isError ? t('loadError') : undefined}
        onRetry={() => void query.refetch()}
        emptyDescription={t('address.emptyDescription')}
      />
    </LedgerPage>
  );
}
