import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

/**
 * Container — the page's content edge.
 *
 * `site` (the default) is the one edge shared by the header, pages and the
 * footer on both hosts: `--gutter` on each side (16px on phones up to 80px)
 * and at most 80rem wide, through the `site-container` utility. Sections that
 * set their own `max-w-7xl px-*` start at a different x than their
 * neighbours, and the grid visibly jumps from section to section.
 *
 *   site     80rem: every page and section (the default)
 *   wide     90rem: the app home's control desk only
 *   reading  one prose measure (66ch), centred: long-form articles
 *   full     no measure: a band that spans its parent
 *
 * Every size carries its own edge; `gutter` adds padding inside it for the
 * rare band that needs one.
 */

const containerVariants = cva('mx-auto', {
  variants: {
    size: {
      site: 'site-container',
      wide: 'w-[min(100%-2*var(--gutter),90rem)]',
      reading: 'w-[min(100%-2*var(--gutter),var(--measure-prose))]',
      full: 'w-full max-w-none',
    },
    gutter: {
      none: '',
      sm: 'px-4',
      md: 'px-4 sm:px-6',
      lg: 'px-4 sm:px-6 lg:px-8',
    },
  },
  defaultVariants: {
    size: 'site',
    gutter: 'none',
  },
});

export type ContainerProps = React.HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof containerVariants>;

export const Container = React.forwardRef<HTMLDivElement, ContainerProps>(
  ({ className, size, gutter, ...props }, ref) => {
    return (
      <div ref={ref} className={cn(containerVariants({ size, gutter }), className)} {...props} />
    );
  },
);
Container.displayName = 'Container';

export { containerVariants };
