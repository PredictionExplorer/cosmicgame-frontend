import { cn } from '@/lib/utils';

const BAR_HEIGHTS = ['h-1.5', 'h-2.5', 'h-3.5'] as const;

export interface DifficultyMeterProps {
  /** 1 for the first tier, up to `max`. */
  level: number;
  max?: number;
  /** The meter's accessible name ("Difficulty 2 of 3"). */
  label: string;
  className?: string;
}

/**
 * A tier's difficulty as rising bars, the filled ones in the accent: a cue
 * that reads at a glance and names itself for screen readers.
 */
export function DifficultyMeter({ level, max = 3, label, className }: DifficultyMeterProps) {
  return (
    <span
      role="img"
      aria-label={label}
      className={cn('inline-flex h-3.5 items-end gap-[3px]', className)}
    >
      {Array.from({ length: max }, (_, index) => (
        <span
          key={index}
          className={cn(
            'w-1 rounded-edge',
            BAR_HEIGHTS[Math.min(index, BAR_HEIGHTS.length - 1)],
            index < level ? 'bg-primary' : 'bg-rule',
          )}
        />
      ))}
    </span>
  );
}
