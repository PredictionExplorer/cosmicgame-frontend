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
      {variant === 'subtle' && <SubtleLayer />}
      {variant === 'signature' && <SignatureLayer />}
      {variant === 'hero' && <HeroLayer />}
      {children}
    </div>
  );
}

function SubtleLayer() {
  return (
    <div
      className="absolute inset-0 opacity-70"
      style={{
        background:
          'radial-gradient(ellipse 80% 50% at 50% -20%, rgb(var(--nebula-violet-rgb) / 0.18), transparent 60%)',
      }}
    />
  );
}

function SignatureLayer() {
  return (
    <>
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 60% 40% at 20% 10%, rgb(var(--aurora-cyan-rgb) / 0.15), transparent 55%)',
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 50% 35% at 85% 30%, rgb(var(--nebula-violet-rgb) / 0.22), transparent 55%)',
        }}
      />
      <div
        className="absolute inset-0 opacity-40"
        style={{
          background:
            'radial-gradient(ellipse 70% 40% at 50% 100%, rgb(var(--chrono-rose-rgb) / 0.14), transparent 55%)',
        }}
      />
      <Grain />
    </>
  );
}

function HeroLayer() {
  return (
    <>
      <SignatureLayer />
      <div
        className="absolute inset-0 opacity-50 animate-cosmic-drift"
        style={{
          background:
            'radial-gradient(ellipse 30% 20% at 50% 50%, rgb(var(--aurora-cyan-rgb) / 0.25), transparent 60%)',
        }}
      />
    </>
  );
}

function Grain() {
  return (
    <div
      className="absolute inset-0 opacity-[0.035] mix-blend-overlay"
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
      }}
    />
  );
}

export { backdropVariants };
