import { useLocale, useTranslations } from 'next-intl';

import { formatSeconds } from '@/utils';

import { InfoTooltip } from '@/components/ui/info-tooltip';
import { cn } from '@/lib/utils';
import { formatCstProgressPercent, getCstAuctionProgress } from '@/utils/cstGesture';

interface AuctionInfoProps {
  secondsElapsed: number;
  auctionDuration: number;
  title?: string;
  subtitle?: string;
  endedMessage?: string;
  /** Keeps every timing value visible in the desktop decision dashboard. */
  compact?: boolean;
}

/** Displays Calibration Window duration, remaining time, and progress without hardcoded timing assumptions. */
export function AuctionInfo({
  secondsElapsed,
  auctionDuration,
  title,
  subtitle,
  endedMessage,
  compact = false,
}: AuctionInfoProps) {
  const t = useTranslations('home');
  const locale = useLocale();
  const resolvedTitle = title ?? t('calibration.defaultTitle');
  const resolvedSubtitle = subtitle ?? t('calibration.defaultSubtitle');
  const resolvedEndedMessage = endedMessage ?? t('calibration.defaultEndedMessage');
  const progress = getCstAuctionProgress({
    AuctionDuration: auctionDuration,
    SecondsElapsed: secondsElapsed,
  });
  const progressLabel = t('calibration.progressAria', { title: resolvedTitle });
  const progressValue = Number(progress.percentComplete.toFixed(1));

  return (
    <section
      aria-label={resolvedTitle}
      className={cn(
        'min-w-0 rounded-xl border border-primary/15 bg-primary/[0.045]',
        compact ? 'p-3' : 'p-4',
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="text-xs font-medium text-primary">{resolvedTitle}</p>
            {compact && <InfoTooltip content={resolvedSubtitle} label={resolvedTitle} />}
          </div>
          {!compact && <p className="mt-1 text-sm text-muted-foreground">{resolvedSubtitle}</p>}
        </div>
        {compact ? (
          <p className="font-mono text-xs tabular-nums text-primary">
            {t('calibration.percentComplete', {
              percent: formatCstProgressPercent(progress.percentComplete),
            })}
          </p>
        ) : (
          <div className="text-right">
            <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              {t('calibration.dynamicDuration')}
            </p>
            <p className="font-mono text-lg font-semibold tabular-nums text-white">
              {formatSeconds(progress.auctionDuration, locale)}
            </p>
          </div>
        )}
      </div>

      {progress.isEnded ? (
        <p
          className={cn(
            'font-medium text-emerald-300',
            compact
              ? 'mt-1.5 text-xs'
              : 'mt-4 rounded-lg border border-emerald-400/20 bg-emerald-400/[0.06] px-3 py-2 text-sm',
          )}
        >
          {resolvedEndedMessage}
        </p>
      ) : (
        <div className={compact ? 'mt-2' : 'mt-4 space-y-3'}>
          {!compact && (
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="text-muted-foreground">{t('calibration.progressLabel')}</span>
              <span className="font-mono font-medium tabular-nums text-primary">
                {t('calibration.percentComplete', {
                  percent: formatCstProgressPercent(progress.percentComplete),
                })}
              </span>
            </div>
          )}
          <div
            role="progressbar"
            aria-label={progressLabel}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progressValue}
            className={cn(
              'overflow-hidden rounded-full bg-white/[0.08]',
              compact ? 'h-1.5' : 'h-2.5',
            )}
          >
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary via-accent to-emerald-300 transition-all duration-500"
              style={{ width: `${progress.percentComplete}%` }}
            />
          </div>
        </div>
      )}

      <dl className={cn('grid gap-3', compact ? 'mt-2 grid-cols-3' : 'mt-4 sm:grid-cols-3')}>
        {[
          { label: compact ? 'dynamicDuration' : 'durationLabel', value: progress.auctionDuration },
          { label: 'elapsedLabel', value: progress.secondsElapsed },
          { label: 'remainingLabel', value: progress.secondsRemaining },
        ].map(({ label, value }) => (
          <div
            key={label}
            className={cn(
              'min-w-0',
              !compact && 'rounded-lg border border-white/[0.06] bg-white/[0.025] px-3 py-2',
            )}
          >
            <dt className="text-xs text-muted-foreground">{t(`calibration.${label}`)}</dt>
            <dd className="mt-1 font-mono text-sm tabular-nums [overflow-wrap:anywhere]">
              {formatSeconds(value, locale)}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
