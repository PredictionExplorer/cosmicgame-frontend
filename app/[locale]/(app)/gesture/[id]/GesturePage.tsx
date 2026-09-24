'use client';

import { useEffect, useState, type ReactNode } from 'react';
import axios from 'axios';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/utils';
import { PageHeader } from '@/components/layout/PageHeader';
import { AddressChip } from '@/components/ui/address-chip';
import { Amount } from '@/components/ui/amount';
import { Badge } from '@/components/ui/badge';
import type { BreadcrumbItem } from '@/components/ui/breadcrumbs';
import { buttonVariants } from '@/components/ui/button';
import { DateTime } from '@/components/ui/date-time';
import { EmptyState } from '@/components/ui/empty-state';
import { LinkifiedText } from '@/components/ui/linkified-text';
import { PageShell } from '@/components/ui/page-shell';
import { SkeletonDetailRows } from '@/components/ui/skeleton';
import { TxExplorerLink } from '@/components/ui/tx-status';
import { UnknownValue } from '@/components/ui/unknown-value';
import RandomWalkNFT from '@/components/nft/RandomWalkNFT';
import NFTImage from '@/components/nft/NFTImage';
import { resolveGestureType } from '@/components/tables/GestureMethodTag';
import { useDashboardInfo, useGestureInfo } from '@/hooks/useApiQuery';
import type { GestureInfo } from '@/services/api';
import { formatCount, formatNumber } from '@/utils/format';
import { formatId } from '@/utils/format/ids';

import { useGestureNeighbours } from './gestureNeighbours';

interface NFTTokenURI {
  image?: string;
  collection_name?: string;
  artist?: string;
  platform?: string;
  description?: string;
  [key: string]: unknown;
}

/** The API's numeric gesture types (GestureMethodTag). */
const CST_GESTURE = 2;

const METHOD_DOT: Readonly<Record<'eth' | 'ethRandomWalk' | 'cst', string>> = {
  eth: 'bg-method-eth',
  ethRandomWalk: 'bg-method-eth-rwlk',
  cst: 'bg-method-cst',
};

/**
 * The first real amount among the API's aliases for one field: a positive
 * one wins over a 0 left in a legacy alias, and a 0 counts only when every
 * alias agrees (a free CST gesture). Negative sentinels (-1e-18) are skipped.
 */
function firstAmount(...values: Array<number | undefined>): number | undefined {
  const finite = values.filter(
    (value): value is number => typeof value === 'number' && Number.isFinite(value),
  );
  return finite.find((value) => value > 0) ?? finite.find((value) => value === 0);
}

/** What the gesture cost, in its own currency (CST gestures pay in CST). */
export function gestureCost(gesture: GestureInfo): {
  value: number | undefined;
  unit: 'ETH' | 'CST';
} {
  if (resolveGestureType(gesture) === CST_GESTURE) {
    return {
      unit: 'CST',
      value: firstAmount(
        gesture.CstCost,
        gesture.NumCSTokensEth,
        gesture.NumCSTTokensEth,
        gesture.CstPriceEth,
      ),
    };
  }
  return {
    unit: 'ETH',
    value: firstAmount(gesture.GestureCostEth, gesture.EthPriceEth),
  };
}

/** The Participation CST the gesture imprinted. */
export function participationCst(gesture: GestureInfo): number | undefined {
  return firstAmount(gesture.ParticipationCST, gesture.CSTRewardEth, gesture.ERC20RewardAmountEth);
}

type CommonTranslate = (key: string, values?: Record<string, string | number>) => string;

/**
 * A gesture sits under its cycle, and its trail repeats that cycle page's own:
 * the live cycle is /current-cycle (Explore), a finalized one is its record
 * under Allocation Recipients. Until the dashboard says which cycle is live,
 * the trail stops at Home rather than guess; if the dashboard cannot be read,
 * the cycle is taken as finalized.
 */
