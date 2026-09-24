'use client';

import { useEffect, useRef, useState } from 'react';
import { Check, Copy } from 'lucide-react';

import { cn } from '@/lib/utils';
import { TOUCH_TARGET_EXTENDED_CLASS } from '@/lib/touch-target';
import { useClipboard } from '@/hooks/useClipboard';

/** How long the check stays before the copy icon returns. */
const COPIED_FEEDBACK_MS = 2_000;

export interface CopyButtonProps {
  /** The text put on the clipboard. */
  value: string;
  /** Accessible name before copying ("Copy email address"). */
  label: string;
  /** Announced once the text is copied ("Email address copied"). */
  copiedLabel: string;
  className?: string;
}

/**
 * A 24px icon button (44px hit area on touch) that copies a value — an
 * email address, a hash — and confirms with a check and a polite
 * announcement. The same behaviour as `AddressChip`'s copy button, for text
 * that is not an address.
 */
export function CopyButton({ value, label, copiedLabel, className }: CopyButtonProps) {
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
    // A refused copy says nothing rather than claim success; the value
    // stays on screen to select by hand.
    if (!(await copy(value))) return;
    setCopied(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), COPIED_FEEDBACK_MS);
  };

  return (
    <>
      <button
        type="button"
        onClick={handleCopy}
        aria-label={copied ? copiedLabel : label}
        data-touch-target="extended"
        className={cn(
          'inline-flex size-6 shrink-0 items-center justify-center rounded-control text-subtle transition-colors duration-fast hover:text-foreground focus-visible:text-foreground',
          TOUCH_TARGET_EXTENDED_CLASS,
          className,
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
    </>
  );
}
