'use client';

import type { ReactNode } from 'react';
import { Coins, Crown, Lock, Swords, User, Zap } from 'lucide-react';

import { formatSeconds } from '@/utils';

import { InfoTooltip } from '@/components/ui/info-tooltip';
import { useChampions, type ChampionsState } from '@/hooks/useChampions';
import { cn } from '@/lib/utils';

interface RoleCardConfig {
  key: 'latest' | 'endurance' | 'chrono' | 'lastcst';
  icon: ReactNode;
  title: string;
  tooltip: string;
  address: string | null;
  duration?: number;
  isLive?: boolean;
  durationLabel?: string;
  emptyText: string;
  accent?: 'primary' | 'emerald' | 'muted';
  extra?: ReactNode;
}

function StatusChip({ isLive }: { isLive: boolean }) {
  return isLive ? (
    <span
      data-testid="champion-live-chip"
      className="inline-flex items-center gap-1 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-300"
    >
      <Zap className="h-3 w-3" />
      Live - growing
    </span>
  ) : (
    <span
      data-testid="champion-locked-chip"
      className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground"
    >
      <Lock className="h-3 w-3" />
      Record standing
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
  icon,
  title,
  tooltip,
  address,
  duration,
  durationLabel,
  isLive,
  emptyText,
  accent = 'muted',
  extra,
}: RoleCardConfig) {
  return (
    <div
      data-special-allocation-card
      data-testid={`special-allocation-card-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
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
            {isLive !== undefined && <StatusChip isLive={isLive} />}
          </div>

          {address ? (
            <a
              href={`/user/${address}`}
              className="mt-2 block break-all font-mono text-sm text-foreground print:!text-foreground transition-colors hover:text-primary"
            >
              {address}
            </a>
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
                {formatSeconds(duration)}
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
  if (!hasEnduranceRecord) {
    return (
      <div
        data-testid="latest-participant-status"
        className="mt-3 rounded-lg border border-emerald-400/20 bg-emerald-400/[0.06] px-3 py-2 text-xs text-emerald-300"
      >
        First endurance record forming
      </div>
    );
  }

  const progress = Math.floor(latestGesture.progressToEnduranceChampion);
  const isComplete = latestGesture.isExtendingEnduranceRecord;
  const remainingCopy = latestGesture.isCurrentEnduranceChampion
    ? `Needs ${formatSeconds(latestGesture.secondsUntilEnduranceChampion)} more to extend record`
    : `Needs ${formatSeconds(latestGesture.secondsUntilEnduranceChampion)} more to become Endurance Champion`;

  return (
    <div className="mt-3 rounded-lg border border-white/[0.06] bg-black/10 px-3 py-2">
      <div className="flex items-center justify-between gap-3">
        <span
          data-testid="latest-participant-remaining"
          className={cn('text-xs', isComplete ? 'text-emerald-300' : 'text-muted-foreground')}
        >
          {isComplete ? 'Extending Endurance Champion record' : remainingCopy}
        </span>
        <span className="font-mono text-xs tabular-nums text-primary">{progress}%</span>
      </div>
      <div
        role="progressbar"
        aria-label="Progress toward Endurance Champion"
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
        {formatSeconds(latestGesture.holdDuration)} of {formatSeconds(latestGesture.durationToBeat)}
      </p>
    </div>
  );
}

/**
 * Minimal static markup only for @media print / Save as PDF. Chrome’s Skia pipeline often drops
 * the interactive layout on the home page (`/`) even when on-screen CSS looks fine; this block is
 * `hidden` on screen and `display:block` when printing so addresses reliably appear in the PDF.
 */
function SpecialAllocationLeadersPrintFallback({ state }: { state: ChampionsState }) {
  return (
    <div
      className="hidden rounded-md border-2 border-foreground/40 bg-background p-4 text-sm text-foreground shadow-none [print-color-adjust:exact] print:block"
      data-special-allocation-leaders-print
    >
      <h3 className="mb-4 border-b border-foreground/30 pb-2 font-display text-base font-bold">
        Special Allocation Leaders
      </h3>
      <dl className="space-y-4">
        <div>
          <dt className="text-xs font-bold uppercase tracking-wide text-foreground/90">
            Latest Participant
          </dt>
          <dd className="mt-1 break-all font-mono text-xs leading-relaxed">
            {state.latestGesture.address ?? '-'}
          </dd>
          {state.latestGesture.holdDuration > 0 && (
            <dd className="mt-1 text-xs">
              Current hold: {formatSeconds(state.latestGesture.holdDuration)}
            </dd>
          )}
        </div>
        <div>
          <dt className="text-xs font-bold uppercase tracking-wide text-foreground/90">
            Endurance Champion
          </dt>
          <dd className="mt-1 break-all font-mono text-xs leading-relaxed">
            {state.endurance.address ?? '-'}
          </dd>
          {state.endurance.duration > 0 && (
            <dd className="mt-1 text-xs">Window: {formatSeconds(state.endurance.duration)}</dd>
          )}
        </div>
        <div>
          <dt className="text-xs font-bold uppercase tracking-wide text-foreground/90">
            Chrono Warrior
          </dt>
          <dd className="mt-1 break-all font-mono text-xs leading-relaxed">
            {state.chrono.address ?? '-'}
          </dd>
          {state.chrono.duration > 0 && (
            <dd className="mt-1 text-xs">Reign: {formatSeconds(state.chrono.duration)}</dd>
          )}
        </div>
        <div>
          <dt className="text-xs font-bold uppercase tracking-wide text-foreground/90">
            Final CST Gesture
          </dt>
          <dd className="mt-1 break-all font-mono text-xs leading-relaxed">
            {state.lastCst.address ?? '-'}
          </dd>
        </div>
      </dl>
    </div>
  );
}

export const SpecialAllocationRecipients = () => {
  const champions = useChampions();

  const cards: RoleCardConfig[] = [
    {
      key: 'latest',
      icon: <User className="h-5 w-5" />,
      title: 'Latest Participant',
      tooltip:
        'The latest gesture maker is building an endurance window. They must hold the position longer than the current Endurance Champion window to take the lead.',
      address: champions.latestGesture.address,
      duration: champions.latestGesture.address ? champions.latestGesture.holdDuration : undefined,
      durationLabel: 'Current hold',
      isLive: champions.latestGesture.address ? true : undefined,
      emptyText: 'No latest gesture yet',
      accent: champions.latestGesture.address ? 'emerald' : 'muted',
      extra: champions.latestGesture.address ? (
        <LatestGestureProgress
          latestGesture={champions.latestGesture}
          hasEnduranceRecord={!!champions.endurance.address}
        />
      ) : null,
    },
    {
      key: 'endurance',
      icon: <Crown className="h-5 w-5" />,
      title: 'Endurance Champion',
      tooltip:
        'The participant with the longest uninterrupted most-recent-gesture window. The timer only grows while that participant is still the latest gesture maker.',
      address: champions.endurance.address,
      duration: champions.endurance.duration,
      durationLabel: 'Endurance window',
      isLive: champions.endurance.isLive,
      emptyText: 'No endurance record yet',
      accent: champions.endurance.isLive ? 'emerald' : 'muted',
    },
    {
      key: 'chrono',
      icon: <Swords className="h-5 w-5" />,
      title: 'Chrono-Warrior',
      tooltip:
        'The participant who held the Endurance Champion position for the longest continuous reign. Receives 8% of the Cycle Reserve, 1,000 CST, and a Cosmic Signature NFT.',
      address: champions.chrono.address,
      duration: champions.chrono.duration,
      durationLabel: 'Champion reign',
      isLive: champions.chrono.isLive,
      emptyText: 'No Chrono-Warrior record yet',
      accent: 'primary',
    },
    {
      key: 'lastcst',
      icon: <Coins className="h-5 w-5" />,
      title: 'Final CST Gesture',
      tooltip:
        'The participant who made the last CST gesture of the cycle receives a Recognition CST imprint of 1,000 CST and a Cosmic Signature NFT.',
      address: champions.lastCst.address,
      emptyText: 'Awaiting first CST gesture',
      accent: 'muted',
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
        aria-label="Special allocation leaders"
      >
        <div className="flex items-center gap-2">
          <h3
            data-testid="special-allocation-heading"
            className="font-display text-lg font-semibold tracking-tight text-foreground print:!text-foreground"
          >
            Special Allocation Leaders
          </h3>
          <span className="print:hidden">
            <InfoTooltip content="These participants are currently in line to receive special allocations when the cycle finalizes. Positions can change with every new gesture." />
          </span>
        </div>

        <div className="grid grid-cols-1 gap-3">
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
