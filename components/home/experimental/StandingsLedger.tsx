'use client';

import type { ComponentType, ReactNode } from 'react';
import { ArrowRight } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

import { Link } from '@/i18n/navigation';
import { AddressChip } from '@/components/ui/address-chip';
import { Amount } from '@/components/ui/amount';
import { Badge } from '@/components/ui/badge';
import { Duration } from '@/components/ui/duration';
import { ExplainedTerm } from '@/components/ui/explain-popover';
import { SectionHeader } from '@/components/ui/section-header';
import { Skeleton, skeletonVariants } from '@/components/ui/skeleton';
import { Term } from '@/components/ui/term';
import { UnknownValue } from '@/components/ui/unknown-value';
import type { ChampionsState } from '@/hooks/useChampions';
import {
  ChronoWarriorIcon,
  EnduranceChampionIcon,
  FinalCstGestureIcon,
  GestureIcon,
} from '@/lib/conceptIcons';
import { cn } from '@/lib/utils';
import type { GestureInfo } from '@/services/api';
import { formatDuration, formatRelativeTime, sameAddress } from '@/utils/format';
import { getCstGestureCost, getEthGestureCost, resolveGestureType } from '@/utils/gesturePayment';

type RoleKey = 'latest' | 'endurance' | 'chrono' | 'lastcst';

/** The recorded Gesture types (`GestureInfo.GestureType`). */
const GESTURE_TYPE = { eth: 0, randomWalk: 1, cst: 2 } as const;

interface StandingRow {
  key: RoleKey;
  icon: ComponentType<{ className?: string; 'aria-hidden'?: boolean }>;
  name: ReactNode;
  holder: string | null;
  empty: string;
  /** A duration the role is measured by, with its label. */
  duration?: { label: string; seconds: number; live: boolean };
  /** Live growing, or a standing record. */
  state?: 'growing' | 'record';
  /** What the role receives at finalization. */
  allocation: ReactNode;
  /** What changes next, or how the role was reached. */
  caption?: ReactNode;
  /** Progress toward the record, 0–100. */
  progress?: number;
  /**
   * Who holds the role is itself measured against the clock (the latest
   * participant may already have overtaken the Endurance record), so the
   * holder line waits for a known clock.
   */
  clockBound?: boolean;
}

interface StandingsLedgerProps {
  champions: ChampionsState;
  /** The latest participant's indexed Gesture, for what it paid and when. */
  latestGesture: GestureInfo | null;
  account?: string | null;
  signatureEth: number | null;
  chronoEth: number | null;
  /**
   * The clock the champions were derived at, in epoch ms: the page's seeded
   * clock during server rendering and hydration, then the live one. `0`
   * means no clock is known yet: every figure measured against it (holds,
   * what the latest participant still needs, the progress rule, who holds
   * the Endurance record) renders as pending, never as a confident "0s".
   */
  nowMs: number;
  /** A slot under the rows: the connected wallet's position. */
  footer?: ReactNode;
  className?: string;
}

/**
 * The Standings Ledger: the four contested allocations of the cycle — Last
 * Gesture, Endurance Champion, Chrono-Warrior and Final CST Gesture — as
 * aligned rows in one frame, so the decision inputs are compared side by
 * side beside the gesture console. Each row gives the holder, the duration
 * the role is measured by (green only while it grows), what the role
 * receives, and what changes next. A role nobody holds yet says so plainly;
 * it never shows a record of 0s, and a figure measured against a clock the
 * page does not know yet is pending rather than zero.
 */
