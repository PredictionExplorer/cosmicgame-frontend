import { createElement as h, type ReactNode } from 'react';
import { ChevronRight, Hash, Info } from 'lucide-react';

import { protocolFacts } from '@/content/protocol-facts';

import { cn } from '@/lib/utils';

/*
 * The reading-room parts shared by the white paper and the Learn guides: one
 * prose style (a 66ch measure at a calm line height), one heading scale
 * (a Clash H2 at 24–28px over an Inter H3 at 18–20px, numbers set apart),
 * and the blocks a long read needs (run-in term lists, notes, formulas and
 * numbered figures). Server components; the page supplies the copy.
 */

/** Running text: the prose measure and leading, one step below the foreground. */
export const PROSE_CLASS = 'type-prose text-muted-foreground';

/** Blocks that carry data (tables, figures, formulas) may run wider than the prose. */
export const BREAKOUT_CLASS = 'max-w-[60rem]';

export interface ReadingHeadingProps {
  as: 'h2' | 'h3';
  /** The section's anchor: the heading's link points at it. */
  sectionId: string;
  /** The heading's own id, for the section's `aria-labelledby`. */
  headingId: string;
  /** Section number, set apart from the title ("5.2"). */
  number?: string;
  children: ReactNode;
  /** Accessible name of the heading's anchor link ("Link to this section: …"). */
  anchorLabel: string;
  className?: string;
}

/**
 * A section heading with its number set apart and a `#` link to the section
 * that appears on hover and on keyboard focus (from `md`; phones share the
 * page's own URL instead). The link sits outside the heading element, so the
 * heading's accessible name is only its number and title.
 */
export function ReadingHeading({
  as: Heading,
  sectionId,
  headingId,
  number,
  children,
  anchorLabel,
  className,
}: ReadingHeadingProps) {
  return (
    <div className={cn('group/heading relative max-w-[var(--measure-prose)]', className)}>
      <Heading
        id={headingId}
        tabIndex={-1}
        className={cn(
          'scroll-mt-[var(--sticky-offset)] text-foreground',
          Heading === 'h2' ? 'type-section' : 'type-heading-3',
        )}
      >
        {number ? (
          <>
            <span
              className={cn(
                'tabular-nums text-subtle',
                Heading === 'h2' ? 'mr-2 sm:mr-3' : 'mr-1.5',
              )}
            >
              {number}
            </span>{' '}
          </>
        ) : null}
        {children}
      </Heading>
      <a
        href={`#${sectionId}`}
        aria-label={anchorLabel}
        className={cn(
          'absolute -left-8 hidden size-6 items-center justify-center rounded-edge text-subtle opacity-0 transition-opacity duration-fast hover:text-primary focus-visible:opacity-100 group-hover/heading:opacity-100 md:inline-flex',
          Heading === 'h2' ? 'top-1' : 'top-0',
        )}
      >
        <Hash aria-hidden className="size-4" />
      </a>
    </div>
  );
}

/** A run-in list item split into its lead term ("Seed.") and the rest. */
export interface RunInItem {
  term: string | null;
  text: string;
}

/** Separators that end a run-in term, in every script the papers use. */
const RUN_IN_SEPARATORS = ['. ', ': ', '。', '：'] as const;
/** A run-in term is a short phrase, never a whole sentence. */
const MAX_TERM_LENGTH = 48;

/**
 * Splits "Seed. At imprint time…" into the term "Seed." and its text: at the
 * first sentence or colon break, provided what precedes it is a short phrase
 * and something follows. Items without such a lead ("Reentrancy guards
 * protect…") come back whole.
 */
export function splitRunIn(item: string): RunInItem {
  let cut = -1;
  let separator = '';
  for (const candidate of RUN_IN_SEPARATORS) {
    const index = item.indexOf(candidate);
    if (index > 0 && (cut === -1 || index < cut)) {
      cut = index;
      separator = candidate;
    }
  }
  if (cut === -1 || cut > MAX_TERM_LENGTH) return { term: null, text: item };
  const term = item.slice(0, cut + separator.trimEnd().length);
  const text = item.slice(cut + separator.length).trim();
  if (!text) return { term: null, text: item };
  return { term, text };
}

/** The term as a label: its closing mark dropped, since the layout separates it. */
export function termLabel(term: string): string {
  return term.replace(/[.:：。]$/, '');
}

export interface RunInListProps {
  items: readonly string[];
  /** A sequence (the art pipeline): number each term. */
  ordered?: boolean;
  /** Renders an item's text, e.g. with its cross-references linked. */
  renderText?: (text: string) => ReactNode;
  className?: string;
}

/**
 * A list whose items open with a term ("Determinism.", "Pull over push:") as
 * a definition list: the term in the foreground beside its text, rows
 * divided by hairlines, so a reader can scan the terms. Items without a term
 * span the row.
 */
export function RunInList({ items, ordered = false, renderText, className }: RunInListProps) {
  const split = items.map(splitRunIn);
  return (
    <dl
      className={cn(
        'max-w-[var(--measure-prose)] divide-y divide-rule-faint border-y border-rule-faint',
        className,
      )}
    >
      {split.map((item, index) => (
        <div
          key={`${index}-${item.text.slice(0, 24)}`}
          className="grid gap-x-8 gap-y-1 py-4 sm:grid-cols-[minmax(0,11rem)_minmax(0,1fr)]"
        >
          {item.term ? (
            <dt className="flex items-baseline gap-2.5 type-title text-foreground">
              {ordered ? (
                <span aria-hidden className="type-label tabular-nums text-subtle">
                  {String(index + 1).padStart(2, '0')}
                </span>
              ) : null}
              <span>{termLabel(item.term)}</span>
            </dt>
          ) : null}
          <dd className={cn('type-body-md text-muted-foreground', !item.term && 'sm:col-span-2')}>
            {renderText ? renderText(item.text) : item.text}
          </dd>
        </div>
      ))}
    </dl>
  );
}

