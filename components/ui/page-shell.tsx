import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';
import { AmbientBackdrop, type AmbientBackdropProps } from '@/components/ui/ambient-backdrop';

/**
 * PageShell — the canonical top-level layout primitive for every page.
 *
 * Replaces per-page copies of `<MainWrapper>` / ad-hoc `<main>` blocks.
 * Renders the ambient backdrop, sets max-width + padding per variant,
 * and provides the `#main` skip-link target.
 */

// Backdrops own their clipping. Content remains visible, including focus rings
// and sticky controls; long data is contained by the responsive table primitive.
const shellVariants = cva('relative z-[1] mx-auto w-full leading-normal', {
  variants: {
    variant: {
      data: 'max-w-[83rem] px-4 pt-[calc(var(--header-height)+3.5rem)] pb-16 max-sm:pt-[calc(var(--header-height)+2rem)] max-sm:pb-12 sm:px-6',
      marketing:
        'max-w-[83rem] px-4 pt-[calc(var(--header-height)+3.5rem)] pb-20 max-sm:pt-[calc(var(--header-height)+2rem)] max-sm:pb-16 sm:px-6',
      form: 'max-w-3xl px-4 pt-[calc(var(--header-height)+3.5rem)] pb-16 max-sm:pt-[calc(var(--header-height)+2rem)] max-sm:pb-12 sm:px-6',
      detail:
        'max-w-6xl px-4 pt-[calc(var(--header-height)+3.5rem)] pb-16 max-sm:pt-[calc(var(--header-height)+2rem)] max-sm:pb-12 sm:px-6',
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
