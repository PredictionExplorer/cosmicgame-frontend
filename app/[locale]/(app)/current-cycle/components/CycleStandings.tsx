'use client';

import type { ReactNode } from 'react';
import { ArrowRight, Lock } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

import {
  ChronoWarriorIcon,
  EnduranceChampionIcon,
  FinalCstGestureIcon,
  GestureIcon,
} from '@/lib/conceptIcons';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/utils';
import { resolveLatestGesture } from '@/lib/latestGesture';
import { AddressChip } from '@/components/ui/address-chip';
import { Amount } from '@/components/ui/amount';
import { Badge } from '@/components/ui/badge';
import { DateTime } from '@/components/ui/date-time';
import { Duration } from '@/components/ui/duration';
import { ExplainedTerm } from '@/components/ui/explain-popover';
import { Skeleton } from '@/components/ui/skeleton';
import { Term } from '@/components/ui/term';
import { UnknownValue } from '@/components/ui/unknown-value';
import { GestureMethodTag } from '@/components/tables/GestureMethodTag';
import { useChampions, type ChampionsState } from '@/hooks/useChampions';
import type { GestureInfo } from '@/services/api/types';
import { formatDuration, formatPercent, sameAddress } from '@/utils/format';
import {
  getAttachedAssetLabels,
  getCstGestureCost,
  getEthGestureCost,
  getParticipationCST,
  hasRandomWalkToken,
  resolveGestureType,
} from '@/utils/gesturePayment';

/** The API's numeric gesture type for a CST gesture (GestureMethodTag). */
const CST_GESTURE = 2;

export interface CycleStandingsProps {
  /** The dashboard's last participant: authoritative for who holds the position. */
  latestParticipantAddress?: string | null;
  /** The newest gesture row of the cycle, when the indexer has it. */
  latestGesture?: GestureInfo | null;
  headingId: string;
  className?: string;
}

interface Figure {
  label: string;
  seconds: number;
  /** A value that is growing right now takes the positive tone. */
  growing: boolean;
}

/** One figure of a role: its label over the value, right-aligned from `sm`. */
function RoleFigure({ figure }: { figure: Figure }) {
  return (
    <div className="flex items-baseline justify-between gap-4 sm:block sm:text-end">
      <p className="type-caption text-subtle">{figure.label}</p>
      <Duration
        seconds={figure.seconds}
        className={cn(
          'type-figure-md sm:mt-0.5 sm:block',
          figure.growing ? 'text-positive' : 'text-foreground',
        )}
      />
    </div>
  );
}

/** A label over a value, for the small spec grids under a role. */
function Spec({
  label,
  children,
  testId,
  className,
}: {
  label: string;
  children: ReactNode;
  testId?: string;
  className?: string;
}) {
  return (
    <div data-testid={testId} className={cn('min-w-0', className)}>
      <dt className="type-caption text-subtle">{label}</dt>
      <dd className="mt-0.5 type-figure-sm text-foreground">{children}</dd>
    </div>
  );
}

interface RoleRowProps {
  testId: string;
  icon: ReactNode;
  title: ReactNode;
  badge?: ReactNode;
  address: string | null;
  emptyText: string;
  figure?: Figure;
  children?: ReactNode;
}

/**
 * One role of the standings: who holds it, whether their time is growing,
 * the one figure that decides it, and what follows from it. Rows are divided
 * by hairlines; nothing inside a row draws a box.
 */
function RoleRow({
  testId,
  icon,
  title,
  badge,
  address,
  emptyText,
  figure,
  children,
}: RoleRowProps) {
  return (
    <li
      data-special-allocation-card
      data-testid={`special-allocation-card-${testId}`}
      className="grid grid-cols-[1rem_minmax(0,1fr)] gap-x-3 py-5 sm:py-6"
    >
      <span aria-hidden className="mt-0.5 text-subtle [&_svg]:size-4">
        {icon}
      </span>
      <div className="min-w-0">
        <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
              <h4 className="type-title text-foreground">{title}</h4>
              {badge}
            </div>
            {address ? (
              <AddressChip
                address={address}
                variant="plain"
                display="responsive"
                className="mt-1.5 type-hash text-muted-foreground"
              />
            ) : (
              <p className="mt-1.5 type-body-sm text-muted-foreground">{emptyText}</p>
            )}
          </div>
          {figure ? (
            <div className="w-full sm:w-auto">
              <RoleFigure figure={figure} />
            </div>
          ) : null}
        </div>
        {children}
      </div>
    </li>
  );
}

