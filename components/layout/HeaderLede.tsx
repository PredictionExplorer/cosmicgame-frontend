'use client';

import { isValidElement, useEffect, useId, useRef, useState, type ReactNode } from 'react';

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
 * Width units per line of a phone lede: 16px body text in the 358px column
 * of a 390px phone holds about 44 Latin characters, or 22 CJK ones.
 */
export const LEDE_UNITS_PER_LINE = 44;

/**
 * The server clamps a lede it estimates at more than three and a half lines.
 * The clamped lede with its button is exactly as tall as four lines, so a
 * lede that really takes four lines never moves whichever way the estimate
 * went: only a lede estimated a line or more off (three against five) does.
 */
const LEDE_ESTIMATED_CLAMP_ABOVE_LINES = LEDE_CLAMP_LINES + 0.5;

/**
 * `full` is a lede short enough to show whole, `clamped` a long one behind
 * "Read more". `measuring` is a lede whose text the server cannot read
 * (rich content): it renders clamped, with the button, until measured.
 */
type LedeFit = 'measuring' | 'full' | 'clamped';

/**
 * East Asian wide characters (Hangul, CJK, kana, full-width forms) take about
 * twice the width of a Latin letter.
 */
const WIDE_CHARACTER =
  /[\u1100-\u115f\u2e80-\u303e\u3041-\u33ff\u3400-\u4dbf\u4e00-\u9fff\ua960-\ua97f\uac00-\ud7a3\uf900-\ufaff\ufe30-\ufe4f\uff00-\uff60\uffe0-\uffe6]/u;

/** Cyrillic letters run wider than Latin ones in the body face, and wrap sooner. */
const CYRILLIC_CHARACTER = /\p{Script=Cyrillic}/u;

/** The width of one character, in Latin-letter units. */
function characterUnits(character: string): number {
  if (WIDE_CHARACTER.test(character)) return 2;
  if (CYRILLIC_CHARACTER.test(character)) return 1.15;
  return 1;
}

/**
 * The plain text of a lede: strings and numbers, through any element nesting.
 * A component that renders its own text (a formatted amount) adds nothing,
 * which only makes the estimate shorter.
 */
export function ledeText(node: ReactNode): string {
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map((child: ReactNode) => ledeText(child)).join('');
  if (isValidElement<{ children?: ReactNode }>(node)) return ledeText(node.props.children);
  return '';
}

/**
 * The fit of a lede estimated from its text alone, so the server's HTML
 * already matches what the phone will measure: a Latin letter is one unit,
 * a wide East Asian character two, and a line holds `LEDE_UNITS_PER_LINE`. Null when there is no text
 * to go by. The client still measures and corrects the rare miss (a very
 * narrow or wide phone, an unusual wrap).
 */
export function estimateLedeFit(text: string): Exclude<LedeFit, 'measuring'> | null {
  if (!text.trim()) return null;
  let units = 0;
  for (const character of text) units += characterUnits(character);
  return units / LEDE_UNITS_PER_LINE > LEDE_ESTIMATED_CLAMP_ABOVE_LINES ? 'clamped' : 'full';
}

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
 * - The server decides from the text's length (`estimateLedeFit`), so a
 *   short lede ships without the button and a long one with it: hydration
 *   moves nothing. The client measures the real line count and corrects the
 *   estimate only when it was wrong.
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
  const [fit, setFit] = useState<LedeFit>(() => estimateLedeFit(ledeText(children)) ?? 'measuring');

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
          // One lede line tall, so three clamped lines and the button take
          // exactly the height of a four-line lede; a 44px hit area around it.
          data-touch-target="extended"
          className={cn(
            'flex h-6 w-fit items-center type-label text-primary underline-offset-4 hover:underline sm:hidden [@media(scripting:none)]:hidden',
            TOUCH_TARGET_EXTENDED_CLASS,
          )}
        >
          {expanded ? lessLabel : moreLabel}
        </button>
      ) : null}
    </>
  );
}
