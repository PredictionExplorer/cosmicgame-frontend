import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

export interface StatisticsGroupProps {
  title: string;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
  accentColor?: 'blue' | 'purple' | 'emerald' | 'amber';
}

const accentBorderMap: Record<string, string> = {
  blue: 'border-l-[#15BFFD]',
  purple: 'border-l-[#AC56FF]',
  emerald: 'border-l-emerald-500',
  amber: 'border-l-amber-500',
};

const accentBgMap: Record<string, string> = {
  blue: 'bg-[#15BFFD]/10 text-[#15BFFD]',
  purple: 'bg-[#AC56FF]/10 text-[#AC56FF]',
  emerald: 'bg-emerald-500/10 text-emerald-400',
  amber: 'bg-amber-500/10 text-amber-400',
};

export function StatisticsGroup({
  title,
  icon,
  children,
  className,
  accentColor,
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
        <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          {title}
        </h4>
      </div>
      <div className="px-3 py-2">{children}</div>
    </div>
  );
}
