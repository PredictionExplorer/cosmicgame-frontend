'use client';

import type { ReactNode } from 'react';
import { ArrowRight } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/utils';
import { Amount } from '@/components/ui/amount';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DateTime } from '@/components/ui/date-time';
import { Duration } from '@/components/ui/duration';
import { ExplainedTerm } from '@/components/ui/explain-popover';
import { LiveStatusView } from '@/components/ui/live-status';
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
  className?: string;
}

interface Figure {
  id: string;
  label: ReactNode;
  value: ReactNode;
}

/**
 * The cycle at a glance: its number and phase, the finalization clock set as
 * type, what the phase means, the page's one commit action and the cycle's
 * running figures as spec-sheet rows. The phase comes from `cyclePhaseView`,
 * so it names the zero-cross exactly as the home clock does.
 */
export function CycleStatus({
  data,
  phase,
  nowMs,
  participants,
  headingId,
  className,
}: CycleStatusProps) {
  const t = useTranslations('currentCycle');
  const tHome = useTranslations('home');
  const tCommon = useTranslations('common');
  const locale = useLocale();
  const freshness = useLiveFreshness();
  const unknown = <UnknownValue label={tCommon('status.unavailable')} />;

  const phaseCopy = (key: 'eyebrow' | 'label' | 'status' | 'tooltip') =>
    tHome(`chrono.phase.${phase.messageKey}.${key}`);
  const { state } = phase;
  const remainingSeconds =
    phase.countdownTargetMs !== null && nowMs > 0
      ? Math.max(0, Math.ceil((phase.countdownTargetMs - nowMs) / 1000))
      : null;
  const clockStale = freshness.state === 'delayed' || freshness.state === 'offline';

  const reserve = toFiniteNumber(data.CosmicGameBalanceEth);
  const startedAt = toFiniteNumber(data.TsRoundStart);
  const runningSeconds =
    startedAt && startedAt > 0 && nowMs > 0 ? Math.floor(nowMs / 1000) - startedAt : null;
  const contributed = toFiniteNumber(data.CurRoundStats?.TotalDonatedAmountEth);
  const attachedNfts = toFiniteNumber(data.CurRoundStats?.TotalDonatedNFTs);

  const figures: Figure[] = [
    {
      id: 'reserve',
      label: <Term id="cycleReserve" />,
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
      label: (
        <ExplainedTerm definition={t('stats.contributedEth.tooltip')} announce="moreInformation">
          {t('stats.contributedEth.label')}
        </ExplainedTerm>
      ),
      value: contributed === null ? unknown : <Amount value={contributed} unit="ETH" />,
    },
    {
      id: 'attachedNfts',
      label: (
        <ExplainedTerm definition={t('stats.attachedNfts.tooltip')} announce="moreInformation">
          {t('stats.attachedNfts.label')}
        </ExplainedTerm>
      ),
      value: attachedNfts === null ? unknown : formatCount(attachedNfts, locale),
    },
  ];

  return (
    <div className={cn('min-w-0', className)} data-phase={state.phase}>
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <h2 id={headingId} className="type-section">
          {t('hero.title', { n: data.CurRoundNum })}
        </h2>
        <Badge data-testid="live-badge" tone={phase.tone} shape="pill" dot>
          {phaseCopy('label')}
        </Badge>
      </div>

      <div className="mt-8 sm:mt-10">
        <p className="type-label text-subtle">
          <ExplainedTerm definition={phaseCopy('tooltip')}>{phaseCopy('eyebrow')}</ExplainedTerm>
        </p>
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
            {/* A clock whose last poll failed may have been extended: it dims until data returns. */}
            <Duration
              seconds={remainingSeconds}
              variant="clock"
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
            <DateTime timestamp={state.activationTime}>
              {(date) => t('hero.countdown.opensAt', { n: data.CurRoundNum, date })}
            </DateTime>
          </p>
        ) : null}
        {clockStale && remainingSeconds !== null ? (
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
        <Button asChild variant="commit" size="lg" className="max-sm:w-full">
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
