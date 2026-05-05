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
    <>
      <div
        className="absolute inset-0 opacity-80"
        style={{
          background:
            'radial-gradient(ellipse 85% 52% at 46% -18%, rgb(var(--aurora-cyan-rgb) / 0.16), transparent 58%), radial-gradient(ellipse 72% 48% at 92% 22%, rgb(var(--nebula-violet-rgb) / 0.18), transparent 58%), linear-gradient(180deg, rgb(var(--cosmic-indigo-deep-rgb) / 0.18), rgb(var(--cosmic-indigo-rgb) / 0.2))',
        }}
      />
      <Starfield opacity="0.42" />
      <ConstellationLines opacity="0.22" />
    </>
  );
}

function SignatureLayer() {
  return (
    <>
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 70% 44% at 10% 0%, rgb(var(--aurora-cyan-rgb) / 0.23), transparent 58%)',
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 62% 46% at 88% 22%, rgb(var(--nebula-violet-rgb) / 0.32), transparent 60%)',
        }}
      />
      <div
        className="absolute inset-0 opacity-75"
        style={{
          background:
            'radial-gradient(ellipse 62% 38% at 52% 100%, rgb(var(--chrono-rose-rgb) / 0.16), transparent 58%), radial-gradient(ellipse 46% 32% at 4% 78%, rgb(var(--impact-green-rgb) / 0.08), transparent 62%)',
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.09]"
        style={{
          backgroundImage:
            'linear-gradient(rgb(255 255 255 / 0.35) 1px, transparent 1px), linear-gradient(90deg, rgb(255 255 255 / 0.26) 1px, transparent 1px)',
          backgroundSize: '96px 96px',
          maskImage: 'radial-gradient(ellipse 70% 52% at 50% 20%, black 0%, transparent 72%)',
        }}
      />
      <Starfield opacity="0.7" />
      <ConstellationLines opacity="0.32" />
      <OrbitalHalo />
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

function Starfield({ opacity }: { opacity: string }) {
  return (
    <div
      className="absolute inset-0"
      style={{
        opacity,
        backgroundImage:
          'radial-gradient(circle at 12% 18%, rgb(255 255 255 / 0.8) 0 1px, transparent 1.8px), radial-gradient(circle at 72% 8%, rgb(var(--aurora-cyan-rgb) / 0.72) 0 1px, transparent 1.7px), radial-gradient(circle at 84% 34%, rgb(255 255 255 / 0.74) 0 1px, transparent 2px), radial-gradient(circle at 28% 62%, rgb(var(--chrono-rose-rgb) / 0.65) 0 1px, transparent 1.8px), radial-gradient(circle at 62% 74%, rgb(255 255 255 / 0.55) 0 1px, transparent 1.7px)',
        backgroundSize: '320px 280px, 420px 360px, 520px 420px, 380px 340px, 460px 400px',
      }}
    />
  );
}

function ConstellationLines({ opacity }: { opacity: string }) {
  return (
    <div
      className="absolute inset-0"
      style={{
        opacity,
        backgroundImage:
          "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='760' height='520' viewBox='0 0 760 520'><g fill='none' stroke='rgba(255,255,255,0.18)' stroke-width='1'><path d='M54 144 132 180 214 136'/><path d='M456 92 542 164 626 132'/><path d='M110 410 188 342 284 386'/><path d='M510 396 586 330 704 382'/></g><g fill='rgba(255,255,255,0.36)'><circle cx='54' cy='144' r='2.6'/><circle cx='132' cy='180' r='2.3'/><circle cx='214' cy='136' r='2.6'/><circle cx='456' cy='92' r='2.6'/><circle cx='542' cy='164' r='2.2'/><circle cx='626' cy='132' r='2.4'/><circle cx='110' cy='410' r='2.7'/><circle cx='188' cy='342' r='2.1'/><circle cx='284' cy='386' r='2.3'/><circle cx='510' cy='396' r='2.5'/><circle cx='586' cy='330' r='2.4'/><circle cx='704' cy='382' r='2.6'/></g></svg>\")",
        backgroundSize: '760px 520px',
      }}
    />
  );
}

function OrbitalHalo() {
  return (
    <div
      className="absolute -right-24 top-24 h-[34rem] w-[34rem] rounded-full opacity-[0.16]"
      style={{
        background:
          'conic-gradient(from 120deg, transparent 0deg, rgb(var(--aurora-cyan-rgb) / 0.8) 22deg, transparent 64deg, rgb(var(--nebula-violet-rgb) / 0.75) 112deg, transparent 156deg, rgb(var(--chrono-rose-rgb) / 0.7) 218deg, transparent 280deg)',
        maskImage:
          'radial-gradient(circle, transparent 58%, black 59%, black 62%, transparent 64%)',
      }}
    />
  );
}

function Grain() {
  return (
    <div
      className="absolute inset-0 opacity-[0.045] mix-blend-overlay"
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
      }}
    />
  );
}

export { backdropVariants };