export function StandingsLedger({
  champions,
  latestGesture,
  account = null,
  signatureEth,
  chronoEth,
  nowMs,
  footer,
  className,
}: StandingsLedgerProps) {
  const t = useTranslations('home');
  const tTables = useTranslations('tables');
  const locale = useLocale();
  const duration = (seconds: number) => formatDuration(seconds, { locale });
  const clockKnown = Number.isFinite(nowMs) && nowMs > 0;

  const { latestGesture: latest, endurance, chrono, chronoChallenge, lastCst } = champions;
  const cstPlusNft = t('deck.board.cstPlusNft');
  const ethWithExtras = (eth: number | null) => (
    <>
      {eth == null ? cstPlusNft : <Amount value={eth} unit="ETH" unitClassName="text-subtle" />}
      {eth == null ? null : (
        <span className="mt-0.5 block type-caption text-subtle">{cstPlusNft}</span>
      )}
    </>
  );

  const latestCaption = (() => {
    if (!latest.address) return undefined;
    // What the latest participant still needs is measured against the clock.
    const progressLine = !clockKnown
      ? null
      : !endurance.address
        ? tTables('specialAllocation.firstRecordForming')
        : latest.isExtendingEnduranceRecord
          ? tTables('specialAllocation.extendingRecord')
          : latest.isCurrentEnduranceChampion
            ? tTables('specialAllocation.needsToExtend', {
                duration: duration(latest.secondsUntilEnduranceChampion),
              })
            : tTables('specialAllocation.needsToBecomeChampion', {
                duration: duration(latest.secondsUntilEnduranceChampion),
              });
    const gesture =
      latestGesture && sameAddress(latestGesture.BidderAddr, latest.address) ? latestGesture : null;
    const gestureType = gesture ? resolveGestureType(gesture) : undefined;
    const paidInCst = gestureType === GESTURE_TYPE.cst;
    const paid = gesture
      ? paidInCst
        ? getCstGestureCost(gesture)
        : getEthGestureCost(gesture)
      : undefined;
    // The unit already names ETH and CST; only a RandomWalk Gesture adds its method.
    const details = gesture
      ? [
          gestureType === GESTURE_TYPE.randomWalk
            ? t('deck.standings.paidVia', { method: t('form.method.randomWalk.label') })
            : null,
          gesture.TimeStamp && clockKnown
            ? formatRelativeTime(Number(gesture.TimeStamp), { locale, now: nowMs })
            : null,
        ].filter((detail): detail is string => Boolean(detail))
      : [];
    return (
      <>
        {progressLine ? (
          <span className="block" data-testid="standing-latest-progress">
            {progressLine}
          </span>
        ) : null}
        {gesture ? (
          <span
            className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-0.5"
            data-testid="standing-latest-gesture"
          >
            <span className="inline-flex items-baseline gap-1.5 whitespace-nowrap">
              {tTables('specialAllocation.amountPaid')}
              <span className="type-figure-sm text-muted-foreground">
                {paid === undefined ? (
                  <UnknownValue label={tTables('status.unavailable')} />
                ) : (
                  <Amount value={paid} unit={paidInCst ? 'CST' : 'ETH'} context="hero" />
                )}
              </span>
            </span>
            {details.length > 0 ? (
              <span className="whitespace-nowrap">{details.join(' · ')}</span>
            ) : null}
            <Link
              href={`/gesture/${gesture.EvtLogId}`}
              className="link-quiet inline-flex min-h-6 items-center gap-1 text-muted-foreground hover:text-foreground"
            >
              {t('observatory.intel.viewGesture')}
              <ArrowRight className="size-3.5 text-subtle" aria-hidden />
            </Link>
          </span>
        ) : null}
      </>
    );
  })();

  const chronoCaption = (() => {
    if (!chrono.address) return undefined;
    if (chrono.isLive) {
      return chrono.willStopGrowingIn !== undefined && chrono.willStopGrowingIn > 0 ? (
        <span className="flex flex-wrap gap-x-1.5">
          <span className="text-muted-foreground">{tTables('specialAllocation.mayCloseIn')}</span>
          <span>
            {tTables('specialAllocation.mayCloseValue', {
              duration: duration(chrono.willStopGrowingIn),
            })}
          </span>
        </span>
      ) : undefined;
    }
    return undefined;
  })();

  const rows: StandingRow[] = [
    {
      key: 'latest',
      icon: GestureIcon,
      name: (
        <ExplainedTerm definition={tTables('specialAllocation.latestTooltip')}>
          {tTables('specialAllocation.lastGesture')}
        </ExplainedTerm>
      ),
      holder: latest.address,
      empty: tTables('specialAllocation.noLatestGesture'),
      duration: latest.address
        ? {
            label: tTables('specialAllocation.currentHold'),
            seconds: latest.holdDuration,
            live: true,
          }
        : undefined,
      state: latest.address ? 'growing' : undefined,
      allocation: ethWithExtras(signatureEth),
      caption: latestCaption,
      progress:
        clockKnown && latest.address && endurance.address
          ? latest.progressToEnduranceChampion
          : undefined,
    },
    {
      key: 'endurance',
      icon: EnduranceChampionIcon,
      name: <Term id="enduranceChampion" />,
      holder: endurance.address,
      empty: tTables('specialAllocation.noEnduranceRecord'),
      duration: endurance.address
        ? {
            label: tTables('specialAllocation.enduranceWindow'),
            seconds: endurance.duration,
            live: endurance.isLive,
          }
        : undefined,
      state: endurance.address ? (endurance.isLive ? 'growing' : 'record') : undefined,
      allocation: cstPlusNft,
      clockBound: true,
    },
    {
      key: 'chrono',
      icon: ChronoWarriorIcon,
      name: <Term id="chronoWarrior" />,
      holder: chrono.address,
      empty: tTables('specialAllocation.noChronoRecord'),
      duration: chrono.address
        ? {
            label: tTables('specialAllocation.championReign'),
            seconds: chrono.duration,
            live: chrono.isLive,
          }
        : undefined,
      state: chrono.address ? (chrono.isLive ? 'growing' : 'record') : undefined,
      allocation: ethWithExtras(chronoEth),
      caption: chronoCaption,
      clockBound: true,
    },
    {
      key: 'lastcst',
      icon: FinalCstGestureIcon,
      name: <Term id="finalCstGesture" />,
      holder: lastCst.address,
      empty: tTables('specialAllocation.awaitingCstGesture'),
      allocation: cstPlusNft,
    },
  ];

  const loading = champions.isLoading && !champions.hasData;
  const challenge =
    clockKnown && chronoChallenge.hasDetails && !chronoChallenge.isLive && chronoChallenge.address
      ? chronoChallenge
      : null;
  // A live figure without a known clock: a placeholder, announced as loading.
  const pendingFigure = (
    <span data-testid="standing-pending-figure">
      <span
        aria-hidden
        className={cn(skeletonVariants(), 'inline-block h-3.5 w-16 rounded-edge align-middle')}
      />
      <span className="sr-only">{tTables('status.loading')}</span>
    </span>
  );

  return (
    <section
      aria-labelledby="standings-title"
      data-testid="standings-ledger"
      className={cn('min-w-0', className)}
    >
      <SectionHeader
        as="h2"
        size="panel"
        headingId="standings-title"
        title={t('deck.standings.title')}
        info={{
          content: tTables('specialAllocation.headingHelp'),
          label: t('deck.standings.title'),
        }}
        className="mb-2"
      />
      <ul className="divide-y divide-rule-faint border-b border-rule-faint">
        {rows.map((row) => {
          const Icon = row.icon;
          const isYou = sameAddress(row.holder, account);
          const holderPending = loading || (row.clockBound === true && !clockKnown);
          const state = holderPending ? undefined : row.state;
          return (
            <li
              key={row.key}
              data-testid={`standing-${row.key}`}
              data-state={holderPending ? 'pending' : row.holder ? (row.state ?? 'held') : 'empty'}
              className="grid grid-cols-[1rem_minmax(0,1fr)] gap-x-3 py-4 sm:grid-cols-[1rem_minmax(0,1fr)_auto]"
            >
              <Icon className="mt-0.5 size-4 text-subtle" aria-hidden />
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <p className="type-title text-foreground">{row.name}</p>
                  {state === 'growing' ? (
                    <Badge tone="live" size="sm" dot>
                      {tTables('specialAllocation.growingNow')}
                    </Badge>
                  ) : state === 'record' ? (
                    <Badge tone="neutral" size="sm">
                      {tTables('specialAllocation.recordStanding')}
                    </Badge>
                  ) : null}
                  {isYou && !holderPending ? (
                    <Badge tone="accent" size="sm">
                      {tTables('status.youBadge')}
                    </Badge>
                  ) : null}
                </div>
                {holderPending ? (
                  <Skeleton className="mt-2 h-4 w-48 max-w-full rounded-edge" />
                ) : row.holder ? (
                  <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1">
                    <AddressChip address={row.holder} variant="plain" className="type-hash" />
                    {row.duration ? (
                      <span className="inline-flex items-baseline gap-1.5">
                        <span className="type-caption text-subtle">{row.duration.label}</span>
                        {row.duration.live && !clockKnown ? (
                          pendingFigure
                        ) : (
                          <Duration
                            seconds={row.duration.seconds}
                            className={cn(
                              'type-figure-sm',
                              row.duration.live ? 'text-positive' : 'text-foreground',
                            )}
                          />
                        )}
                      </span>
                    ) : null}
                  </div>
                ) : (
                  <p className="mt-1.5 type-body-sm text-muted-foreground">{row.empty}</p>
                )}
                {row.progress != null ? (
                  <div
                    aria-hidden
                    data-testid={`standing-${row.key}-rule`}
                    className="mt-2.5 h-0.5 max-w-sm overflow-hidden rounded-pill bg-rule"
                  >
                    <div
                      className="h-full rounded-pill bg-primary"
                      style={{ width: `${Math.min(100, Math.max(0, row.progress))}%` }}
                    />
                  </div>
                ) : null}
                {row.caption && !holderPending ? (
                  <div className="mt-1.5 type-caption text-subtle">{row.caption}</div>
                ) : null}
              </div>
              <div className="col-start-2 mt-2 type-figure-sm text-foreground sm:col-start-3 sm:row-start-1 sm:mt-0 sm:text-end">
                {row.allocation}
              </div>
            </li>
          );
        })}
      </ul>
      {challenge ? (
        <p
          className="mt-3 flex flex-wrap items-center gap-x-1.5 gap-y-1 type-caption text-subtle"
          data-testid="standing-challenge"
        >
          <span className="text-muted-foreground">
            {tTables('specialAllocation.activeEnduranceChallenge')}
          </span>
          <AddressChip
            address={challenge.address as string}
            variant="plain"
            showCopy={false}
            className="type-hash"
          />
          <span aria-hidden>·</span>
          {challenge.startsGrowingIn !== undefined ? (
            <>
              <span>
                {challenge.isRecordHolder
                  ? tTables('specialAllocation.canExtendIn')
                  : tTables('specialAllocation.canOvertakeIn')}
              </span>
              <Duration seconds={challenge.startsGrowingIn} className="text-muted-foreground" />
            </>
          ) : (
            <span>
              {challenge.isRecordHolder
                ? tTables('specialAllocation.waitingToExtend')
                : tTables('specialAllocation.waitingToOvertake')}
            </span>
          )}
        </p>
      ) : null}
      {footer}
    </section>
  );
}
