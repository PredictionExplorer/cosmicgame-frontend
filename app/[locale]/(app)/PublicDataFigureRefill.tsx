'use client';

import type { ReactElement } from 'react';
import { useTranslations } from 'next-intl';

import { Amount } from '@/components/ui/amount';
import { DateTime } from '@/components/ui/date-time';
import { Skeleton } from '@/components/ui/skeleton';
import { UnknownValue } from '@/components/ui/unknown-value';
import {
  useCharityCGDeposits,
  useCharityVoluntary,
  useCharityWithdrawals,
  useClaimHistory,
  useDonationsNFTList,
  useMarketingRewards,
  useNamedNFTs,
  useRoundList,
  useUsedRWLKNFTs,
} from '@/hooks/useApiQuery';
import { useFormat } from '@/hooks/useFormat';

import { measureRows, measureUnit, type ListMeasure } from './publicDataMeasures';

/**
 * The lists a public data page's header figures are measured from, each read
 * by the hook its ledger uses (the key `PublicDataQuerySeed` seeds), so a
 * refill shares the ledger's request instead of adding one.
 */
export type RefillSource =
  | 'roundList'
  | 'marketingRewards'
  | 'attachedNfts'
  | 'claimHistory'
  | 'namedNfts'
  | 'usedRwlkNfts'
  | 'publicGoodsDeposits'
  | 'voluntaryPublicGoods'
  | 'publicGoodsRetrievals';

interface ListRead {
  data: readonly object[] | null | undefined;
  isLoading: boolean;
}

interface MeasureProps {
  measure: ListMeasure;
  /** What a `latest` figure says for an empty list ("None yet"), in the page's copy. */
  none?: string;
}

function MeasuredFigure({ read, measure, none }: MeasureProps & { read: ListRead }) {
  const t = useTranslations('common');
  const format = useFormat();
  if (!read.data) {
    // A skeleton while the browser reads the list; "Unavailable" only when that read failed too.
    return read.isLoading ? (
      <Skeleton as="span" className="inline-block h-[1em] w-16 align-middle" />
    ) : (
      <UnknownValue label={t('status.unavailable')} />
    );
  }
  const value = measureRows(read.data, measure);
  const unit = measureUnit(measure);
  if (value === null) {
    return unit === 'date' && none ? (
      <span className="text-muted-foreground">{none}</span>
    ) : (
      <UnknownValue label={t('status.unavailable')} />
    );
  }
  if (unit === 'eth') return <Amount value={value} unit="ETH" />;
  if (unit === 'date') return <DateTime timestamp={value} year="always" />;
  return <>{format.count(value)}</>;
}

function RoundListFigure(props: MeasureProps) {
  return <MeasuredFigure read={useRoundList()} {...props} />;
}
function MarketingRewardsFigure(props: MeasureProps) {
  return <MeasuredFigure read={useMarketingRewards()} {...props} />;
}
function AttachedNftsFigure(props: MeasureProps) {
  return <MeasuredFigure read={useDonationsNFTList()} {...props} />;
}
function ClaimHistoryFigure(props: MeasureProps) {
  return <MeasuredFigure read={useClaimHistory()} {...props} />;
}
function NamedNftsFigure(props: MeasureProps) {
  return <MeasuredFigure read={useNamedNFTs()} {...props} />;
}
function UsedRwlkNftsFigure(props: MeasureProps) {
  return <MeasuredFigure read={useUsedRWLKNFTs()} {...props} />;
}
function PublicGoodsDepositsFigure(props: MeasureProps) {
  return <MeasuredFigure read={useCharityCGDeposits()} {...props} />;
}
function VoluntaryPublicGoodsFigure(props: MeasureProps) {
  return <MeasuredFigure read={useCharityVoluntary()} {...props} />;
}
function PublicGoodsRetrievalsFigure(props: MeasureProps) {
  return <MeasuredFigure read={useCharityWithdrawals()} {...props} />;
}

const SOURCE_FIGURES: Record<RefillSource, (props: MeasureProps) => ReactElement> = {
  roundList: RoundListFigure,
  marketingRewards: MarketingRewardsFigure,
  attachedNfts: AttachedNftsFigure,
  claimHistory: ClaimHistoryFigure,
  namedNfts: NamedNftsFigure,
  usedRwlkNfts: UsedRwlkNftsFigure,
  publicGoodsDeposits: PublicGoodsDepositsFigure,
  voluntaryPublicGoods: VoluntaryPublicGoodsFigure,
  publicGoodsRetrievals: PublicGoodsRetrievalsFigure,
};

/**
 * A header figure the server could not read (a rate limit while the page was
 * rendered, say), measured in the browser from the page's own list instead
 * of keeping a dash for the life of the cached page: a skeleton while the
 * list is on its way, the figure once it arrives (measured exactly as the
 * server measures it), and "Unavailable" only when the browser's read fails
 * too. The same pattern as the anchoring hub's `AnchoringHeaderCount`.
 */
export function PublicDataFigureRefill({
  source,
  ...props
}: MeasureProps & { source: RefillSource }) {
  const Figure = SOURCE_FIGURES[source];
  return <Figure {...props} />;
}
