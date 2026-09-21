import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

/**
 * AmbientBackdrop — decorative, fixed-position backdrop layer for a page.
 *
 * Pure CSS (no 3D) so it's cheap on every page. Heavy 3D scenes live in
 * page-specific components (e.g. components/three/HeroCanvas) and are
 * composed beside this when needed.
 *
 * aria-hidden + pointer-events-none — never interferes with content.
 */

const backdropVariants = cva(
  'pointer-events-none fixed inset-0 -z-10 overflow-hidden print:hidden',
  {
    variants: {
      variant: {
        subtle: 'opacity-[calc(var(--atmosphere-strength)*0.65)]',
        signature: 'opacity-[var(--atmosphere-strength)]',
        hero: 'opacity-[var(--atmosphere-strength)]',
      },
    },
    defaultVariants: { variant: 'subtle' },
  },
);

export type AmbientBackdropProps = React.HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof backdropVariants>;

export function AmbientBackdrop({
  variant = 'subtle',
  className,
  children,
  ...props
}: AmbientBackdropProps) {
  return (
    <div
      aria-hidden
      data-ambient-backdrop={variant}
      className={cn(backdropVariants({ variant }), className)}
      {...props}
    >
      {/* Static atmosphere stays visible for visitors who reduce motion. */}
      <div className="absolute inset-0 bg-[image:var(--gradient-atmosphere)]" />
      {children}
    </div>
  );
}

export { backdropVariants };
