'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { ArrowRight, MessageSquare, type LucideIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { AddressChip } from '@/components/ui/address-chip';
import { Amount } from '@/components/ui/amount';
import { Badge } from '@/components/ui/badge';
import { DateTime } from '@/components/ui/date-time';
import { Duration } from '@/components/ui/duration';
import { ExplainedTerm } from '@/components/ui/explain-popover';
import { LiveStatus } from '@/components/ui/live-status';
import { SectionHeader } from '@/components/ui/section-header';
import { Skeleton } from '@/components/ui/skeleton';
import { Term } from '@/components/ui/term';
import { UnknownValue } from '@/components/ui/unknown-value';
import type { ChampionsState } from '@/hooks/useChampions';
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
import { sameAddress } from '@/utils/format';
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
 * ledger is a table, and the cells of a row share one baseline: the small
 * mono holder sits on the line of the larger figures beside it. Below 30rem
 * of ledger width each row reads as a record.
 */
const ROW_GRID =
  '@[30rem]/ledger:grid @[30rem]/ledger:grid-cols-[minmax(0,1.25fr)_minmax(0,1.1fr)_minmax(0,1fr)_minmax(0,0.95fr)] @[30rem]/ledger:items-baseline @[30rem]/ledger:gap-x-4';
const FIELDS_GRID =
  '@[30rem]/ledger:col-span-3 @[30rem]/ledger:grid @[30rem]/ledger:grid-cols-subgrid @[30rem]/ledger:items-baseline';

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
  /**
   * The Signature Allocation's ETH, set where the ledger shows it as the Last
   * Gesture's figure (the cycle page); null while unknown. Omitted, the row
   * names the allocation instead (the home's clock already shows the figure).
   */
  signatureEth?: number | null;
  /** The connected wallet's latest change of position, for the landed line. */
  moment?: PositionMoment | null;
  /**
   * The ledger's heading level; its four roles take the next one. 2 on the
   * home desk, 3 inside the cycle page's status section.
   */
  headingLevel?: 2 | 3;
  /** Id of the ledger's heading (it labels the section). */
  headingId?: string;
  /** A line under the heading that says what the ledger holds, where a page introduces it. */
  description?: ReactNode;
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
  /** The role's heading element: one level below the ledger's heading. */
  headingAs: 'h3' | 'h4';
  icon: LucideIcon;
  role: ReactNode;
  holder: string | null;
  /** Said once, under the role, while nobody holds it; its holder and time read as a dash. */
  emptyText: string;
  account: string | null;
  time: ReactNode;
  allocation: ReactNode;
  children?: ReactNode;
}

/** A value nobody holds yet: a dash for sighted readers, "None" for everyone. */
function NoValue() {
  const tTables = useTranslations('tables');
  return (
    <>
      <span aria-hidden className="type-figure-sm text-subtle">
        —
      </span>
      <span className="sr-only">{tTables('status.none')}</span>
    </>
  );
}

function LedgerRow({
  testId,
  headingAs: RoleHeading,
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
        'relative py-2',
        // The connected wallet's row carries a 2px accent rule and a row whose
        // holder just changed a --live one. The rule hangs in the frame's
        // gutter, so the row's columns stay aligned with the rest.
        "before:pointer-events-none before:absolute before:inset-y-2 before:-start-3 before:w-0.5 before:rounded-pill before:bg-transparent before:transition-colors before:duration-[var(--duration-settle)] before:ease-[var(--ease-out-soft)] before:content-['']",
        isYou && 'before:bg-primary',
        settling && 'before:bg-live',
      )}
    >
      <div className={ROW_GRID}>
        <div className="min-w-0">
          <RoleHeading className="flex min-w-0 items-start gap-2 type-label font-medium text-foreground">
            <Icon className="mt-px size-4 shrink-0 text-subtle" aria-hidden />
            {/* The role's text, not the icon, gives the row its baseline. */}
            <span className="min-w-0 self-baseline">{role}</span>
          </RoleHeading>
          {!holder && (
            <p data-testid={`${testId}-empty`} className="type-caption mt-1 ps-6 text-subtle">
              {emptyText}
            </p>
          )}
        </div>
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
                <NoValue />
              )}
            </dd>
          </div>
          <div className="flex min-w-0 items-baseline justify-between gap-3 @[30rem]/ledger:block">
            <dt className="type-label text-subtle @[30rem]/ledger:sr-only">{t('columns.time')}</dt>
            <dd className="min-w-0 text-end @[30rem]/ledger:text-start">
              {holder ? time : <NoValue />}
            </dd>
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

