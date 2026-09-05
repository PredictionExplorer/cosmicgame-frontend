import type { HTMLAttributes, ReactNode } from 'react';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';

import { cn } from '@/lib/utils';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import { Skeleton } from '@/components/ui/skeleton';
import { formatFixed } from '@/utils/format';

type Accent = 'aurora' | 'nebula' | 'solar' | 'impact' | 'neutral';

const ACCENT: Record<Accent, { icon: string }> = {
  aurora: {
    icon: 'bg-[rgb(var(--aurora-cyan-rgb)/0.15)] text-[rgb(var(--aurora-cyan-rgb))]',
  },
  nebula: {
    icon: 'bg-secondary/10 text-secondary',
  },
  solar: {
    icon: 'bg-[rgb(var(--solar-gold-rgb)/0.15)] text-[rgb(var(--solar-gold-rgb))]',
  },
  impact: {
    icon: 'bg-[rgb(var(--impact-green-rgb)/0.15)] text-[rgb(var(--impact-green-rgb))]',
  },
  neutral: {
    icon: 'bg-white/[0.06] text-primary/60',
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
  /** Apply a brand accent to the icon. */
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
        'relative min-w-0 overflow-hidden rounded-[var(--radius-card)] border p-5',
        'print:overflow-visible',
        featured
          ? 'gradient-border-card gradient-border-card-accent bg-secondary/[0.04] print:border print:border-border'
          : 'border-white/[0.10] bg-white/[0.02]',
        className,
      )}
    >
      <div className="relative z-[1] flex items-start justify-between gap-2">
        {/* `min-w-0` on both levels: flex items default to `min-width: auto`,
            which stops a long label from ever wrapping and pushes the card
            wider than its grid column on narrow screens. */}
        <div className="flex min-w-0 items-center gap-1.5">
          <p className="type-eyebrow min-w-0 break-words text-muted-foreground print:!text-foreground/80">
            {label}
          </p>
          {tooltip ? <InfoTooltip content={tooltip} label={label} /> : null}
        </div>
        {icon ? (
          <div
            className={cn(
              'flex h-7 w-7 shrink-0 items-center justify-center rounded-md transition-colors',
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
            'stat-card-value relative z-[1] mt-4 break-words text-2xl font-medium tracking-tight tabular-nums text-foreground',
            'print:!text-foreground print:!shadow-none print:[-webkit-text-fill-color:hsl(var(--foreground))]',
            gradient && 'text-secondary',
            featured && !gradient && 'text-white print:!text-foreground',
          )}
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
  const pct = `${isUp ? '+' : ''}${formatFixed(delta, 1)}%`;
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
        'rounded-[var(--radius-card)] border border-white/[0.10] bg-white/[0.02] p-5',
        className,
      )}
    >
      <Skeleton className="h-3 w-24" />
      <Skeleton className="mt-3 h-7 w-2/3" />
    </div>
  );
}
