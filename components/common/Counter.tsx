'use client';

import type { CountdownRenderProps } from 'react-countdown';
import { motion, AnimatePresence } from 'framer-motion';

import { cn } from '@/lib/utils';

interface TimeUnit {
  id: keyof CounterUnitLabels;
  value: number;
  label: string;
}

export interface CounterUnitLabels {
  days: string;
  hours: string;
  minutes: string;
  seconds: string;
}

export interface LocalizedCountdownRenderProps extends CountdownRenderProps {
  unitLabels?: CounterUnitLabels;
}

interface CounterProps extends LocalizedCountdownRenderProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  tone?: 'default' | 'impact';
}

const DEFAULT_UNIT_LABELS: CounterUnitLabels = {
  days: 'DAYS',
  hours: 'HRS',
  minutes: 'MIN',
  seconds: 'SEC',
};

const sizeClasses = {
  sm: { digit: 'text-xl', label: 'text-[10px]', pad: 'px-2.5 py-1', gap: 'gap-1.5' },
  md: { digit: 'text-3xl', label: 'text-xs', pad: 'px-3.5 py-2', gap: 'gap-2' },
  lg: { digit: 'text-5xl md:text-6xl', label: 'text-sm', pad: 'px-5 py-3', gap: 'gap-3' },
  xl: {
    digit: 'text-4xl sm:text-6xl md:text-7xl lg:text-8xl',
    label: 'text-[11px] sm:text-sm',
    pad: 'px-3 py-3 sm:px-5 sm:py-4',
    gap: 'gap-2 sm:gap-3',
  },
};

/**
 * Pure function -- no hooks allowed here because react-countdown calls the
 * renderer as `renderer(props)` (plain function call), not `<Renderer />`.
 */
function getTimeUnits(
  days: number,
  hours: number,
  minutes: number,
  seconds: number,
  labels: CounterUnitLabels,
): TimeUnit[] {
  const units: TimeUnit[] = [
    { id: 'days', value: days, label: labels.days },
    { id: 'hours', value: hours, label: labels.hours },
    { id: 'minutes', value: minutes, label: labels.minutes },
    { id: 'seconds', value: seconds, label: labels.seconds },
  ];
  if (days === 0) {
    const filtered = units.filter((u) => u.id !== 'days');
    if (hours === 0) return filtered.filter((u) => u.id !== 'hours');
    return filtered;
  }
  return units;
}

const Counter = ({
  days,
  hours,
  minutes,
  seconds,
  milliseconds = 0,
  total,
  unitLabels = DEFAULT_UNIT_LABELS,
  size = 'md',
  tone = 'default',
}: CounterProps) => {
  const padZero = (value: number): string => value.toString().padStart(2, '0');
  const totalSeconds = days * 86400 + hours * 3600 + minutes * 60 + seconds;
  const derivedTotalMs = totalSeconds * 1000 + milliseconds;
  const totalMs = total > 0 ? total : derivedTotalMs;
  const showTenths = totalMs > 0 && totalMs < 60_000;
  const tenths = Math.floor(milliseconds / 100);
  const isUrgent = totalSeconds < 3600 && totalSeconds > 0;
  const isCritical = totalSeconds < 300 && totalSeconds > 0;
  const isImpact = tone === 'impact' && !isUrgent && !isCritical;
  const s = sizeClasses[size];
  const timeUnits = getTimeUnits(days, hours, minutes, seconds, unitLabels);
  const isMonument = size === 'xl';

  return (
    <div className={cn('flex items-center justify-center', s.gap)}>
      {timeUnits.map(({ id, value, label }, i) => (
        <div key={id} className="flex items-center gap-inherit">
          <div className="flex flex-col items-center">
            <div
              className={cn(
                'relative rounded-lg border overflow-hidden backdrop-blur-sm',
                s.pad,
                isCritical
                  ? 'border-red-500/40 bg-red-500/[0.08] animate-urgency-pulse'
                  : isUrgent
                    ? 'border-amber-500/30 bg-amber-500/[0.06]'
                    : isImpact
                      ? 'border-[rgb(var(--impact-green-rgb)/0.30)] bg-[rgb(var(--impact-green-rgb)/0.08)]'
                      : 'border-white/[0.08] bg-white/[0.04]',
              )}
            >
              <AnimatePresence mode="popLayout">
                <motion.span
                  key={value}
                  initial={isMonument ? false : { y: -8, opacity: 0, filter: 'blur(4px)' }}
                  animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
                  exit={
                    isMonument ? { y: 0, opacity: 1 } : { y: 8, opacity: 0, filter: 'blur(4px)' }
                  }
                  transition={isMonument ? { duration: 0.08 } : { duration: 0.25, ease: 'easeOut' }}
                  className={cn(
                    'block font-display font-bold tabular-nums tracking-tight',
                    s.digit,
                    isCritical
                      ? 'text-red-400'
                      : isUrgent
                        ? 'text-amber-300'
                        : isImpact
                          ? 'bg-gradient-to-r from-[rgb(var(--impact-green-rgb))] via-[#7DD3FC] to-[#35C9FF] bg-clip-text text-transparent'
                          : 'bg-gradient-to-r from-[#35C9FF] via-[#1D9BEF] to-[#AC56FF] bg-clip-text text-transparent',
                  )}
                  style={
                    isImpact
                      ? { textShadow: '0 0 30px rgb(var(--impact-green-rgb) / 0.35)' }
                      : !isCritical && !isUrgent
                        ? { textShadow: '0 0 30px rgba(21, 191, 253, 0.3)' }
                        : isCritical
                          ? { textShadow: '0 0 20px rgba(239, 68, 68, 0.4)' }
                          : { textShadow: '0 0 20px rgba(245, 158, 11, 0.3)' }
                  }
                >
                  {padZero(value)}
                  {id === 'seconds' && showTenths && (
                    <span data-testid="countdown-tenths" className="text-[0.6em] opacity-80">
                      .{tenths}
                    </span>
                  )}
                </motion.span>
              </AnimatePresence>
            </div>
            <span
              className={cn(
                'mt-1.5 font-medium tracking-widest',
                s.label,
                isCritical
                  ? 'text-red-400/70'
                  : isUrgent
                    ? 'text-amber-400/70'
                    : isImpact
                      ? 'text-[rgb(var(--impact-green-rgb)/0.78)]'
                      : 'text-muted-foreground',
              )}
            >
              {label}
            </span>
          </div>
          {i < timeUnits.length - 1 && (
            <span
              className={cn(
                'font-display font-bold self-start mt-1',
                s.digit,
                isCritical
                  ? 'text-red-400/50'
                  : isUrgent
                    ? 'text-amber-400/50'
                    : isImpact
                      ? 'text-[rgb(var(--impact-green-rgb)/0.36)]'
                      : 'text-white/20',
              )}
            >
              :
            </span>
          )}
        </div>
      ))}
    </div>
  );
};

export default Counter;
