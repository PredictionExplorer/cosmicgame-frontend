'use client';

import { ArrowUp } from 'lucide-react';

import { TOUCH_TARGET_EXTENDED_CLASS } from '@/lib/touch-target';
import { cn } from '@/lib/utils';

/**
 * A section's way back to the phone contents. The contents is a `<details>`
 * disclosure, and following a link to a closed one does not open it, so
 * the reader would land on "On this page" and have to tap again: the link
 * opens it on the way. Without JavaScript it is still an in-page link.
 */
export function BackToContentsLink({ targetId, label }: { targetId: string; label: string }) {
  return (
    <a
      href={`#${targetId}`}
      data-touch-target="extended"
      onClick={() => {
        const target = document.getElementById(targetId);
        if (target instanceof HTMLDetailsElement) target.open = true;
      }}
      className={cn(
        'inline-flex min-h-6 items-center gap-1.5 type-label text-subtle transition-colors duration-[var(--duration-fast)] hover:text-foreground',
        TOUCH_TARGET_EXTENDED_CLASS,
      )}
    >
      <ArrowUp aria-hidden className="size-3.5" />
      {label}
    </a>
  );
}
