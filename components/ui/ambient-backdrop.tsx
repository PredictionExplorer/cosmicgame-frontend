import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';
import { OriginalAmbientBackdrop } from '@/components/ui/original-ambient-backdrop';

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
  'pointer-events-none fixed inset-0 -z-10 overflow-hidden motion-reduce:hidden print:hidden',
  {
    variants: {
      variant: {
        subtle: '',
        signature: '',
        hero: '',
      },
    },
    defaultVariants: { variant: 'subtle' },
  },
);

export type AmbientBackdropProps = React.HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof backdropVariants> & {
    originalGlassVariant?: NonNullable<VariantProps<typeof backdropVariants>['variant']>;
  };

export function AmbientBackdrop({
  variant = 'subtle',
  originalGlassVariant,
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
      <div data-current-ambient className="absolute inset-0">
        {variant === 'subtle' && <SubtleLayer />}
        {variant === 'signature' && <SignatureLayer />}
        {variant === 'hero' && <HeroLayer />}
      </div>
      <OriginalAmbientBackdrop variant={originalGlassVariant ?? variant ?? 'subtle'} />
      {children}
    </div>
  );
}

function SubtleLayer() {
  return (
    <div
      className="absolute inset-0"
      style={{
        background:
          'radial-gradient(ellipse 65% 40% at 75% 0%, hsl(var(--secondary) / 0.035), transparent 70%)',
      }}
    />
  );
}

function SignatureLayer() {
  return (
    <div
      className="absolute inset-0"
      style={{
        background:
          'radial-gradient(ellipse 70% 45% at 80% 0%, hsl(var(--secondary) / 0.065), transparent 70%)',
      }}
    />
  );
}

function HeroLayer() {
  return <SignatureLayer />;
}

export { backdropVariants };