function RoleBadge({ growing }: { growing: boolean }) {
  const t = useTranslations('tables');
  return growing ? (
    <Badge data-testid="champion-live-chip" tone="live" size="sm" dot>
      {t('specialAllocation.growingNow')}
    </Badge>
  ) : (
    <Badge data-testid="champion-locked-chip" size="sm" icon={<Lock />}>
      {t('specialAllocation.recordStanding')}
    </Badge>
  );
}

/** How far the latest participant's hold is from the Endurance Champion record. */
function HoldProgress({
  latest,
  hasEnduranceRecord,
}: {
  latest: ChampionsState['latestGesture'];
  hasEnduranceRecord: boolean;
}) {
  const t = useTranslations('tables');
  const locale = useLocale();

  if (!hasEnduranceRecord) {
    return (
      <p data-testid="latest-participant-status" className="mt-4 type-body-sm text-positive">
        {t('specialAllocation.firstRecordForming')}
      </p>
    );
  }
  // The holder is extending their own record: a bar measured against that
  // record would read "100% · 11d of 11d". One line says what is happening.
  if (latest.isExtendingEnduranceRecord) {
    return (
      <p data-testid="latest-participant-remaining" className="mt-4 type-body-sm text-positive">
        {t('specialAllocation.extendingRecord')}
      </p>
    );
  }

  const progress = Math.floor(latest.progressToEnduranceChampion);
  const duration = formatDuration(latest.secondsUntilEnduranceChampion, { locale });
  return (
    <div className="mt-4">
      <div className="flex items-baseline justify-between gap-4">
        <p
          data-testid="latest-participant-remaining"
          className="type-body-sm text-muted-foreground"
        >
          {latest.isCurrentEnduranceChampion
            ? t('specialAllocation.needsToExtend', { duration })
            : t('specialAllocation.needsToBecomeChampion', { duration })}
        </p>
        <span className="shrink-0 type-figure-sm text-foreground">
          {formatPercent(progress, locale, { maximumFractionDigits: 0 })}
        </span>
      </div>
      <div
        role="progressbar"
        aria-label={t('specialAllocation.progressAria')}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={progress}
        className="mt-2 h-0.5 rounded-pill bg-rule"
      >
        <div
          className="h-full rounded-pill bg-primary motion-safe:transition-[width] motion-safe:duration-base"
          style={{ width: `${latest.progressToEnduranceChampion}%` }}
        />
      </div>
      {latest.durationToBeat > 0 ? (
        <p className="mt-1.5 type-caption text-subtle">
          {t('specialAllocation.progressAmounts', {
            current: formatDuration(latest.holdDuration, { locale }),
            target: formatDuration(latest.durationToBeat, { locale }),
          })}
        </p>
      ) : null}
    </div>
  );
}

