'use client';

import { useEffect, useId, useRef, type MouseEvent, type ReactNode } from 'react';
import { ArrowUp } from 'lucide-react';

import { cn } from '@/lib/utils';

import { branchOf, flattenContents, type ContentsCopy, type ContentsEntry } from './contents';
import { prefersReducedMotion } from './scrolling';
import { useReadingPosition, type ReadingPosition } from './useReadingPosition';

/*
 * The reading pages' contents rail and the list it shares with the phone
 * sheet (ContentsNav). A module of its own, so a page that shows the rail
 * alone (the Trust Center documents) ships no sheet with it.
 */

export interface ContentsListProps {
  entries: readonly ContentsEntry[];
  activeId: string | null;
  /**
   * `sections`: the top level only, the section being read marked (the rail:
   * it never grows or shrinks while the reader scrolls, so nothing in it
   * shifts); `all`: every level (the sheet).
   */
  expand: 'sections' | 'all';
  onNavigate?: (id: string, event: MouseEvent<HTMLAnchorElement>) => void;
  depth?: number;
}

/** The numbered list of sections both the rail and the sheet draw. */
export function ContentsList({
  entries,
  activeId,
  expand,
  onNavigate,
  depth = 0,
}: ContentsListProps) {
  const branch = branchOf(entries, activeId);
  // A numbered list keeps a number column, so an unnumbered entry (References) still aligns.
  const numbered = entries.some((entry) => entry.number);
  return (
    <ol className={cn(depth === 0 ? 'space-y-px' : 'mb-1.5 mt-px space-y-px')}>
      {entries.map((entry) => {
        const onBranch = entry.id === branch;
        // In the rail a section stands for its subsections: it is marked while one is read.
        const isActive = entry.id === activeId || (expand === 'sections' && onBranch);
        const showChildren = Boolean(entry.children?.length) && expand === 'all';
        return (
          <li key={entry.id}>
            <a
              href={`#${entry.id}`}
              aria-current={isActive ? 'location' : undefined}
              onClick={onNavigate ? (event) => onNavigate(entry.id, event) : undefined}
              className={cn(
                'focus-ring-inset relative flex min-h-8 items-baseline gap-2.5 rounded-edge py-1.5 pr-2 transition-colors duration-fast',
                depth === 0 ? 'pl-4 type-body-sm' : 'pl-[2.875rem] type-label',
                isActive
                  ? 'text-foreground before:absolute before:inset-y-1 before:-left-px before:w-0.5 before:rounded-pill before:bg-primary'
                  : onBranch
                    ? 'text-foreground'
                    : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {depth === 0 && numbered ? (
                <span aria-hidden className="min-w-5 shrink-0 tabular-nums text-subtle">
                  {entry.number}
                </span>
              ) : null}
              <span className="min-w-0">
                {depth > 0 && entry.number ? (
                  <span className="mr-1.5 tabular-nums text-subtle">{entry.number}</span>
                ) : null}
                {entry.label}
              </span>
            </a>
            {showChildren ? (
              <ContentsList
                entries={entry.children ?? []}
                activeId={activeId}
                expand={expand}
                onNavigate={onNavigate}
                depth={depth + 1}
              />
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}

/** The words the rail itself needs: its label and its way back to the top. */
export type RailCopy = Pick<ContentsCopy, 'railLabel' | 'backToTopLabel'>;

export interface RailProps {
  entries: readonly ContentsEntry[];
  copy: RailCopy;
  position: ReadingPosition;
  topId: string;
  footer?: ReactNode;
}

/**
 * The sticky rail (from `lg`): every section, the one being read marked (its
 * subsections are in the in-flow contents and the sheet, so the rail keeps
 * one height while the reader scrolls), a hairline that fills as the reader
 * progresses, and a way back to the top. It scrolls on its own when the list is taller than the screen,
 * keeping the current entry in view without moving the page.
 */
export function ContentsRail({ entries, copy, position, topId, footer }: RailProps) {
  const { activeId, progress } = position;
  const labelId = useId();
  const scrollerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller || !activeId || scroller.scrollHeight <= scroller.clientHeight) return;
    const link = scroller.querySelector<HTMLElement>(`a[href="#${CSS.escape(activeId)}"]`);
    if (!link) return;
    const top = link.offsetTop;
    if (top < scroller.scrollTop + 32 || top > scroller.scrollTop + scroller.clientHeight - 64) {
      scroller.scrollTo({
        top: Math.max(0, top - scroller.clientHeight / 3),
        behavior: prefersReducedMotion() ? 'auto' : 'smooth',
      });
    }
  }, [activeId]);

  return (
    <nav
      aria-labelledby={labelId}
      className="sticky top-[var(--sticky-offset)] hidden max-h-[calc(100dvh-var(--sticky-offset)-1.5rem)] flex-col lg:flex"
      data-testid="contents-rail"
    >
      <p id={labelId} className="type-eyebrow text-subtle">
        {copy.railLabel}
      </p>
      <div
        ref={scrollerRef}
        className="relative mt-4 min-h-0 flex-1 overflow-y-auto overscroll-contain scrollbar-none"
      >
        {/* The reading-progress hairline: the rule fills with the accent as the reader goes. */}
        <span aria-hidden className="absolute inset-y-0 left-0 w-px bg-rule" />
        <span
          aria-hidden
          className="absolute left-0 top-0 w-px bg-primary"
          style={{ height: `${Math.round(progress * 1000) / 10}%` }}
          data-testid="reading-progress"
        />
        <ContentsList entries={entries} activeId={activeId} expand="sections" />
      </div>
      <div className="mt-4 flex flex-col items-start gap-2 border-t border-rule-faint pt-4">
        {footer}
        <a
          href={`#${topId}`}
          className="link-quiet inline-flex min-h-6 items-center gap-1.5 type-label text-muted-foreground hover:text-foreground"
        >
          <ArrowUp aria-hidden className="size-3.5" />
          {copy.backToTopLabel}
        </a>
      </div>
    </nav>
  );
}

export interface ReadingRailProps {
  entries: readonly ContentsEntry[];
  copy: RailCopy;
  /** The id of the article whose position and progress the rail follows. */
  articleId: string;
  /** Where "Back to top" goes: usually the H1's id. */
  topId: string;
  footer?: ReactNode;
}

/**
 * The same sticky rail alone, for a reading page whose phones find their
 * way through an in-flow contents list of their own (the Trust Center
 * documents' "On this page" disclosure) rather than the floating sheet.
 * Place it in the reading grid's rail column.
 */
export function ReadingRail({ entries, copy, articleId, topId, footer }: ReadingRailProps) {
  const position = useReadingPosition(flattenContents(entries), articleId);
  return (
    <ContentsRail entries={entries} copy={copy} position={position} topId={topId} footer={footer} />
  );
}
