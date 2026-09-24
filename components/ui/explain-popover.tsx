'use client';

import * as React from 'react';
import * as PopoverPrimitive from '@radix-ui/react-popover';
import { Slot } from '@radix-ui/react-slot';
import { useTranslations } from 'next-intl';

import { cn } from '@/lib/utils';

type Side = 'top' | 'right' | 'bottom' | 'left';
type Align = 'start' | 'center' | 'end';

/** Hover intent: long enough to skip a pointer passing over, short enough to feel immediate. */
const OPEN_DELAY_MS = 250;
/** Grace period to cross from the trigger into the card (WCAG 1.4.13: hoverable). */
const CLOSE_DELAY_MS = 150;

export interface ExplainPopoverProps {
  /** Heading of the card: the term or the label it explains. */
  title?: string;
  /** Shown on hover and always exposed as the trigger's accessible description. */
  definition: string;
  /**
   * Added below the definition once the card is pinned by a click, tap or
   * key, and announced through a polite live region at that moment.
   */
  details?: string;
  side?: Side;
  align?: Align;
  /** Widest the card may grow, in CSS pixels. */
  maxWidth?: number;
  /**
   * The single focusable trigger: a `<button type="button">`, or an inline
   * `role="button"` element that activates on Enter and Space (as
   * `ExplainedTerm` does). It receives `aria-describedby`, `data-state` and
   * the pointer and click handlers, merged with its own.
   */
  children: React.ReactElement;
}

/**
 * The one explanation surface behind `<Term>`, `<ExplainedTerm>` and
 * `<InfoTooltip>`: a tooltip on hover and a toggletip on click, tap, Enter
 * or Space.
 *
 * - A fine pointer resting on the trigger opens a compact card (the short
 *   definition) that stays open while the pointer moves onto it.
 * - A click, tap or key press pins the card open with the longer details; a
 *   second press, Escape or a click elsewhere closes it. Focus never moves.
 * - The short definition is the trigger's accessible description through
 *   `aria-describedby`, pointing at a `hidden` copy beside the trigger. A
 *   screen reader hears it on focus in every browser without opening
 *   anything, and browse mode does not read it a second time (hidden content
 *   still counts when an ARIA reference points at it directly). The name
 *   stays short and is never a truncated sentence.
 * - Pinning announces the longer details through a polite live region,
 *   because the card itself renders in a portal at the end of the page.
 * - The trigger carries no `aria-expanded`: announcing "collapsed" on every
 *   explained word would only add noise to text the reader already hears.
 */