/** The newest gesture of the cycle: what it paid and imprinted, and its record. */
function LastGesture({
  gesture,
  latestAddress,
  pending,
}: {
  gesture: GestureInfo | null;
  latestAddress: string | null;
  pending: boolean;
}) {
  const t = useTranslations('currentCycle');
  const tTables = useTranslations('tables');
  const tCommon = useTranslations('common');
  const unknown = <UnknownValue label={tCommon('status.unavailable')} />;

  if (!gesture) {
    return (
      <div data-testid="latest-participant-gesture-details" className="mt-5">
        <p
          data-testid="latest-participant-gesture-syncing"
          role="status"
          className="type-body-sm text-muted-foreground"
        >
          {pending
            ? tTables('specialAllocation.gestureDetailsSyncing')
            : tTables('specialAllocation.gestureDetailsUnavailable')}
        </p>
      </div>
    );
  }

  const isCst = resolveGestureType(gesture) === CST_GESTURE;
  const paid = isCst ? getCstGestureCost(gesture) : getEthGestureCost(gesture);
  const received = getParticipationCST(gesture);
  const assets = getAttachedAssetLabels(gesture);
  const message = gesture.Message?.trim() ?? '';
  const madeBy =
    gesture.BidderAddr && !sameAddress(gesture.BidderAddr, latestAddress)
      ? gesture.BidderAddr
      : null;
  const hasPosition = typeof gesture.BidPosition === 'number' && gesture.BidPosition > 0;

  return (
    <div
      data-testid="latest-participant-gesture-details"
      className="mt-5 border-t border-rule-faint pt-4"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h5 className="type-label text-subtle">{t('standings.lastGesture')}</h5>
        {hasPosition ? (
          <Link
            data-testid="latest-participant-gesture-id"
            href={`/gesture/${gesture.EvtLogId}`}
            className="link-quiet inline-flex items-center gap-1 type-label text-foreground"
          >
            {t('standings.gestureLink', { position: String(gesture.BidPosition) })}
            <ArrowRight aria-hidden className="size-3.5 text-subtle" />
          </Link>
        ) : null}
      </div>
      {madeBy ? (
        <p className="mt-1 flex flex-wrap items-center gap-x-1.5 type-caption text-subtle">
          {tTables('specialAllocation.gestureBy')}
          <AddressChip address={madeBy} variant="plain" display="full" showCopy={false} />
        </p>
      ) : null}
      <dl className="mt-3 grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-4">
        <Spec
          label={tTables('specialAllocation.amountPaid')}
          testId="latest-participant-paid-amount"
        >
          {paid === undefined ? (
            unknown
          ) : (
            // An ETH price reads as the wallet quoted it; CST at two decimals,
            // like every CST figure beside it (the exact amount is on hover).
            <Amount value={paid} unit={isCst ? 'CST' : 'ETH'} context={isCst ? 'card' : 'exact'} />
          )}
        </Spec>
        <Spec
          label={tTables('specialAllocation.cstReceived')}
          testId="latest-participant-cst-received"
        >
          {received === undefined ? unknown : <Amount value={received} unit="CST" />}
        </Spec>
        <Spec label={tTables('specialAllocation.method')}>
          <span className="inline-flex flex-wrap items-center gap-1.5">
            <GestureMethodTag
              gestureType={resolveGestureType(gesture)}
              unknownLabel={tTables('status.unknown')}
            />
            {hasRandomWalkToken(gesture) ? (
              <span data-testid="latest-participant-random-walk" className="type-mono text-subtle">
                #{gesture.RWalkNFTId}
              </span>
            ) : null}
          </span>
        </Spec>
        <Spec label={tTables('specialAllocation.gestureTime')}>
          {typeof gesture.TimeStamp === 'number' && Number.isFinite(gesture.TimeStamp) ? (
            <DateTime timestamp={gesture.TimeStamp} />
          ) : (
            unknown
          )}
        </Spec>
        {assets.length > 0 ? (
          <Spec
            label={tTables('specialAllocation.attachedAssets')}
            testId="latest-participant-attached-assets"
            className="col-span-full"
          >
            {assets.join(' + ')}
          </Spec>
        ) : null}
      </dl>
      {message ? (
        <blockquote
          data-testid="latest-participant-message"
          className="mt-4 line-clamp-3 border-l-2 border-rule pl-3 type-body-sm text-muted-foreground [overflow-wrap:anywhere]"
        >
          {message}
        </blockquote>
      ) : null}
    </div>
  );
}

