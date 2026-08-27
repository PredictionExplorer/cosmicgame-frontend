'use client';

import type { ReactNode } from 'react';
import { Coins, Crown, Lock, MessageSquare, Swords, User, Zap } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

import { formatSeconds } from '@/utils';

import { useHydrationSafeDateTime } from '@/components/common/HydrationSafeDateTime';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import { useChampions, type ChampionsState } from '@/hooks/useChampions';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/utils';
import {
  formatAttachedAssets,
  formatGestureMethod,
  formatGesturePayment,
  formatReceivedCstAmount,
  getAttachedAssetLabels,
  getParticipationCST,
  hasRandomWalkToken,
  resolveGestureType,
} from '@/utils/gesturePayment';
import type { GestureInfo } from '@/services/api/types';

interface RoleCardConfig {
  key: 'latest' | 'endurance' | 'chrono' | 'lastcst';
  testId: string;
  icon: ReactNode;
  title: string;
  tooltip: string;
  address: string | null;
  duration?: number;
  isLive?: boolean;
  statusText?: string;
  durationLabel?: string;
  emptyText: string;
  accent?: 'primary' | 'emerald' | 'muted';
  extra?: ReactNode;
  badge?: ReactNode;
}

interface SpecialAllocationRecipientsProps {
  currentAccount?: string | null;
  latestMessage?: string | null;
  latestGesture?: GestureInfo | null;
  /**
   * 'stack' keeps the cards in one column (narrow contexts like
   * /current-cycle); 'grid' spreads the four role cards across the row so the
   * whole leaderboard is visible near the top of the home page.
   */
  layout?: 'stack' | 'grid';
}

function StatusChip({ isLive, statusText }: { isLive: boolean; statusText?: string }) {
  const t = useTranslations('tables');

  return isLive ? (
    <span
      data-testid="champion-live-chip"
      className="inline-flex items-center gap-1 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-300"
    >
      <Zap className="h-3 w-3" />
      {statusText ?? t('specialAllocation.liveGrowing')}
    </span>
  ) : (
    <span
      data-testid="champion-locked-chip"
      className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground"
    >
      <Lock className="h-3 w-3" />
      {statusText ?? t('specialAllocation.recordStanding')}
    </span>
  );
}

function LoadingCard({ title, icon }: Pick<RoleCardConfig, 'title' | 'icon'>) {
  return (
    <div
      data-special-allocation-card
      className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4"
    >
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/[0.06] text-muted-foreground">
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {title}
          </p>
          <div className="mt-3 h-4 w-44 animate-pulse rounded bg-white/[0.08]" />
          <div className="mt-3 h-3 w-28 animate-pulse rounded bg-white/[0.06]" />
        </div>
      </div>
    </div>
  );
}