export function gestureTrail(
  cycle: number | undefined,
  liveCycle: number | undefined | null,
  dashboardFailed: boolean,
  t: CommonTranslate,
): { section: 'explore' | 'records'; trail: BreadcrumbItem[] } {
  if (typeof cycle !== 'number' || cycle < 0) return { section: 'records', trail: [] };
  const cycleLabel = t('pageHeader.crumbs.cycle', { cycle });
  if (!dashboardFailed && typeof liveCycle !== 'number') return { section: 'records', trail: [] };
  if (liveCycle === cycle) {
    return { section: 'explore', trail: [{ label: cycleLabel, href: '/current-cycle' }] };
  }
  return {
    section: 'records',
    trail: [
      { label: t('pageHeader.crumbs.allocationRecipients'), href: '/allocation' },
      { label: cycleLabel, href: `/allocation/${cycle}` },
    ],
  };
}

/** One label / value line of the record. */
function RecordRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid gap-1 py-3.5 sm:grid-cols-[minmax(0,13rem)_minmax(0,1fr)] sm:items-baseline sm:gap-8">
      <dt className="type-label text-subtle">{label}</dt>
      <dd className="min-w-0 type-body-sm text-foreground">{children}</dd>
    </div>
  );
}

/**
 * One gesture as a record people can cite: the H1 names it by its place in
 * the cycle, the header carries what it cost, what it imprinted and its
 * cycle, and the meta line how it was paid, when (with the explorer proof).
 * The participant's message is quoted when there is one. Previous and next
 * step through the cycle by position.
 */
