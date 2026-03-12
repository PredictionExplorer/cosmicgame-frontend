'use client';

import type { CountdownRenderProps } from 'react-countdown';
import { motion, AnimatePresence } from 'framer-motion';

import { cn } from '@/lib/utils';

interface TimeUnit {
  value: number;
  label: string;
}

interface CounterProps extends CountdownRenderProps {
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: { digit: 'text-xl', label: 'text-[10px]', pad: 'px-2.5 py-1', gap: 'gap-1.5' },
  md: { digit: 'text-3xl', label: 'text-xs', pad: 'px-3.5 py-2', gap: 'gap-2' },
  lg: { digit: 'text-5xl md:text-6xl', label: 'text-sm', pad: 'px-5 py-3', gap: 'gap-3' },
};

/**
 * Pure function -- no hooks allowed here because react-countdown calls the
 * renderer as `renderer(props)` (plain function call), not `<Renderer />`.
 */
function getTimeUnits(days: number, hours: number, minutes: number, seconds: number): TimeUnit[] {
  const units: TimeUnit[] = [
    { value: days, label: 'DAYS' },
    { value: hours, label: 'HRS' },
    { value: minutes, label: 'MIN' },
    { value: seconds, label: 'SEC' },
  ];
  if (days === 0) {
    const filtered = units.filter((u) => u.label !== 'DAYS');
    if (hours === 0) return filtered.filter((u) => u.label !== 'HRS');
    return filtered;
  }
  return units;
}

const Counter = ({ days, hours, minutes, seconds, size = 'md' }: CounterProps) => {
  const padZero = (value: number): string => value.toString().padStart(2, '0');
  const totalSeconds = days * 86400 + hours * 3600 + minutes * 60 + seconds;
  const isUrgent = totalSeconds < 3600 && totalSeconds > 0;
  const isCritical = totalSeconds < 300 && totalSeconds > 0;
  const s = sizeClasses[size];
  const timeUnits = getTimeUnits(days, hours, minutes, seconds);

  return (
    <div className={cn('flex items-center justify-center', s.gap)}>
      {timeUnits.map(({ value, label }, i) => (
        <div key={label} className="flex items-center gap-inherit">
          <div className="flex flex-col items-center">
            <div
              className={cn(
                'relative rounded-lg border overflow-hidden backdrop-blur-sm',
                s.pad,
                isCritical
                  ? 'border-red-500/40 bg-red-500/[0.08] animate-urgency-pulse'
                  : isUrgent
                    ? 'border-amber-500/30 bg-amber-500/[0.06]'
                    : 'border-white/[0.08] bg-white/[0.04]',
              )}
            >
              <AnimatePresence mode="popLayout">
                <motion.span
                  key={value}
                  initial={{ y: -8, opacity: 0, filter: 'blur(4px)' }}
                  animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
                  exit={{ y: 8, opacity: 0, filter: 'blur(4px)' }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                  className={cn(
                    'block font-display font-bold tabular-nums tracking-tight',
                    s.digit,
                    isCritical
                      ? 'text-red-400'
                      : isUrgent
                        ? 'text-amber-300'
                        : 'bg-gradient-to-r from-[#35C9FF] via-[#1D9BEF] to-[#AC56FF] bg-clip-text text-transparent',
                  )}
                  style={
                    !isCritical && !isUrgent
                      ? { textShadow: '0 0 30px rgba(21, 191, 253, 0.3)' }
                      : isCritical
                        ? { textShadow: '0 0 20px rgba(239, 68, 68, 0.4)' }
                        : { textShadow: '0 0 20px rgba(245, 158, 11, 0.3)' }
                  }
                >
                  {padZero(value)}
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
                isCritical ? 'text-red-400/50' : isUrgent ? 'text-amber-400/50' : 'text-white/20',
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
