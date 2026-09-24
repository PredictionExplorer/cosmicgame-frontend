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
 *
 * The legacy sizes (`sm` … `prose`) and `gutter` remain for existing call
 * sites; new code uses the three above, which carry the gutter themselves.
 */

const FLUID_SIZES = new Set(['site', 'wide', 'reading']);

const containerVariants = cva('mx-auto', {
  variants: {
    size: {
      site: 'site-container',
      wide: 'w-[min(100%-2*var(--gutter),90rem)]',
      reading: 'w-[min(100%-2*var(--gutter),var(--measure-prose))]',
      /** @deprecated Use `site`, `wide` or `reading`. */
      sm: 'w-full max-w-2xl',
      /** @deprecated Use `site`, `wide` or `reading`. */
      md: 'w-full max-w-4xl',
      /** @deprecated Use `site`, `wide` or `reading`. */
      lg: 'w-full max-w-6xl',
      /** @deprecated Use `site`, `wide` or `reading`. */
      xl: 'w-full max-w-7xl',
      full: 'w-full max-w-none',
      /** @deprecated Use `reading`. */
      prose: 'w-full max-w-prose',
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
  },
});

export type ContainerProps = React.HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof containerVariants>;

export const Container = React.forwardRef<HTMLDivElement, ContainerProps>(
  ({ className, size, gutter, ...props }, ref) => {
    const resolvedSize = size ?? 'site';
    // The fluid sizes include the gutter in their width; the legacy fixed
    // widths keep their padding unless the caller turns it off.
    const resolvedGutter = gutter ?? (FLUID_SIZES.has(resolvedSize) ? 'none' : 'md');
    return (
      <div
        ref={ref}
        className={cn(containerVariants({ size: resolvedSize, gutter: resolvedGutter }), className)}
        {...props}
      />
    );
  },
);
Container.displayName = 'Container';

export { containerVariants };
