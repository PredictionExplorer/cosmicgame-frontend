'use client';

import { useEffect, useId, useRef, useState, type ReactNode } from 'react';

import { TOUCH_TARGET_EXTENDED_CLASS } from '@/lib/touch-target';
import { cn } from '@/lib/utils';

/** Lines a clamped lede shows on a phone. */
export const LEDE_CLAMP_LINES = 3;

/**
 * A lede one line longer than the clamp shows in full: hiding a single line
 * behind a "Read more" row saves no space, it only cuts the sentence.
 */
export const LEDE_FULL_UP_TO_LINES = LEDE_CLAMP_LINES + 1;

/**
 * `measuring` is the server render and the first client paint (clamped, with
 * the button), `full` a lede short enough to show whole, `clamped` a long
 * one behind "Read more".
 */
type LedeFit = 'measuring' | 'full' | 'clamped';

/** How many lines the paragraph's full text takes at its current width. */
function lineCount(element: HTMLElement): number {
  const style = window.getComputedStyle(element);
  const lineHeight =
    Number.parseFloat(style.lineHeight) || Number.parseFloat(style.fontSize) * 1.5 || 24;
  return Math.round(element.scrollHeight / lineHeight);
}

/**
 * Clamping needs script (the button that lifts it is a client control), so
 * it only applies while the `scripting` media feature reports it. A browser
 * that does not know the feature never clamps, and the lede shows in full.
 */
function canClamp(): boolean {
  return typeof window.matchMedia === 'function'
    ? window.matchMedia('(scripting: enabled)').matches
    : false;
}

export interface HeaderLedeProps {
  children: ReactNode;
  /** Button label while the lede is clamped. */
  moreLabel: string;
  /** Button label once it is expanded. */
  lessLabel: string;
  /**
   * Clamp long ledes on phones (the data template). Reading pages (legal,
   * trust, long-form) pass false: their lede is the page's first statement
   * and always shows in full.
   */
  clamp?: boolean;
  className?: string;
}

/**
 * The page header's lede. On phones a long lede is clamped to three lines,
 * so the header stays inside the first screen, with a "Read more" button;
 * from `sm` it always shows in full, and the whole text is in the server HTML
 * either way.
 *
 * - A lede at most one line longer than the clamp shows whole: the button
 *   would take the line it saves.
 * - The clamp is scoped to `(scripting: enabled)`, so without script the lede
 *   is never cut and the button (which could not work) is hidden.
 * - Most ledes that clamp at all run well past three lines, so the server
 *   renders the clamped state and the client drops the button (and the
 *   clamp) once it measures a lede that fits: the common case never shifts.
 */
export function HeaderLede({
  children,
  moreLabel,
  lessLabel,
  clamp = true,
  className,
}: HeaderLedeProps) {
  if (!clamp) return <p className={className}>{children}</p>;
  return (
    <ClampedLede moreLabel={moreLabel} lessLabel={lessLabel} className={className}>
      {children}
    </ClampedLede>
  );
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
  const [fit, setFit] = useState<LedeFit>('measuring');

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const measure = () =>
      setFit(canClamp() && lineCount(element) > LEDE_FULL_UP_TO_LINES ? 'clamped' : 'full');
    measure();
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const clamped = fit !== 'full' && !expanded;
  return (
    <>
      <p
        ref={ref}
        id={id}
        data-lede-fit={fit}
        className={cn(className, clamped && 'max-sm:[@media(scripting:enabled)]:line-clamp-3')}
      >
        {children}
      </p>
      {fit !== 'full' ? (
        <button
          type="button"
          aria-controls={id}
          aria-expanded={expanded}
          onClick={() => setExpanded((value) => !value)}
          // A 44px hit area around a one-line control, without making the line taller.
          data-touch-target="extended"
          className={cn(
            'mt-1 inline-flex min-h-6 items-center type-label text-primary underline-offset-4 hover:underline sm:hidden [@media(scripting:none)]:hidden',
            TOUCH_TARGET_EXTENDED_CLASS,
          )}
        >
          {expanded ? lessLabel : moreLabel}
        </button>
      ) : null}
    </>
  );
}
