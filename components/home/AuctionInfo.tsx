import { useLocale, useTranslations } from 'next-intl';

import { Duration } from '@/components/ui/duration';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import { CalibrationWindowIcon } from '@/lib/conceptIcons';
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

/**
 * A Calibration Window's timing on its own (the experimental console): its
 * length, how much has elapsed and what remains, with a 2px progress rule.
 * The home's CalibrationStatus leads with the cost instead. One hairline
 * frame, figures in tabular Inter, and the ended state in neutral words.
 */
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
  const percent = formatCstProgressPercent(progress.percentComplete, locale);
  const figures = [
    { label: 'dynamicDuration', value: progress.auctionDuration },
    { label: 'elapsedLabel', value: progress.secondsElapsed },
    { label: 'remainingLabel', value: progress.secondsRemaining },
  ] as const;

  return (
    <section
      aria-label={resolvedTitle}
      className={cn(
        // `@container`: the figures size by this card, not the viewport; the
        // card sits in narrow columns on wide screens.
        '@container min-w-0 rounded-surface border border-rule-faint bg-surface/60',
        compact ? 'p-3' : 'p-4',
      )}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <div className="flex min-w-0 items-center gap-1.5">
          <CalibrationWindowIcon className="size-4 shrink-0 text-subtle" aria-hidden />
          <p className="type-label min-w-0 text-foreground">{resolvedTitle}</p>
          <InfoTooltip content={resolvedSubtitle} label={resolvedTitle} />
        </div>
        {!progress.isEnded && (
          <p className="type-caption tabular-nums text-subtle">
            {t('calibration.percentComplete', { percent })}
          </p>
        )}
      </div>

      {progress.isEnded ? (
        <p className="type-caption mt-2 text-muted-foreground">{resolvedEndedMessage}</p>
      ) : (
        <div
          role="progressbar"
          aria-label={t('calibration.progressAria', { title: resolvedTitle })}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progress.percentComplete * 10) / 10}
          className="mt-2 h-0.5 w-full rounded-pill bg-rule"
        >
          <div
            className="h-full rounded-pill bg-primary transition-[width] duration-[var(--duration-slow)] motion-reduce:transition-none"
            style={{ width: `${progress.percentComplete}%` }}
          />
        </div>
      )}

      <dl
        className={cn(
          'mt-2 grid gap-x-4 gap-y-1.5',
          compact ? '@min-[26rem]:grid-cols-3' : '@lg:grid-cols-3',
        )}
      >
        {figures.map(({ label, value }) => (
          <div
            key={label}
            className="flex min-w-0 items-baseline justify-between gap-3 @min-[26rem]:block"
          >
            <dt className="type-caption min-w-0 text-subtle">{t(`calibration.${label}`)}</dt>
            <dd className="@min-[26rem]:mt-0.5">
              <Duration seconds={value} className="type-figure-sm text-foreground" />
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
