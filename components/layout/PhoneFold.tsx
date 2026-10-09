'use client';

import { useId, useState, type ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';

import { cn } from '@/lib/utils';

interface PhoneFoldProps {
  /** The group's heading, an h2, always rendered (visible, or sr-only via `headingClassName`). */
  heading: ReactNode;
  headingClassName?: string;
  children: ReactNode;
  className?: string;
  panelClassName?: string;
  /** The toggle's box; it overlays the heading row. Default: a 48px row. */
  toggleClassName?: string;
}

/**
 * A group that folds on phones and is plain content from 640px: the client
 * island of the server-rendered footer. Below 640px a toggle over the
 * heading row opens and closes the group.
 *
 * The folding is a class, not `<details>`, so the server HTML is already
 * right at every width (nothing shifts on hydration) and the links stay in
 * the markup for crawlers. It only applies while `(scripting: enabled)`:
 * without script the toggle could not open anything, so it hides and every
 * group stays open.
 */
export function PhoneFold({
  heading,
  headingClassName,
  children,
  className,
  panelClassName,
  toggleClassName,
}: PhoneFoldProps) {
  const [open, setOpen] = useState(false);
  const headingId = useId();
  const panelId = useId();
  return (
    <div className={cn('relative min-w-0', className)}>
      <h2 id={headingId} className={headingClassName}>
        {heading}
      </h2>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        aria-labelledby={headingId}
        onClick={() => setOpen((value) => !value)}
        className={cn(
          'absolute inset-x-0 top-0 flex h-12 items-center justify-end rounded-control text-subtle sm:hidden [@media(scripting:none)]:hidden',
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
      <div
        id={panelId}
        className={cn(
          'min-w-0',
          panelClassName,
          !open && 'max-sm:[@media(scripting:enabled)]:hidden',
        )}
      >
        {children}
      </div>
    </div>
  );
}
