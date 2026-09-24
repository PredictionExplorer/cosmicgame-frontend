'use client';

import { useEffect, useRef, useState, type MouseEvent, type ReactNode } from 'react';
import { ArrowUp, ListTree } from 'lucide-react';

import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

import {
  branchOf,
  findEntry,
  flattenContents,
  type ContentsCopy,
  type ContentsEntry,
} from './contents';
import { prefersReducedMotion } from './scrolling';
import { useReadingPosition, type ReadingPosition } from './useReadingPosition';

interface ContentsListProps {
  entries: readonly ContentsEntry[];
  activeId: string | null;
  /** `active`: only the current section's subsections open (the rail); `all`: every level (the sheet). */
  expand: 'active' | 'all';
  onNavigate?: (id: string, event: MouseEvent<HTMLAnchorElement>) => void;
  depth?: number;
}

/** The numbered list of sections both the rail and the sheet draw. */
function ContentsList({ entries, activeId, expand, onNavigate, depth = 0 }: ContentsListProps) {
  const branch = branchOf(entries, activeId);
  return (
    <ol className={cn(depth === 0 ? 'space-y-px' : 'mb-1.5 mt-px space-y-px')}>
      {entries.map((entry) => {
        const isActive = entry.id === activeId;
        const onBranch = entry.id === branch;
        const showChildren = Boolean(entry.children?.length) && (expand === 'all' || onBranch);
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
              {depth === 0 ? (
                <span aria-hidden className="w-5 shrink-0 tabular-nums text-subtle">
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

interface RailProps {
  entries: readonly ContentsEntry[];
  copy: ContentsCopy;
  position: ReadingPosition;
  topId: string;
  footer?: ReactNode;
}

/**
 * The sticky rail (from `lg`): every section, the current one's subsections
 * opened, a hairline that fills as the reader progresses, and a way back to
 * the top. It scrolls on its own when the list is taller than the screen,
 * keeping the current entry in view without moving the page.
 */
function ContentsRail({ entries, copy, position, topId, footer }: RailProps) {
  const { activeId, progress } = position;
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
      aria-label={copy.railLabel}
      className="sticky top-[var(--sticky-offset)] hidden max-h-[calc(100dvh-var(--sticky-offset)-1.5rem)] flex-col lg:flex"
      data-testid="contents-rail"
    >
      <p className="type-eyebrow text-subtle">{copy.heading}</p>
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
        <ContentsList entries={entries} activeId={activeId} expand="active" />
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

interface SheetProps {
  entries: readonly ContentsEntry[];
  copy: ContentsCopy;
  position: ReadingPosition;
}

/**
 * Below `lg`: a floating Contents button, shown once the in-flow contents has
 * scrolled away, naming the section being read and underlined by the reading
 * progress. It opens the full contents in a bottom sheet; choosing an entry
 * closes the sheet and moves there, focus included.
 */
function ContentsSheet({ entries, copy, position }: SheetProps) {
  const { activeId, progress, pastAnchor } = position;
  const [open, setOpen] = useState(false);
  const target = useRef<string | null>(null);

  const current = findEntry(entries, activeId);
  const visible = pastAnchor || open;

  const navigate = (id: string, event: MouseEvent<HTMLAnchorElement>) => {
    // The sheet locks page scroll while it is open: move once it has closed.
    event.preventDefault();
    target.current = id;
    setOpen(false);
  };

  return (
    <div
      data-action-dock
      className={cn(
        'pointer-events-none fixed inset-x-0 bottom-0 z-30 flex justify-center px-4 pb-[max(1rem,env(safe-area-inset-bottom))] transition-[opacity,transform] duration-base lg:hidden',
        visible ? 'opacity-100' : 'translate-y-3 opacity-0',
      )}
    >
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <button
            type="button"
            tabIndex={visible ? undefined : -1}
            aria-hidden={visible ? undefined : true}
            data-testid="contents-sheet-trigger"
            className={cn(
              'glass relative inline-flex min-h-11 max-w-full items-center gap-2.5 overflow-hidden rounded-pill border border-rule py-2 pl-4 pr-5 shadow-float type-label text-foreground',
              visible && 'pointer-events-auto',
            )}
          >
            <ListTree aria-hidden className="size-4 shrink-0 text-primary" />
            <span className="shrink-0">{copy.openLabel}</span>
            {current ? (
              <span className="min-w-0 truncate text-muted-foreground">
                {current.number ? (
                  <span className="tabular-nums">{`${current.number} `}</span>
                ) : null}
                {current.label}
              </span>
            ) : null}
            <span
              aria-hidden
              className="absolute inset-x-0 bottom-0 h-0.5 origin-left bg-primary"
              style={{ transform: `scaleX(${progress})` }}
            />
          </button>
        </SheetTrigger>
        <SheetContent
          side="bottom"
          aria-describedby={undefined}
          onCloseAutoFocus={(event) => {
            const id = target.current;
            if (!id) return;
            target.current = null;
            event.preventDefault();
            const element = document.getElementById(id);
            if (!element) return;
            element.scrollIntoView({
              block: 'start',
              behavior: prefersReducedMotion() ? 'auto' : 'smooth',
            });
            window.history.replaceState(null, '', `#${id}`);
            const heading = element.querySelector<HTMLElement>('h2, h3');
            (heading ?? element).focus({ preventScroll: true });
          }}
          className="flex max-h-[85dvh] flex-col gap-0 rounded-t-surface border-t border-rule bg-background p-0"
        >
          <div className="border-b border-rule-faint px-5 pb-3 pt-5 pr-16">
            <SheetTitle className="type-eyebrow text-subtle">{copy.heading}</SheetTitle>
          </div>
          <nav
            aria-label={copy.railLabel}
            className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3"
          >
            <div className="relative ml-1">
              <span aria-hidden className="absolute inset-y-0 left-0 w-px bg-rule" />
              <ContentsList
                entries={entries}
                activeId={activeId}
                expand="all"
                onNavigate={navigate}
              />
            </div>
          </nav>
        </SheetContent>
      </Sheet>
    </div>
  );
}

export interface ReadingContentsProps {
  entries: readonly ContentsEntry[];
  copy: ContentsCopy;
  /** The id of the article whose position and progress the contents follow. */
  articleId: string;
  /** Where "Back to top" goes: usually the H1's id. */
  topId: string;
  /** The in-flow contents list below `lg`; the floating button waits until it has scrolled away. */
  anchorId: string;
  /** Extra actions at the foot of the rail, e.g. the PDF download. */
  railFooter?: ReactNode;
}

/**
 * Wayfinding for a long read, with one scroll-spy: the sticky rail from `lg`
 * (place this in the grid's rail column) and, below `lg`, the floating
 * Contents button with its bottom sheet.
 */
export function ReadingContents({
  entries,
  copy,
  articleId,
  topId,
  anchorId,
  railFooter,
}: ReadingContentsProps) {
  const position = useReadingPosition(flattenContents(entries), articleId, anchorId);
  return (
    <>
      <ContentsRail
        entries={entries}
        copy={copy}
        position={position}
        topId={topId}
        footer={railFooter}
      />
      <ContentsSheet entries={entries} copy={copy} position={position} />
    </>
  );
}
