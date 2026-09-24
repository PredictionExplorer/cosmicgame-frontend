'use client';

import type { ReactNode } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

import { Link } from '@/i18n/navigation';
import { GESTURE_METHOD_BG_CLASS, type GestureMethod } from '@/lib/theme/dataColors';
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
import { MEDIA_PLATE_CLASS, PendingPlate } from '@/components/ui/art-frame';
import { SkeletonDetailRows } from '@/components/ui/skeleton';
import { TxExplorerLink } from '@/components/ui/tx-status';
import { UnknownValue } from '@/components/ui/unknown-value';
import { RandomWalkPlate } from '@/components/nft/RandomWalkPlate';
import NFTImage from '@/components/nft/NFTImage';
import { useAttachedNftMetadata } from '@/components/attachments/useAttachedNftMetadata';
import { resolveGestureType } from '@/components/tables/GestureMethodTag';
import { useDashboardInfo, useGestureInfo } from '@/hooks/useApiQuery';
import type { GestureInfo } from '@/services/api';
import { formatCount, formatNumber } from '@/utils/format';
import { formatId } from '@/utils/format/ids';

import { useGestureNeighbours } from './gestureNeighbours';

/** The API's numeric gesture types (GestureMethodTag). */
const CST_GESTURE = 2;

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

/** A metadata field when the token URI actually carries text for it. */
function metadataText(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

/**
 * A citable instant: the full date in the reader's zone with the zone
 * printed ("May 29, 2026, 04:06:06 UTC-5"), the same zone the cycle's tables
 * use, so a gesture keeps its date on click-through and a quote of it still
 * names the zone. The exact instant and its age stay on hover.
 */
function RecordTime({ timestamp }: { timestamp: number | null | undefined }) {
  return <DateTime timestamp={timestamp} variant="full" showZone />;
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
  // The shared reader races the IPFS gateways and falls back to the
  // contract's own tokenURI, so third-party art resolves where a single
  // cross-origin fetch would be refused.
  const nftMetadata = useAttachedNftMetadata(gestureInfo?.NFTTokenURI, {
    tokenAddr: gestureInfo?.NFTDonationTokenAddr,
    tokenId: (gestureInfo?.NFTDonationTokenId ?? -1) >= 0 ? gestureInfo?.NFTDonationTokenId : null,
  });
  const tokenURI = nftMetadata.data ?? null;

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
  const method: GestureMethod =
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
      icon={<span className={cn('block size-1.5 rounded-full', GESTURE_METHOD_BG_CLASS[method])} />}
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
        // Phones: equal halves side by side, or equal full-width rows once
        // the labels no longer fit two to a line (vi at 320px).
        className={cn(
          buttonVariants({ variant: 'outline', size: 'sm' }),
          'max-sm:grow max-sm:basis-40',
        )}
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
  const nftMetadataRows = (
    [
      ['collectionName', t('nftPreview.collectionName'), tokenURI?.collection_name],
      ['artist', t('nftPreview.artist'), tokenURI?.artist],
      ['platform', t('nftPreview.platform'), tokenURI?.platform],
      ['description', t('nftPreview.description'), tokenURI?.description],
    ] as const
  ).flatMap(([key, label, raw]) => {
    const value = metadataText(raw);
    return value ? [{ key, label, value }] : [];
  });

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
                  // An ETH price reads as the wallet quoted it; CST at two decimals, like the
                  // Participation CST beside it (the exact amount is on hover).
                  <Amount
                    value={cost.value}
                    unit={cost.unit}
                    context={cost.unit === 'ETH' ? 'exact' : 'card'}
                  />
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
              <RecordTime timestamp={gestureInfo.TimeStamp} />
              <TxExplorerLink hash={gestureInfo.TxHash} label={t('header.explorer')} />
            </>
          }
          actions={
            hasSteps ? (
              <nav aria-label={t('nav.aria')} className="flex flex-wrap gap-2 max-sm:w-full">
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
                {finalizationTime === null ? unknown : <RecordTime timestamp={finalizationTime} />}
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
              {/* The header's method badge already names the token number. */}
              <RandomWalkPlate
                tokenId={rwlkId}
                alt={`${t('randomWalk.heading')} ${formatId(rwlkId)}`}
                className="max-w-xs"
              />
            </section>
          ) : null}

          {hasNft ? (
            <section aria-labelledby="gesture-nft-heading">
              <h2 id="gesture-nft-heading" className="mb-4 type-heading-3 text-foreground">
                {t('sections.nft.title')}
              </h2>
              <div className="grid gap-8 sm:grid-cols-[minmax(0,15rem)_minmax(0,1fr)]">
                {/* The media keeps its own ratio: the well does not stretch to the list beside it. */}
                <div className={cn(MEDIA_PLATE_CLASS, 'self-start')}>
                  {nftMetadata.isLoading ? (
                    <PendingPlate variant="media" busy />
                  ) : (
                    <NFTImage
                      src={tokenURI?.image}
                      fallbackSrc={tokenURI?.imageFallback}
                      alt={
                        metadataText(tokenURI?.name) ??
                        `${t('sections.nft.title')} ${gestureInfo.NFTDonationTokenId}`
                      }
                    />
                  )}
                </div>
                <dl className="self-start divide-y divide-rule-faint border-y border-rule">
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
                  {/* Collection, artist and platform are optional metadata: a row
                      appears only when the token URI names it. */}
                  {nftMetadataRows.map(({ key, label, value }) => (
                    <RecordRow key={key} label={label}>
                      {key === 'description' ? (
                        <span className="whitespace-pre-wrap text-muted-foreground">{value}</span>
                      ) : (
                        value
                      )}
                    </RecordRow>
                  ))}
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
