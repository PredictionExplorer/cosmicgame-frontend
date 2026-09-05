import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

/**
 * Surface — the single visual container primitive.
 *
 * Consolidates the ~80 inline `rounded-xl border border-white/[0.06]
 * bg-white/[0.02]` instances and the `.gradient-border-card` CSS into one
 * typed component. Card, StatCard, table containers, empty/error states,
 * dialog bodies, etc. all compose from this.
 */

const surfaceVariants = cva('relative min-w-0 overflow-hidden text-card-foreground', {
  variants: {
    variant: {
      glass: 'border border-white/[0.10] bg-white/[0.03]',
      'glass-bordered': 'border border-white/[0.16] bg-white/[0.04]',
      solid: 'border border-border bg-card',
      'gradient-border': 'gradient-border-card bg-card',
      'gradient-border-accent': 'gradient-border-card gradient-border-card-accent bg-card',
      elevated: 'border border-border bg-card shadow-[var(--elevation-3)]',
      aurora: 'border border-[rgb(var(--aurora-cyan-rgb)/0.18)] bg-card',
      nebula: 'border border-secondary/20 bg-card',
      solar: 'border border-[rgb(var(--solar-gold-rgb)/0.20)] bg-card',
      impact: 'border border-[rgb(var(--impact-green-rgb)/0.20)] bg-card',
      plain: '',
    },
    radius: {
      none: 'rounded-none',
      sm: 'rounded-md',
      md: 'rounded-[var(--radius-card)]',
      lg: 'rounded-[var(--radius-surface)]',
      xl: 'rounded-[var(--radius-hero)]',
      pill: 'rounded-full',
    },
    padding: {
      none: '',
      sm: 'p-3',
      md: 'p-4',
      lg: 'p-6',
      xl: 'p-8',
    },
    interactive: {
      true: 'transition-colors duration-[var(--duration-fast)] hover:border-secondary/30 hover:bg-white/[0.05] focus-within:border-secondary/30',
      false: '',
    },
  },
  defaultVariants: {
    variant: 'glass',
    radius: 'md',
    padding: 'none',
    interactive: false,
  },
});

export type SurfaceProps = React.HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof surfaceVariants> & {
    asChild?: boolean;
  };

export const Surface = React.forwardRef<HTMLDivElement, SurfaceProps>(
  ({ className, variant, radius, padding, interactive, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'div';
    return (
      <Comp
        ref={ref}
        className={cn(surfaceVariants({ variant, radius, padding, interactive }), className)}
        {...props}
      />
    );
  },
);
Surface.displayName = 'Surface';

export { surfaceVariants };
