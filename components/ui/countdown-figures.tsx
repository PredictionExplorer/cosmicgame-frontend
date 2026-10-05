import { Fragment, type CSSProperties } from 'react';

import { cn } from '@/lib/utils';
import { clockUnitLabels, type ClockUnit } from '@/utils/format/durations';

/** One group of the clock: a unit's value and its caption ("hours", "години", "時間"). */
export interface CountdownGroup {
  id: string;
  value: number;
  /** The unit caption: a fixed column label (see `countdownGroups`). */
  label: string;
}

/**
 * The clock's size. `hero` is the landing's clock band and `desk` the clock
 * in a column (the app home, /current-cycle); between their bounds the
 * figures fit the room they have (see `countdownFontSize`). A one-line
 * countdown in a bar is a `<Duration variant="clock">`, not these figures.
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

/** The whole units left of a countdown. */
export interface CountdownParts {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

/**
 * The one rounding rule for a countdown: whole seconds, rounded up, so it
 * reads 00:00:01 until the deadline and reaches zero exactly at it. Every
 * reading of one deadline (the app home's clock, its dock, its finalize
 * window and the clock's pre-hydration tick, /current-cycle) rounds here, so
 * two of them never read a second apart. A negative or broken reading is zero.
 */
export function countdownSeconds(remainingMs: number): number {
  if (!Number.isFinite(remainingMs) || remainingMs <= 0) return 0;
  return Math.ceil(remainingMs / 1000);
}

/** A number of milliseconds as whole units, rounded like `countdownSeconds`. */
export function countdownPartsFromMs(remainingMs: number): CountdownParts {
  const total = countdownSeconds(remainingMs);
  return {
    days: Math.floor(total / 86_400),
    hours: Math.floor((total % 86_400) / 3_600),
    minutes: Math.floor((total % 3_600) / 60),
    seconds: total % 60,
  };
}

/**
 * The Cycle clock's groups, captioned from the one unit catalog:
 * DD:HH:MM:SS while days remain, then HH:MM:SS, so the width never jumps
 * within a phase. Every clock of the Cycle Finalization Time builds its
 * groups here, so the landing, the app home, /current-cycle and the dock
 * share one group order, one padding and one set of captions.
 */
export function countdownGroups(parts: CountdownParts, locale: string): CountdownGroup[] {
  const labels = clockUnitLabels(locale);
  const units: ClockUnit[] =
    parts.days > 0 ? ['days', 'hours', 'minutes', 'seconds'] : ['hours', 'minutes', 'seconds'];
  return units.map((unit) => ({ id: unit, value: parts[unit], label: labels[unit] }));
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
  /**
   * The deadline the figures count to (epoch ms), for a server-rendered
   * clock that ticks before hydration: each value carries `data-unit` and a
   * pre-hydration script (the app home's) recomputes them from
   * `data-deadline` until `data-hydrated` appears.
   */
  deadlineMs?: number;
  /** Set once React has hydrated the figures (stops the pre-hydration tick). */
  hydrated?: boolean;
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
 * clock of the Cycle Finalization Time: tabular lining Inter figures,
 * zero-padded groups, hairline colons in the subtle tier, and (except
 * `inline`) each unit's caption centred beneath its group as a fixed column
 * label. No tiles, rings or glows. Decorative (`aria-hidden`): put it inside
 * a `role="timer"` whose accessible name spells the duration out.
 */
export function CountdownFigures({
  groups,
  size = 'desk',
  align = 'center',
  tone = 'live',
  deadlineMs,
  hydrated,
  className,
  'data-testid': testId = 'countdown-figures',
}: CountdownFiguresProps) {
  const placeholder = tone === 'placeholder';
  const ticksBeforeHydration = deadlineMs !== undefined && !placeholder;
  const digits = groups.reduce((total, group) => total + padCountdown(group.value).length, 0);
  const style: CSSProperties = { fontSize: countdownFontSize(digits, size) };

  return (
    <div
      aria-hidden="true"
      data-testid={testId}
      data-size={size}
      data-deadline={ticksBeforeHydration ? deadlineMs : undefined}
      data-hydrated={ticksBeforeHydration && hydrated ? true : undefined}
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
              data-unit={ticksBeforeHydration ? group.id : undefined}
              // The pre-hydration tick may already have moved these digits
              // on; React's first render keeps the server value it reconciles.
              suppressHydrationWarning={ticksBeforeHydration || undefined}
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
