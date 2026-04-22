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
        'relative rounded-xl border p-4 backdrop-blur-sm transition-all duration-300 hover:bg-white/[0.05] print:backdrop-blur-none',
        featured
          ? 'gradient-border-card gradient-border-card-accent bg-white/[0.04] print:border print:border-border'
          : 'border-white/[0.06] bg-white/[0.03]',
        className,
      )}
    >
      <div className="relative z-[1] flex items-start justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground print:!text-foreground/80">
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
        <div
          className={cn(
            'relative z-[1] mt-2.5 text-lg font-bold tracking-tight tabular-nums text-foreground',
            gradient &&
              'bg-gradient-to-r from-[#35C9FF] via-[#1D9BEF] to-[#AC56FF] bg-clip-text text-transparent print:!bg-none print:!bg-clip-border print:!text-foreground print:!shadow-none print:[-webkit-text-fill-color:hsl(var(--foreground))]',
            featured && !gradient && 'text-white print:text-foreground',
          )}
          style={gradient ? { textShadow: '0 0 30px rgba(21, 191, 253, 0.15)' } : undefined}
        >
          {value}
        </div>
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