/** A 2px progress rule against a record. */
function RecordRule({ percent, live, label }: { percent: number; live: boolean; label: string }) {
  const value = Math.max(0, Math.min(100, percent));
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.floor(value)}
      className="h-0.5 w-full rounded-pill bg-rule"
    >
      <div
        className={cn(
          'h-full rounded-pill transition-[width] duration-[var(--duration-slow)]',
          live ? 'bg-live' : 'bg-primary',
        )}
        style={{ width: `${value}%` }}
      />
    </div>
  );
}

interface LedgerFact {
  key: string;
  testId?: string;
  label: string;
  /** A duration in seconds: a reign so far or the time left until a change. */
  seconds: number;
}

/**
 * What changes a row next, as label and figure lines: the label wraps and
 * the figure sits in its own column and never does, so a ticking figure can
 * never re-wrap the line and move the desk (the ledger is measured against
 * the rows of the page, not its own content). Every figure reads as a clock
 * ("1d 01:12:05" over "8d 00:24:38"), so stacked lines share one format,
 * their digits align, and a width holds while it ticks.
 */
function LedgerFacts({ facts }: { facts: LedgerFact[] }) {
  return (
    <dl className="grid gap-y-1">
      {facts.map((fact) => (
        <div
          key={fact.key}
          data-testid={fact.testId}
          className="grid grid-cols-[minmax(0,3fr)_minmax(0,2fr)] items-baseline gap-x-3"
        >
          <dt className="type-caption min-w-0 text-muted-foreground">{fact.label}</dt>
          <dd className="type-caption min-w-0 text-end text-foreground">
            <Duration seconds={fact.seconds} variant="clock" />
          </dd>
        </div>
      ))}
    </dl>
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
          <DateTime timestamp={gesture.TimeStamp} showZone />
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
          className="link-quiet inline-flex min-h-6 items-center gap-1 text-primary"
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

/** Four placeholder rows in the ledger's own template while the holders are read. */
function LedgerSkeleton() {
  return (
    <>
      {[0, 1, 2, 3].map((row) => (
        <li key={row} data-testid="standings-ledger-skeleton-row" aria-hidden className="py-2">
          <div className={ROW_GRID}>
            <span className="flex items-center gap-2">
              <Skeleton className="size-4 shrink-0 rounded-edge" />
              <Skeleton className="h-3.5 w-32" />
            </span>
            <span className="mt-2 flex flex-col gap-1.5 @[30rem]/ledger:col-span-3 @[30rem]/ledger:mt-0 @[30rem]/ledger:grid @[30rem]/ledger:grid-cols-subgrid">
              <Skeleton className="h-3.5 w-28" />
              <Skeleton className="h-3.5 w-16" />
              <Skeleton className="h-3.5 w-20 @[30rem]/ledger:justify-self-end" />
            </span>
          </div>
        </li>
      ))}
    </>
  );
}

/**
 * The Standings Ledger: the four roles a Gesture can change — Last Gesture,
 * Endurance Champion, Chrono-Warrior and Final CST Gesture — as four aligned
 * rows. Holders line up in mono, durations in tabular figures, and each row
 * carries what changes it next under it: the Last Gesture its hold against
 * the Endurance record, the Chrono-Warrior the Endurance Champion's current
 * reign against its record. Those lines have a fixed shape, so the ledger
 * keeps its height while the figures tick. A row whose holder just changed
 * settles with a 900ms --live rule; the connected wallet's row carries the
 * accent rule and a "You" tag. A role nobody holds yet says so once, under
 * its name.
 *
 * Holds are shown only when they are measured against a real clock; before
 * hydration they read as pending, never as a confident 0s or 0%. Until the
 * holders are first read the rows are placeholders, never "no record yet".
 *
 * The one standings ledger of the app: the home desk (heading level 2) and
 * the current-cycle page (level 3, with a description) both render it.
 */
export function StandingsLedger({
  champions,
  latestGesture = null,
  gestureDetailsPending = false,
  showLastGesture = true,
  account = null,
  chronoEth,
  signatureEth,
  moment = null,
  headingLevel = 2,
  headingId = 'standings-ledger-title',
  description,
  className,
}: StandingsLedgerProps) {
  const t = useTranslations('home.observatory');
  const tTables = useTranslations('tables');
  const tHome = useTranslations('home');
  const tCommon = useTranslations('common');
  const { latestGesture: latest, endurance, chrono, chronoChallenge, lastCst } = champions;
  const clockKnown = latest.isTimeKnown !== false;
  const hasEnduranceRecord = !!endurance.address;
  const latestIsYou = sameAddress(account, latest.address);
  const loading = champions.isLoading && !champions.hasData;
  const Heading = headingLevel === 2 ? 'h2' : 'h3';
  const roleHeading = headingLevel === 2 ? 'h3' : 'h4';

  // What changes the Last Gesture row next: its hold measured against the
  // Endurance record. Unknown until the clock is.
  const latestProgress: {
    percent: number;
    live: boolean;
    caption?: string;
    showBar: boolean;
    fact?: LedgerFact;
  } | null = (() => {
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
      live: false,
      showBar: true,
      fact: {
        key: 'endurance',
        testId: 'latest-endurance-countdown',
        label: t(
          latest.isCurrentEnduranceChampion ? 'ledger.extendsRecordIn' : 'ledger.passesRecordIn',
        ),
        seconds: latest.secondsUntilEnduranceChampion,
      },
    };
  })();

  // The Endurance Champion's current reign against the Chrono-Warrior record,
  // under the row it can change. Its holder is named once, on the Endurance
  // Champion row.
  const showChallenge =
    !loading && !!chrono.address && chronoChallenge.hasDetails && !chronoChallenge.isLive;
  const challengeFacts: LedgerFact[] = [];
  if (showChallenge && chronoChallenge.duration !== undefined) {
    challengeFacts.push({
      key: 'reign',
      testId: 'chrono-challenge-segment',
      label: t('ledger.challenge.reign'),
      seconds: chronoChallenge.duration,
    });
  }
  if (showChallenge && chronoChallenge.startsGrowingIn !== undefined) {
    challengeFacts.push({
      key: 'passes',
      testId: 'chrono-challenge-next-change',
      label: t('ledger.challenge.passesIn'),
      seconds: chronoChallenge.startsGrowingIn,
    });
  }
  const challengePercent =
    chronoChallenge.duration !== undefined && chronoChallenge.recordToBeat > 0
      ? (chronoChallenge.duration / (chronoChallenge.recordToBeat + 1)) * 100
      : null;

  return (
    <section
      aria-labelledby={headingId}
      aria-busy={loading || undefined}
      data-testid="standings-ledger"
      className={cn('@container/ledger min-w-0', className)}
    >
      <SectionHeader
        as={Heading}
        size="panel"
        headingId={headingId}
        title={t('standings.title')}
        description={description}
        actions={<LiveStatus variant="inline" still queryKeys={[['currentSpecialWinners']]} />}
        className="mb-0 flex-row flex-wrap items-baseline justify-between gap-y-1 sm:items-baseline"
      />

      {/* The column heads, once, for sighted readers; every value carries its own label. */}
      <div
        aria-hidden
        className="mt-2.5 hidden border-b border-rule pb-2 type-label text-subtle @[30rem]/ledger:grid @[30rem]/ledger:grid-cols-[minmax(0,1.25fr)_minmax(0,1.1fr)_minmax(0,1fr)_minmax(0,0.95fr)] @[30rem]/ledger:gap-x-4"
      >
        <span />
        <span>{t('ledger.columns.holder')}</span>
        <span>{t('ledger.columns.time')}</span>
        <span className="text-end">{t('ledger.columns.allocation')}</span>
      </div>

      <ul role="list" className="mt-3 divide-y divide-rule-faint @[30rem]/ledger:mt-0">
        {loading ? (
          <LedgerSkeleton />
        ) : (
          <>
            <LedgerRow
              headingAs={roleHeading}
              testId="latest-participant-intel"
              icon={GestureIcon}
              role={
                <ExplainedTerm definition={t('standings.latestTooltip')}>
                  {tTables('specialAllocation.lastGesture')}
                </ExplainedTerm>
              }
              holder={latest.address}
              emptyText={t('ledger.empty.latest')}
              account={account}
              time={
                latest.address ? (
                  <TimeHeld seconds={latest.holdDuration} live={false} pending={!clockKnown} />
                ) : null
              }
              allocation={
                signatureEth === undefined ? (
                  <span className="type-label text-muted-foreground">
                    {tHome('observatory.clock.reserveLabel')}
                  </span>
                ) : (
                  <span className="inline-flex flex-col items-end">
                    {signatureEth === null ? (
                      <UnknownValue label={tCommon('status.unavailable')} />
                    ) : (
                      <Amount
                        value={signatureEth}
                        unit="ETH"
                        context="card"
                        className="type-figure-sm text-foreground"
                      />
                    )}
                    <span className="type-caption text-subtle">
                      {tHome('observatory.clock.reserveLabel')}
                    </span>
                  </span>
                )
              }
            >
              {latest.address && (
                <div className="space-y-2.5">
                  {latestProgress ? (
                    latestProgress.showBar ? (
                      <div data-testid="latest-endurance-progress" className="space-y-1.5">
                        {latestProgress.fact ? (
                          <LedgerFacts facts={[latestProgress.fact]} />
                        ) : (
                          <p className="type-caption text-live">{latestProgress.caption}</p>
                        )}
                        <RecordRule
                          percent={latestProgress.percent}
                          live={latestProgress.live}
                          label={tTables('specialAllocation.progressAria')}
                        />
                      </div>
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
              headingAs={roleHeading}
              testId="control-desk-endurance"
              icon={EnduranceChampionIcon}
              role={
                <Term id="enduranceChampion">{tTables('specialAllocation.enduranceChampion')}</Term>
              }
              holder={endurance.address}
              emptyText={t('ledger.empty.endurance')}
              account={account}
              time={
                <TimeHeld
                  seconds={endurance.duration}
                  live={endurance.isLive}
                  pending={endurance.isLive && !clockKnown}
                  caption={endurance.isLive ? tTables('specialAllocation.growingNow') : undefined}
                />
              }
              allocation={
                <span className="type-figure-sm text-foreground">{t('standings.cstPlusNft')}</span>
              }
            />

            <LedgerRow
              headingAs={roleHeading}
              testId="chrono-role-summary"
              icon={ChronoWarriorIcon}
              role={<Term id="chronoWarrior">{tTables('specialAllocation.chronoWarrior')}</Term>}
              holder={chrono.address}
              emptyText={t('ledger.empty.chrono')}
              account={account}
              time={
                <TimeHeld
                  seconds={chrono.duration}
                  live={chrono.isLive}
                  caption={chrono.isLive ? tTables('specialAllocation.growingNow') : undefined}
                />
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
                  <div data-testid="chrono-next-change">
                    <LedgerFacts
                      facts={[
                        {
                          key: 'stops',
                          label: t('ledger.chronoStopsIn'),
                          seconds: chrono.willStopGrowingIn,
                        },
                      ]}
                    />
                  </div>
                )}
              {challengeFacts.length > 0 && (
                <div data-testid="chrono-active-challenge" className="space-y-1.5">
                  <LedgerFacts facts={challengeFacts} />
                  {challengePercent != null && (
                    <RecordRule
                      percent={challengePercent}
                      live={false}
                      label={t('ledger.challenge.progressAria')}
                    />
                  )}
                </div>
              )}
            </LedgerRow>

            <LedgerRow
              headingAs={roleHeading}
              testId="final-cst-role-summary"
              icon={FinalCstGestureIcon}
              role={
                <Term id="finalCstGesture">{tTables('specialAllocation.finalCstGesture')}</Term>
              }
              holder={lastCst.address}
              emptyText={t('ledger.empty.finalCst')}
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
          </>
        )}
      </ul>
      {loading && <span className="sr-only">{tCommon('status.loading')}</span>}
    </section>
  );
}