/** The Chrono-Warrior's growing segment, or the challenge running under a standing record. */
function ChronoDetails({
  chrono,
  challenge,
}: {
  chrono: ChampionsState['chrono'];
  challenge: ChampionsState['chronoChallenge'];
}) {
  const t = useTranslations('currentCycle');
  const tTables = useTranslations('tables');
  const locale = useLocale();

  if (!chrono.address) return null;

  if (chrono.isLive) {
    return (
      <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3">
        {chrono.currentSegmentDuration !== undefined ? (
          <Spec
            label={tTables('specialAllocation.recordGrowingSegment')}
            testId="chrono-current-segment"
          >
            <Duration seconds={chrono.currentSegmentDuration} />
          </Spec>
        ) : null}
        {chrono.willStopGrowingIn !== undefined && chrono.willStopGrowingIn > 0 ? (
          <Spec
            label={tTables('specialAllocation.mayCloseIn')}
            testId="chrono-next-change"
            className="col-span-2"
          >
            <span className="type-body-sm">
              {tTables('specialAllocation.mayCloseValue', {
                duration: formatDuration(chrono.willStopGrowingIn, { locale }),
              })}
            </span>
          </Spec>
        ) : null}
      </dl>
    );
  }

  if (!challenge.hasDetails || challenge.isLive) return null;

  return (
    <div data-testid="chrono-active-challenge" className="mt-5 border-t border-rule-faint pt-4">
      <h5 className="type-label text-subtle">{t('standings.activeChallenge')}</h5>
      {challenge.address ? (
        <AddressChip
          address={challenge.address}
          variant="plain"
          display="responsive"
          className="mt-1 type-hash text-muted-foreground"
        />
      ) : null}
      <dl className="mt-3 grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3">
        {challenge.duration !== undefined ? (
          <Spec
            label={tTables('specialAllocation.challengeSegment')}
            testId="chrono-challenge-segment"
          >
            <Duration seconds={challenge.duration} />
          </Spec>
        ) : null}
        <Spec
          label={tTables('specialAllocation.recordToBeat')}
          testId="chrono-challenge-record-to-beat"
        >
          <Duration seconds={challenge.recordToBeat} />
        </Spec>
        <Spec
          label={
            challenge.isRecordHolder
              ? tTables('specialAllocation.canExtendIn')
              : tTables('specialAllocation.canOvertakeIn')
          }
          testId="chrono-challenge-next-change"
        >
          {challenge.startsGrowingIn !== undefined ? (
            <Duration seconds={challenge.startsGrowingIn} />
          ) : (
            <span className="type-body-sm">
              {challenge.isRecordHolder
                ? tTables('specialAllocation.waitingToExtend')
                : tTables('specialAllocation.waitingToOvertake')}
            </span>
          )}
        </Spec>
      </dl>
      <p className="mt-3 type-caption text-subtle">
        {tTables('specialAllocation.challengeDescription')}
      </p>
    </div>
  );
}

function StandingsSkeleton() {
  return (
    <>
      {[0, 1, 2, 3].map((row) => (
        <li
          key={row}
          data-special-allocation-card
          aria-hidden
          className="grid grid-cols-[1rem_minmax(0,1fr)] gap-x-3 py-6"
        >
          <Skeleton className="mt-0.5 size-4 rounded-edge" />
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-2.5">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3.5 w-56" />
            </div>
            <Skeleton className="h-8 w-28" />
          </div>
        </li>
      ))}
    </>
  );
}

/**
 * Who holds each special allocation of the live cycle right now, as one
 * hairline ledger: the latest participant (their hold, how far it is from the
 * Endurance Champion record, and the last gesture), the Endurance Champion,
 * the Chrono-Warrior (with any challenge under a standing record) and the
 * Final CST Gesture. Only a value that is growing takes the positive tone and
 * a live badge; a standing record is a neutral badge with a lock.
 */