function RoleCard({
  testId,
  icon,
  title,
  tooltip,
  address,
  duration,
  durationLabel,
  isLive,
  statusText,
  emptyText,
  accent = 'muted',
  extra,
  badge,
}: RoleCardConfig) {
  const locale = useLocale();
  return (
    <div
      data-special-allocation-card
      data-testid={`special-allocation-card-${testId}`}
      className={cn(
        'rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 backdrop-blur-sm transition-all duration-300 hover:bg-white/[0.04] print:border print:border-border print:animate-none',
        accent === 'primary' &&
          'border-primary/35 bg-primary/[0.04] shadow-[0_0_24px_-12px_rgba(21,191,253,0.45)]',
        accent === 'emerald' &&
          'border-emerald-400/30 bg-emerald-400/[0.035] shadow-[0_0_24px_-12px_rgba(52,211,153,0.4)]',
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
            accent === 'primary'
              ? 'bg-gradient-to-br from-primary/20 to-accent/20 text-primary'
              : accent === 'emerald'
                ? 'bg-emerald-400/10 text-emerald-300'
                : 'bg-white/[0.06] text-muted-foreground',
          )}
        >
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <span
              className={cn(
                'text-xs font-medium uppercase tracking-wider',
                accent === 'primary'
                  ? 'text-primary'
                  : accent === 'emerald'
                    ? 'text-emerald-300'
                    : 'text-muted-foreground',
              )}
            >
              {title}
            </span>
            <span className="print:hidden">
              <InfoTooltip content={tooltip} />
            </span>
            {isLive !== undefined && <StatusChip isLive={isLive} statusText={statusText} />}
            {badge}
          </div>

          {address ? (
            <Link
              href={`/user/${address}`}
              className="mt-2 block break-all font-mono text-sm text-foreground print:!text-foreground transition-colors hover:text-primary"
            >
              {address}
            </Link>
          ) : (
            <p className="mt-2 text-sm text-muted-foreground/60 italic">{emptyText}</p>
          )}

          {duration !== undefined && (
            <div className="mt-3 rounded-lg border border-white/[0.06] bg-black/10 px-3 py-2">
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                {durationLabel}
              </p>
              <p
                className={cn(
                  'mt-0.5 font-mono text-base tabular-nums',
                  isLive ? 'text-emerald-300' : 'text-foreground',
                )}
              >
                {formatSeconds(duration, locale)}
              </p>
            </div>
          )}
          {extra}
        </div>
      </div>
    </div>
  );
}

function LatestGestureProgress({
  latestGesture,
  hasEnduranceRecord,
}: {
  latestGesture: ChampionsState['latestGesture'];
  hasEnduranceRecord: boolean;
}) {
  const t = useTranslations('tables');
  const locale = useLocale();

  if (!hasEnduranceRecord) {
    return (
      <div
        data-testid="latest-participant-status"
        className="mt-3 rounded-lg border border-emerald-400/20 bg-emerald-400/[0.06] px-3 py-2 text-xs text-emerald-300"
      >
        {t('specialAllocation.firstRecordForming')}
      </div>
    );
  }

  const progress = Math.floor(latestGesture.progressToEnduranceChampion);
  const isComplete = latestGesture.isExtendingEnduranceRecord;
  const remainingCopy = latestGesture.isCurrentEnduranceChampion
    ? t('specialAllocation.needsToExtend', {
        duration: formatSeconds(latestGesture.secondsUntilEnduranceChampion, locale),
      })
    : t('specialAllocation.needsToBecomeChampion', {
        duration: formatSeconds(latestGesture.secondsUntilEnduranceChampion, locale),
      });

  return (
    <div className="mt-3 rounded-lg border border-white/[0.06] bg-black/10 px-3 py-2">
      <div className="flex items-center justify-between gap-3">
        <span
          data-testid="latest-participant-remaining"
          className={cn('text-xs', isComplete ? 'text-emerald-300' : 'text-muted-foreground')}
        >
          {isComplete ? t('specialAllocation.extendingRecord') : remainingCopy}
        </span>
        <span className="font-mono text-xs tabular-nums text-primary">{progress}%</span>
      </div>
      <div
        role="progressbar"
        aria-label={t('specialAllocation.progressAria')}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={progress}
        className="mt-2 h-2 overflow-hidden rounded-full bg-white/[0.08]"
      >
        <div
          className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
          style={{ width: `${latestGesture.progressToEnduranceChampion}%` }}
        />
      </div>
      <p className="mt-1 text-[11px] text-muted-foreground">
        {t('specialAllocation.progressAmounts', {
          current: formatSeconds(latestGesture.holdDuration, locale),
          target: formatSeconds(latestGesture.durationToBeat, locale),
        })}
      </p>
    </div>
  );
}

function LatestParticipantMessage({ message }: { message: string }) {
  return (
    <div
      data-testid="latest-participant-message"
      className="mt-3 flex items-start gap-2 rounded-lg bg-white/[0.03] p-3"
    >
      <MessageSquare className="h-3.5 w-3.5 mt-0.5 text-muted-foreground/50 shrink-0" />
      <p className="break-words text-sm text-amber-300/90">&ldquo;{message}&rdquo;</p>
    </div>
  );
}

