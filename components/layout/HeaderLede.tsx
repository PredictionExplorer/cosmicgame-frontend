'use client';

import { useEffect, useId, useRef, useState, type ReactNode } from 'react';

import { TOUCH_TARGET_EXTENDED_CLASS } from '@/lib/touch-target';
import { cn } from '@/lib/utils';

export interface HeaderLedeProps {
  children: ReactNode;
  /** Button label while the lede is clamped. */
  moreLabel: string;
  /** Button label once it is expanded. */
  lessLabel: string;
  /**
   * `false`: the lede is the page's thesis (a long read's header), shown in
   * full on phones too, with no button to mount or remove after hydration.
   */
  clamp?: boolean;
  className?: string;
}

/**
 * The page header's lede. On phones it is clamped to three lines, so the
 * header stays inside the first screen, with a "Read more" button when the
 * text is longer; from `sm` it always shows in full. The whole text is in the
 * server HTML either way. Most ledes run past three lines on a phone, so the
 * server renders the button and the client removes it once it measures a
 * lede that fits: the common case never shifts the page.
 */
export function HeaderLede({ clamp = true, ...props }: HeaderLedeProps) {
  if (!clamp) return <p className={props.className}>{props.children}</p>;
  return <ClampedLede {...props} />;
}

function ClampedLede({
  children,
  moreLabel,
  lessLabel,
  className,
}: Omit<HeaderLedeProps, 'clamp'>) {
  const id = useId();
  const ref = useRef<HTMLParagraphElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [clamped, setClamped] = useState(true);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const measure = () => setClamped(element.scrollHeight > element.clientHeight + 1);
    measure();
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <p ref={ref} id={id} className={cn(className, !expanded && 'max-sm:line-clamp-3')}>
        {children}
      </p>
      {clamped || expanded ? (
        <button
          type="button"
          aria-controls={id}
          aria-expanded={expanded}
          onClick={() => setExpanded((value) => !value)}
          // A 44px hit area around a one-line control, without making the line taller.
          data-touch-target="extended"
          className={cn(
            'mt-1 inline-flex min-h-6 items-center type-label text-primary underline-offset-4 hover:underline sm:hidden',
            TOUCH_TARGET_EXTENDED_CLASS,
          )}
        >
          {expanded ? lessLabel : moreLabel}
        </button>
      ) : null}
    </>
  );
}