export function ExplainPopover({
  title,
  definition,
  details,
  side = 'top',
  align = 'center',
  maxWidth = 320,
  children,
}: ExplainPopoverProps) {
  const [open, setOpen] = React.useState(false);
  const [pinned, setPinned] = React.useState(false);
  const triggerRef = React.useRef<HTMLElement | null>(null);
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const reactId = React.useId();
  const contentId = `explain-${reactId}`;
  const descriptionId = `explain-description-${reactId}`;

  const clearTimer = React.useCallback(() => {
    if (timer.current !== null) {
      clearTimeout(timer.current);
      timer.current = null;
    }
  }, []);

  React.useEffect(() => clearTimer, [clearTimer]);

  const close = React.useCallback(() => {
    clearTimer();
    setOpen(false);
    setPinned(false);
  }, [clearTimer]);

  const scheduleOpen = React.useCallback(() => {
    clearTimer();
    timer.current = setTimeout(() => setOpen(true), OPEN_DELAY_MS);
  }, [clearTimer]);

  const scheduleClose = React.useCallback(() => {
    clearTimer();
    if (pinned) return;
    timer.current = setTimeout(() => setOpen(false), CLOSE_DELAY_MS);
  }, [clearTimer, pinned]);

  const onPointerEnter = React.useCallback(
    (event: React.PointerEvent) => {
      if (event.pointerType !== 'mouse' || pinned) return;
      if (open) clearTimer();
      else scheduleOpen();
    },
    [clearTimer, open, pinned, scheduleOpen],
  );

  const onPointerLeave = React.useCallback(
    (event: React.PointerEvent) => {
      if (event.pointerType !== 'mouse') return;
      scheduleClose();
    },
    [scheduleClose],
  );

  const onClick = React.useCallback(() => {
    clearTimer();
    if (open && pinned) {
      close();
      return;
    }
    setOpen(true);
    setPinned(true);
  }, [clearTimer, close, open, pinned]);

  return (
    <PopoverPrimitive.Root open={open} onOpenChange={(next) => (next ? setOpen(true) : close())}>
      <PopoverPrimitive.Anchor asChild>
        <Slot
          ref={triggerRef}
          aria-describedby={descriptionId}
          data-state={open ? 'open' : 'closed'}
          onClick={onClick}
          onPointerEnter={onPointerEnter}
          onPointerLeave={onPointerLeave}
        >
          {children}
        </Slot>
      </PopoverPrimitive.Anchor>
      <span id={descriptionId} hidden data-explain-companion="">
        {definition}
      </span>
      {details ? (
        <span role="status" className="sr-only" data-explain-companion="">
          {pinned ? details : ''}
        </span>
      ) : null}
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          id={contentId}
          role="tooltip"
          side={side}
          align={align}
          sideOffset={6}
          collisionPadding={12}
          onOpenAutoFocus={(event) => event.preventDefault()}
          onCloseAutoFocus={(event) => event.preventDefault()}
          onInteractOutside={(event) => {
            // A press on the trigger toggles through its own click handler.
            if (triggerRef.current?.contains(event.target as Node)) event.preventDefault();
          }}
          onPointerEnter={(event) => {
            if (event.pointerType === 'mouse') clearTimer();
          }}
          onPointerLeave={(event) => {
            if (event.pointerType === 'mouse') scheduleClose();
          }}
          style={{ maxWidth: `min(${maxWidth}px, calc(100vw - 1.5rem))` }}
          className={cn(
            'z-50 w-max rounded-control border border-rule bg-surface-raised px-3.5 py-3 text-left text-popover-foreground shadow-float',
            'data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 motion-reduce:animate-none',
          )}
        >
          {title ? <p className="type-label text-foreground">{title}</p> : null}
          <p className={cn('type-body-sm text-muted-foreground', title && 'mt-1')}>{definition}</p>
          {pinned && details ? (
            <p className="mt-2.5 border-t border-rule-faint pt-2.5 type-caption text-subtle">
              {details}
            </p>
          ) : null}
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}

/**
 * Whether a trigger sits inside a sentence: a run of visible text beside it,
 * directly or around the inline elements that wrap it (`<p>The <Term/>
 * expires</p>`, `<p>Before the <strong><Term/></strong> ends</p>`). The
 * walk stops at the first ancestor that is not inline, the box the line of
 * text lives in. The explanation's own companions (the hidden description,
 * the live region) never count, and neither does whitespace.
 *
 * A trigger in a sentence keeps its line box (WCAG 2.5.8's inline
 * exception); anything else — a figure label, a ledger role, a heading made
 * of the term alone — is standalone and grows a 44px touch target.
 */
export function sitsInSentence(trigger: HTMLElement): boolean {
  let node: Element = trigger;
  for (let parent = trigger.parentElement; parent; parent = parent.parentElement) {
    for (const sibling of Array.from(parent.childNodes)) {
      if (sibling === node) continue;
      if (sibling.nodeType === Node.TEXT_NODE) {
        if (/\S/.test(sibling.textContent ?? '')) return true;
        continue;
      }
      if (!(sibling instanceof HTMLElement)) continue;
      if (sibling.hidden || sibling.hasAttribute('data-explain-companion')) continue;
      if (
        window.getComputedStyle(sibling).display === 'inline' &&
        /\S/.test(sibling.textContent ?? '')
      ) {
        return true;
      }
    }
    if (window.getComputedStyle(parent).display !== 'inline') return false;
    node = parent;
  }
  return false;
}

/**
 * Enter and Space activate an inline `role="button"` the way they activate a
 * native button. Both are cancelled first: Space would scroll the page and
 * Enter could reach an enclosing form. A held key does not toggle repeatedly.
 */
function activateOnKey(event: React.KeyboardEvent<HTMLElement>) {
  if (event.key !== 'Enter' && event.key !== ' ') return;
  event.preventDefault();
  if (!event.repeat) event.currentTarget.click();
}

export interface ExplainedTermProps extends Omit<
  React.HTMLAttributes<HTMLSpanElement>,
  'title' | 'children' | 'role' | 'tabIndex'
> {
  /** What the word means: the hover card and the trigger's description. */
  definition: string;
  /** The longer explanation shown once the card is pinned. */
  details?: string;
  /** Card heading; defaults to the visible text when it is a string. */
  title?: string;
  /** The word or label as it reads in place. */
  children: React.ReactNode;
  /**
   * `text` (default) names the trigger by its visible word, for terms in
   * running text. `moreInformation` names it "More information about
   * {label}", for the label of a figure, whose word alone would not say that
   * it opens an explanation.
   */
  announce?: 'text' | 'moreInformation';
  /**
   * `auto` (default) measures the trigger once it mounts: a word inside a
   * sentence keeps its line (WCAG 2.5.8's inline exception), and a word that
   * stands alone — a figure label, a ledger role, a heading — grows a 44px
   * touch target on coarse pointers without moving the layout
   * (`touch-hit-area`). Pass `sentence` or `standalone` only where the
   * measurement cannot see the context.
   */
  placement?: 'auto' | 'sentence' | 'standalone';
  side?: Side;
  align?: Align;
  maxWidth?: number;
}

/**
 * ExplainedTerm — a word or label that explains itself with an ad hoc
 * definition (ERC-20, Layer 2, a figure label). For the coined vocabulary use
 * `<Term id>` (components/ui/term), which reads the glossary.
 *
 * The word keeps its place in the sentence, marked by a dotted underline,
 * and is the only tab stop: hovering it shows the definition, and a click,
 * tap, Enter or Space pins the card. The trigger is an inline
 * `<span role="button">`, not a `<button>`: browsers lay a button out as one
 * atomic inline-block, so a multi-word term would jump whole to the next line
 * and box its underline, where a span breaks across lines with the sentence
 * (CJK included).
 *
 * On touch, a standalone trigger (see `placement`) reaches 44px: its own box
 * grows by padding that a negative margin hands back, so hit-testing and
 * the tap-target audit see the real target and nothing around it moves.
 *
 *   <ExplainedTerm definition={t('erc20.definition')}>ERC-20</ExplainedTerm>
 *   <ExplainedTerm definition={tooltip} announce="moreInformation">{label}</ExplainedTerm>
 */
export function ExplainedTerm({
  definition,
  details,
  title,
  children,
  announce = 'text',
  placement = 'auto',
  side,
  align,
  maxWidth,
  className,
  onKeyDown,
  ...rest
}: ExplainedTermProps) {
  const tTooltips = useTranslations('tooltips');
  const visibleText = typeof children === 'string' ? children : undefined;
  const cardTitle = title ?? visibleText;
  const label = visibleText ?? title;
  const triggerRef = React.useRef<HTMLSpanElement>(null);
  // The server cannot see the layout, so it renders the sentence form (no
  // pad); the measurement below only ever adds a pad that moves nothing.
  const [measuredStandalone, setMeasuredStandalone] = React.useState(false);
  const standalone = placement === 'auto' ? measuredStandalone : placement === 'standalone';

  React.useLayoutEffect(() => {
    if (placement !== 'auto' || !triggerRef.current) return;
    setMeasuredStandalone(!sitsInSentence(triggerRef.current));
  }, [placement]);

  return (
    <ExplainPopover
      title={cardTitle}
      definition={definition}
      details={details}
      side={side}
      align={align}
      maxWidth={maxWidth}
    >
      <span
        {...rest}
        ref={triggerRef}
        role="button"
        tabIndex={0}
        data-placement={standalone ? 'standalone' : 'sentence'}
        aria-label={
          announce === 'moreInformation' && label
            ? tTooltips('moreInformationAbout', { label })
            : undefined
        }
        onKeyDown={(event) => {
          onKeyDown?.(event);
          if (!event.defaultPrevented) activateOnKey(event);
        }}
        className={cn(
          // Inline in running text: inherits the sentence's font, size and
          // colour and breaks across lines with it, each line keeping its own
          // underline and focus edge. The dotted underline is quiet at rest
          // and turns solid on hover, focus and while the card is open.
          'cursor-help rounded-edge [-webkit-box-decoration-break:clone] [box-decoration-break:clone]',
          'underline decoration-dotted decoration-1 underline-offset-[0.22em] [text-decoration-color:color-mix(in_oklab,currentColor_55%,transparent)]',
          'transition-[text-decoration-color] duration-[var(--duration-fast)] ease-[var(--ease-out-soft)]',
          'hover:[text-decoration-color:currentColor] focus-visible:[text-decoration-color:currentColor] data-[state=open]:[text-decoration-color:currentColor]',
          standalone && 'touch-hit-area',
          className,
        )}
      >
        {children}
      </span>
    </ExplainPopover>
  );
}