function DetailMetric({
  label,
  value,
  testId,
  tone = 'muted',
}: {
  label: string;
  value: string;
  testId?: string;
  tone?: 'muted' | 'primary' | 'emerald';
}) {
  return (
    <div
      data-testid={testId}
      className={cn(
        'mt-2 rounded-lg border px-3 py-2',
        tone === 'primary'
          ? 'border-primary/20 bg-primary/[0.055] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]'
          : tone === 'emerald'
            ? 'border-emerald-400/20 bg-emerald-400/[0.055]'
            : 'border-white/[0.06] bg-black/10',
      )}
    >
      <p
        className={cn(
          'text-[11px] uppercase tracking-wider',
          tone === 'primary'
            ? 'text-primary/90'
            : tone === 'emerald'
              ? 'text-emerald-300'
              : 'text-muted-foreground',
        )}
      >
        {label}
      </p>
      <p className="mt-0.5 text-xs text-foreground">{value}</p>
    </div>
  );
}

function LatestGestureDetails({
  latestGesture,
  latestAddress,
}: {
  latestGesture?: GestureInfo | null;
  latestAddress: string | null;
}) {
  const t = useTranslations('tables');
  const locale = useLocale();
  const hasGestureTime =
    typeof latestGesture?.TimeStamp === 'number' && Number.isFinite(latestGesture.TimeStamp);
  const gestureTimestamp =
    typeof latestGesture?.TimeStamp === 'number' && Number.isFinite(latestGesture.TimeStamp)
      ? latestGesture.TimeStamp
      : 0;
  const gestureTime = useHydrationSafeDateTime(gestureTimestamp, true, locale);

  if (!latestGesture || !sameAddress(latestGesture.BidderAddr, latestAddress)) return null;

  const randomWalkStatus = hasRandomWalkToken(latestGesture)
    ? t('specialAllocation.yesToken', { id: String(latestGesture.RWalkNFTId) })
    : resolveGestureType(latestGesture) === 1
      ? t('status.yes')
      : t('status.no');

  return (
    <div
      data-testid="latest-participant-gesture-details"
      className="mt-3 rounded-xl border border-emerald-400/20 bg-gradient-to-br from-emerald-400/[0.07] via-white/[0.025] to-transparent p-3 shadow-[0_0_30px_-22px_rgba(52,211,153,0.75)]"
    >
      <div className="mb-2 flex items-center gap-2">
        <div className="h-1.5 w-1.5 rounded-full bg-emerald-300 shadow-[0_0_12px_rgba(110,231,183,0.9)]" />
        <p className="text-[11px] font-medium uppercase tracking-wider text-emerald-300">
          {t('specialAllocation.lastGesture')}
        </p>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        <DetailMetric
          testId="latest-participant-paid-amount"
          label={t('specialAllocation.amountPaid')}
          value={formatGesturePayment(latestGesture, t('status.unavailable'))}
          tone="emerald"
        />
        <DetailMetric
          label={t('specialAllocation.method')}
          value={formatGestureMethod(latestGesture, t('status.unknown'))}
        />
        <DetailMetric
          testId="latest-participant-random-walk"
          label={t('specialAllocation.randomWalk')}
          value={randomWalkStatus}
        />
        <DetailMetric
          label={t('specialAllocation.gestureTime')}
          value={hasGestureTime ? gestureTime : t('status.unavailable')}
        />
        <DetailMetric
          testId="latest-participant-gesture-id"
          label={t('specialAllocation.gesturePosition')}
          value={
            typeof latestGesture.BidPosition === 'number'
              ? `#${latestGesture.BidPosition}`
              : t('status.unavailable')
          }
        />
        <DetailMetric
          testId="latest-participant-cst-received"
          label={t('specialAllocation.cstReceived')}
          value={formatReceivedCstAmount(
            getParticipationCST(latestGesture),
            t('status.unavailable'),
          )}
          tone="emerald"
        />
        {getAttachedAssetLabels(latestGesture).length > 0 && (
          <DetailMetric
            testId="latest-participant-attached-assets"
            label={t('specialAllocation.attachedAssets')}
            value={formatAttachedAssets(latestGesture, t('status.none'))}
          />
        )}
      </div>
    </div>
  );
}

