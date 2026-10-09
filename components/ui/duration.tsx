import { Fragment, type HTMLAttributes } from 'react';
import { useLocale } from 'next-intl';

import { getLocaleConfig } from '@/i18n/localeConfig';
import { NBSP, formatDurationParts, toIsoDuration, type DurationOptions } from '@/utils/format';
import { cn } from '@/lib/utils';

export interface DurationProps extends Omit<HTMLAttributes<HTMLElement>, 'children'> {
  /** Length in seconds; fractions are truncated, negatives read as zero. */
  seconds: number | null | undefined;
  /** `compact` (default): "1d 2h 30m 45s". `clock`: a countdown, "6d 22:23:44". */
  variant?: DurationOptions['style'];
  /** `compact` only: keep at most this many leading units ("1d 2h"). */
  maxUnits?: number;
  /**
   * `clock` only: let a box too narrow for the whole countdown break it
   * between the day count and the clock ("5 ngày" / "06:54:03") instead of
   * overflowing. A countdown otherwise stays on one line.
   */
  wrap?: boolean;
  /** Defaults to the active locale. */
  locale?: string;
}

/**
 * One duration or countdown, rendered as `<time dateTime="P…">` with
 * tabular figures so a ticking value does not jitter.
 *
 * A unit group ("30m", "5 ngày", "1時間", "22:03:44") never splits. A compact
 * duration may wrap between groups where its container wraps text, so
 * "9 ngày 1 giờ 36 phút 42 giây" fits a narrow ledger cell on two lines; a
 * `whitespace-nowrap` container (every data-table duration column) keeps it
 * on one. A countdown stays whole unless `wrap` is set. The text is exactly
 * `formatDuration`'s: the break points are `<wbr>` elements, and `keep-all`
 * stops Han and Hangul text from breaking anywhere else. The caller drives
 * the ticking (and adds `role="timer"` / `aria-live` where a live countdown
 * needs it).
 */
export function Duration({
  seconds,
  variant = 'compact',
  maxUnits,
  wrap = false,
  locale,
  className,
  ...rest
}: DurationProps) {
  const activeLocale = useLocale();
  const resolvedLocale = locale ?? activeLocale;
  const parts = formatDurationParts(seconds, { locale: resolvedLocale, style: variant, maxUnits });
  const joiner = getLocaleConfig(resolvedLocale).wordSpacing ? NBSP : '';
  const breaksBetweenGroups = variant === 'compact' || wrap;

  return (
    <time
      dateTime={toIsoDuration(seconds)}
      className={cn(
        'tabular-nums',
        breaksBetweenGroups ? 'break-keep' : 'whitespace-nowrap',
        className,
      )}
      {...rest}
    >
      {breaksBetweenGroups
        ? parts.map((part, index) => (
            <Fragment key={index}>
              {index > 0 && (
                <>
                  {joiner}
                  <wbr />
                </>
              )}
              {part}
            </Fragment>
          ))
        : parts.join(joiner)}
    </time>
  );
}
