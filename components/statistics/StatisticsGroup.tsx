import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

export interface StatisticsGroupProps {
  title: string;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function StatisticsGroup({ title, icon, children, className }: StatisticsGroupProps) {
  return (
    <div className={cn('rounded-xl border border-white/[0.06] bg-white/[0.02]', className)}>
      <div className="flex items-center gap-2.5 border-b border-white/[0.06] px-5 py-3.5">
        {icon && (
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
            {icon}
          </div>
        )}
        <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          {title}
        </h4>
      </div>
      <div className="px-5 py-2">{children}</div>
    </div>
  );
}
