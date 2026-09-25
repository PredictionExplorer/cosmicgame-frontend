'use client';

import type { ReactNode } from 'react';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
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
import { Duration } from '@/components/ui/duration';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { LinkifiedText } from '@/components/ui/linkified-text';
import { PageShell } from '@/components/ui/page-shell';
import { MEDIA_PLATE_CLASS, PendingPlate } from '@/components/ui/art-frame';
import { SectionHeader } from '@/components/ui/section-header';
import { Skeleton, SkeletonDetailRows } from '@/components/ui/skeleton';
import { UnknownValue } from '@/components/ui/unknown-value';
import { RecordPager } from '@/components/ui/record-pager';
import { RandomWalkPlate } from '@/components/nft/RandomWalkPlate';
import NFTImage from '@/components/nft/NFTImage';
import { useAttachedNftMetadata } from '@/components/attachments/useAttachedNftMetadata';
import { resolveGestureType } from '@/components/tables/GestureMethodTag';
import { useDashboardInfo, useGestureInfo, useRoundInfo } from '@/hooks/useApiQuery';
import { useNow } from '@/hooks/useNow';
import type { GestureInfo } from '@/services/api';
import { isRecordNotFound } from '@/services/api/readError';
import { toFiniteNumber } from '@/utils/finiteNumber';
import { NBSP, UNAVAILABLE_VALUE, formatDuration, formatNumber } from '@/utils/format';
import { formatId } from '@/utils/format/ids';
import { getExplorerUrl } from '@/utils/urls';

import { GestureCycleRail } from './GestureCycleRail';
import { useGestureNeighbours, type GestureNeighbour } from './gestureNeighbours';

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

/** Whether the gesture's cycle is still open, finalized, or not yet known. */
export type GestureCycleState = 'live' | 'finalized' | 'unknown';

/**
 * A gesture sits under its cycle, and its trail repeats that cycle page's own:
 * the live cycle is /current-cycle (Explore), a finalized one is its record
 * under Allocation Recipients. Until the dashboard says which cycle is live,
 * the trail stops at Home rather than guess, and the cycle has no link yet
 * (a live cycle's allocation page does not exist); if the dashboard cannot be
 * read, the cycle is taken as finalized. `cycleHref` is where the page's
 * links to the cycle's gestures go, from the same decision.
 */
export function gestureTrail(
  cycle: number | undefined,
  liveCycle: number | undefined | null,
  dashboardFailed: boolean,
  t: CommonTranslate,
): {
  section: 'explore' | 'records';
  trail: BreadcrumbItem[];
  cycleState: GestureCycleState;
  cycleHref: string | null;
} {
  if (
    typeof cycle !== 'number' ||
    cycle < 0 ||
    (!dashboardFailed && typeof liveCycle !== 'number')
  ) {
    return { section: 'records', trail: [], cycleState: 'unknown', cycleHref: null };
  }
  const cycleLabel = t('pageHeader.crumbs.cycle', { cycle });
  if (liveCycle === cycle) {
    return {
      section: 'explore',
      trail: [{ label: cycleLabel, href: '/current-cycle' }],
      cycleState: 'live',
      cycleHref: '/current-cycle#gesture-history',
    };
  }
  return {
    section: 'records',
    trail: [
      { label: t('pageHeader.crumbs.allocationRecipients'), href: '/allocation' },
      { label: cycleLabel, href: `/allocation/${cycle}` },
    ],
    cycleState: 'finalized',
    cycleHref: `/allocation/${cycle}`,
  };
}

/** How long a gesture stayed the Last Gesture, as far as the page can tell. */
export type GestureHold =
  | { state: 'known'; seconds: number }
  | { state: 'holding'; since: number }
  | { state: 'pending' }
  | { state: 'unknown' };

/**
 * A gesture holds the Last Gesture from its own time until the next gesture
 * of the cycle; the cycle's latest holds until the cycle finalized
 * (`cycleEnd`), or is still holding while the cycle is open. `pending` while
 * a read it depends on is in flight; `unknown` when one failed or a time is
 * missing.
 */
