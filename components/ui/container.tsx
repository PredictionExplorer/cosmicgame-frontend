import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

/**
 * Container — horizontal centering + max-width primitive.
 * Pair with PageShell (which handles vertical padding + ambient backdrop).
 */

const containerVariants = cva('mx-auto w-full', {
  variants: {
    size: {
      sm: 'max-w-2xl',
      md: 'max-w-4xl',
      lg: 'max-w-6xl',
      xl: 'max-w-7xl',
      full: 'max-w-none',
      prose: 'max-w-prose',
    },
    gutter: {
      none: '',
      sm: 'px-4',
      md: 'px-4 sm:px-6',
      lg: 'px-4 sm:px-6 lg:px-8',
    },
  },
  defaultVariants: {
    size: 'xl',
    gutter: 'md',
  },
});

export type ContainerProps = React.HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof containerVariants>;

export const Container = React.forwardRef<HTMLDivElement, ContainerProps>(
  ({ className, size, gutter, ...props }, ref) => (
    <div ref={ref} className={cn(containerVariants({ size, gutter }), className)} {...props} />
  ),
);
Container.displayName = 'Container';

export { containerVariants };
