import { Fragment, type CSSProperties } from 'react';

import { cn } from '@/lib/utils';

/** One group of the clock: a unit's value and its caption ("hours", "год", "時間"). */
export interface CountdownGroup {
  id: string;
  value: number;
  /** The unit caption for this value, already pluralized by the caller's catalog. */
  label: string;
}

/**
 * The clock's size bounds. `hero` is the landing's clock band, `desk` a
 * clock in a panel column (the app home). Between the bounds the figures fit
 * the room they have: see `countdownFontSize`.
 */
export type CountdownSize = 'hero' | 'desk';

const SIZE_BOUNDS: Record<CountdownSize, readonly [min: string, max: string]> = {
  hero: ['2rem', '4.5rem'],
  desk: ['2.25rem', '3.5rem'],
};

/** Two digits at least: the clock never jumps width as a unit drops below ten. */
export function padCountdown(value: number): string {
  return String(Math.max(0, Math.floor(value))).padStart(2, '0');
}

/**
 * The figures' font size: about 0.62em per tabular digit plus the colons and
 * gaps, fitted to the nearest inline-size container (`cqi`) within the
 * size's bounds, so a three-digit day count still fits one row on a 320px
 * phone. The parent must be a size container (`container-type: inline-size`).
 */
export function countdownFontSize(digits: number, size: CountdownSize): string {
  const [min, max] = SIZE_BOUNDS[size];
  return `clamp(${min}, calc(100cqi / (${digits} * 0.62 + 2.6)), ${max})`;
}

export interface CountdownFiguresProps {
  groups: readonly CountdownGroup[];
  size?: CountdownSize;
  /** Where the row sits in its column. */
  align?: 'start' | 'center' | 'end';
  /**
   * `live`: foreground figures. `stale`: the reading is not fresh, so the
   * figures step back to the muted tier (a freshness stamp says why).
   * `placeholder`: dashes at the final size while the first reading is on its
   * way, so nothing reflows when it lands.
   */
  tone?: 'live' | 'stale' | 'placeholder';
  className?: string;
  'data-testid'?: string;
}

const ALIGN = {
  start: 'justify-start',
  center: 'justify-center',
  end: 'justify-end',
} as const;

const TONE = {
  live: 'text-foreground',
  stale: 'text-muted-foreground',
  placeholder: 'text-subtle',
} as const;

/**
 * CountdownFigures — the Cycle clock as type, one presentation for every
 * clock of the Cycle Finalization Time: tabular Inter figures with a slashed
 * zero, hairline colons in the subtle tier, and each unit's caption centred
 * beneath its group, pluralized for its value by the caller's catalog. No
 * tiles, rings or glows. Decorative (`aria-hidden`): put it inside a
 * `role="timer"` whose accessible name spells the duration out.
 */
export function CountdownFigures({
  groups,
  size = 'desk',
  align = 'center',
  tone = 'live',
  className,
  'data-testid': testId = 'countdown-figures',
}: CountdownFiguresProps) {
  const placeholder = tone === 'placeholder';
  const digits = groups.reduce((total, group) => total + padCountdown(group.value).length, 0);
  const style: CSSProperties = { fontSize: countdownFontSize(digits, size) };

  return (
    <div
      aria-hidden="true"
      data-testid={testId}
      data-size={size}
      className={cn(
        'type-figure-xl flex w-full min-w-0 items-start gap-[0.12em] [direction:ltr]',
        ALIGN[align],
        className,
      )}
      style={style}
    >
      {groups.map((group, index) => (
        <Fragment key={group.id}>
          {index > 0 ? <span className="font-light text-subtle">:</span> : null}
          <span
            className="flex min-w-0 flex-col items-center"
            data-countdown-unit={placeholder ? undefined : group.id}
          >
            <span
              className={cn(
                'whitespace-nowrap transition-colors duration-[var(--duration-slow)] ease-[var(--ease-out-soft)]',
                TONE[tone],
              )}
              data-testid={placeholder ? undefined : 'countdown-value'}
            >
              {placeholder ? '––' : padCountdown(group.value)}
            </span>
            <span className="type-caption mt-2 whitespace-nowrap tracking-normal text-subtle">
              {group.label}
            </span>
          </span>
        </Fragment>
      ))}
    </div>
  );
}
