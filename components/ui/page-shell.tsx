import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';
import { AmbientBackdrop, type AmbientBackdropProps } from '@/components/ui/ambient-backdrop';

/**
 * PageShell — the canonical top-level layout primitive for every page.
 *
 * Renders the ambient backdrop, the page's `<main>` (the `#main` skip-link
 * target) and its content edge.
 *
 * The edge is the site's one content edge, `--gutter` (styles/tokens.css),
 * the same one the header and footer draw with `site-container`, so a page's
 * H1 starts under the header's wordmark at every width. `data` and
 * `marketing` pages are the full 80rem column; `form` (48rem) and `detail`
 * (72rem) are narrower measures centred on the same gutters. The width is a
 * max-width plus gutter padding rather than `site-container`'s `width`, so a
 * caller's `max-w-none px-0` still opens a full-bleed page.
 */

const EDGE = 'px-[var(--gutter)]';

// Backdrops own their clipping. Content remains visible, including focus rings
// and sticky controls; long data is contained by the responsive table primitive.
const shellVariants = cva('relative z-[1] mx-auto w-full leading-normal', {
  variants: {
    variant: {
      data: `max-w-[calc(80rem+2*var(--gutter))] ${EDGE} pt-[calc(var(--header-height)+3.5rem)] pb-16 max-sm:pt-[calc(var(--header-height)+2rem)] max-sm:pb-12`,
      marketing: `max-w-[calc(80rem+2*var(--gutter))] ${EDGE} pt-[calc(var(--header-height)+3.5rem)] pb-20 max-sm:pt-[calc(var(--header-height)+2rem)] max-sm:pb-16`,
      form: `max-w-[calc(48rem+2*var(--gutter))] ${EDGE} pt-[calc(var(--header-height)+3.5rem)] pb-16 max-sm:pt-[calc(var(--header-height)+2rem)] max-sm:pb-12`,
      detail: `max-w-[calc(72rem+2*var(--gutter))] ${EDGE} pt-[calc(var(--header-height)+3.5rem)] pb-16 max-sm:pt-[calc(var(--header-height)+2rem)] max-sm:pb-12`,
      bare: 'max-w-none px-0 pt-0 pb-0 min-h-0 overflow-visible',
    },
  },
  defaultVariants: {
    variant: 'data',
  },
});

type BackdropProp = AmbientBackdropProps['variant'] | null;

export interface PageShellProps
  extends React.HTMLAttributes<HTMLElement>, VariantProps<typeof shellVariants> {
  /** Ambient backdrop variant. Pass `null` to skip. Defaults per `variant`. */
  backdrop?: BackdropProp;
  /** Override the default `#main` skip-link target id. */
  id?: string;
}

const DEFAULT_BACKDROP: Record<NonNullable<PageShellProps['variant']>, BackdropProp> = {
  data: 'subtle',
  marketing: 'signature',
  form: 'subtle',
  detail: 'signature',
  bare: null,
};

export const PageShell = React.forwardRef<HTMLElement, PageShellProps>(
  ({ className, variant = 'data', backdrop, id = 'main', children, ...props }, ref) => {
    const resolvedBackdrop =
      backdrop === undefined ? DEFAULT_BACKDROP[variant ?? 'data'] : backdrop;
    return (
      <>
        {resolvedBackdrop ? <AmbientBackdrop variant={resolvedBackdrop} /> : null}
        <main
          ref={ref}
          id={id}
          tabIndex={-1}
          className={cn(shellVariants({ variant }), className)}
          {...props}
        >
          {children}
        </main>
      </>
    );
  },
);
PageShell.displayName = 'PageShell';

export { shellVariants };
