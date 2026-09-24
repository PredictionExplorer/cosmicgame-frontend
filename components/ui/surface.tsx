import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

/**
 * Surface — the single container primitive.
 *
 * Four roles (Black Plate direction: at most one bordered level per region;
 * group inside it with space, a --rule-faint hairline or a sunken well):
 *
 *   plain     no box at all
 *   quiet     --surface fill, no border: the one control group of a view
 *   outlined  a 1px --rule on a faint surface: link cards, index rows, panels
 *   raised    --surface-raised with the float shadow: layers over content
 *
 * `gradient-border` and `gradient-border-accent` draw the signature ring on
 * the one emphasised card of a region. Card is outlined.
 */
const surfaceVariants = cva('relative min-w-0 overflow-hidden text-card-foreground', {
  variants: {
    variant: {
      plain: '',
      quiet: 'bg-surface',
      outlined: 'border border-rule-faint bg-surface/60',
      raised: 'border border-rule bg-surface-raised shadow-float',
      /** The signature ring, for the one emphasised card of a region. */
      'gradient-border': 'gradient-border-card bg-surface',
      'gradient-border-accent': 'gradient-border-card gradient-border-card-accent bg-surface',
    },
    radius: {
      none: 'rounded-none',
      sm: 'rounded-control',
      md: 'rounded-surface',
      lg: 'rounded-surface',
      xl: 'rounded-surface',
      pill: 'rounded-pill',
    },
    padding: {
      none: '',
      sm: 'p-3',
      md: 'p-4',
      lg: 'p-6',
      xl: 'p-8',
    },
    interactive: {
      true: 'transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out-soft)] hover:border-rule hover:bg-surface focus-within:border-rule',
      false: '',
    },
  },
  defaultVariants: {
    variant: 'outlined',
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
