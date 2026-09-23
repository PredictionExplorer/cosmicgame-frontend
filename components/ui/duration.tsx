import type { HTMLAttributes } from 'react';
import { useLocale } from 'next-intl';

import { formatDuration, toIsoDuration, type DurationOptions } from '@/utils/format';
import { cn } from '@/lib/utils';

export interface DurationProps extends Omit<HTMLAttributes<HTMLElement>, 'children'> {
  /** Length in seconds; fractions are truncated, negatives read as zero. */
  seconds: number | null | undefined;
  /** `compact` (default): "1d 2h 30m 45s". `clock`: a countdown, "6d 22:23:44". */
  variant?: DurationOptions['style'];
  /** `compact` only: keep at most this many leading units ("1d 2h"). */
  maxUnits?: number;
  /** Defaults to the active locale. */
  locale?: string;
}

/**
 * One duration or countdown, rendered as `<time dateTime="P…">` with
 * tabular figures so a ticking value does not jitter, and never wrapping,
 * so "6d 22:23:44" cannot split across lines. The caller drives the ticking
 * (and adds `role="timer"` / `aria-live` where a live countdown needs it).
 */
export function Duration({
  seconds,
  variant = 'compact',
  maxUnits,
  locale,
  className,
  ...rest
}: DurationProps) {
  const activeLocale = useLocale();
  return (
    <time
      dateTime={toIsoDuration(seconds)}
      className={cn('whitespace-nowrap tabular-nums', className)}
      {...rest}
    >
      {formatDuration(seconds, { locale: locale ?? activeLocale, style: variant, maxUnits })}
    </time>
  );
}
