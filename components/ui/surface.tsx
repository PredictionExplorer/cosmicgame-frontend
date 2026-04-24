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

const surfaceVariants = cva('relative text-card-foreground', {
  variants: {
    variant: {
      glass: 'border border-white/[0.06] bg-white/[0.03] backdrop-blur-sm print:backdrop-blur-none',
      'glass-bordered':
        'border border-white/[0.10] bg-white/[0.04] backdrop-blur-md print:backdrop-blur-none',
      solid: 'border border-border bg-card shadow-sm',
      'gradient-border':
        'gradient-border-card bg-white/[0.04] backdrop-blur-sm print:backdrop-blur-none',
      'gradient-border-accent':
        'gradient-border-card gradient-border-card-accent bg-white/[0.04] backdrop-blur-sm print:backdrop-blur-none',
      elevated: 'border border-border bg-card shadow-[var(--elevation-3)]',
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
      true: 'transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out-soft)] hover:bg-white/[0.06]',
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
