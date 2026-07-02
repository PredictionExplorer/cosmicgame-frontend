import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';
import { InfoTooltip } from '@/components/ui/info-tooltip';

export interface StatisticsGroupProps {
  title: string;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
  accentColor?: 'blue' | 'purple' | 'emerald' | 'amber';
  tooltip?: string;
}

type AccentColor = NonNullable<StatisticsGroupProps['accentColor']>;

const accentBorderMap: Record<AccentColor, string> = {
  blue: 'border-l-[rgb(var(--aurora-cyan-rgb))]',
  purple: 'border-l-[rgb(var(--nebula-violet-rgb))]',
  emerald: 'border-l-[rgb(var(--impact-green-rgb))]',
  amber: 'border-l-[rgb(var(--solar-gold-rgb))]',
};

const accentBgMap: Record<AccentColor, string> = {
  blue: 'bg-[rgb(var(--aurora-cyan-rgb)/0.10)] text-[rgb(var(--aurora-cyan-rgb))]',
  purple: 'bg-[rgb(var(--nebula-violet-rgb)/0.10)] text-[rgb(var(--nebula-violet-rgb))]',
  emerald: 'bg-[rgb(var(--impact-green-rgb)/0.10)] text-[rgb(var(--impact-green-rgb))]',
  amber: 'bg-[rgb(var(--solar-gold-rgb)/0.10)] text-[rgb(var(--solar-gold-rgb))]',
};

export function StatisticsGroup({
  title,
  icon,
  children,
  className,
  accentColor,
  tooltip,
}: StatisticsGroupProps) {
  return (
    <div
      className={cn(
        'rounded-xl border border-white/[0.06] bg-white/[0.02] transition-colors hover:bg-white/[0.03]',
        accentColor && 'border-l-2',
        accentColor && accentBorderMap[accentColor],
        className,
      )}
    >
      <div className="flex items-center gap-2.5 border-b border-white/[0.06] px-5 py-3.5">
        {icon && (
          <div
            className={cn(
              'flex h-7 w-7 shrink-0 items-center justify-center rounded-md',
              accentColor ? accentBgMap[accentColor] : 'bg-primary/10 text-primary',
            )}
          >
            {icon}
          </div>
        )}
        <div className="flex min-w-0 items-center gap-1.5">
          <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            {title}
          </h4>
          {tooltip ? <InfoTooltip content={tooltip} label={title} /> : null}
        </div>
      </div>
      <div className="px-3 py-2">{children}</div>
    </div>
  );
}
