import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

/**
 * AmbientBackdrop — decorative, fixed-position backdrop layer for a page.
 *
 * Pure CSS and static: the palette's atmosphere gradient (its own glow
 * colours, at the palette's --atmosphere-strength), and on hero pages a
 * sparse starfield in the palette's foreground colour, kept to the side
 * gutters so it never sits behind a line of text. No canvas, no motion, no
 * JavaScript. Heavy 3D scenes live in page-specific components and are
 * composed beside this when needed.
 *
 * Variants set how much of the palette's atmosphere shows:
 *   hero       the landing hero and the app home: full strength, starfield
 *   subtle     data and long-form pages: 40%, so the data stays quiet
 *   signature  kept for existing call sites; the same calm 40% as subtle
 *   none       lights down (detail pages, the fullscreen viewer): nothing
 *
 * aria-hidden + pointer-events-none — never interferes with content.
 */

const backdropVariants = cva(
  'pointer-events-none fixed inset-0 -z-10 overflow-hidden print:hidden',
  {
    variants: {
      variant: {
        hero: '[--backdrop-strength:1]',
        subtle: '[--backdrop-strength:0.4]',
        signature: '[--backdrop-strength:0.4]',
        none: '[--backdrop-strength:0]',
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
      <div className="absolute inset-0 bg-[image:var(--gradient-atmosphere)] opacity-[calc(var(--atmosphere-strength)*var(--backdrop-strength))]" />
      {variant === 'hero' ? (
        <div
          data-starfield
          className="starfield absolute inset-0 opacity-[var(--atmosphere-strength)]"
        />
      ) : null}
      {children}
    </div>
  );
}

export { backdropVariants };