function ChronoWarriorDetails({
  chrono,
  challenge,
}: {
  chrono: ChampionsState['chrono'];
  challenge: ChampionsState['chronoChallenge'];
}) {
  const t = useTranslations('tables');
  const locale = useLocale();

  if (!chrono.address) return null;

  const nextMetric = (() => {
    if (chrono.isLive) {
      return chrono.willStopGrowingIn !== undefined && chrono.willStopGrowingIn > 0
        ? {
            label: t('specialAllocation.mayCloseIn'),
            value: t('specialAllocation.mayCloseValue', {
              duration: formatSeconds(chrono.willStopGrowingIn, locale),
            }),
          }
        : { label: t('columns.status'), value: t('specialAllocation.growingNow') };
    }
    return {
      label: t('specialAllocation.recordStatus'),
      value: t('specialAllocation.standingChronoRecord'),
    };
  })();

  const showChallenge = challenge.hasDetails && !challenge.isLive;

  return (
    <div
      data-testid="chrono-warrior-details"
      className="mt-3 rounded-xl border border-primary/20 bg-gradient-to-br from-primary/[0.08] via-accent/[0.045] to-transparent p-3 shadow-[0_0_30px_-20px_rgba(21,191,253,0.8)]"
    >
      <div className="mb-2 flex items-center gap-2">
        <div className="h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_12px_rgba(21,191,253,0.9)]" />
        <p className="text-[11px] font-medium uppercase tracking-wider text-primary/90">
          {t('specialAllocation.chronoReign')}
        </p>
      </div>
      {chrono.isLive && chrono.currentSegmentDuration !== undefined && (
        <DetailMetric
          testId="chrono-current-segment"
          label={t('specialAllocation.recordGrowingSegment')}
          value={formatSeconds(chrono.currentSegmentDuration, locale)}
          tone="primary"
        />
      )}
      <DetailMetric
        testId="chrono-next-change"
        label={nextMetric.label}
        value={nextMetric.value}
        tone={chrono.isLive ? 'emerald' : 'primary'}
      />
      <p className="text-[11px] leading-relaxed text-muted-foreground">
        {t('specialAllocation.chronoDescription')}
      </p>
      {showChallenge && (
        <div
          data-testid="chrono-active-challenge"
          className="mt-3 rounded-xl border border-emerald-400/20 bg-emerald-400/[0.045] p-3"
        >
          <p className="text-[11px] font-medium uppercase tracking-wider text-emerald-300">
            {t('specialAllocation.activeEnduranceChallenge')}
          </p>
          {challenge.address && (
            <Link
              href={`/user/${challenge.address}`}
              className="mt-2 block break-all font-mono text-xs text-foreground transition-colors hover:text-primary"
            >
              {challenge.address}
            </Link>
          )}
          {challenge.duration !== undefined && (
            <DetailMetric
              testId="chrono-challenge-segment"
              label={t('specialAllocation.challengeSegment')}
              value={formatSeconds(challenge.duration, locale)}
              tone="emerald"
            />
          )}
          <DetailMetric
            testId="chrono-challenge-next-change"
            label={
              challenge.isRecordHolder
                ? t('specialAllocation.canExtendIn')
                : t('specialAllocation.canOvertakeIn')
            }
            value={
              challenge.startsGrowingIn !== undefined
                ? formatSeconds(challenge.startsGrowingIn, locale)
                : challenge.isRecordHolder
                  ? t('specialAllocation.waitingToExtend')
                  : t('specialAllocation.waitingToOvertake')
            }
            tone="emerald"
          />
          <p className="text-[11px] leading-relaxed text-muted-foreground">
            {t('specialAllocation.challengeDescription')}
          </p>
        </div>
      )}
    </div>
  );
}

