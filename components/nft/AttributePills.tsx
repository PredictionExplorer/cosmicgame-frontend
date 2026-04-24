import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

/**
 * AttributePills — pill-style attribute / trait / rarity chips for NFT
 * detail pages (Provenance, Lineage, Algorithm tabs). Also handy on list
 * rows where a row needs a quick badge cluster.
 *
 * One AttributePill is a small chip; AttributePillGroup arranges them
 * with a consistent gap + wrap behavior.
 */

const pillVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 type-mono-sm transition-colors duration-[var(--duration-fast)]',
  {
    variants: {
      tone: {
        neutral: 'border-white/[0.08] bg-white/[0.04] text-muted-foreground',
        aurora:
          'border-[rgb(var(--aurora-cyan-rgb)/0.25)] bg-[rgb(var(--aurora-cyan-rgb)/0.08)] text-[rgb(var(--aurora-cyan-rgb))]',
        nebula:
          'border-[rgb(var(--nebula-violet-rgb)/0.25)] bg-[rgb(var(--nebula-violet-rgb)/0.1)] text-[rgb(var(--nebula-violet-rgb))]',
        solar:
          'border-[rgb(var(--solar-gold-rgb)/0.25)] bg-[rgb(var(--solar-gold-rgb)/0.1)] text-[rgb(var(--solar-gold-rgb))]',
        impact:
          'border-[rgb(var(--impact-green-rgb)/0.25)] bg-[rgb(var(--impact-green-rgb)/0.1)] text-[rgb(var(--impact-green-rgb))]',
        rose: 'border-[rgb(var(--chrono-rose-rgb)/0.25)] bg-[rgb(var(--chrono-rose-rgb)/0.1)] text-[rgb(var(--chrono-rose-rgb))]',
      },
      size: {
        sm: 'type-mono-sm px-2 py-0.5',
        md: 'type-mono-sm px-2.5 py-1',
        lg: 'text-sm px-3 py-1.5',
      },
      interactive: {
        true: 'cursor-pointer hover:brightness-110',
        false: '',
      },
    },
    defaultVariants: {
      tone: 'neutral',
      size: 'md',
      interactive: false,
    },
  },
);

type PillTone = NonNullable<VariantProps<typeof pillVariants>['tone']>;

export interface AttributePillProps
  extends
    Omit<React.HTMLAttributes<HTMLSpanElement>, 'children'>,
    VariantProps<typeof pillVariants> {
  /** Optional label rendered in muted tone before the value. */
  label?: React.ReactNode;
  value: React.ReactNode;
  icon?: React.ReactNode;
}

export const AttributePill = React.forwardRef<HTMLSpanElement, AttributePillProps>(
  ({ label, value, icon, tone, size, interactive, className, ...props }, ref) => (
    <span ref={ref} className={cn(pillVariants({ tone, size, interactive }), className)} {...props}>
      {icon ? <span aria-hidden>{icon}</span> : null}
      {label ? (
        <>
          <span className="text-muted-foreground/70">{label}</span>
          <span aria-hidden className="text-muted-foreground/30">
            ·
          </span>
        </>
      ) : null}
      <span>{value}</span>
    </span>
  ),
);
AttributePill.displayName = 'AttributePill';

export interface AttributePillGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Horizontal gap between pills. */
  gap?: 'sm' | 'md' | 'lg';
  /** Orientation — defaults to horizontal wrap. */
  direction?: 'row' | 'column';
}

export const AttributePillGroup = React.forwardRef<HTMLDivElement, AttributePillGroupProps>(
  ({ gap = 'md', direction = 'row', className, children, ...props }, ref) => {
    const gapClass = gap === 'sm' ? 'gap-1.5' : gap === 'lg' ? 'gap-3' : 'gap-2';
    const dirClass = direction === 'column' ? 'flex-col items-start' : 'flex-wrap';
    return (
      <div ref={ref} className={cn('flex', dirClass, gapClass, className)} {...props}>
        {children}
      </div>
    );
  },
);
AttributePillGroup.displayName = 'AttributePillGroup';

export { pillVariants };
export type { PillTone };
