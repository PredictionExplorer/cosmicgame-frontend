'use client';

import { useTranslations } from 'next-intl';

import { shortenHex } from '@/utils';

import type { ChampionsState } from '@/hooks/useChampions';
import { useFormat } from '@/hooks/useFormat';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/utils';

import { DetailMetric } from './DetailMetric';

export interface ChronoWarriorDetailsProps {
  chrono: ChampionsState['chrono'];
  challenge: ChampionsState['chronoChallenge'];
  /** Tight control-desk layout; the full cycle cards use the roomier default. */
  compact?: boolean;
  /** A horizontal decision strip below the dashboard's role summaries. */
  dashboard?: boolean;
}

/** The 6px mark of something changing right now; the heading beside it is the word. */
function LiveDot() {
  return <span aria-hidden className="size-1.5 shrink-0 rounded-full bg-live" />;
}

/**
 * Complete Chrono-Warrior state: standing record, live-growing segment, next
 * state change, and the distinct active Endurance challenge.
 *
 * The current Endurance Champion is not necessarily the standing
 * Chrono-Warrior, so the challenge remains a separate, explicitly labeled
 * block rather than being folded into the record holder's row. Inside a
 * card the details are grouped by a hairline and sunken wells, never a
 * second bordered box; the live colour marks only values that are ticking.
 */
