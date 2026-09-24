'use client';

import { useId, useState, type ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';

import { cn } from '@/lib/utils';

interface PhoneFoldProps {
  /** The group's heading, always rendered (visible, or sr-only via `headingClassName`). */
  heading: ReactNode;
  headingClassName?: string;
  /** A stable id for the heading, when a surrounding landmark is labelled by it. */
  headingId?: string;
  /** Heading level; the footer and the site map use h2. */
  headingLevel?: 'h2' | 'h3';
  /** Always visible between the heading and the folded content (the site map's section line). */
  lead?: ReactNode;
  children: ReactNode;
  className?: string;
  panelClassName?: string;
  /** The toggle's box; it overlays the heading row. Default: a 48px row. */
  toggleClassName?: string;
}

/**
 * A group that folds on phones and is plain content from 640px: the client
 * island of the server-rendered footer and site map. Below 640px a toggle
 * over the heading row opens and closes the group; the folding is a
 * `max-sm:hidden` class, not `<details>`, so the server HTML is already
 * right at every width (nothing shifts on hydration) and the links stay in
 * the markup for crawlers. Its children render on the server.
 */
export function PhoneFold({
  heading,
  headingClassName,
  headingId: givenHeadingId,
  headingLevel: Heading = 'h2',
  lead,
  children,
  className,
  panelClassName,
  toggleClassName,
}: PhoneFoldProps) {
  const [open, setOpen] = useState(false);
  const generatedHeadingId = useId();
  const headingId = givenHeadingId ?? generatedHeadingId;
  const panelId = useId();
  return (
    <div className={cn('relative min-w-0', className)}>
      <Heading id={headingId} className={headingClassName}>
        {heading}
      </Heading>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        aria-labelledby={headingId}
        onClick={() => setOpen((value) => !value)}
        className={cn(
          'absolute inset-x-0 top-0 flex h-12 items-center justify-end rounded-control text-subtle sm:hidden',
          toggleClassName,
        )}
      >
        <ChevronDown
          aria-hidden
          className={cn(
            'size-4 transition-transform duration-200 motion-reduce:transition-none',
            open && 'rotate-180',
          )}
        />
      </button>
      {lead}
      <div id={panelId} className={cn('min-w-0', panelClassName, !open && 'max-sm:hidden')}>
        {children}
      </div>
    </div>
  );
}
