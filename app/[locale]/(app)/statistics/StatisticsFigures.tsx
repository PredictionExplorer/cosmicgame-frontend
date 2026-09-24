'use client';

import { useTranslations } from 'next-intl';

import { countActiveAnchorHolders } from '@/utils/anchoringStats';
import { toFiniteNumber } from '@/utils/finiteNumber';
import { useFormat } from '@/hooks/useFormat';
import { useHydrated } from '@/hooks/useHydrated';
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
 *
 * Query data is read only after hydration (`useHydrated`): the server has
 * none, and the app shell's queries can answer before an island hydrates, so
 * a number in the first client render would not match the server HTML.
 */

/** U+2007 FIGURE SPACE: as wide as one tabular digit, and never collapsed. */
const FIGURE_SPACE = '\u2007';

/**
 * A figure on its way: a skeleton one line of the figure type tall and
 * `digits` tabular digits wide, so the row keeps its size when the number
 * arrives.
 */
function FigurePlaceholder({ digits = 3 }: { digits?: number }) {
  return (
    <span aria-hidden className="relative inline-block align-top">
      <span className="invisible">{FIGURE_SPACE.repeat(digits)}</span>
      <Skeleton as="span" className="absolute inset-x-0 inset-y-[0.12em]" />
    </span>
  );
}

function FigureValue({ value, loading }: { value: number | null | undefined; loading: boolean }) {
  const tCommon = useTranslations('common');
  const format = useFormat();
  if (value === undefined || (loading && value === null)) {
    return loading ? <FigurePlaceholder /> : <UnknownValue label={tCommon('status.unavailable')} />;
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
  const hydrated = useHydrated();
  const { data, isLoading } = useDashboardInfo(undefined, { poll: false });
  const value = hydrated && data ? dashboardCount(data, metric) : seed;
  return <FigureValue value={value} loading={!hydrated || isLoading} />;
}

/** Distinct wallets anchoring either NFT kind now (one wallet anchoring both counts once). */
export function ActiveAnchorHoldersFigure() {
  const hydrated = useHydrated();
  const cst = useUniqueCSTAnchorHolders();
  const rwlk = useUniqueRWLKAnchorHolders();
  const loading = !hydrated || cst.isLoading || rwlk.isLoading;
  return (
    <FigureValue
      value={loading ? undefined : countActiveAnchorHolders(cst.data, rwlk.data)}
      loading={loading}
    />
  );
}

/** Wallets holding at least one Cosmic Signature NFT. */
export function NftHoldersFigure() {
  const hydrated = useHydrated();
  const { data, isLoading: queryLoading, isError } = useCSTDistribution();
  const isLoading = !hydrated || queryLoading;
  return (
    <FigureValue
      value={isLoading ? undefined : isError || !data ? null : data.length}
      loading={isLoading}
    />
  );
}

/** Wallets holding CST. */
export function CstHoldersFigure() {
  const hydrated = useHydrated();
  const { data, isLoading: queryLoading, isError } = useCTBalancesDistribution();
  const isLoading = !hydrated || queryLoading;
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
  const hydrated = useHydrated();
  const { data, isLoading } = useCTStatistics();
  if (!hydrated || isLoading) return <FigurePlaceholder digits={10} />;
  const supply = toFiniteNumber(data?.TotalSupplyEth);
  return supply === null ? (
    <UnknownValue label={tCommon('status.unavailable')} />
  ) : (
    <Amount value={supply} unit="CST" context="hero" />
  );
}
