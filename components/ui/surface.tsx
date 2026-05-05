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

const surfaceVariants = cva(
  'relative overflow-hidden text-card-foreground shadow-[0_18px_80px_-64px_rgb(var(--aurora-cyan-rgb)/0.85)]',
  {
    variants: {
      variant: {
        glass:
          'border border-white/[0.06] bg-white/[0.03] bg-[linear-gradient(135deg,rgb(255_255_255/0.045),rgb(255_255_255/0.018)_48%,rgb(var(--nebula-violet-rgb)/0.05))] backdrop-blur-sm print:backdrop-blur-none',
        'glass-bordered':
          'border border-white/[0.10] bg-white/[0.04] bg-[linear-gradient(135deg,rgb(var(--aurora-cyan-rgb)/0.08),rgb(255_255_255/0.025)_44%,rgb(var(--nebula-violet-rgb)/0.09))] backdrop-blur-md print:backdrop-blur-none',
        solid: 'border border-border bg-card shadow-sm',
        'gradient-border':
          'gradient-border-card bg-white/[0.04] bg-[linear-gradient(135deg,rgb(var(--aurora-cyan-rgb)/0.06),rgb(var(--nebula-violet-rgb)/0.05))] backdrop-blur-sm print:backdrop-blur-none',
        'gradient-border-accent':
          'gradient-border-card gradient-border-card-accent bg-white/[0.04] bg-[linear-gradient(135deg,rgb(var(--aurora-cyan-rgb)/0.09),rgb(var(--nebula-violet-rgb)/0.08)_52%,rgb(var(--chrono-rose-rgb)/0.06))] backdrop-blur-sm print:backdrop-blur-none',
        elevated: 'border border-border bg-card shadow-[var(--elevation-3)]',
        aurora:
          'border border-[rgb(var(--aurora-cyan-rgb)/0.22)] bg-white/[0.03] bg-[linear-gradient(135deg,rgb(var(--aurora-cyan-rgb)/0.13),rgb(255_255_255/0.025)_52%,rgb(var(--nebula-violet-rgb)/0.08))] backdrop-blur-md',
        nebula:
          'border border-[rgb(var(--nebula-violet-rgb)/0.25)] bg-white/[0.03] bg-[linear-gradient(135deg,rgb(var(--nebula-violet-rgb)/0.15),rgb(255_255_255/0.025)_46%,rgb(var(--chrono-rose-rgb)/0.08))] backdrop-blur-md',
        solar:
          'border border-[rgb(var(--solar-gold-rgb)/0.26)] bg-white/[0.03] bg-[linear-gradient(135deg,rgb(var(--solar-gold-rgb)/0.12),rgb(255_255_255/0.025)_52%,rgb(var(--chrono-rose-rgb)/0.07))] backdrop-blur-md',
        impact:
          'border border-[rgb(var(--impact-green-rgb)/0.24)] bg-white/[0.03] bg-[linear-gradient(135deg,rgb(var(--impact-green-rgb)/0.12),rgb(255_255_255/0.025)_50%,rgb(var(--aurora-cyan-rgb)/0.07))] backdrop-blur-md',
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
        true: 'transition-all duration-[var(--duration-base)] ease-[var(--ease-out-soft)] hover:-translate-y-0.5 hover:border-white/[0.16] hover:bg-white/[0.06] hover:shadow-[0_24px_80px_-48px_rgb(var(--aurora-cyan-rgb)/0.7)]',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'glass',
      radius: 'md',
      padding: 'none',
      interactive: false,
    },
  },
);

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
