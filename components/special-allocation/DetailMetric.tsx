import { cn } from '@/lib/utils';

export interface DetailMetricProps {
  label: string;
  value: string;
  testId?: string;
  tone?: 'muted' | 'primary' | 'emerald' | 'gold';
  /** Removes outer margin and tightens padding for the home control desk. */
  compact?: boolean;
  className?: string;
}

/**
 * Small label/value cell shared by special-allocation detail views.
 *
 * Keeping this primitive in the domain layer ensures the home control desk
 * and the full current-cycle cards present the same values with only density
 * changing between contexts.
 */
export function DetailMetric({
  label,
  value,
  testId,
  tone = 'muted',
  compact = false,
  className,
}: DetailMetricProps) {
  return (
    <div
      data-testid={testId}
      className={cn(
        'rounded-lg border',
        compact ? 'px-2.5 py-1.5' : 'mt-2 px-3 py-2',
        tone === 'primary'
          ? 'border-primary/20 bg-primary/[0.055] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]'
          : tone === 'emerald'
            ? 'border-emerald-400/20 bg-emerald-400/[0.055]'
            : tone === 'gold'
              ? 'border-[rgb(var(--solar-gold-rgb)/0.24)] bg-[rgb(var(--solar-gold-rgb)/0.055)]'
              : 'border-white/[0.06] bg-black/10',
        className,
      )}
    >
      <p
        className={cn(
          'text-[10px] uppercase tracking-wider',
          tone === 'primary'
            ? 'text-primary/90'
            : tone === 'emerald'
              ? 'text-emerald-300'
              : tone === 'gold'
                ? 'text-[rgb(var(--solar-gold-rgb))]'
                : 'text-muted-foreground',
        )}
      >
        {label}
      </p>
      <p className="mt-0.5 break-words text-xs font-medium text-foreground">{value}</p>
    </div>
  );
}
