import type { ReactNode } from 'react';
import { Info } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Skeleton } from '@/components/ui/skeleton';

interface StatCardProps {
  label: string;
  value: ReactNode;
  icon?: ReactNode;
  tooltip?: string;
  gradient?: boolean;
  className?: string;
  loading?: boolean;
}

export function StatCard({
  label,
  value,
  icon,
  tooltip,
  gradient = false,
  className,
  loading = false,
}: StatCardProps) {
  return (
    <div
      className={cn(
        'relative rounded-xl border border-white/[0.06] bg-white/[0.03] p-5 backdrop-blur-sm transition-colors hover:bg-white/[0.05]',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {label}
          {tooltip && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="ml-1 inline h-3 w-3 text-muted-foreground/50 cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-[200px]">{tooltip}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </p>
        {icon && <div className="text-primary/70">{icon}</div>}
      </div>
      {loading ? (
        <Skeleton className="mt-3 h-7 w-2/3" />
      ) : (
        <p
          className={cn(
            'mt-3 text-xl font-bold tracking-tight',
            gradient &&
              'bg-gradient-to-r from-[#35C9FF] via-[#1D9BEF] to-[#AC56FF] bg-clip-text text-transparent',
          )}
        >
          {value}
        </p>
      )}
    </div>
  );
}

export function StatCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('rounded-xl border border-white/[0.06] bg-white/[0.03] p-5', className)}>
      <Skeleton className="h-3 w-24" />
      <Skeleton className="mt-3 h-7 w-2/3" />
    </div>
  );
}
