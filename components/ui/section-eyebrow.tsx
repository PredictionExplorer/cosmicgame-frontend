import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

/**
 * SectionEyebrow — small uppercase chip rendered above a heading.
 * Promoted from components/landing-v2/SectionHeading.tsx so app pages can
 * share the landing aesthetic.
 */

const dotVariants = cva('h-1.5 w-1.5 shrink-0 rounded-full', {
  variants: {
    tone: {
      aurora: 'bg-[oklch(84.7%_0.149_213)]',
      nebula: 'bg-[oklch(50.4%_0.247_296)]',
      solar: 'bg-[oklch(82.4%_0.162_81)]',
      impact: 'bg-[oklch(77.1%_0.163_161)]',
      rose: 'bg-[oklch(67.2%_0.228_4)]',
      muted: 'bg-white/40',
    },
  },
  defaultVariants: { tone: 'aurora' },
});

export interface SectionEyebrowProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'>, VariantProps<typeof dotVariants> {
  children: React.ReactNode;
  /** Whether to show the leading colored dot. Defaults to true. */
  showDot?: boolean;
  /** Whether the pulse animation plays on the dot. Defaults to false. */
  pulse?: boolean;
}

export function SectionEyebrow({
  className,
  tone,
  showDot = true,
  pulse = false,
  children,
  ...props
}: SectionEyebrowProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1',
        'type-eyebrow text-white/70 backdrop-blur',
        className,
      )}
      {...props}
    >
      {showDot ? (
        <span className={cn(dotVariants({ tone }), pulse && 'animate-pulse-glow')} aria-hidden />
      ) : null}
      {children}
    </div>
  );
}

export { dotVariants };
