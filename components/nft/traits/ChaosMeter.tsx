'use client';

import { useLocale, useTranslations } from 'next-intl';

import { DEFAULT_CHAOS_MAX } from '@/lib/nftMetadata';
import { cn } from '@/lib/utils';
import { toIntlLocale } from '@/utils/format';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

/** Props for {@link ChaosMeter}. */
export interface ChaosMeterProps {
  /** Chaos index; renders nothing when absent. */
  value?: number;
  max?: number;
  size?: 'sm' | 'md';
  /** Show the numeric value next to the bar. */
  withValue?: boolean;
  className?: string;
}

/**
 * ChaosMeter — the simulation's chaos index as a compact meter (cool aurora
 * for orderly orbits shading into rose as the trajectories turn turbulent).
 */
export function ChaosMeter({
  value,
  max = DEFAULT_CHAOS_MAX,
  size = 'sm',
  withValue = true,
  className,
}: ChaosMeterProps) {
  const t = useTranslations('traits');
  const locale = useLocale();
  if (typeof value !== 'number' || !Number.isFinite(value)) return null;
  const bound = max > 0 ? max : DEFAULT_CHAOS_MAX;
  const ratio = Math.min(1, Math.max(0, value / bound));
  const label = t('card.chaosAria', { value, max: bound });

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          className={cn('inline-flex items-center gap-1.5 cursor-help', className)}
          data-testid="chaos-meter"
        >
          <span
            role="meter"
            aria-label={label}
            aria-valuemin={0}
            aria-valuemax={bound}
            aria-valuenow={value}
            className={cn(
              'relative block overflow-hidden rounded-full bg-white/[0.08]',
              size === 'sm' ? 'h-1 w-10' : 'h-1.5 w-16',
            )}
          >
            <span
              aria-hidden
              className="absolute inset-y-0 left-0 rounded-full"
              style={{
                width: `${(ratio * 100).toFixed(1)}%`,
                backgroundImage:
                  'linear-gradient(90deg, rgb(var(--aurora-cyan-rgb)), rgb(var(--nebula-violet-rgb)) 55%, rgb(var(--chrono-rose-rgb)))',
              }}
            />
          </span>
          {withValue ? (
            <span
              aria-hidden
              className={cn(
                'font-mono tabular-nums text-muted-foreground',
                size === 'sm' ? 'text-[10px]' : 'text-xs',
              )}
            >
              {value.toLocaleString(toIntlLocale(locale))}
            </span>
          ) : null}
        </span>
      </TooltipTrigger>
      <TooltipContent side="bottom">
        <p className="font-medium">{label}</p>
        <p className="text-muted-foreground">{t('hints.chaos')}</p>
      </TooltipContent>
    </Tooltip>
  );
}