export function gestureHold({
  timestamp,
  next,
  settled,
  cycleState,
  cycleEnd,
}: {
  timestamp: number | null;
  next: GestureNeighbour | null;
  /** The neighbours were read. */
  settled: boolean;
  cycleState: GestureCycleState;
  /** When the finalized cycle ended (Unix seconds); undefined while its record loads. */
  cycleEnd: number | null | undefined;
}): GestureHold {
  if (timestamp === null) return { state: 'unknown' };
  if (next) {
    return next.timestamp === null
      ? { state: 'unknown' }
      : { state: 'known', seconds: Math.max(0, next.timestamp - timestamp) };
  }
  if (!settled || cycleState === 'unknown') return { state: 'pending' };
  if (cycleState === 'live') return { state: 'holding', since: timestamp };
  if (cycleEnd === undefined) return { state: 'pending' };
  return cycleEnd === null
    ? { state: 'unknown' }
    : { state: 'known', seconds: Math.max(0, cycleEnd - timestamp) };
}

/**
 * How far the gesture moved the Cycle Finalization Time: its own finalization
 * time less the one the previous gesture left. Null for a cycle's first
 * gesture, which sets the clock rather than extending it, or when a time is
 * unknown.
 */
export function clockExtension(
  finalizationTime: number | null,
  previous: GestureNeighbour | null,
): number | null {
  if (finalizationTime === null || previous?.finalizationTime == null) return null;
  const seconds = finalizationTime - previous.finalizationTime;
  return seconds > 0 ? seconds : null;
}

/** The latest gesture's hold while the cycle is open, ticking in its own node. */
function LiveHold({ since }: { since: number }) {
  const nowMs = useNow(1000);
  if (nowMs <= 0) return <Skeleton aria-hidden className="mt-1 h-7 w-28" />;
  return <Duration seconds={Math.floor(nowMs / 1000) - since} variant="clock" />;
}

