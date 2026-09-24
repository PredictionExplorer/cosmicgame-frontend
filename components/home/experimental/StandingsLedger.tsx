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
import { Skeleton } from '@/components/ui/skeleton';
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

/** The method label of a recorded Gesture, as the console names the methods. */
const METHOD_LABEL_KEYS: Record<number, string> = {
  0: 'form.method.eth.label',
  1: 'form.method.randomWalk.label',
  2: 'form.method.cst.label',
};

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
}

interface StandingsLedgerProps {
  champions: ChampionsState;
  /** The latest participant's indexed Gesture, for what it paid and when. */
  latestGesture: GestureInfo | null;
  account?: string | null;
  signatureEth: number | null;
  chronoEth: number | null;
  /** Epoch ms, for the age of the latest Gesture. */
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
 * it never shows a record of 0s.
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
    const progressLine = !endurance.address
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
    const paidInCst = gestureType === 2;
    const paid = gesture
      ? paidInCst
        ? getCstGestureCost(gesture)
        : getEthGestureCost(gesture)
      : undefined;
    const methodKey = gestureType !== undefined ? METHOD_LABEL_KEYS[gestureType] : undefined;
    return (
      <>
        <span className="block" data-testid="standing-latest-progress">
          {progressLine}
        </span>
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
                  <Amount value={paid} unit={paidInCst ? 'CST' : 'ETH'} context="exact" />
                )}
              </span>
            </span>
            <span className="inline-flex items-baseline gap-2 whitespace-nowrap">
              {methodKey ? t(methodKey) : tTables('status.unknown')}
              {gesture.TimeStamp ? (
                <>
                  <span aria-hidden>·</span>
                  {formatRelativeTime(Number(gesture.TimeStamp), { locale, now: nowMs })}
                </>
              ) : null}
            </span>
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
        latest.address && endurance.address ? latest.progressToEnduranceChampion : undefined,
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
    chronoChallenge.hasDetails && !chronoChallenge.isLive && chronoChallenge.address
      ? chronoChallenge
      : null;

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
          return (
            <li
              key={row.key}
              data-testid={`standing-${row.key}`}
              data-state={row.holder ? (row.state ?? 'held') : 'empty'}
              className="grid grid-cols-[1rem_minmax(0,1fr)] gap-x-3 py-4 sm:grid-cols-[1rem_minmax(0,1fr)_auto]"
            >
              <Icon className="mt-0.5 size-4 text-subtle" aria-hidden />
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <p className="type-title text-foreground">{row.name}</p>
                  {row.state === 'growing' ? (
                    <Badge tone="live" size="sm" dot>
                      {tTables('specialAllocation.growingNow')}
                    </Badge>
                  ) : row.state === 'record' ? (
                    <Badge tone="neutral" size="sm">
                      {tTables('specialAllocation.recordStanding')}
                    </Badge>
                  ) : null}
                  {isYou ? (
                    <Badge tone="accent" size="sm">
                      {tTables('status.youBadge')}
                    </Badge>
                  ) : null}
                </div>
                {loading ? (
                  <Skeleton className="mt-2 h-4 w-48 max-w-full rounded-edge" />
                ) : row.holder ? (
                  <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1">
                    <AddressChip address={row.holder} variant="plain" className="type-hash" />
                    {row.duration ? (
                      <span className="inline-flex items-baseline gap-1.5">
                        <span className="type-caption text-subtle">{row.duration.label}</span>
                        <Duration
                          seconds={row.duration.seconds}
                          className={cn(
                            'type-figure-sm',
                            row.duration.live ? 'text-positive' : 'text-foreground',
                          )}
                        />
                      </span>
                    ) : null}
                  </div>
                ) : (
                  <p className="mt-1.5 type-body-sm text-muted-foreground">{row.empty}</p>
                )}
                {row.progress != null ? (
                  <div
                    aria-hidden
                    className="mt-2.5 h-0.5 max-w-sm overflow-hidden rounded-pill bg-rule"
                  >
                    <div
                      className="h-full rounded-pill bg-primary"
                      style={{ width: `${Math.min(100, Math.max(0, row.progress))}%` }}
                    />
                  </div>
                ) : null}
                {row.caption && !loading ? (
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
