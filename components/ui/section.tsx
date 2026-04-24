'use client';

import * as React from 'react';
import { motion, useInView } from 'framer-motion';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';
import { fadeRise, useMotionVariants } from '@/lib/motion';

const sectionVariants = cva('relative', {
  variants: {
    density: {
      comfortable: 'py-12 sm:py-16',
      compact: 'py-8 sm:py-10',
      tight: 'py-4 sm:py-6',
    },
  },
  defaultVariants: { density: 'comfortable' },
});

const headerAlign = cva('mb-8 max-w-3xl', {
  variants: {
    align: {
      left: 'text-left',
      center: 'mx-auto text-center',
    },
  },
  defaultVariants: { align: 'left' },
});

interface SectionProps
  extends Omit<React.HTMLAttributes<HTMLElement>, 'title'>, VariantProps<typeof sectionVariants> {
  /** Small uppercase chip rendered above the title. */
  eyebrow?: React.ReactNode;
  title?: React.ReactNode;
  description?: React.ReactNode;
  align?: 'left' | 'center';
  /** Disable the scroll-reveal animation (renders visible immediately). */
  disableReveal?: boolean;
  /** Slot for extra header actions (right-aligned on desktop). */
  actions?: React.ReactNode;
}

export function Section({
  className,
  density,
  eyebrow,
  title,
  description,
  align = 'left',
  disableReveal = false,
  actions,
  id,
  children,
}: SectionProps) {
  const variants = useMotionVariants(fadeRise);
  const ref = React.useRef<HTMLElement | null>(null);
  const inView = useInView(ref, { once: true, amount: 0.2 });

  const hasHeader = eyebrow || title || description || actions;

  return (
    <motion.section
      ref={ref}
      id={id}
      className={cn(sectionVariants({ density }), className)}
      variants={variants}
      initial={disableReveal ? undefined : 'initial'}
      animate={disableReveal || inView ? 'animate' : 'initial'}
    >
      {hasHeader ? (
        <header
          className={cn(
            headerAlign({ align }),
            actions && 'flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between',
          )}
        >
          <div>
            {eyebrow ? (
              <div className="mb-3 type-eyebrow text-muted-foreground">{eyebrow}</div>
            ) : null}
            {title ? <h2 className="type-heading-1 text-foreground">{title}</h2> : null}
            {description ? (
              <p className="mt-3 type-body-md text-muted-foreground">{description}</p>
            ) : null}
          </div>
          {actions ? <div className="flex shrink-0 gap-2">{actions}</div> : null}
        </header>
      ) : null}
      {children}
    </motion.section>
  );
}

export { sectionVariants };
