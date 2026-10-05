'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';

import { cn } from '@/lib/utils';
import { TABLE_LINK_CLASS } from '@/components/ui/responsive-table';

interface ClampedTextProps {
  text: string;
  className?: string;
}

/**
 * Free text in a ledger cell (a gesture message): two lines on a wide
 * screen, with a "Show all" button when there is more, and the whole text on
 * a phone record, which has the room. The button is a real disclosure, so
 * the rest of a long message is one Tab and Enter away rather than behind a
 * hover tooltip. A string with no spaces (a pasted URL, a run of letters)
 * breaks anywhere instead of widening its column past the screen.
 */
export function ClampedText({ text, className }: ClampedTextProps) {
  const t = useTranslations('tables');
  const id = useId();
  const ref = useRef<HTMLSpanElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [overflows, setOverflows] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element || expanded || typeof ResizeObserver === 'undefined') return;
    const measure = () => setOverflows(element.scrollHeight > element.clientHeight + 1);
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [expanded, text]);

  return (
    <span className="block">
      <span
        ref={ref}
        id={id}
        className={cn('block [overflow-wrap:anywhere]', !expanded && 'sm:line-clamp-2', className)}
      >
        {text}
      </span>
      {overflows || expanded ? (
        <button
          type="button"
          aria-expanded={expanded}
          aria-controls={id}
          onClick={() => setExpanded((open) => !open)}
          className={cn(
            TABLE_LINK_CLASS,
            'mt-1 hidden min-h-6 items-center type-caption text-muted-foreground sm:inline-flex',
          )}
        >
          {expanded ? t('message.showLess') : t('message.showAll')}
        </button>
      ) : null}
    </span>
  );
}