function sameAddress(left: string | null | undefined, right: string | null | undefined): boolean {
  return !!left && !!right && left.toLowerCase() === right.toLowerCase();
}

/**
 * Minimal static markup only for @media print / Save as PDF. Chrome’s Skia pipeline often drops
 * the interactive layout on the home page (`/`) even when on-screen CSS looks fine; this block is
 * `hidden` on screen and `display:block` when printing so addresses reliably appear in the PDF.
 */
function SpecialAllocationLeadersPrintFallback({ state }: { state: ChampionsState }) {
  const t = useTranslations('tables');
  const locale = useLocale();

  return (
    <div
      className="hidden rounded-md border-2 border-foreground/40 bg-background p-4 text-sm text-foreground shadow-none [print-color-adjust:exact] print:block"
      data-special-allocation-leaders-print
    >
      <h3 className="mb-4 border-b border-foreground/30 pb-2 font-display text-base font-bold">
        {t('specialAllocation.heading')}
      </h3>
      <dl className="space-y-4">
        <div>
          <dt className="text-xs font-bold uppercase tracking-wide text-foreground/90">
            {t('specialAllocation.latestParticipant')}
          </dt>
          <dd className="mt-1 break-all font-mono text-xs leading-relaxed">
            {state.latestGesture.address ?? '-'}
          </dd>
          {state.latestGesture.holdDuration > 0 && (
            <dd className="mt-1 text-xs">
              {t('specialAllocation.printCurrentHold', {
                duration: formatSeconds(state.latestGesture.holdDuration, locale),
              })}
            </dd>
          )}
        </div>
        <div>
          <dt className="text-xs font-bold uppercase tracking-wide text-foreground/90">
            {t('specialAllocation.enduranceChampion')}
          </dt>
          <dd className="mt-1 break-all font-mono text-xs leading-relaxed">
            {state.endurance.address ?? '-'}
          </dd>
          {state.endurance.duration > 0 && (
            <dd className="mt-1 text-xs">
              {t('specialAllocation.printWindow', {
                duration: formatSeconds(state.endurance.duration, locale),
              })}
            </dd>
          )}
        </div>
        <div>
          <dt className="text-xs font-bold uppercase tracking-wide text-foreground/90">
            {t('specialAllocation.chronoWarriorPrint')}
          </dt>
          <dd className="mt-1 break-all font-mono text-xs leading-relaxed">
            {state.chrono.address ?? '-'}
          </dd>
          {state.chrono.duration > 0 && (
            <dd className="mt-1 text-xs">
              {t('specialAllocation.printReign', {
                duration: formatSeconds(state.chrono.duration, locale),
              })}
            </dd>
          )}
        </div>
        <div>
          <dt className="text-xs font-bold uppercase tracking-wide text-foreground/90">
            {t('specialAllocation.finalCstGesture')}
          </dt>
          <dd className="mt-1 break-all font-mono text-xs leading-relaxed">
            {state.lastCst.address ?? '-'}
          </dd>
        </div>
      </dl>
    </div>
  );
}

