'use client';

import type { ReactNode } from 'react';
import { ArrowRight } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

import { Link } from '@/i18n/navigation';
import { TOUCH_TARGET_EXTENDED_CLASS } from '@/lib/touch-target';
import { cn } from '@/lib/utils';
import { Amount } from '@/components/ui/amount';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  CountdownFigures,
  countdownGroups,
  countdownPartsFromMs,
} from '@/components/ui/countdown-figures';
import { DateTime } from '@/components/ui/date-time';
import { Duration } from '@/components/ui/duration';
import { LiveStatus, LiveStatusView } from '@/components/ui/live-status';
import { Term } from '@/components/ui/term';
import { UnknownValue } from '@/components/ui/unknown-value';
import { useLiveFreshness } from '@/hooks/useLiveFreshness';
import type { DashboardInfo } from '@/services/api/types';
import { formatCount } from '@/utils/format';
import { toFiniteNumber } from '@/utils/finiteNumber';

import type { CyclePhaseView } from '../cyclePhase';

/**
 * A region of the cycle's first body row: it opens on the page's hairline
 * over its heading, and both columns share it, so the figures and the
 * standings read as one instrument.
 */
export const CYCLE_REGION_CLASS = 'border-t border-rule pt-5';

export interface CycleClockProps {
  data: DashboardInfo;
  phase: CyclePhaseView;
  /** Browser clock (epoch ms); 0 before the first tick. */
  nowMs: number;
  /**
   * Whether the clock carries the page's one freshness stamp: while the
   * cycle has no standings ledger (the ledger carries it then).
   */
  liveStatus?: boolean;
  className?: string;
}

/**
 * The cycle's clock, beside the page header from `lg` (under it on smaller
 * screens), so the moment the cycle can finalize and the page's one commit
 * action are in the first screen: the phase as a badge, the finalization
 * clock set as type, what the phase means in one visible sentence and the
 * action. The phase comes from `cyclePhaseView`, so it names the zero-cross
 * exactly as the home clock does.
 */
export function CycleClock({ data, phase, nowMs, liveStatus = false, className }: CycleClockProps) {
  const t = useTranslations('currentCycle');
  const tHome = useTranslations('home');
  const locale = useLocale();
  const freshness = useLiveFreshness();

  const phaseCopy = (key: 'eyebrow' | 'label' | 'status') =>
    tHome(`chrono.phase.${phase.messageKey}.${key}`);
  const { state } = phase;
  const remainingSeconds =
    phase.countdownTargetMs !== null && nowMs > 0
      ? Math.max(0, Math.ceil((phase.countdownTargetMs - nowMs) / 1000))
      : null;
  const clockStale = freshness.state === 'delayed' || freshness.state === 'offline';
  // A stale clock names the delay under itself; the stamp would say it twice.
  const clockCaveat = clockStale && remainingSeconds !== null;

  return (
    <div className={cn('min-w-0', className)} data-phase={state.phase} data-testid="cycle-clock">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <p className="type-label text-subtle">{phaseCopy('eyebrow')}</p>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          {liveStatus && !clockCaveat ? <LiveStatus variant="inline" /> : null}
          <Badge data-testid="live-badge" tone={phase.tone} shape="pill" dot>
            {phaseCopy('label')}
          </Badge>
        </div>
      </div>

      {remainingSeconds !== null ? (
        <div
          role="timer"
          aria-live="off"
          aria-label={tHome('chrono.timerAria', {
            label: phaseCopy('label'),
            status: phaseCopy('status'),
          })}
          className="@container mt-2"
        >
          {/* The one Cycle clock, as on the app home and the landing. A clock
              whose last poll failed may have been extended: it dims until
              data returns. */}
          <CountdownFigures
            groups={countdownGroups(countdownPartsFromMs(remainingSeconds * 1000), locale)}
            size="desk"
            align="start"
            tone={clockStale ? 'stale' : 'live'}
            data-testid="cycle-status-clock"
          />
        </div>
      ) : phase.showsZero ? (
        <div className="@container mt-2">
          <CountdownFigures
            groups={countdownGroups(countdownPartsFromMs(0), locale)}
            size="desk"
            align="start"
            tone="stale"
            data-testid="cycle-status-clock"
          />
        </div>
      ) : null}
      <p className="mt-3 max-w-[var(--measure-lede)] type-body-sm text-muted-foreground">
        {phaseCopy('status')}
      </p>
      {state.isOpeningSoon && state.activationTime ? (
        <p className="mt-1 type-body-sm text-muted-foreground">
          <DateTime timestamp={state.activationTime} showZone>
            {(date) => t('hero.countdown.opensAt', { n: data.CurRoundNum, date })}
          </DateTime>
        </p>
      ) : null}
      {clockCaveat ? (
        <LiveStatusView
          state={freshness.state}
          ageMs={freshness.ageMs}
          variant="inline"
          clockCaveat
          className="mt-3"
        />
      ) : null}

      <div className="mt-6">
        <Button
          asChild
          variant={phase.cta.emphasis === 'commit' ? 'commit' : 'outline'}
          size="lg"
          className="max-sm:w-full"
        >
          <Link href={phase.cta.href}>
            {t(`hero.cta.${phase.cta.key}`)}
            <ArrowRight aria-hidden />
          </Link>
        </Button>
      </div>
    </div>
  );
}

