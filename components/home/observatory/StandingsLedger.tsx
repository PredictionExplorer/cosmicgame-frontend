'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { ArrowRight, MessageSquare, type LucideIcon } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

import { AddressChip } from '@/components/ui/address-chip';
import { Amount } from '@/components/ui/amount';
import { Badge } from '@/components/ui/badge';
import { DateTime } from '@/components/ui/date-time';
import { Duration } from '@/components/ui/duration';
import { ExplainedTerm } from '@/components/ui/explain-popover';
import { LiveStatus } from '@/components/ui/live-status';
import { Term } from '@/components/ui/term';
import { UnknownValue } from '@/components/ui/unknown-value';
import type { ChampionsState } from '@/hooks/useChampions';
import { useFormat } from '@/hooks/useFormat';
import type { PositionMoment } from '@/hooks/usePositionMoment';
import { Link } from '@/i18n/navigation';
import {
  ChronoWarriorIcon,
  EnduranceChampionIcon,
  FinalCstGestureIcon,
  GestureIcon,
} from '@/lib/conceptIcons';
import { cn } from '@/lib/utils';
import type { GestureInfo } from '@/services/api';
import { formatPercent, sameAddress } from '@/utils/format';
import {
  formatGestureMethod,
  formatAttachedAssets,
  getAttachedAssetLabels,
  getCstGestureCost,
  getEthGestureCost,
  getParticipationCST,
  hasRandomWalkToken,
  resolveGestureType,
} from '@/utils/gesturePayment';

import { ValuePending } from './ValuePending';

/** How long a changed row carries its --live rule (docs/design-system.md, duration-settle). */
const SETTLE_MS = 900;

/**
 * The ledger's columns: role, holder, time held, allocation. Every row uses
 * the same proportional template (and the header row repeats it), so holders,
 * durations and allocations line up down the ledger at every width where the
 * ledger is a table. Below 30rem of ledger width each row reads as a record.
 */
const ROW_GRID =
  '@[30rem]/ledger:grid @[30rem]/ledger:grid-cols-[minmax(0,1.25fr)_minmax(0,1.1fr)_minmax(0,1fr)_minmax(0,0.95fr)] @[30rem]/ledger:items-start @[30rem]/ledger:gap-x-4';
const FIELDS_GRID =
  '@[30rem]/ledger:col-span-3 @[30rem]/ledger:grid @[30rem]/ledger:grid-cols-subgrid';

export interface StandingsLedgerProps {
  champions: ChampionsState;
  /** The indexed transaction of the Last Gesture holder, when it has arrived. */
  latestGesture?: GestureInfo | null;
  /** The holder is known but their transaction row has not been indexed yet. */
  gestureDetailsPending?: boolean;
  /** A Gesture exists in this cycle (the dashboard names a latest participant). */
  showLastGesture?: boolean;
  account?: string | null;
  /** The Chrono-Warrior's ETH allocation; null while the reserve is unknown. */
  chronoEth: number | null;
  /** The connected wallet's latest change of position, for the landed line. */
  moment?: PositionMoment | null;
  className?: string;
}

/** True for SETTLE_MS after `value` changes (never on the first render). */
function useSettle(value: string | null): boolean {
  const [previous, setPrevious] = useState(value);
  const [settling, setSettling] = useState(false);
  if (value !== previous) {
    setPrevious(value);
    setSettling(true);
  }
  useEffect(() => {
    if (!settling) return undefined;
    const id = window.setTimeout(() => setSettling(false), SETTLE_MS);
    return () => window.clearTimeout(id);
  }, [settling]);
  return settling;
}

interface LedgerRowProps {
  testId: string;
  icon: LucideIcon;
  role: ReactNode;
  holder: string | null;
  emptyText: string;
  account: string | null;
  time: ReactNode;
  allocation: ReactNode;
  children?: ReactNode;
}

