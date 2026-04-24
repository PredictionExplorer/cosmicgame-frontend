import * as React from 'react';

import { cn } from '@/lib/utils';

/**
 * SkipLink — WCAG 2.4.1 "bypass blocks" target. Visually hidden until focused.
 * Mount once at the top of the document via Providers; pair with a PageShell
 * that uses the matching `#main` id as its skip target.
 */
interface SkipLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  /** Anchor target — defaults to #main (PageShell's default id). */
  href?: string;
  children?: React.ReactNode;
}

export function SkipLink({
  href = '#main',
  className,
  children = 'Skip to main content',
  ...props
}: SkipLinkProps) {
  return (
    <a
      href={href}
      className={cn(
        'sr-only focus:not-sr-only',
        'focus:fixed focus:left-4 focus:top-4 focus:z-[100]',
        'focus:inline-flex focus:items-center focus:gap-2',
        'focus:rounded-md focus:bg-card focus:border focus:border-white/10',
        'focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-foreground',
        'focus:shadow-[var(--elevation-3)]',
        className,
      )}
      {...props}
    >
      {children}
    </a>
  );
}
