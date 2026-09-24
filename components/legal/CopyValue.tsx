'use client';

import { useEffect, useRef, useState } from 'react';
import { Check, Copy } from 'lucide-react';

import { useClipboard } from '@/hooks/useClipboard';
import { TOUCH_TARGET_EXTENDED_CLASS } from '@/lib/touch-target';
import { cn } from '@/lib/utils';

/** How long the check stays before the copy icon returns. */
const COPIED_FEEDBACK_MS = 2_000;

/**
 * A literal a reader should compare character by character (a domain, a
 * handle), in mono, with a button that copies it. Labels come from the
 * server copy, so the component needs no client catalog.
 */
export function CopyValue({
  value,
  copyLabel,
  copiedLabel,
  className,
}: {
  value: string;
  /** The button's name, e.g. "Copy app.cosmicsignature.com". */
  copyLabel: string;
  /** Announced once the value is on the clipboard. */
  copiedLabel: string;
  className?: string;
}) {
  const { copy } = useClipboard();
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const handleCopy = async () => {
    await copy(value);
    setCopied(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), COPIED_FEEDBACK_MS);
  };

  return (
    <span className={cn('inline-flex max-w-full items-center gap-1.5', className)}>
      <span className="type-mono text-foreground">{value}</span>
      <button
        type="button"
        onClick={handleCopy}
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