function LedgerRow({
  testId,
  icon: Icon,
  role,
  holder,
  emptyText,
  account,
  time,
  allocation,
  children,
}: LedgerRowProps) {
  const t = useTranslations('home.observatory.ledger');
  const tTables = useTranslations('tables');
  const isYou = sameAddress(account, holder);
  const settling = useSettle(holder);

  return (
    <li
      data-testid={testId}
      data-empty={!holder || undefined}
      data-current={isYou || undefined}
      data-settling={settling || undefined}
      className={cn(
        'relative py-2.5 transition-shadow duration-[var(--duration-settle)] ease-[var(--ease-out-soft)]',
        // The connected wallet's row keeps its place and carries the 2px
        // accent rule; a row whose holder just changed carries --live.
        isYou && 'shadow-[inset_2px_0_0_hsl(var(--primary))] ps-3',
        settling && 'shadow-[inset_2px_0_0_hsl(var(--live))] ps-3',
      )}
    >
      <div className={ROW_GRID}>
        <h3 className="flex min-w-0 items-start gap-2 type-label font-medium text-foreground">
          <Icon className="mt-px size-4 shrink-0 text-subtle" aria-hidden />
          <span className="min-w-0">{role}</span>
        </h3>
        <dl className={cn('mt-2 grid gap-y-1.5 @[30rem]/ledger:mt-0', FIELDS_GRID)}>
          <div className="flex min-w-0 items-baseline justify-between gap-3 @[30rem]/ledger:block">
            <dt className="type-label text-subtle @[30rem]/ledger:sr-only">
              {t('columns.holder')}
            </dt>
            <dd className="flex min-w-0 flex-wrap items-center justify-end gap-1.5 @[30rem]/ledger:justify-start">
              {holder ? (
                <>
                  <AddressChip
                    address={holder}
                    variant="plain"
                    showCopy={false}
                    label={false}
                    className="type-hash text-foreground"
                  />
                  {isYou && (
                    <Badge tone="accent" size="sm">
                      {tTables('status.youBadge')}
                    </Badge>
                  )}
                </>
              ) : (
                <span className="type-caption text-subtle">{emptyText}</span>
              )}
            </dd>
          </div>
          <div className="flex min-w-0 items-baseline justify-between gap-3 @[30rem]/ledger:block">
            <dt className="type-label text-subtle @[30rem]/ledger:sr-only">{t('columns.time')}</dt>
            <dd className="min-w-0 text-end @[30rem]/ledger:text-start">{time}</dd>
          </div>
          <div className="flex min-w-0 items-baseline justify-between gap-3 @[30rem]/ledger:block">
            <dt className="type-label text-subtle @[30rem]/ledger:sr-only">
              {t('columns.allocation')}
            </dt>
            <dd className="min-w-0 text-end">{allocation}</dd>
          </div>
        </dl>
        {children && (
          <div className="mt-2.5 min-w-0 @[30rem]/ledger:col-span-3 @[30rem]/ledger:col-start-2">
            {children}
          </div>
        )}
      </div>
    </li>
  );
}

/** A duration that is live (--live while it grows), a record, or not measurable yet. */
function TimeHeld({
  seconds,
  live,
  caption,
  pending = false,
}: {
  seconds: number;
  live: boolean;
  caption?: string;
  pending?: boolean;
}) {
  return (
    <span className="inline-flex flex-col items-end @[30rem]/ledger:items-start">
      {pending ? (
        <ValuePending ch={9} className="type-figure-sm" />
      ) : (
        <Duration
          seconds={seconds}
          className={cn('type-figure-sm', live ? 'text-live' : 'text-foreground')}
        />
      )}
      {caption && (
        <span
          className={cn(
            'type-caption inline-flex items-center gap-1.5',
            live ? 'text-live' : 'text-subtle',
          )}
        >
          {live && <span aria-hidden className="size-1.5 rounded-full bg-live" />}
          {caption}
        </span>
      )}
    </span>
  );
}

