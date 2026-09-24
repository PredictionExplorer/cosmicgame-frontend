'use client';

import * as React from 'react';
import { motion, useInView } from 'framer-motion';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';
import { fadeRise, useMotionVariants } from '@/lib/motion';
import { SectionHeader, type SectionHeaderProps } from '@/components/ui/section-header';

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

interface SectionProps
  extends Omit<React.HTMLAttributes<HTMLElement>, 'title'>, VariantProps<typeof sectionVariants> {
  /** A short kicker above the title, once per section. */
  eyebrow?: React.ReactNode;
  title?: React.ReactNode;
  description?: React.ReactNode;
  align?: 'left' | 'center';
  /** Disable the scroll-reveal animation (renders visible immediately). */
  disableReveal?: boolean;
  /** Slot for extra header actions (right-aligned on desktop). */
  actions?: React.ReactNode;
  /** The title's heading element (`h2` by default). */
  headingAs?: SectionHeaderProps['as'];
  /** One explanation for the whole section, beside its title. */
  info?: SectionHeaderProps['info'];
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
  headingAs,
  info,
  id,
  children,
}: SectionProps) {
  const variants = useMotionVariants(fadeRise);
  const ref = React.useRef<HTMLElement | null>(null);
  const inView = useInView(ref, { once: true, amount: 0.2 });

  const headingId = id ? `${id}-heading` : undefined;

  return (
    <motion.section
      ref={ref}
      id={id}
      aria-labelledby={title ? headingId : undefined}
      className={cn(sectionVariants({ density }), className)}
      variants={variants}
      initial={disableReveal ? undefined : 'initial'}
      animate={disableReveal || inView ? 'animate' : 'initial'}
    >
      {title ? (
        <SectionHeader
          as={headingAs}
          headingId={headingId}
          title={title}
          eyebrow={eyebrow}
          description={description}
          info={info}
          actions={actions}
          align={align === 'center' ? 'center' : 'start'}
        />
      ) : null}
      {children}
    </motion.section>
  );
}

export { sectionVariants };