export const SpecialAllocationRecipients = ({
  currentAccount = null,
  latestMessage = null,
  latestGesture = null,
  layout = 'stack',
}: SpecialAllocationRecipientsProps = {}) => {
  const t = useTranslations('tables');
  const champions = useChampions();
  const isCurrentAccountLatest = sameAddress(currentAccount, champions.latestGesture.address);
  const cleanLatestMessage = latestMessage?.trim() ?? '';

  const cards: RoleCardConfig[] = [
    {
      key: 'latest',
      testId: 'latest-participant',
      icon: <User className="h-5 w-5" />,
      title: t('specialAllocation.latestParticipant'),
      tooltip: t('specialAllocation.latestTooltip'),
      address: champions.latestGesture.address,
      duration: champions.latestGesture.address ? champions.latestGesture.holdDuration : undefined,
      durationLabel: t('specialAllocation.currentHold'),
      isLive: champions.latestGesture.address ? true : undefined,
      emptyText: t('specialAllocation.noLatestGesture'),
      accent: champions.latestGesture.address ? 'emerald' : 'muted',
      badge: isCurrentAccountLatest ? (
        <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-400">
          {t('status.youBadge')}
        </span>
      ) : null,
      extra: champions.latestGesture.address ? (
        <>
          <LatestGestureProgress
            latestGesture={champions.latestGesture}
            hasEnduranceRecord={!!champions.endurance.address}
          />
          <LatestGestureDetails
            latestGesture={latestGesture}
            latestAddress={champions.latestGesture.address}
          />
          {cleanLatestMessage && <LatestParticipantMessage message={cleanLatestMessage} />}
        </>
      ) : null,
    },
    {
      key: 'endurance',
      testId: 'endurance-champion',
      icon: <Crown className="h-5 w-5" />,
      title: t('specialAllocation.enduranceChampion'),
      tooltip: t('specialAllocation.enduranceTooltip'),
      address: champions.endurance.address,
      duration: champions.endurance.duration,
      durationLabel: t('specialAllocation.enduranceWindow'),
      isLive: champions.endurance.isLive,
      emptyText: t('specialAllocation.noEnduranceRecord'),
      accent: champions.endurance.isLive ? 'emerald' : 'muted',
      extra: champions.endurance.address ? (
        <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
          {t('specialAllocation.enduranceNote')}
        </p>
      ) : null,
    },
    {
      key: 'chrono',
      testId: 'chrono-warrior',
      icon: <Swords className="h-5 w-5" />,
      title: t('specialAllocation.chronoWarrior'),
      tooltip: t('specialAllocation.chronoTooltip'),
      address: champions.chrono.address,
      duration: champions.chrono.duration,
      durationLabel: t('specialAllocation.championReign'),
      isLive: champions.chrono.isLive,
      statusText: champions.chrono.isLive
        ? t('specialAllocation.growingNow')
        : t('specialAllocation.recordStanding'),
      emptyText: t('specialAllocation.noChronoRecord'),
      accent: 'primary',
      extra: (
        <ChronoWarriorDetails chrono={champions.chrono} challenge={champions.chronoChallenge} />
      ),
    },
    {
      key: 'lastcst',
      testId: 'final-cst-gesture',
      icon: <Coins className="h-5 w-5" />,
      title: t('specialAllocation.finalCstGesture'),
      tooltip: t('specialAllocation.finalCstTooltip'),
      address: champions.lastCst.address,
      emptyText: t('specialAllocation.awaitingCstGesture'),
      accent: 'muted',
      extra: champions.lastCst.address ? (
        <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
          {t('specialAllocation.finalCstNote')}
        </p>
      ) : null,
    },
  ];

  const printDuplex =
    process.env.NODE_ENV !== 'test' ? (
      <SpecialAllocationLeadersPrintFallback state={champions} />
    ) : null;

  return (
    <>
      <section
        className="min-h-[2rem] space-y-4 print:min-h-0 print:hidden"
        data-special-allocation-leaders
        aria-label={t('specialAllocation.sectionAria')}
      >
        <div className="flex items-center gap-2">
          <h3
            data-testid="special-allocation-heading"
            className="font-display text-lg font-semibold tracking-tight text-foreground print:!text-foreground"
          >
            {t('specialAllocation.heading')}
          </h3>
          <span className="print:hidden">
            <InfoTooltip content={t('specialAllocation.headingHelp')} />
          </span>
        </div>

        <div
          className={cn(
            'grid grid-cols-1 gap-3',
            layout === 'grid' && 'items-start md:grid-cols-2 2xl:grid-cols-4',
          )}
        >
          {cards.map(({ key, ...card }) =>
            champions.isLoading && !champions.hasData ? (
              <LoadingCard key={key} title={card.title} icon={card.icon} />
            ) : (
              <RoleCard key={key} {...card} />
            ),
          )}
        </div>
      </section>
      {printDuplex}
    </>
  );
};