/** A 2px progress rule against a record, with its caption and percentage. */
function RecordProgress({
  percent,
  caption,
  live,
  label,
}: {
  percent: number;
  caption: string;
  live: boolean;
  label: string;
}) {
  const locale = useLocale();
  const value = Math.max(0, Math.min(100, percent));
  return (
    <div data-testid="latest-endurance-progress">
      <div className="flex items-baseline justify-between gap-3">
        <span className={cn('type-caption', live ? 'text-live' : 'text-muted-foreground')}>
          {caption}
        </span>
        <span className="type-caption tabular-nums text-subtle">
          {formatPercent(Math.floor(value), locale, { maximumFractionDigits: 0 })}
        </span>
      </div>
      <div
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.floor(value)}
        className="mt-1.5 h-0.5 w-full rounded-pill bg-rule"
      >
        <div
          className={cn(
            'h-full rounded-pill transition-[width] duration-[var(--duration-slow)]',
            live ? 'bg-live' : 'bg-primary',
          )}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

/** What the Last Gesture paid, received and when: one wall-label line, never a grid of boxes. */
function GestureFacts({ gesture, pending }: { gesture: GestureInfo | null; pending: boolean }) {
  const t = useTranslations('home.observatory');
  const tTables = useTranslations('tables');

  if (!gesture) {
    return (
      <p
        data-testid="latest-participant-gesture-syncing"
        role="status"
        className="type-caption text-subtle"
      >
        {pending
          ? tTables('specialAllocation.gestureDetailsSyncing')
          : tTables('specialAllocation.gestureDetailsUnavailable')}
      </p>
    );
  }

  const isCst = resolveGestureType(gesture) === 2;
  const paid = isCst ? getCstGestureCost(gesture) : getEthGestureCost(gesture);
  const received = getParticipationCST(gesture);
  const unavailable = tTables('status.unavailable');
  const message = gesture.Message?.trim() ?? '';
  // Paid and received carry visible labels; the method shows only when the
  // unit does not already say it (a Random Walk NFT), and the time and the
  // position read as themselves, labelled for screen readers.
  const facts: {
    key: string;
    label: string;
    value: ReactNode;
    testId?: string;
    quietLabel?: boolean;
  }[] = [
    {
      key: 'paid',
      testId: 'latest-participant-paid-amount',
      label: t('ledger.paid'),
      value:
        paid === undefined ? (
          <UnknownValue label={unavailable} />
        ) : (
          <Amount value={paid} unit={isCst ? 'CST' : 'ETH'} context={isCst ? 'card' : 'exact'} />
        ),
    },
    {
      key: 'received',
      testId: 'latest-participant-cst-received',
      label: t('ledger.received'),
      value:
        received === undefined ? (
          <UnknownValue label={unavailable} />
        ) : (
          <Amount value={received} unit="CST" context="card" />
        ),
    },
    {
      key: 'time',
      quietLabel: true,
      label: tTables('specialAllocation.gestureTime'),
      value:
        typeof gesture.TimeStamp === 'number' && gesture.TimeStamp > 0 ? (
          <DateTime timestamp={gesture.TimeStamp} />
        ) : (
          <UnknownValue label={unavailable} />
        ),
    },
    {
      key: 'position',
      quietLabel: true,
      testId: 'latest-participant-gesture-id',
      label: t('ledger.position'),
      // The position is the way into the Gesture's own record.
      value: (
        <Link
          href={`/gesture/${gesture.EvtLogId}`}
          aria-label={`${t('intel.viewGesture')} ${
            typeof gesture.BidPosition === 'number' ? `#${gesture.BidPosition}` : ''
          }`.trim()}
          className="link-quiet inline-flex items-center gap-1 text-primary"
        >
          {typeof gesture.BidPosition === 'number'
            ? `#${gesture.BidPosition}`
            : t('intel.viewGesture')}
          <ArrowRight className="size-3.5 text-subtle" aria-hidden />
        </Link>
      ),
    },
  ];
  if (hasRandomWalkToken(gesture) || resolveGestureType(gesture) === 1) {
    facts.splice(2, 0, {
      key: 'method',
      testId: 'latest-participant-method',
      label: tTables('specialAllocation.method'),
      value: formatGestureMethod(gesture, tTables('status.unknown')),
    });
  }
  if (getAttachedAssetLabels(gesture).length > 0) {
    facts.push({
      key: 'assets',
      testId: 'latest-participant-attached-assets',
      label: tTables('specialAllocation.attachedAssets'),
      value: formatAttachedAssets(gesture, tTables('status.none')),
    });
  }

  return (
    <div data-testid="latest-participant-gesture-details" className="space-y-1.5">
      <dl className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
        {facts.map((fact) => (
          <div key={fact.key} data-testid={fact.testId} className="flex items-baseline gap-1.5">
            <dt className={cn('type-caption text-subtle', fact.quietLabel && 'sr-only')}>
              {fact.label}
            </dt>
            <dd className="type-caption tabular-nums text-muted-foreground">{fact.value}</dd>
          </div>
        ))}
      </dl>
      {message && (
        <p
          data-testid="latest-participant-message"
          className="flex items-start gap-2 type-caption text-muted-foreground"
        >
          <MessageSquare className="mt-0.5 size-3.5 shrink-0 text-subtle" aria-hidden />
          <q className="line-clamp-2 break-words">{message}</q>
        </p>
      )}
    </div>
  );
}

