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

export interface CycleStatusProps {
  data: DashboardInfo;
  phase: CyclePhaseView;
  /** Browser clock (epoch ms); 0 before the first tick. */
  nowMs: number;
  /** Unique participants this cycle, or null while the gesture list loads or failed. */
  participants: number | null;
  headingId: string;
  /**
   * Whether the column carries the page's one freshness stamp: while the
   * cycle has no standings ledger beside it (the ledger carries it then).
   */
  liveStatus?: boolean;
  className?: string;
}

interface Figure {
  id: string;
  label: ReactNode;
  value: ReactNode;
}

/**
 * The cycle at a glance (the H1 above names it): its phase, the
 * finalization clock set as type, what the phase means in one visible
 * sentence, the page's one commit action and the cycle's running figures as
 * spec-sheet rows. Only the coined Cycle Reserve explains itself; the other
 * labels say what they are. The phase comes from `cyclePhaseView`, so it
 * names the zero-cross exactly as the home clock does.
 */
export function CycleStatus({
  data,
  phase,
  nowMs,
  participants,
  headingId,
  liveStatus = false,
  className,
}: CycleStatusProps) {
  const t = useTranslations('currentCycle');
  const tHome = useTranslations('home');
  const tCommon = useTranslations('common');
  const locale = useLocale();
  const freshness = useLiveFreshness();
  const unknown = <UnknownValue label={tCommon('status.unavailable')} />;

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
          <Duration seconds={runningSeconds} maxUnits={2} />
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
    <div className={cn('min-w-0', className)} data-phase={state.phase}>
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <h2 id={headingId} className="type-section">
          {t('status.heading')}
        </h2>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          {liveStatus && !clockCaveat ? <LiveStatus variant="inline" /> : null}
          <Badge data-testid="live-badge" tone={phase.tone} shape="pill" dot>
            {phaseCopy('label')}
          </Badge>
        </div>
      </div>

      <div className="mt-8 sm:mt-10">
        <p className="type-label text-subtle">{phaseCopy('eyebrow')}</p>
        {remainingSeconds !== null ? (
          <div
            role="timer"
            aria-live="off"
            aria-label={tHome('chrono.timerAria', {
              label: phaseCopy('label'),
              status: phaseCopy('status'),
            })}
            className="mt-2"
          >
            {/* A clock whose last poll failed may have been extended: it dims until data returns.
                A column too narrow for a long day unit ("5 ngày 06:54:03") puts
                the clock on a second line rather than overflowing. */}
            <Duration
              seconds={remainingSeconds}
              variant="clock"
              wrap
              className={cn(
                'block type-figure-xl',
                clockStale ? 'text-muted-foreground' : 'text-foreground',
              )}
            />
          </div>
        ) : phase.showsZero ? (
          <p className="mt-2 type-figure-xl text-muted-foreground" aria-hidden>
            <Duration seconds={0} variant="clock" />
          </p>
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
      </div>

      <div className="mt-8">
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

      <dl className="mt-10 border-t border-rule">
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
    </div>
  );
}