export function ChronoWarriorDetails({
  chrono,
  challenge,
  compact = false,
  dashboard = false,
}: ChronoWarriorDetailsProps) {
  const t = useTranslations('tables');
  const format = useFormat();

  if (!chrono.address) return null;

  const nextMetric = (() => {
    if (chrono.isLive) {
      return chrono.willStopGrowingIn !== undefined && chrono.willStopGrowingIn > 0
        ? {
            label: t('specialAllocation.mayCloseIn'),
            value: t('specialAllocation.mayCloseValue', {
              duration: format.duration(chrono.willStopGrowingIn),
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
  const challengeCountdown = challenge.startsGrowingIn !== undefined;
  const challengeNext = {
    label: challenge.isRecordHolder
      ? t('specialAllocation.canExtendIn')
      : t('specialAllocation.canOvertakeIn'),
    value: challengeCountdown
      ? format.duration(challenge.startsGrowingIn ?? 0)
      : challenge.isRecordHolder
        ? t('specialAllocation.waitingToExtend')
        : t('specialAllocation.waitingToOvertake'),
  };

  const challengerLink = (full: boolean) =>
    challenge.address ? (
      <Link
        href={`/user/${challenge.address}`}
        title={challenge.address}
        aria-label={challenge.address}
        className={cn(
          'mt-0.5 inline-block type-mono-sm text-foreground transition-colors duration-fast hover:text-primary',
          full ? 'break-all' : 'whitespace-nowrap',
        )}
      >
        {full ? challenge.address : shortenHex(challenge.address, 6)}
      </Link>
    ) : null;

  if (dashboard) {
    if (!showChallenge && !chrono.isLive) return null;

    return (
      <div
        data-testid="chrono-warrior-details"
        className="@container/chrono min-w-0 rounded-control bg-surface-sunken px-2.5 py-2"
      >
        {showChallenge ? (
          <div
            data-testid="chrono-active-challenge"
            className="grid min-w-0 grid-cols-2 gap-x-3 gap-y-2 @min-[570px]/chrono:grid-cols-[1.4fr_1fr_1fr_1fr]"
          >
            <div className="min-w-0">
              <p className="flex items-center gap-1.5 type-caption font-medium text-foreground">
                <LiveDot />
                {t('specialAllocation.activeEnduranceChallenge')}
              </p>
              {challengerLink(false)}
            </div>
            {challenge.duration !== undefined && (
              <DetailMetric
                testId="chrono-challenge-segment"
                label={t('specialAllocation.challengeSegment')}
                value={format.duration(challenge.duration)}
                unframed
              />
            )}
            <DetailMetric
              testId="chrono-challenge-record-to-beat"
              label={t('specialAllocation.recordToBeat')}
              value={format.duration(challenge.recordToBeat)}
              unframed
            />
            <DetailMetric
              testId="chrono-challenge-next-change"
              label={challengeNext.label}
              value={challengeNext.value}
              tone={challengeCountdown ? 'live' : 'neutral'}
              unframed
            />
          </div>
        ) : (
          <div className="grid min-w-0 grid-cols-2 gap-x-3 gap-y-2 @min-[570px]/chrono:grid-cols-[1fr_1fr_2fr]">
            {chrono.currentSegmentDuration !== undefined && (
              <DetailMetric
                testId="chrono-current-segment"
                label={t('specialAllocation.recordGrowingSegment')}
                value={format.duration(chrono.currentSegmentDuration)}
                tone="live"
                unframed
              />
            )}
            <DetailMetric
              testId="chrono-challenge-record-to-beat"
              label={t('specialAllocation.recordToBeat')}
              value={format.duration(challenge.recordToBeat)}
              unframed
            />
            <DetailMetric
              testId="chrono-next-change"
              label={nextMetric.label}
              value={nextMetric.value}
              tone="live"
              unframed
              className="col-span-2 @min-[570px]/chrono:col-span-1"
            />
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      data-testid="chrono-warrior-details"
      className={cn(
        '@container/chrono min-w-0',
        compact
          ? 'rounded-control bg-surface-sunken p-2.5'
          : 'mt-3 border-t border-rule-faint pt-3',
      )}
    >
      <div
        className={cn(
          compact &&
            showChallenge &&
            'grid items-start gap-3 @min-[560px]/chrono:grid-cols-[0.45fr_1.55fr]',
        )}
      >
        <div className="min-w-0">
          <p className="mb-1.5 flex items-center gap-1.5 type-label text-muted-foreground">
            {chrono.isLive && <LiveDot />}
            {t('specialAllocation.chronoReign')}
          </p>
          <div
            className={cn(
              'grid',
              compact ? 'gap-x-3 gap-y-2' : 'gap-1.5',
              compact && chrono.isLive && '@min-[350px]/chrono:grid-cols-2',
            )}
          >
            {chrono.isLive && chrono.currentSegmentDuration !== undefined && (
              <DetailMetric
                testId="chrono-current-segment"
                label={t('specialAllocation.recordGrowingSegment')}
                value={format.duration(chrono.currentSegmentDuration)}
                tone="live"
                unframed={compact}
              />
            )}
            <DetailMetric
              testId="chrono-next-change"
              label={nextMetric.label}
              value={nextMetric.value}
              tone={chrono.isLive ? 'live' : 'neutral'}
              unframed={compact}
            />
          </div>
          {!compact && (
            <p className="mt-2 type-caption text-subtle">
              {t('specialAllocation.chronoDescription')}
            </p>
          )}
        </div>
        {showChallenge && (
          <div
            data-testid="chrono-active-challenge"
            className={cn('min-w-0', !compact && 'mt-3 border-t border-rule-faint pt-3')}
          >
            <p className="flex items-center gap-1.5 type-label text-muted-foreground">
              <LiveDot />
              {t('specialAllocation.activeEnduranceChallenge')}
            </p>
            {challengerLink(!compact)}
            <div
              className={cn(
                'mt-1.5 grid',
                compact ? 'grid-cols-3 gap-x-3 gap-y-2' : 'gap-1.5 @min-[420px]/chrono:grid-cols-3',
              )}
            >
              {challenge.duration !== undefined && (
                <DetailMetric
                  testId="chrono-challenge-segment"
                  label={t('specialAllocation.challengeSegment')}
                  value={format.duration(challenge.duration)}
                  unframed={compact}
                />
              )}
              <DetailMetric
                testId="chrono-challenge-record-to-beat"
                label={t('specialAllocation.recordToBeat')}
                value={format.duration(challenge.recordToBeat)}
                unframed={compact}
              />
              <DetailMetric
                testId="chrono-challenge-next-change"
                label={challengeNext.label}
                value={challengeNext.value}
                tone={challengeCountdown ? 'live' : 'neutral'}
                unframed={compact}
              />
            </div>
            {!compact && (
              <p className="mt-1.5 type-caption text-subtle">
                {t('specialAllocation.challengeDescription')}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
