import type { HTMLAttributes, ReactNode } from 'react';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';

import { cn } from '@/lib/utils';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import { Skeleton } from '@/components/ui/skeleton';

type Accent = 'aurora' | 'nebula' | 'solar' | 'impact' | 'neutral';

const ACCENT: Record<Accent, { icon: string; hover: string }> = {
  aurora: {
    icon: 'bg-[rgb(var(--aurora-cyan-rgb)/0.15)] text-[rgb(var(--aurora-cyan-rgb))]',
    hover: 'hover:shadow-[0_0_40px_-10px_rgb(var(--aurora-cyan-rgb)/0.4)]',
  },
  nebula: {
    icon: 'bg-[rgb(var(--nebula-violet-rgb)/0.18)] text-[rgb(var(--nebula-violet-rgb))]',
    hover: 'hover:shadow-[0_0_40px_-10px_rgb(var(--nebula-violet-rgb)/0.45)]',
  },
  solar: {
    icon: 'bg-[rgb(var(--solar-gold-rgb)/0.15)] text-[rgb(var(--solar-gold-rgb))]',
    hover: 'hover:shadow-[0_0_40px_-10px_rgb(var(--solar-gold-rgb)/0.4)]',
  },
  impact: {
    icon: 'bg-[rgb(var(--impact-green-rgb)/0.15)] text-[rgb(var(--impact-green-rgb))]',
    hover: 'hover:shadow-[0_0_40px_-10px_rgb(var(--impact-green-rgb)/0.4)]',
  },
  neutral: {
    icon: 'bg-white/[0.06] text-primary/60',
    hover: '',
  },
};

export interface StatCardTrend {
  /** Positive = up, negative = down, 0 = flat. */
  delta: number;
  label: string;
  /** Override the sign semantics — "up is bad" for some metrics. */
  invertSentiment?: boolean;
}

interface StatCardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'title'> {
  label: string;
  value: ReactNode;
  icon?: ReactNode;
  tooltip?: string;
  /** Apply a brand accent to icon + subtle glow on hover. */
  accent?: Accent;
  /** Apply a gradient to the value (deprecated — prefer accent). */
  gradient?: boolean;
  /** Featured variant renders a gradient border. */
  featured?: boolean;
  /** Optional trend pill rendered below the value. */
  trend?: StatCardTrend;
  loading?: boolean;
}

export function StatCard({
  label,
  value,
  icon,
  tooltip,
  accent = 'neutral',
  gradient = false,
  featured = false,
  trend,
  loading = false,
  className,
  ...rest
}: StatCardProps) {
  const palette = ACCENT[accent];
  return (
    <div
      {...rest}
      className={cn(
        'group relative rounded-[var(--radius-card)] border p-4 backdrop-blur-sm transition-all',
        'duration-[var(--duration-base)] ease-[var(--ease-out-soft)]',
        'hover:bg-white/[0.06] hover:-translate-y-0.5',
        'print:backdrop-blur-none print:hover:translate-y-0',
        featured
          ? 'gradient-border-card gradient-border-card-accent bg-white/[0.04] print:border print:border-border'
          : 'border-white/[0.06] bg-white/[0.03]',
        palette.hover,
        className,
      )}
    >
      <div className="relative z-[1] flex items-start justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <p className="type-eyebrow text-muted-foreground print:!text-foreground/80">{label}</p>
          {tooltip ? <InfoTooltip content={tooltip} /> : null}
        </div>
        {icon ? (
          <div
            className={cn(
              'flex h-7 w-7 items-center justify-center rounded-md transition-colors',
              'duration-[var(--duration-fast)]',
              featured ? 'bg-primary/15 text-primary' : palette.icon,
            )}
          >
            {icon}
          </div>
        ) : null}
      </div>
      {loading ? (
        <Skeleton className="mt-3 h-7 w-2/3" />
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
      {!loading && trend ? <StatTrend {...trend} /> : null}
    </div>
  );
}

function StatTrend({ delta, label, invertSentiment = false }: StatCardTrend) {
  const isUp = delta > 0;
  const isFlat = delta === 0;
  const isGood = isFlat ? null : invertSentiment ? !isUp : isUp;
  const Arrow = isUp ? ArrowUpRight : ArrowDownRight;
  const pct = `${isUp ? '+' : ''}${delta.toFixed(1)}%`;
  return (
    <div className="mt-2.5 flex items-center gap-2 type-body-sm">
      <span
        className={cn(
          'inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 type-mono-sm',
          isFlat && 'bg-white/[0.06] text-muted-foreground',
          isGood === true &&
            'bg-[rgb(var(--impact-green-rgb)/0.12)] text-[rgb(var(--impact-green-rgb))]',
          isGood === false &&
            'bg-[rgb(var(--chrono-rose-rgb)/0.12)] text-[rgb(var(--chrono-rose-rgb))]',
        )}
      >
        {!isFlat ? <Arrow className="h-3 w-3" aria-hidden /> : null}
        {pct}
      </span>
      <span className="text-muted-foreground">{label}</span>
    </div>
  );
}

export function StatCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'rounded-[var(--radius-card)] border border-white/[0.06] bg-white/[0.03] p-4',
        className,
      )}
    >
      <Skeleton className="h-3 w-24" />
      <Skeleton className="mt-3 h-7 w-2/3" />
    </div>
  );
}