/** A metadata field when the token URI actually carries text for it. */
function metadataText(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

/**
 * A citable instant: the full date in the reader's zone, as every other
 * page prints it, with that zone named beside it (UTC through hydration, so
 * the server HTML never guesses). The age and the full date stay on hover.
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
        <ArrowUpRight aria-hidden className="size-3.5 text-subtle" />
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
function RecordRow({ label, children }: { label: ReactNode; children: ReactNode }) {
  return (
    <div className="grid gap-1 py-3.5 sm:grid-cols-[minmax(0,13rem)_minmax(0,1fr)] sm:items-baseline sm:gap-8">
      <dt className="type-label text-subtle">{label}</dt>
      <dd className="min-w-0 type-body-sm text-foreground">{children}</dd>
    </div>
  );
}

/**
 * One gesture as a record people can cite, richer than the ledger row that
 * links to it: the H1 names it by its place in the cycle, the header
 * carries what it cost, what it imprinted and how long it held the Last
 * Gesture (still ticking while it does), and the meta line how it was paid
 * and when. The record adds who made it, where it moved the Cycle
 * Finalization Time and by how much, and the transaction (with the explorer
 * proof, once). The participant's message is quoted when there is one.
 * Beside the record from `lg`, the cycle: the gesture's place among its
 * gestures and, once the cycle has finalized, the Signature they shaped.
 * Previous and next step through the cycle by position: beside the title
 * from `sm`, after the page on phones, where the figures come first.
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
  const cycle = gestureInfo?.RoundNum;
  const liveCycle = dashboard?.CurRoundNum ?? serverLiveCycle ?? undefined;
  const { section, trail, cycleState, cycleHref } = gestureTrail(
    cycle,
    dashboardFailed ? null : liveCycle,
    dashboardFailed,
    (key, values) => tCommon(key, values),
  );
  // A finalized cycle's record: its total, its Signature, and when its latest gesture stopped holding.
  const roundInfo = useRoundInfo(
    cycleState === 'finalized' && typeof cycle === 'number' ? cycle : -1,
  );
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
  const timestamp = toFiniteNumber(gestureInfo.TimeStamp);
  const hold = gestureHold({
    timestamp: timestamp !== null && timestamp > 0 ? timestamp : null,
    next: neighbours.next,
    settled: neighbours.settled,
    cycleState,
    // A finalized cycle's latest gesture held until the cycle's record was written.
    cycleEnd:
      cycleState === 'finalized'
        ? roundInfo.isPending
          ? undefined
          : (toFiniteNumber(roundInfo.data?.TimeStamp) ?? null)
        : null,
  });
  const cycleTotal =
    cycleState === 'live'
      ? toFiniteNumber(dashboard?.CurNumBids)
      : toFiniteNumber(roundInfo.data?.RoundStats?.TotalBids);
  const cycleSignature =
    cycleState === 'finalized' && roundInfo.data
      ? { tokenId: roundInfo.data.TokenId, seed: roundInfo.data.TokenSeed }
      : null;
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
  const extension = clockExtension(finalizationTime, neighbours.previous);

  const heldValue: ReactNode | null =
    hold.state === 'known' ? (
      <Duration seconds={hold.seconds} variant="clock" />
    ) : hold.state === 'holding' ? (
      <LiveHold since={hold.since} />
    ) : hold.state === 'pending' ? (
      <>
        <Skeleton aria-hidden className="mt-1 h-7 w-28" />
        <span className="sr-only">{tCommon('status.loading')}</span>
      </>
    ) : null;

  const methodBadge = (
    <Badge
      data-testid="gesture-method"
      icon={<span className={cn('block size-1.5 rounded-full', GESTURE_METHOD_BG_CLASS[method])} />}
    >
      {t(`method.${method}`)}
      {rwlkId !== null ? <span className="font-mono tabular-nums">{formatId(rwlkId)}</span> : null}
    </Badge>
  );

  // The neighbours named as their own pages name them ("Gesture #1134"), with
  // their direction spoken: the one record pager every record page uses.
  const stepTarget = (direction: 'previous' | 'next') => {
    const target = neighbours[direction];
    return target
      ? {
          href: `/gesture/${target.id}`,
          label: t('header.title', { position: String(target.position) }),
        }
      : null;
  };
  const hasSteps = !!(neighbours.previous || neighbours.next);
  // Beside the title from `sm`; last on the page on phones, after the cycle.
  const stepNav = (className: string) => (
    <RecordPager
      label={t('nav.aria')}
      previousLabel={t('nav.previous')}
      nextLabel={t('nav.next')}
      previous={stepTarget('previous')}
      next={stepTarget('next')}
      className={className}
    />
  );
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
              // How long it led, not a bare cycle number: the trail and the cycle
              // column already name the cycle.
              id: 'held',
              label: t('figures.held'),
              info: t('figures.heldInfo'),
              value: heldValue,
              caption: hold.state === 'holding' ? t('figures.heldLive') : undefined,
            },
          ]}
          meta={
            // The proof is the Transaction row's; on phones a hairline keeps the
            // meta line from reading as part of the last figure.
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 max-sm:mt-1 max-sm:w-full max-sm:border-t max-sm:border-rule-faint max-sm:pt-3">
              {methodBadge}
              <RecordTime timestamp={gestureInfo.TimeStamp} />
            </div>
          }
          // Phones put the figures first and step through the cycle after the record.
          actions={hasSteps ? stepNav('max-sm:hidden') : undefined}
        />

        <div className="grid gap-x-12 gap-y-16 lg:grid-cols-12 xl:gap-x-16">
          <div className={cn(RECORD_WIDTH_CLASS, 'min-w-0 space-y-12 lg:col-span-8')}>
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
              <SectionHeader
                headingId="gesture-record-heading"
                title={t('sections.details.title')}
                className="mb-3"
              />
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
                    <>
                      <RecordTime timestamp={finalizationTime} />
                      {extension !== null ? (
                        <span
                          className="mt-0.5 block type-caption tabular-nums text-subtle"
                          data-testid="clock-extension"
                        >
                          {t('rows.clockExtended', {
                            duration: formatDuration(extension, { locale }),
                          })}
                        </span>
                      ) : null}
                    </>
                  )}
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
                <SectionHeader headingId="gesture-rwlk-heading" title={t('randomWalk.heading')} />
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
                <SectionHeader headingId="gesture-nft-heading" title={t('sections.nft.title')} />
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
          </div>

          {typeof cycle === 'number' && cycle >= 0 ? (
            <GestureCycleRail
              cycle={cycle}
              position={hasPosition ? position : null}
              total={cycleTotal}
              live={cycleState === 'unknown' ? null : cycleState === 'live'}
              signature={cycleSignature}
              cycleHref={cycleHref}
              className="lg:col-span-4"
            />
          ) : null}
        </div>

        {stepNav('mt-12 sm:hidden')}
      </div>
    </PageShell>
  );
};

export default GesturePage;
