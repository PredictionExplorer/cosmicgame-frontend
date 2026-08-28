'use client';

import { useLocale, useTranslations } from 'next-intl';

import { formatSeconds, shortenHex } from '@/utils';

import type { ChampionsState } from '@/hooks/useChampions';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/utils';

import { DetailMetric } from './DetailMetric';

export interface ChronoWarriorDetailsProps {
  chrono: ChampionsState['chrono'];
  challenge: ChampionsState['chronoChallenge'];
  /** Tight control-desk layout; the full cycle cards use the roomier default. */
  compact?: boolean;
}

/**
 * Complete Chrono-Warrior state: standing record, live-growing segment, next
 * state change, and the distinct active Endurance challenge.
 *
 * The current Endurance Champion is not necessarily the standing
 * Chrono-Warrior, so the challenge remains a separate, explicitly labeled
 * block rather than being folded into the record holder's row.
 */
export function ChronoWarriorDetails({
  chrono,
  challenge,
  compact = false,
}: ChronoWarriorDetailsProps) {
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
      className={cn(
        'rounded-xl border border-primary/20 bg-gradient-to-br from-primary/[0.08] via-accent/[0.045] to-transparent shadow-[0_0_30px_-20px_rgba(21,191,253,0.8)]',
        compact ? 'p-2' : 'mt-3 p-3',
      )}
    >
      <div
        className={cn(
          compact && showChallenge && 'grid items-start gap-1.5 sm:grid-cols-[0.45fr_1.55fr]',
        )}
      >
        <div>
          <div className="mb-1.5 flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_12px_rgba(21,191,253,0.9)]" />
            <p className="text-[10px] font-medium uppercase tracking-wider text-primary/90">
              {t('specialAllocation.chronoReign')}
            </p>
          </div>
          <div className={cn('grid gap-1.5', compact && chrono.isLive && 'sm:grid-cols-2')}>
            {chrono.isLive && chrono.currentSegmentDuration !== undefined && (
              <DetailMetric
                testId="chrono-current-segment"
                label={t('specialAllocation.recordGrowingSegment')}
                value={formatSeconds(chrono.currentSegmentDuration, locale)}
                tone="primary"
                compact={compact}
              />
            )}
            <DetailMetric
              testId="chrono-next-change"
              label={nextMetric.label}
              value={nextMetric.value}
              tone={chrono.isLive ? 'emerald' : 'primary'}
              compact={compact}
            />
          </div>
          {!compact && (
            <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
              {t('specialAllocation.chronoDescription')}
            </p>
          )}
        </div>
        {showChallenge && (
          <div
            data-testid="chrono-active-challenge"
            className={cn(
              'rounded-xl border border-emerald-400/20 bg-emerald-400/[0.045]',
              compact ? 'p-2' : 'mt-3 p-3',
            )}
          >
            <p className="text-[10px] font-medium uppercase tracking-wider text-emerald-300">
              {t('specialAllocation.activeEnduranceChallenge')}
            </p>
            {challenge.address && (
              <Link
                href={`/user/${challenge.address}`}
                title={challenge.address}
                aria-label={challenge.address}
                className={cn(
                  'mt-1.5 block font-mono text-xs text-foreground transition-colors hover:text-primary',
                  compact ? 'whitespace-nowrap' : 'break-all',
                )}
              >
                {compact ? shortenHex(challenge.address, 6) : challenge.address}
              </Link>
            )}
            <div className={cn('grid gap-1.5', compact && 'mt-1.5 grid-cols-3')}>
              {challenge.duration !== undefined && (
                <DetailMetric
                  testId="chrono-challenge-segment"
                  label={t('specialAllocation.challengeSegment')}
                  value={formatSeconds(challenge.duration, locale)}
                  tone="emerald"
                  compact={compact}
                />
              )}
              <DetailMetric
                testId="chrono-challenge-record-to-beat"
                label={t('specialAllocation.recordToBeat')}
                value={formatSeconds(challenge.recordToBeat, locale)}
                tone="gold"
                compact={compact}
              />
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
                compact={compact}
              />
            </div>
            {!compact && (
              <p className="mt-1.5 text-[10px] leading-relaxed text-muted-foreground">
                {t('specialAllocation.challengeDescription')}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
