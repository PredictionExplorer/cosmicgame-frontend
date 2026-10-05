'use client';

import { Check, Copy } from 'lucide-react';

import { cn } from '@/lib/utils';
import { TOUCH_TARGET_EXTENDED_CLASS } from '@/lib/touch-target';
import { useCopyFeedback } from '@/hooks/useCopyFeedback';

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
  // A refused copy says nothing rather than claim success; the value stays
  // on screen to select by hand.
  const { copied, copy } = useCopyFeedback();
  const handleCopy = () => void copy(value);

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
