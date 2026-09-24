'use client';

import * as React from 'react';
import * as PopoverPrimitive from '@radix-ui/react-popover';
import { Slot } from '@radix-ui/react-slot';
import { useTranslations } from 'next-intl';

import { cn } from '@/lib/utils';

/**
 * The coined vocabulary with a definition in `messages/<locale>/glossary.json`.
 * One definition per term, shared by every surface that explains it: the FAQ,
 * figure labels, the standings and the how-it-works page all read the same
 * `short` and `long` copy, so the protocol is described one way everywhere.
 */
export const GLOSSARY_TERM_IDS = [
  'gesture',
  'cycle',
  'cycleFinalizationTime',
  'calibrationWindow',
  'cycleReserve',
  'signatureAllocation',
  'finalCstGesture',
  'enduranceChampion',
  'chronoWarrior',
  'stellarSelection',
  'anchoring',
  'anchorDistribution',
  'retrieve',
  'imprint',
  'publicGoods',
  'outreachReserve',
  'cosmicCouncil',
  'cst',
] as const;

export type GlossaryTermId = (typeof GLOSSARY_TERM_IDS)[number];

type Side = 'top' | 'right' | 'bottom' | 'left';
type Align = 'start' | 'center' | 'end';

/** Hover intent: long enough to skip a pointer passing over, short enough to feel immediate. */
const OPEN_DELAY_MS = 250;
/** Grace period to cross from the trigger into the card (WCAG 1.4.13: hoverable). */
const CLOSE_DELAY_MS = 150;

export interface ExplainPopoverProps {
  /** Heading of the card: the term or the label it explains. */
  title?: string;
  /** Shown on hover and always announced as the trigger's description. */
  definition: string;
  /** Added below the definition once the card is opened by a click, tap or key. */
  details?: string;
  side?: Side;
  align?: Align;
  /** Widest the card may grow, in CSS pixels. */
  maxWidth?: number;
  /**
   * The single focusable trigger: a `<button type="button">`. It receives the
   * description, `data-state` and the pointer and click handlers (merged with
   * its own).
   */
  children: React.ReactElement;
}

/**
 * The one explanation surface behind `<Term>` and `<InfoTooltip>`: a tooltip
 * on hover and a toggletip on click, tap, Enter or Space.
 *
 * - A fine pointer resting on the trigger opens a compact card (the short
 *   definition) that stays open while the pointer moves onto it.
 * - A click, tap or key press pins the card open with the longer details; a
 *   second press, Escape or a click elsewhere closes it. Focus never moves.
 * - The short definition is the trigger's `aria-description` at all times,
 *   so a screen reader hears it on focus without opening anything, the name
 *   stays short (no truncated sentence), and the page text is not doubled.
 *   The trigger carries no `aria-expanded`: announcing "collapsed" on every
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
  const triggerRef = React.useRef<HTMLButtonElement | null>(null);
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const reactId = React.useId();
  const contentId = `explain-${reactId}`;

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
          aria-description={definition}
          data-state={open ? 'open' : 'closed'}
          onClick={onClick}
          onPointerEnter={onPointerEnter}
          onPointerLeave={onPointerLeave}
        >
          {children}
        </Slot>
      </PopoverPrimitive.Anchor>
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

type TermSource =
  | {
      /** A glossary term: the definition and the default text come from glossary.json. */
      id: GlossaryTermId;
      definition?: never;
      details?: never;
      title?: never;
    }
  | {
      id?: never;
      /** An ad hoc definition for a word outside the glossary (ERC-20, Layer 2). */
      definition: string;
      details?: string;
      /** Card heading; defaults to the visible text when it is a string. */
      title?: string;
    };

export type TermProps = TermSource & {
  /** The word as it reads in the sentence (plural, inflected). Defaults to the glossary term. */
  children?: React.ReactNode;
  /**
   * `text` (default) names the trigger by its visible word, for terms in
   * running text. `moreInformation` names it "More information about {label}",
   * for the label of a figure, whose word alone would not say that it opens
   * an explanation.
   */
  announce?: 'text' | 'moreInformation';
  side?: Side;
  align?: Align;
  maxWidth?: number;
  className?: string;
};

/**
 * Term — a coined word that explains itself.
 *
 * The word keeps its place in the sentence or label, marked by a dotted
 * underline, and is the only tab stop: hovering it shows the short
 * definition, and a click, tap, Enter or Space pins a card with the longer
 * one. It replaces a word followed by an ⓘ icon, which doubled the tab
 * stops and broke the reading line.
 *
 *   <Term id="calibrationWindow" />
 *   <Term id="stellarSelection">Stellar Selections</Term>
 *   <Term definition={t('metrics.gestures.tooltip')}>{t('metrics.gestures.label')}</Term>
 */
export function Term({
  id,
  definition,
  details,
  title,
  children,
  announce = 'text',
  side,
  align,
  maxWidth,
  className,
}: TermProps) {
  const t = useTranslations('glossary');
  const tTooltips = useTranslations('tooltips');

  const word = id ? t(`terms.${id}.term`) : undefined;
  const text = children ?? word;
  const cardTitle = id ? word : (title ?? (typeof children === 'string' ? children : undefined));
  const short = id ? t(`terms.${id}.short`) : (definition ?? '');
  const long = id ? t(`terms.${id}.long`) : details;
  const label = cardTitle ?? (typeof text === 'string' ? text : undefined);

  return (
    <ExplainPopover
      title={cardTitle}
      definition={short}
      details={long}
      side={side}
      align={align}
      maxWidth={maxWidth}
    >
      <button
        type="button"
        aria-label={
          announce === 'moreInformation' && label
            ? tTooltips('moreInformationAbout', { label })
            : undefined
        }
        data-term={id}
        className={cn(
          // Inline in running text: inherits the sentence's font, size and
          // colour, wraps with it, and keeps a quiet dotted underline that
          // turns solid on hover, focus and while its card is open.
          'inline max-w-full cursor-help rounded-edge text-left',
          'underline decoration-dotted decoration-1 underline-offset-[0.22em] [text-decoration-color:color-mix(in_oklab,currentColor_55%,transparent)]',
          'transition-[text-decoration-color] duration-[var(--duration-fast)] ease-[var(--ease-out-soft)]',
          'hover:[text-decoration-color:currentColor] focus-visible:[text-decoration-color:currentColor] data-[state=open]:[text-decoration-color:currentColor]',
          className,
        )}
      >
        {text}
      </button>
    </ExplainPopover>
  );
}
