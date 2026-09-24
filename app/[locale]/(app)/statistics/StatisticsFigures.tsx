'use client';

import { useTranslations } from 'next-intl';

import { countActiveAnchorHolders } from '@/utils/anchoringStats';
import { toFiniteNumber } from '@/utils/finiteNumber';
import { useFormat } from '@/hooks/useFormat';
import {
  useCSTDistribution,
  useCTBalancesDistribution,
  useCTStatistics,
  useDashboardInfo,
  useUniqueCSTAnchorHolders,
  useUniqueRWLKAnchorHolders,
} from '@/hooks/useApiQuery';
import { Amount } from '@/components/ui/amount';
import { Skeleton } from '@/components/ui/skeleton';
import { UnknownValue } from '@/components/ui/unknown-value';

import { dashboardCount, type DashboardCountMetric } from './dashboardCounts';

/**
 * Header figures for the statistics section pages. Each is a small client
 * island inside the server-rendered `PageHeader`: dashboard counts start
 * from the server's read (`seed`) so the server HTML holds the number, and
 * list counts show a skeleton until their query returns. A read that fails
 * shows the unknown dash, never 0.
 */

function FigureValue({ value, loading }: { value: number | null | undefined; loading: boolean }) {
  const tCommon = useTranslations('common');
  const format = useFormat();
  if (value === undefined || (loading && value === null)) {
    return loading ? (
      <Skeleton aria-hidden className="mt-1 h-6 w-16 lg:h-8" />
    ) : (
      <UnknownValue label={tCommon('status.unavailable')} />
    );
  }
  return value === null ? (
    <UnknownValue label={tCommon('status.unavailable')} />
  ) : (
    <>{format.count(value)}</>
  );
}

/** A dashboard count, live, starting from the server's read. */
export function DashboardCountFigure({
  metric,
  seed,
}: {
  metric: DashboardCountMetric;
  /** The server-read value; undefined when the server read failed. */
  seed?: number | null;
}) {
  const { data, isLoading } = useDashboardInfo(undefined, { poll: false });
  const value = data ? dashboardCount(data, metric) : seed;
  return <FigureValue value={value} loading={isLoading} />;
}

/** Distinct wallets anchoring either NFT kind now (one wallet anchoring both counts once). */
export function ActiveAnchorHoldersFigure() {
  const cst = useUniqueCSTAnchorHolders();
  const rwlk = useUniqueRWLKAnchorHolders();
  const loading = cst.isLoading || rwlk.isLoading;
  return <FigureValue value={loading ? undefined : countActiveAnchorHolders(cst.data, rwlk.data)} loading={loading} />;
}

/** Wallets holding at least one Cosmic Signature NFT. */
export function NftHoldersFigure() {
  const { data, isLoading, isError } = useCSTDistribution();
  return (
    <FigureValue
      value={isLoading ? undefined : isError || !data ? null : data.length}
      loading={isLoading}
    />
  );
}

/** Wallets holding CST. */
export function CstHoldersFigure() {
  const { data, isLoading, isError } = useCTBalancesDistribution();
  return (
    <FigureValue
      value={isLoading ? undefined : isError || !data ? null : data.length}
      loading={isLoading}
    />
  );
}

/** The CST total supply. */
export function CstSupplyFigure() {
  const tCommon = useTranslations('common');
  const { data, isLoading } = useCTStatistics();
  if (isLoading) return <Skeleton aria-hidden className="mt-1 h-6 w-24 lg:h-8" />;
  const supply = toFiniteNumber(data?.TotalSupplyEth);
  return supply === null ? (
    <UnknownValue label={tCommon('status.unavailable')} />
  ) : (
    <Amount value={supply} unit="CST" context="hero" />
  );
}
