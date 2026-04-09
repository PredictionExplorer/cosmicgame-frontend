import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import { Skeleton } from '@/components/ui/skeleton';

interface StatCardProps {
  label: string;
  value: ReactNode;
  icon?: ReactNode;
  tooltip?: string;
  gradient?: boolean;
  featured?: boolean;
  className?: string;
  loading?: boolean;
}

export function StatCard({
  label,
  value,
  icon,
  tooltip,
  gradient = false,
  featured = false,
  className,
  loading = false,
}: StatCardProps) {
  return (
    <div
      className={cn(
        'relative rounded-xl border p-4 backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/[0.05]',
        featured
          ? 'gradient-border-card gradient-border-card-accent bg-white/[0.04] hover:shadow-lg hover:shadow-primary/10'
          : 'border-white/[0.06] bg-white/[0.03] hover:border-white/[0.12] hover:shadow-lg hover:shadow-primary/5',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            {label}
          </p>
          {tooltip && <InfoTooltip content={tooltip} />}
        </div>
        {icon && (
          <div
            className={cn(
              'flex h-7 w-7 items-center justify-center rounded-md',
              featured ? 'bg-primary/15 text-primary' : 'bg-white/[0.06] text-primary/60',
            )}
          >
            {icon}
          </div>
        )}
      </div>
      {loading ? (
        <Skeleton className="mt-2.5 h-7 w-2/3" />
      ) : (
        <p
          className={cn(
            'mt-2.5 text-lg font-bold tracking-tight',
            gradient &&
              'bg-gradient-to-r from-[#35C9FF] via-[#1D9BEF] to-[#AC56FF] bg-clip-text text-transparent',
            featured && !gradient && 'text-white',
          )}
          style={gradient ? { textShadow: '0 0 30px rgba(21, 191, 253, 0.15)' } : undefined}
        >
          {value}
        </p>
      )}
    </div>
  );
}

export function StatCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('rounded-xl border border-white/[0.06] bg-white/[0.03] p-4', className)}>
      <Skeleton className="h-3 w-24" />
      <Skeleton className="mt-2.5 h-7 w-2/3" />
    </div>
  );
}