export interface CalloutProps {
  label: string;
  children: ReactNode;
  className?: string;
}

/** An aside to the argument (a disclaimer, a caveat): a primary rule on the start edge and a label. */
export function Callout({ label, children, className }: CalloutProps) {
  return (
    <div
      role="note"
      className={cn('max-w-[var(--measure-prose)] border-l-2 border-primary py-1 pl-5', className)}
    >
      <p className="flex items-center gap-2 type-label text-foreground">
        <Info aria-hidden className="size-4 text-primary" />
        {label}
      </p>
      <div className="mt-2 type-body-sm text-muted-foreground">{children}</div>
    </div>
  );
}

export interface FormulaFigureProps {
  label: string;
  /** The expression as the contracts write it. */
  formula: string;
  /** The same rule in plain notation; when present it leads and the expression folds away. */
  notation?: string;
  legend?: readonly { symbol: string; meaning: string }[];
  /** Summary of the disclosure holding the contract expression. */
  expressionLabel: string;
  caption?: string;
  className?: string;
}

/**
 * Notations the paper sets as MathML rather than as a line of text: a real
 * radical over its radicand and floor brackets that grow with it, drawn by
 * the browser's math typesetting (MathML Core) instead of fallback glyphs
 * in the mono face. Built with createElement, since JSX has no MathML types.
 */
const NOTATION_MATH: Readonly<Record<string, () => ReactNode>> = {
  [protocolFacts.participationCstNotation]: () =>
    h(
      'math',
      { 'aria-label': protocolFacts.participationCstNotation, className: 'text-foreground' },
      h(
        'mrow',
        null,
        h('mi', { mathvariant: 'normal' }, 'CST'),
        h('mo', null, '='),
        h('mo', null, '⌊'),
        h(
          'msqrt',
          null,
          h('mi', { mathvariant: 'normal' }, 'Δt'),
          h('mo', null, '×'),
          h('mi', null, 'm'),
          h('mo', null, '÷'),
          h('mi', null, 'i'),
        ),
        h('mo', null, '⌋'),
      ),
    ),
};

/**
 * A formula in a sunken well: the plain notation (set as MathML when the
 * paper has a typeset form of it) with a legend of its symbols, the
 * contract's own expression one click away, and the caption.
 */
export function FormulaFigure({
  label,
  formula,
  notation,
  legend,
  expressionLabel,
  caption,
  className,
}: FormulaFigureProps) {
  return (
    <figure
      className={cn(
        // Sized to its content (the prose measure at most), not a 60rem well
        // the equation sat in the corner of.
        'max-w-[var(--measure-prose)] rounded-surface bg-surface-sunken px-5 py-5 sm:px-7 sm:py-6',
        className,
      )}
    >
      <p className="type-label text-subtle">{label}</p>
      {notation && NOTATION_MATH[notation] ? (
        // The key equation of the token model set as a figure: at display
        // size, centred, with room above and below.
        <div className="type-formula my-4 flex justify-center overflow-x-auto py-2 sm:my-6">
          {NOTATION_MATH[notation]()}
        </div>
      ) : (
        <p className="mt-3 break-words font-mono type-body-lg text-foreground">
          {notation ?? formula}
        </p>
      )}
      {legend && legend.length > 0 ? (
        <dl className="mt-4 grid gap-1.5">
          {legend.map((entry) => (
            <div key={entry.symbol} className="flex items-baseline gap-4">
              <dt className="type-formula-symbol w-8 shrink-0 text-foreground">
                {h(
                  'math',
                  null,
                  // As in the equation: a multi-letter name upright, a single letter italic.
                  h('mi', entry.symbol.length > 1 ? { mathvariant: 'normal' } : null, entry.symbol),
                )}
              </dt>
              <dd className="type-body-sm text-muted-foreground">{entry.meaning}</dd>
            </div>
          ))}
        </dl>
      ) : null}
      {notation ? (
        <details className="group mt-4 border-t border-rule-faint pt-3">
          <summary className="inline-flex min-h-6 cursor-pointer list-none items-center gap-1.5 type-label text-muted-foreground hover:text-foreground [&::-webkit-details-marker]:hidden">
            <ChevronRight
              aria-hidden
              className="size-3.5 transition-transform duration-fast group-open:rotate-90"
            />
            {expressionLabel}
          </summary>
          <code className="mt-2 block type-hash text-muted-foreground">{formula}</code>
        </details>
      ) : null}
      {caption ? (
        <figcaption className="mt-4 type-caption text-subtle">{caption}</figcaption>
      ) : null}
    </figure>
  );
}

export interface NumberedFigureProps {
  /** "Figure 1". */
  label: string;
  title: string;
  /** The caption, e.g. with its cross-references linked. */
  caption?: ReactNode;
  children: ReactNode;
  className?: string;
  /** Id of the title, which names the figure. */
  titleId: string;
}

/** A numbered figure: label and title above, the illustration, the caption below. */
export function NumberedFigure({
  label,
  title,
  caption,
  children,
  className,
  titleId,
}: NumberedFigureProps) {
  return (
    <figure aria-labelledby={titleId} className={cn(BREAKOUT_CLASS, className)}>
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span className="type-label tabular-nums text-subtle">{label}</span>
        <span id={titleId} className="type-title text-foreground">
          {title}
        </span>
      </div>
      <div className="mt-5">{children}</div>
      {caption ? (
        <figcaption className="mt-4 max-w-[var(--measure-prose)] type-caption text-subtle">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}
