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

const shellVariants = cva(
  'relative z-[1] mx-auto w-full overflow-hidden print:overflow-visible leading-normal min-h-[calc(100vh-100px)]',
  {
    variants: {
      variant: {
        data: 'max-w-7xl px-4 pt-40 pb-24 max-sm:pt-36 max-sm:pb-20 sm:px-6 lg:px-8',
        marketing: 'max-w-7xl px-4 pt-40 pb-32 max-sm:pt-36 max-sm:pb-24 sm:px-6 lg:px-8',
        form: 'max-w-3xl px-4 pt-40 pb-24 max-sm:pt-36 max-sm:pb-20 sm:px-6',
        detail: 'max-w-6xl px-4 pt-40 pb-28 max-sm:pt-36 max-sm:pb-20 sm:px-6 lg:px-8',
        bare: 'max-w-none px-0 pt-0 pb-0 min-h-0 overflow-visible',
      },
    },
    defaultVariants: {
      variant: 'data',
    },
  },
);

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