export function CycleStandings({
  latestParticipantAddress = null,
  latestGesture = null,
  headingId,
  className,
}: CycleStandingsProps) {
  const t = useTranslations('currentCycle');
  const tTables = useTranslations('tables');
  const tCommon = useTranslations('common');
  const latestResolution = resolveLatestGesture({
    dashboardLastAddress: latestParticipantAddress,
    gestures: latestGesture ? [latestGesture] : [],
  });
  const champions = useChampions(undefined, latestResolution.evidence);
  const { latestGesture: latest, endurance, chrono, chronoChallenge, lastCst } = champions;
  const loading = champions.isLoading && !champions.hasData;

  return (
    <section
      aria-labelledby={headingId}
      aria-busy={loading || undefined}
      data-special-allocation-leaders
      className={className}
    >
      <h3 id={headingId} data-testid="special-allocation-heading" className="type-section">
        {t('standings.title')}
      </h3>
      <p className="mt-2 max-w-[var(--measure-lede)] type-body-sm text-muted-foreground">
        {tTables('specialAllocation.headingHelp')}
      </p>

      <ul className="mt-6 divide-y divide-rule-faint border-y border-rule">
        {loading ? (
          <StandingsSkeleton />
        ) : (
          <>
            <RoleRow
              testId="latest-participant"
              icon={<GestureIcon />}
              title={
                <ExplainedTerm definition={tTables('specialAllocation.latestTooltip')}>
                  {t('standings.latest')}
                </ExplainedTerm>
              }
              badge={latest.address ? <RoleBadge growing /> : undefined}
              address={latest.address}
              emptyText={tTables('specialAllocation.noLatestGesture')}
              figure={
                latest.address
                  ? {
                      label: tTables('specialAllocation.currentHold'),
                      seconds: latest.holdDuration,
                      growing: true,
                    }
                  : undefined
              }
            >
              {latest.address ? (
                <>
                  <HoldProgress latest={latest} hasEnduranceRecord={!!endurance.address} />
                  <LastGesture
                    gesture={latestResolution.gesture}
                    latestAddress={latest.address}
                    pending={latestResolution.isSyncing}
                  />
                </>
              ) : null}
            </RoleRow>

            <RoleRow
              testId="endurance-champion"
              icon={<EnduranceChampionIcon />}
              title={<Term id="enduranceChampion" />}
              badge={endurance.address ? <RoleBadge growing={endurance.isLive} /> : undefined}
              address={endurance.address}
              emptyText={tTables('specialAllocation.noEnduranceRecord')}
              figure={
                endurance.address
                  ? {
                      label: tTables('specialAllocation.enduranceWindow'),
                      seconds: endurance.duration,
                      growing: endurance.isLive,
                    }
                  : undefined
              }
            >
              {endurance.address ? (
                <p className="mt-3 max-w-[var(--measure-lede)] type-caption text-subtle">
                  {tTables('specialAllocation.enduranceNote')}
                </p>
              ) : null}
            </RoleRow>

            <RoleRow
              testId="chrono-warrior"
              icon={<ChronoWarriorIcon />}
              title={<Term id="chronoWarrior" />}
              // With no Chrono-Warrior yet the row is only its empty line: no
              // "0s" reign and no badge for a record that does not exist.
              badge={chrono.address ? <RoleBadge growing={chrono.isLive} /> : undefined}
              address={chrono.address}
              emptyText={tTables('specialAllocation.noChronoRecord')}
              figure={
                chrono.address
                  ? {
                      label: tTables('specialAllocation.championReign'),
                      seconds: chrono.duration,
                      growing: chrono.isLive,
                    }
                  : undefined
              }
            >
              <ChronoDetails chrono={chrono} challenge={chronoChallenge} />
            </RoleRow>

            <RoleRow
              testId="final-cst-gesture"
              icon={<FinalCstGestureIcon />}
              title={<Term id="finalCstGesture" />}
              address={lastCst.address}
              emptyText={tTables('specialAllocation.awaitingCstGesture')}
            >
              {lastCst.address ? (
                <p className="mt-3 max-w-[var(--measure-lede)] type-caption text-subtle">
                  {tTables('specialAllocation.finalCstNote')}
                </p>
              ) : null}
            </RoleRow>
          </>
        )}
      </ul>
      {loading ? <span className="sr-only">{tCommon('status.loading')}</span> : null}
    </section>
  );
}