const GesturePage = ({ gestureId }: { gestureId: number }) => {
  const t = useTranslations('gesture');
  const tCommon = useTranslations('common');
  const locale = useLocale();
  const { data: gestureInfo = null, isLoading: loading } = useGestureInfo(gestureId);
  // Only to tell the live cycle (its page is /current-cycle) from a finalized one.
  const { data: dashboard, isError: dashboardFailed } = useDashboardInfo(undefined, {
    poll: false,
  });
  const neighbours = useGestureNeighbours(gestureInfo?.RoundNum, gestureInfo?.BidPosition);
  const [tokenURI, setTokenURI] = useState<NFTTokenURI | null>(null);

  useEffect(() => {
    if (!gestureInfo?.NFTTokenURI) return;
    let cancelled = false;
    axios
      .get<NFTTokenURI>(gestureInfo.NFTTokenURI)
      .then(({ data }) => {
        if (!cancelled) setTokenURI(data);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [gestureInfo?.NFTTokenURI]);

  if (gestureId < 0) {
    return (
      <PageShell variant="detail">
        <EmptyState
          variant="page"
          headingLevel={2}
          title={t('invalid.title')}
          description={t('invalid.help')}
        />
      </PageShell>
    );
  }

  const unknown = <UnknownValue label={tCommon('status.unavailable')} />;
  const position = gestureInfo?.BidPosition;
  const hasPosition = typeof position === 'number' && position > 0;
  const cycle = gestureInfo?.RoundNum;
  const { section, trail } = gestureTrail(
    cycle,
    dashboardFailed ? null : dashboard?.CurRoundNum,
    dashboardFailed,
    (key, values) => tCommon(key, values),
  );
  const cycleHref =
    typeof cycle === 'number' && !dashboardFailed && dashboard?.CurRoundNum === cycle
      ? '/current-cycle#gesture-history'
      : `/allocation/${cycle}`;
  // A position is an ordinal, not a quantity: no digit grouping ("#1141").
  const title = hasPosition
    ? t('header.title', { position: String(position) })
    : t('header.fallback');

  if (loading || !gestureInfo) {
    return (
      <PageShell variant="detail" backdrop="signature">
        <div className="mx-auto max-w-3xl">
          <PageHeader section={section} breadcrumbs={trail} title={title} />
          {loading ? (
            <SkeletonDetailRows rows={6} />
          ) : (
            <EmptyState headingLevel={2} title={t('empty.title')} description={t('empty.help')} />
          )}
        </div>
      </PageShell>
    );
  }

  const cost = gestureCost(gestureInfo);
  const reward = participationCst(gestureInfo);
  const rwlkId = (gestureInfo.RWalkNFTId ?? -1) >= 0 ? (gestureInfo.RWalkNFTId as number) : null;
  const method =
    resolveGestureType(gestureInfo) === CST_GESTURE
      ? 'cst'
      : rwlkId !== null
        ? 'ethRandomWalk'
        : 'eth';
  const message = gestureInfo.Message?.trim() ?? '';
  const hasNft = !!gestureInfo.NFTDonationTokenAddr && (gestureInfo.NFTDonationTokenId ?? -1) >= 0;
  const finalizationTime =
    typeof gestureInfo.PrizeTime === 'number' && gestureInfo.PrizeTime > 0
      ? gestureInfo.PrizeTime
      : null;

  const methodBadge = (
    <Badge
      data-testid="gesture-method"
      icon={<span className={cn('block size-1.5 rounded-full', METHOD_DOT[method])} />}
    >
      {t(`method.${method}`)}
      {rwlkId !== null ? <span className="font-mono tabular-nums">{formatId(rwlkId)}</span> : null}
    </Badge>
  );

  const stepLink = (direction: 'previous' | 'next') => {
    const target = neighbours[direction];
    if (!target) return null;
    return (
      <Link
        href={`/gesture/${target.id}`}
        rel={direction === 'previous' ? 'prev' : 'next'}
        className={buttonVariants({ variant: 'outline', size: 'sm' })}
      >
        {direction === 'previous' ? <ArrowLeft aria-hidden /> : null}
        <span>
          {t(`nav.${direction}`)}
          <span className="sr-only">
            {' '}
            {t('header.title', { position: String(target.position) })}
          </span>
        </span>
        {direction === 'next' ? <ArrowRight aria-hidden /> : null}
      </Link>
    );
  };
  const hasSteps = !!(neighbours.previous || neighbours.next);

  return (
    <PageShell variant="detail" backdrop="signature" className="max-sm:pb-16">
      <div className="mx-auto max-w-3xl">
        <PageHeader
          section={section}
          breadcrumbs={trail}
          title={title}
          figures={[
            {
              id: 'cost',
              label: t('figures.cost'),
              value:
                cost.value === undefined ? null : (
                  <Amount value={cost.value} unit={cost.unit} context="exact" />
                ),
            },
            {
              id: 'participationCst',
              label: t('figures.participationCst'),
              value: reward === undefined ? null : <Amount value={reward} unit="CST" />,
            },
            {
              id: 'cycle',
              label: t('figures.cycle'),
              value:
                typeof cycle === 'number' ? (
                  <Link href={cycleHref} className="link-quiet">
                    {formatCount(cycle, locale)}
                  </Link>
                ) : null,
            },
          ]}
          meta={
            <>
              {methodBadge}
              <DateTime timestamp={gestureInfo.TimeStamp} variant="full" />
              <TxExplorerLink hash={gestureInfo.TxHash} label={t('header.explorer')} />
            </>
          }
          actions={
            hasSteps ? (
              <nav aria-label={t('nav.aria')} className="flex gap-2">
                {stepLink('previous')}
                {stepLink('next')}
              </nav>
            ) : undefined
          }
        />

        <div className="space-y-12">
          {message ? (
            <figure data-testid="gesture-message">
              <figcaption className="type-label text-subtle">
                {t('sections.message.title')}
              </figcaption>
              <blockquote className="mt-3 border-l-2 border-primary pl-5 type-prose whitespace-pre-wrap text-foreground [overflow-wrap:anywhere]">
                <LinkifiedText text={message} />
              </blockquote>
            </figure>
          ) : null}

          <section aria-labelledby="gesture-record-heading">
            <h2 id="gesture-record-heading" className="mb-2 type-heading-3 text-foreground">
              {t('sections.details.title')}
            </h2>
            <dl className="divide-y divide-rule-faint border-y border-rule">
              <RecordRow label={t('rows.participant')}>
                <AddressChip
                  address={gestureInfo.BidderAddr}
                  display="responsive"
                  variant="plain"
                />
              </RecordRow>
              <RecordRow label={t('rows.finalizationTime')}>
                {finalizationTime === null ? (
                  unknown
                ) : (
                  <DateTime timestamp={finalizationTime} variant="full" />
                )}
              </RecordRow>
              <RecordRow label={t('rows.transaction')}>
                <span className="type-hash text-muted-foreground">{gestureInfo.TxHash}</span>
              </RecordRow>
              {gestureInfo.DonatedERC20TokenAddr ? (
                <>
                  <RecordRow label={t('rows.erc20')}>
                    <AddressChip
                      address={gestureInfo.DonatedERC20TokenAddr}
                      variant="plain"
                      display="responsive"
                    />
                  </RecordRow>
                  <RecordRow label={t('rows.erc20Amount')}>
                    <span className="tabular-nums">
                      {formatNumber(gestureInfo.DonatedERC20TokenAmountEth ?? null, locale, {
                        maximumFractionDigits: 4,
                      })}
                    </span>
                  </RecordRow>
                </>
              ) : null}
            </dl>
          </section>

          {rwlkId !== null ? (
            <section aria-labelledby="gesture-rwlk-heading">
              <h2 id="gesture-rwlk-heading" className="mb-4 type-heading-3 text-foreground">
                {t('randomWalk.heading')}
              </h2>
              <div className="max-w-xs">
                <RandomWalkNFT tokenId={rwlkId} selectable={false} />
              </div>
            </section>
          ) : null}

          {hasNft ? (
            <section aria-labelledby="gesture-nft-heading">
              <h2 id="gesture-nft-heading" className="mb-4 type-heading-3 text-foreground">
                {t('sections.nft.title')}
              </h2>
              <div className="grid gap-8 sm:grid-cols-[minmax(0,15rem)_minmax(0,1fr)]">
                <div className="overflow-hidden rounded-edge bg-art-ground">
                  <NFTImage src={tokenURI?.image} className="bg-contain" />
                </div>
                <dl className="divide-y divide-rule-faint border-y border-rule">
                  <RecordRow label={t('rows.nftContract')}>
                    <AddressChip
                      address={gestureInfo.NFTDonationTokenAddr as string}
                      variant="plain"
                      display="short"
                    />
                  </RecordRow>
                  <RecordRow label={t('rows.nftId')}>
                    <span className="type-mono">{gestureInfo.NFTDonationTokenId}</span>
                  </RecordRow>
                  <RecordRow label={t('nftPreview.collectionName')}>
                    {tokenURI?.collection_name ?? unknown}
                  </RecordRow>
                  <RecordRow label={t('nftPreview.artist')}>
                    {tokenURI?.artist ?? unknown}
                  </RecordRow>
                  <RecordRow label={t('nftPreview.platform')}>
                    {tokenURI?.platform ?? unknown}
                  </RecordRow>
                  {tokenURI?.description ? (
                    <RecordRow label={t('nftPreview.description')}>
                      <span className="whitespace-pre-wrap text-muted-foreground">
                        {tokenURI.description}
                      </span>
                    </RecordRow>
                  ) : null}
                </dl>
              </div>
            </section>
          ) : null}

          {typeof cycle === 'number' ? (
            <p>
              <Link href={cycleHref} className="link inline-flex items-center gap-1.5 type-body-sm">
                {t('nav.all', { cycle: formatCount(cycle, locale) })}
                <ArrowRight aria-hidden className="size-3.5" />
              </Link>
            </p>
          ) : null}
        </div>
      </div>
    </PageShell>
  );
};

export default GesturePage;
