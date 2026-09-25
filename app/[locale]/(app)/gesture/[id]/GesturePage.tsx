'use client';

import type { ReactNode } from 'react';
import { ArrowLeft, ArrowRight, ExternalLink } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

import { Link } from '@/i18n/navigation';
import { GESTURE_METHOD_BG_CLASS, type GestureMethod } from '@/lib/theme/dataColors';
import { TOUCH_TARGET_EXTENDED_CLASS } from '@/lib/touch-target';
import { cn } from '@/lib/utils';
import { PageHeader } from '@/components/layout/PageHeader';
import { AddressChip } from '@/components/ui/address-chip';
import { Amount } from '@/components/ui/amount';
import { Badge } from '@/components/ui/badge';
import type { BreadcrumbItem } from '@/components/ui/breadcrumbs';
import { buttonVariants } from '@/components/ui/button';
import { CopyButton } from '@/components/ui/copy-button';
import { DateTime, useTimeZoneLabel } from '@/components/ui/date-time';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
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
import { isRecordNotFound } from '@/services/api/readError';
import { NBSP, UNAVAILABLE_VALUE, formatCount, formatNumber } from '@/utils/format';
import { formatId } from '@/utils/format/ids';
import { getExplorerUrl } from '@/utils/urls';

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
 * A citable instant: the full date in UTC, as every record prints it, with
 * the zone named beside it. The reader's own time and the age are on hover.
 */
function RecordTime({ timestamp }: { timestamp: number | null | undefined }) {
  const zone = useTimeZoneLabel();
  return (
    <DateTime timestamp={timestamp} variant="full">
      {(value) =>
        value === UNAVAILABLE_VALUE ? (
          value
        ) : (
          <>
            {value}
            {NBSP}
            <span className="text-subtle">{zone}</span>
          </>
        )
      }
    </DateTime>
  );
}

/**
 * The transaction behind the record: the full hash (it may break anywhere),
 * a copy button and the explorer proof as an icon link.
 */
function TransactionHash({ hash }: { hash: string }) {
  const t = useTranslations('gesture');
  return (
    <span className="flex items-start gap-2">
      <span className="min-w-0 type-hash text-muted-foreground">{hash}</span>
      <CopyButton
        value={hash}
        label={t('rows.copyHash')}
        copiedLabel={t('rows.hashCopied')}
        className="-my-0.5"
      />
      <a
        href={getExplorerUrl('tx', hash)}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={t('header.explorer')}
        data-touch-target="extended"
        className={cn(
          '-my-0.5 inline-flex size-6 shrink-0 items-center justify-center rounded-control text-subtle transition-colors duration-fast hover:text-foreground focus-visible:text-foreground',
          TOUCH_TARGET_EXTENDED_CLASS,
        )}
      >
        <ExternalLink aria-hidden className="size-3.5" />
      </a>
    </span>
  );
}

/**
 * The record's width: wide enough on desktop for a transaction hash (66
 * mono characters) with its copy and explorer buttons on one line beside the
 * label column. The participant's message keeps the narrower reading measure.
 */
const RECORD_WIDTH_CLASS = 'max-w-4xl';

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
 * step through the cycle by position: beside the title from `sm`, after
 * the record on phones, where the figures come first.
 *
 * The page sits on the site's content edge like every other page, with the
 * record itself held to a reading width. The server reads the record
 * (page.tsx seeds the query), so the heading and figures are in the first
 * HTML. A read that fails offers a retry; a record that does not exist
 * says so and points to the current cycle.
 */
