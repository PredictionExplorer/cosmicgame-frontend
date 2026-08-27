'use client';

import type { ReactNode } from 'react';
import { Coins, Crown, Lock, Swords, User, Zap } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

import { formatSeconds } from '@/utils';

import { ChronoWarriorDetails } from '@/components/special-allocation/ChronoWarriorDetails';
import { LatestParticipantDetails } from '@/components/special-allocation/LatestParticipantDetails';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import { useChampions, type ChampionsState } from '@/hooks/useChampions';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/utils';
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
        <LatestParticipantDetails
          latest={champions.latestGesture}
          hasEnduranceRecord={!!champions.endurance.address}
          latestGesture={latestGesture}
          latestAddress={champions.latestGesture.address}
          message={cleanLatestMessage}
        />
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