export interface CycleFiguresProps {
  data: DashboardInfo;
  /** Browser clock (epoch ms); 0 before the first tick. */
  nowMs: number;
  /** Unique participants this cycle, or null while the gesture list loads or failed. */
  participants: number | null;
  headingId: string;
  className?: string;
}

interface Figure {
  id: string;
  label: ReactNode;
  value: ReactNode;
}

/**
 * The cycle's running figures as spec-sheet rows under a panel heading, the
 * standings' peer in the page's first body row. Only the coined Cycle
 * Reserve explains itself; the other labels say what they are. "Running
 * for" is a live duration figure, so it reads as a clock, like every other
 * duration figure in the app (docs/design-system.md, Ticking figures).
 */
export function CycleFigures({
  data,
  nowMs,
  participants,
  headingId,
  className,
}: CycleFiguresProps) {
  const t = useTranslations('currentCycle');
  const tCommon = useTranslations('common');
  const locale = useLocale();
  const unknown = <UnknownValue label={tCommon('status.unavailable')} />;

  const reserve = toFiniteNumber(data.CosmicGameBalanceEth);
  const startedAt = toFiniteNumber(data.TsRoundStart);
  const runningSeconds =
    startedAt && startedAt > 0 && nowMs > 0 ? Math.floor(nowMs / 1000) - startedAt : null;
  const contributed = toFiniteNumber(data.CurRoundStats?.TotalDonatedAmountEth);
  const attachedNfts = toFiniteNumber(data.CurRoundStats?.TotalDonatedNFTs);

  const figures: Figure[] = [
    {
      id: 'reserve',
      // A label on its own line, not a word in a sentence: on phones its
      // hit area grows to 44px without moving the row.
      label: (
        <Term
          id="cycleReserve"
          data-touch-target="extended"
          className={TOUCH_TARGET_EXTENDED_CLASS}
        />
      ),
      value: reserve === null ? unknown : <Amount value={reserve} unit="ETH" />,
    },
    {
      id: 'running',
      label: t('figures.running'),
      value:
        runningSeconds !== null && runningSeconds > 0 ? (
          <Duration seconds={runningSeconds} variant="clock" />
        ) : (
          <span className="text-muted-foreground">{t('status.notStarted')}</span>
        ),
    },
    {
      id: 'participants',
      label: t('figures.participants'),
      value: participants === null ? unknown : formatCount(participants, locale),
    },
    {
      id: 'contributed',
      label: t('stats.contributedEth.label'),
      value: contributed === null ? unknown : <Amount value={contributed} unit="ETH" />,
    },
    {
      id: 'attachedNfts',
      label: t('stats.attachedNfts.label'),
      value: attachedNfts === null ? unknown : formatCount(attachedNfts, locale),
    },
  ];

  return (
    <section aria-labelledby={headingId} className={cn('min-w-0', CYCLE_REGION_CLASS, className)}>
      <h3 id={headingId} className="type-heading-3 text-foreground">
        {t('status.figuresHeading')}
      </h3>
      <dl className="mt-2.5 border-t border-rule">
        {figures.map((figure) => (
          <div
            key={figure.id}
            data-figure={figure.id}
            className="flex min-h-[var(--row-h)] items-center justify-between gap-4 border-b border-rule-faint py-2.5"
          >
            <dt className="type-label text-subtle">{figure.label}</dt>
            <dd className="type-figure-sm text-end text-foreground">{figure.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