const GesturePage = ({
  gestureId,
  serverLiveCycle = null,
}: {
  gestureId: number;
  /**
   * The live cycle as the server read it for this request. The shell's
   * dashboard query takes the seed only after hydration, so without it the
   * server HTML drew a bare trail that re-routed itself once the page loaded.
   */
  serverLiveCycle?: number | null;
}) => {
  const t = useTranslations('gesture');
  const tCommon = useTranslations('common');
  const locale = useLocale();
  const {
    data: gestureInfo = null,
    isLoading: loading,
    isError,
    error,
    refetch,
  } = useGestureInfo(gestureId);
  // The API answers 400 "record not found" for an id it does not hold: that
  // is a missing record (mistyped, or not indexed yet), not a failed read.
  const readFailed = isError && !isRecordNotFound(error);
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

  const toCurrentCycle = (
    <Link href="/current-cycle" className={buttonVariants({ variant: 'outline' })}>
      {t('empty.action')}
      <ArrowRight aria-hidden />
    </Link>
  );

  // The route hands -1 for an id that is not a whole number (page.tsx).
  if (gestureId < 0) {
    return (
      <PageShell variant="data">
        <PageHeader title={t('invalid.title')} subtitle={t('invalid.help')} />
        {toCurrentCycle}
      </PageShell>
    );
  }

  const unknown = <UnknownValue label={tCommon('status.unavailable')} />;
  const position = gestureInfo?.BidPosition;
  const hasPosition = typeof position === 'number' && position > 0;
  const cycle = gestureInfo?.RoundNum;
  const liveCycle = dashboard?.CurRoundNum ?? serverLiveCycle ?? undefined;
  const { section, trail } = gestureTrail(
    cycle,
    dashboardFailed ? null : liveCycle,
    dashboardFailed,
    (key, values) => tCommon(key, values),
  );
  const cycleHref =
    typeof cycle === 'number' && !dashboardFailed && liveCycle === cycle
      ? '/current-cycle#gesture-history'
      : `/allocation/${cycle}`;
  // A position is an ordinal, not a quantity: no digit grouping ("#1141", "record 29434").
  const title = hasPosition
    ? t('header.title', { position: String(position) })
    : t('header.fallback', { id: String(gestureId) });

  if (loading || !gestureInfo) {
    return (
      <PageShell variant="data" backdrop="signature">
        <PageHeader section={section} breadcrumbs={trail} title={title} />
        <div className={RECORD_WIDTH_CLASS}>
          {loading ? (
            <SkeletonDetailRows rows={6} />
          ) : readFailed ? (
            <ErrorState
              headingLevel={2}
              title={t('error.title')}
              message={t('error.message')}
              onRetry={() => void refetch()}
            />
          ) : (
            <EmptyState
              headingLevel={2}
              title={t('empty.title')}
              description={t('empty.help')}
              action={toCurrentCycle}
            />
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
  const stepNav = (className: string) =>
    hasSteps ? (
      <nav aria-label={t('nav.aria')} className={cn('flex flex-wrap gap-2', className)}>
        {stepLink('previous')}
        {stepLink('next')}
      </nav>
    ) : null;
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
    <PageShell variant="data" backdrop="signature" className="max-sm:pb-16">
      <div>
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
              <TxExplorerLink
                hash={gestureInfo.TxHash}
                label={t('header.explorer')}
                className="min-h-6"
              />
            </>
          }
          // Phones put the figures first and step through the cycle after the record.
          actions={hasSteps ? stepNav('max-sm:hidden') : undefined}
        />

        <div className={cn(RECORD_WIDTH_CLASS, 'space-y-12')}>
          {message ? (
            <figure data-testid="gesture-message" className="max-w-3xl">
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
                {gestureInfo.TxHash ? <TransactionHash hash={gestureInfo.TxHash} /> : unknown}
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
              <Link
                href={cycleHref}
                className="link inline-flex min-h-6 items-center gap-1.5 type-body-sm"
              >
                {t('nav.all', { cycle: formatCount(cycle, locale) })}
                <ArrowRight aria-hidden className="size-3.5" />
              </Link>
            </p>
          ) : null}

          {stepNav('sm:hidden')}
        </div>
      </div>
    </PageShell>
  );
};

export default GesturePage;
