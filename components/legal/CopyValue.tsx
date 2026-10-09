'use client';

import { Check, Copy } from 'lucide-react';

import { useCopyFeedback } from '@/hooks/useCopyFeedback';
import { TOUCH_TARGET_EXTENDED_CLASS } from '@/lib/touch-target';
import { cn } from '@/lib/utils';

/**
 * A literal a reader should compare character by character (a domain, a
 * handle), in mono, with a button that copies it. Labels come from the
 * server copy, so the component needs no client catalog.
 */
export function CopyValue({
  value,
  display,
  copyLabel,
  copiedLabel,
  className,
}: {
  value: string;
  /**
   * What to show instead of the whole value (a middle-truncated identifier);
   * the whole value is its title and what the button copies.
   */
  display?: string;
  /** The button's name, e.g. "Copy app.cosmicsignature.com". */
  copyLabel: string;
  /** Announced once the value is on the clipboard. */
  copiedLabel: string;
  className?: string;
}) {
  const { copied, copy } = useCopyFeedback();

  return (
    <span className={cn('inline-flex max-w-full items-center gap-1.5', className)}>
      <span className="type-mono text-foreground" title={display ? value : undefined}>
        {display ?? value}
      </span>
      <button
        type="button"
        onClick={() => void copy(value)}
        aria-label={copyLabel}
        data-touch-target="extended"
        className={cn(
          'inline-flex size-6 shrink-0 items-center justify-center rounded-control text-subtle transition-colors duration-[var(--duration-fast)] hover:text-foreground',
          TOUCH_TARGET_EXTENDED_CLASS,
        )}
      >
        {copied ? (
          <Check aria-hidden className="size-3.5 text-positive" />
        ) : (
          <Copy aria-hidden className="size-3.5" />
        )}
      </button>
      <span role="status" className="sr-only">
        {copied ? copiedLabel : ''}
      </span>
    </span>
  );
}