/**
 * The Standings Ledger: the four roles a Gesture can change — Last Gesture,
 * Endurance Champion, Chrono-Warrior and Final CST Gesture — as four aligned
 * rows in one frame. Holders line up in mono, durations in tabular figures,
 * and each row carries what changes it next as a caption. The Endurance hold
 * that is measured against the Chrono record reads as one line under the
 * ledger. A row whose holder just changed settles with a 900ms --live rule;
 * the connected wallet's row carries the accent rule and a "You" tag.
 *
 * Holds are shown only when they are measured against a real clock; before
 * hydration they read as pending, never as a confident 0s or 0%.
 */
export function StandingsLedger({
  champions,
  latestGesture = null,
  gestureDetailsPending = false,
  showLastGesture = true,
  account = null,
  chronoEth,
  moment = null,
  className,
}: StandingsLedgerProps) {
  const t = useTranslations('home.observatory');
  const tTables = useTranslations('tables');
  const tHome = useTranslations('home');
  const tCommon = useTranslations('common');
  const format = useFormat();
  const { latestGesture: latest, endurance, chrono, chronoChallenge, lastCst } = champions;
  const clockKnown = latest.isTimeKnown !== false;
  const hasEnduranceRecord = !!endurance.address;
  const latestIsYou = sameAddress(account, latest.address);

  // What changes the Last Gesture row next: its hold measured against the
  // Endurance record. Unknown until the clock is.
  const latestProgress = (() => {
    if (!latest.address || !clockKnown) return null;
    if (!hasEnduranceRecord || latest.durationToBeat <= 0) {
      return {
        percent: 0,
        caption: tTables('specialAllocation.firstRecordForming'),
        live: true,
        showBar: false,
      };
    }
    if (latest.isExtendingEnduranceRecord) {
      return {
        percent: 100,
        caption: tTables('specialAllocation.extendingRecord'),
        live: true,
        showBar: true,
      };
    }
    return {
      percent: latest.progressToEnduranceChampion,
      caption: t(latest.isCurrentEnduranceChampion ? 'ledger.extendsIn' : 'ledger.passesIn', {
        duration: format.duration(latest.secondsUntilEnduranceChampion),
      }),
      live: false,
      showBar: true,
    };
  })();

  const showChallenge = !!chrono.address && chronoChallenge.hasDetails && !chronoChallenge.isLive;

  return (
    <section
      aria-labelledby="standings-ledger-title"
      data-testid="standings-ledger"
      className={cn('@container/ledger min-w-0', className)}
    >
      <header className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h2 id="standings-ledger-title" className="type-title text-foreground">
          {t('standings.title')}
        </h2>
        <LiveStatus variant="inline" queryKeys={[['currentSpecialWinners']]} />
      </header>

      {/* The column heads, once, for sighted readers; every value carries its own label. */}
      <div
        aria-hidden
        className="mt-3 hidden border-b border-rule pb-2 type-label text-subtle @[30rem]/ledger:grid @[30rem]/ledger:grid-cols-[minmax(0,1.25fr)_minmax(0,1.1fr)_minmax(0,1fr)_minmax(0,0.95fr)] @[30rem]/ledger:gap-x-4"
      >
        <span />
        <span>{t('ledger.columns.holder')}</span>
        <span>{t('ledger.columns.time')}</span>
        <span className="text-end">{t('ledger.columns.allocation')}</span>
      </div>

      <ul role="list" className="mt-3 divide-y divide-rule-faint @[30rem]/ledger:mt-0">
        <LedgerRow
          testId="latest-participant-intel"
          icon={GestureIcon}
          role={
            <ExplainedTerm definition={t('standings.latestTooltip')}>
              {tTables('specialAllocation.lastGesture')}
            </ExplainedTerm>
          }
          holder={latest.address}
          emptyText={tTables('specialAllocation.noLatestGesture')}
          account={account}
          time={
            latest.address ? (
              <TimeHeld seconds={latest.holdDuration} live={false} pending={!clockKnown} />
            ) : (
              <UnknownValue label={tTables('specialAllocation.noLatestGesture')} />
            )
          }
          allocation={
            <span className="type-label text-muted-foreground">
              {tHome('observatory.clock.reserveLabel')}
            </span>
          }
        >
          {latest.address && (
            <div className="space-y-2.5">
              {latestProgress ? (
                latestProgress.showBar ? (
                  <RecordProgress
                    percent={latestProgress.percent}
                    live={latestProgress.live}
                    label={tTables('specialAllocation.progressAria')}
                    caption={latestProgress.caption}
                  />
                ) : (
                  <p data-testid="latest-participant-status" className="type-caption text-live">
                    {latestProgress.caption}
                  </p>
                )
              ) : (
                <ValuePending ch={28} className="type-caption" />
              )}
              {latestIsYou && moment?.kind === 'landed' && (
                <p data-testid="latest-participant-landed" className="type-label text-positive">
                  {t('standing.landed')}
                </p>
              )}
              {showLastGesture && (
                <GestureFacts gesture={latestGesture} pending={gestureDetailsPending} />
              )}
            </div>
          )}
        </LedgerRow>

        <LedgerRow
          testId="control-desk-endurance"
          icon={EnduranceChampionIcon}
          role={
            <Term id="enduranceChampion">{tTables('specialAllocation.enduranceChampion')}</Term>
          }
          holder={endurance.address}
          emptyText={tTables('specialAllocation.noEnduranceRecord')}
          account={account}
          time={
            endurance.address ? (
              <TimeHeld
                seconds={endurance.duration}
                live={endurance.isLive}
                pending={endurance.isLive && !clockKnown}
                caption={endurance.isLive ? tTables('specialAllocation.growingNow') : undefined}
              />
            ) : null
          }
          allocation={
            <span className="type-figure-sm text-foreground">{t('standings.cstPlusNft')}</span>
          }
        />

        <LedgerRow
          testId="chrono-role-summary"
          icon={ChronoWarriorIcon}
          role={<Term id="chronoWarrior">{tTables('specialAllocation.chronoWarrior')}</Term>}
          holder={chrono.address}
          emptyText={tTables('specialAllocation.noChronoRecord')}
          account={account}
          time={
            chrono.address ? (
              <TimeHeld
                seconds={chrono.duration}
                live={chrono.isLive}
                caption={chrono.isLive ? tTables('specialAllocation.growingNow') : undefined}
              />
            ) : null
          }
          allocation={
            chronoEth != null ? (
              <Amount
                value={chronoEth}
                unit="ETH"
                context="card"
                className="type-figure-sm text-foreground"
              />
            ) : (
              <UnknownValue label={tCommon('status.unavailable')} />
            )
          }
        >
          {chrono.isLive &&
            chrono.willStopGrowingIn !== undefined &&
            chrono.willStopGrowingIn > 0 && (
              <p data-testid="chrono-next-change" className="type-caption text-muted-foreground">
                {t('ledger.chronoMayClose', {
                  duration: format.duration(chrono.willStopGrowingIn),
                })}
              </p>
            )}
        </LedgerRow>

        <LedgerRow
          testId="final-cst-role-summary"
          icon={FinalCstGestureIcon}
          role={<Term id="finalCstGesture">{tTables('specialAllocation.finalCstGesture')}</Term>}
          holder={lastCst.address}
          emptyText={tTables('specialAllocation.awaitingCstGesture')}
          account={account}
          time={
            // This role holds no timer: a dash for sighted readers, the reason for everyone.
            <span data-testid="final-cst-note">
              <span aria-hidden className="type-figure-sm text-subtle">
                —
              </span>
              <span className="sr-only">{t('ledger.finalCstNote')}</span>
            </span>
          }
          allocation={
            <span className="type-figure-sm text-foreground">{t('standings.cstPlusNft')}</span>
          }
        />
      </ul>

      {showChallenge && (
        <div
          data-testid="chrono-active-challenge"
          className="mt-3 @[30rem]/ledger:flex @[30rem]/ledger:flex-wrap @[30rem]/ledger:items-baseline @[30rem]/ledger:gap-x-4 @[30rem]/ledger:gap-y-1"
        >
          <p className="type-label text-muted-foreground">{t('ledger.challenge.title')}</p>
          {/* The hold belongs to the Endurance Champion in the row above
              (useChampions: the challenge address is the effective holder),
              so the line gives only its figures. */}
          <dl className="mt-1.5 grid gap-y-1 @[30rem]/ledger:mt-0 @[30rem]/ledger:flex @[30rem]/ledger:flex-wrap @[30rem]/ledger:items-baseline @[30rem]/ledger:gap-x-4">
            {[
              chronoChallenge.duration !== undefined && {
                testId: 'chrono-challenge-segment',
                label: t('ledger.challenge.held'),
                seconds: chronoChallenge.duration,
              },
              {
                testId: 'chrono-challenge-record-to-beat',
                label: t('ledger.challenge.record'),
                seconds: chronoChallenge.recordToBeat,
              },
              chronoChallenge.startsGrowingIn !== undefined && {
                testId: 'chrono-challenge-next-change',
                label: chronoChallenge.isRecordHolder
                  ? t('ledger.challenge.extendsIn')
                  : t('ledger.challenge.passesIn'),
                seconds: chronoChallenge.startsGrowingIn,
              },
            ]
              .filter((fact): fact is { testId: string; label: string; seconds: number } => !!fact)
              .map((fact) => (
                <div
                  key={fact.testId}
                  data-testid={fact.testId}
                  className="flex items-baseline justify-between gap-3 @[30rem]/ledger:justify-start @[30rem]/ledger:gap-1.5"
                >
                  <dt className="type-caption text-subtle">{fact.label}</dt>
                  <dd>
                    <Duration seconds={fact.seconds} className="type-figure-sm" />
                  </dd>
                </div>
              ))}
          </dl>
        </div>
      )}
    </section>
  );
}
