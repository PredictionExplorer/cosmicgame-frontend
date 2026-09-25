'use client';

import * as React from 'react';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

import { cn } from '@/lib/utils';
import { formatCount } from '@/utils/format';
import { type ButtonProps, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const Pagination = ({ className, ...props }: React.ComponentProps<'nav'>) => {
  const t = useTranslations('tables');

  return (
    <nav
      aria-label={t('pagination.label')}
      className={cn('mx-auto flex w-full justify-center', className)}
      {...props}
    />
  );
};
Pagination.displayName = 'Pagination';

const PaginationContent = React.forwardRef<HTMLUListElement, React.ComponentProps<'ul'>>(
  ({ className, ...props }, ref) => (
    <ul ref={ref} className={cn('flex flex-row items-center gap-1', className)} {...props} />
  ),
);
PaginationContent.displayName = 'PaginationContent';

const PaginationItem = React.forwardRef<HTMLLIElement, React.ComponentProps<'li'>>(
  ({ className, ...props }, ref) => <li ref={ref} className={cn('', className)} {...props} />,
);
PaginationItem.displayName = 'PaginationItem';

type PaginationLinkProps = {
  isActive?: boolean;
} & Pick<ButtonProps, 'size'> &
  Omit<React.ComponentProps<'button'>, 'type'>;

/**
 * Renders a `<button>`, not an `<a>`.
 *
 * Paging here changes component state rather than navigating, and the previous
 * `<a>` had no `href`, so it was not focusable and exposed no control role.
 */
const PaginationLink = ({ className, isActive, size = 'icon', ...props }: PaginationLinkProps) => (
  <button
    type="button"
    aria-current={isActive ? 'page' : undefined}
    className={cn(
      buttonVariants({ variant: 'ghost', size }),
      'cursor-pointer tabular-nums text-muted-foreground',
      isActive && 'border border-rule bg-muted text-foreground hover:bg-muted',
      className,
    )}
    {...props}
  />
);
PaginationLink.displayName = 'PaginationLink';

const PaginationEllipsis = ({ className, ...props }: React.ComponentProps<'span'>) => {
  const t = useTranslations('tables');

  return (
    <span className={cn('flex h-9 w-9 items-center justify-center', className)} {...props}>
      <MoreHorizontal className="h-4 w-4" aria-hidden />
      <span className="sr-only">{t('pagination.morePages')}</span>
    </span>
  );
};
PaginationEllipsis.displayName = 'PaginationEllipsis';

/** Page count for `total` rows at `pageSize` per page; at least 1. */
export function pageCountFor(total: number, pageSize: number): number {
  if (!Number.isFinite(total) || !Number.isFinite(pageSize) || pageSize <= 0) return 1;
  return Math.max(1, Math.ceil(total / pageSize));
}

/**
 * The page buttons to show: every page up to 7, otherwise the first, the
 * last and the current page's neighbours, with gaps as `'ellipsis'`.
 */
export function visiblePages(current: number, total: number): (number | 'ellipsis')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages: (number | 'ellipsis')[] = [1];
  if (current > 3) pages.push('ellipsis');
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let page = start; page <= end; page++) pages.push(page);
  if (current < total - 2) pages.push('ellipsis');
  pages.push(total);
  return pages;
}

/**
 * A stable React key for each entry of {@link visiblePages}: the page number
 * itself, and `ellipsis-start` / `ellipsis-end` for the gaps. Keys that held
 * the entry's position changed whenever the window moved (page 5 was the
 * fifth entry on page 4 and the fourth on page 5), so React remounted the
 * button a keyboard user had just pressed and focus fell to the page.
 */
export function pageItemKey(
  item: number | 'ellipsis',
  index: number,
  items: readonly (number | 'ellipsis')[],
): string {
  if (item !== 'ellipsis') return String(item);
  return items.indexOf('ellipsis') === index ? 'ellipsis-start' : 'ellipsis-end';
}

/** From this many pages, a "Go to page" field joins the page buttons (from `sm` up). */
const GO_TO_PAGE_THRESHOLD = 30;

/**
 * From this many pages, a phone, which shows no page numbers, offers the
 * field beside Previous and Next, so the end of a 115-page log is one entry
 * away rather than 114 presses.
 */
const PHONE_GO_TO_PAGE_THRESHOLD = 5;

/**
 * "Go to page": a number the reader types and then commits with Enter or by
 * leaving the field. Typing "37" must not visit page 3 on the way, and
 * clearing the field to type afresh must not snap it back, so the field
 * holds a draft of its own until it is committed.
 */
function GoToPage({
  current,
  pageCount,
  onGo,
  className,
}: {
  current: number;
  pageCount: number;
  onGo: (page: number) => void;
  className?: string;
}) {
  const t = useTranslations('tables');
  const [draft, setDraft] = React.useState<string | null>(null);

  const commit = () => {
    if (draft === null) return;
    const value = Number(draft);
    setDraft(null);
    if (draft.trim() !== '' && Number.isFinite(value) && value > 0) onGo(Math.trunc(value));
  };

  return (
    <label
      className={cn('items-center gap-2 whitespace-nowrap type-caption text-subtle', className)}
    >
      {t('pagination.goToPage')}
      <Input
        type="number"
        inputMode="numeric"
        className="h-9 w-20 tabular-nums"
        value={draft ?? String(current)}
        min={1}
        max={pageCount}
        aria-label={t('pagination.goToPageAria')}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={commit}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            event.preventDefault();
            commit();
          } else if (event.key === 'Escape' && draft !== null) {
            setDraft(null);
          }
        }}
      />
    </label>
  );
}

/**
 * Previous or Next. At the first or last page the button stays where it is
 * and keeps keyboard focus: it is `aria-disabled` and ignores presses rather
 * than natively `disabled`, which would drop a reader who has just paged
 * onto the last page to the top of the document. Its name is its visible
 * word (visually hidden on a phone, where only the chevron shows), so a
 * voice-control user can say what they see (WCAG 2.5.3).
 */
function StepButton({
  direction,
  unavailable,
  onStep,
}: {
  direction: 'previous' | 'next';
  unavailable: boolean;
  onStep: () => void;
}) {
  const t = useTranslations('tables');
  const Chevron = direction === 'previous' ? ChevronLeft : ChevronRight;
  const icon = <Chevron className="h-4 w-4" aria-hidden />;
  const word = <span className="max-sm:sr-only">{t(`pagination.${direction}`)}</span>;
  return (
    <PaginationLink
      size="default"
      aria-disabled={unavailable || undefined}
      onClick={(event) => {
        if (unavailable) {
          event.preventDefault();
          return;
        }
        onStep();
      }}
      className={cn(
        'gap-1 px-2.5 max-sm:size-11 max-sm:px-0',
        'aria-disabled:cursor-default aria-disabled:opacity-40 aria-disabled:hover:bg-transparent aria-disabled:hover:text-muted-foreground motion-safe:aria-disabled:active:scale-100',
      )}
    >
      {direction === 'previous' ? icon : null}
      {word}
      {direction === 'next' ? icon : null}
    </PaginationLink>
  );
}

export interface TablePaginationProps {
  /** The current page, 1-based. */
  page: number;
  pageSize: number;
  /** Rows across all pages. */
  total: number;
  onPageChange: (page: number) => void;
  /**
   * A caption after the row range, such as the time zone the table's dates
   * are in. It is shown even when the table fits on one page.
   */
  caption?: React.ReactNode;
  /**
   * The navigation's accessible name ("Anchor Distributions pages"), so a
   * page with several ledgers has distinguishable pagination landmarks.
   */
  label?: string;
  className?: string;
}

/**
 * Pagination for a ledger: the row range ("1–20 of 1,140"), Previous and
 * Next, the page numbers from `sm` up, and a "Go to page" field for a long
 * ledger (on a phone, from a handful of pages). It renders nothing when
 * every row fits on one page, so a short table carries no dead "1" button.
 *
 * Keyboard focus never falls out of it: the page buttons are keyed by page,
 * so the one just pressed stays mounted as the window of numbers moves, and
 * Previous and Next stay focusable at the ends.
 */
export function TablePagination({
  page,
  pageSize,
  total,
  onPageChange,
  caption,
  label,
  className,
}: TablePaginationProps) {
  const t = useTranslations('tables');
  const locale = useLocale();
  // What a screen reader hears after the reader pages: the new range, once.
  // The visible range is not a live region, because a live table (the
  // cycle's gestures) changes its total on its own and would otherwise
  // announce itself whenever a gesture lands.
  const [announcement, setAnnouncement] = React.useState('');
  const pageCount = pageCountFor(total, pageSize);
  const current = Math.min(Math.max(page, 1), pageCount);
  const paged = pageCount > 1;

  if (!paged && !caption) return null;

  const rangeOf = (target: number) =>
    t('pagination.range', {
      from: formatCount((target - 1) * pageSize + 1, locale),
      to: formatCount(Math.min(target * pageSize, total), locale),
      total: formatCount(total, locale),
    });
  const goTo = (next: number) => {
    const target = Math.min(Math.max(next, 1), pageCount);
    if (target !== current) setAnnouncement(rangeOf(target));
    onPageChange(target);
  };
  const items = paged ? visiblePages(current, pageCount) : [];
  // A wide screen offers the field only for a long ledger; a phone, which
  // shows no page numbers, from a handful of pages.
  const goToPageClass =
    pageCount >= GO_TO_PAGE_THRESHOLD
      ? 'flex'
      : pageCount >= PHONE_GO_TO_PAGE_THRESHOLD
        ? 'flex sm:hidden'
        : null;

  return (
    <div
      data-slot="table-pagination"
      className={cn(
        // From `sm` the caption lines up with the ledger's cell text.
        'mt-3 flex flex-wrap items-center justify-between gap-x-6 gap-y-2 sm:pl-4',
        className,
      )}
    >
      <p className="type-caption text-subtle tabular-nums">
        {paged ? <span>{rangeOf(current)}</span> : null}
        {paged && caption ? <span aria-hidden> · </span> : null}
        {caption ? <span>{caption}</span> : null}
      </p>
      {paged ? (
        <p role="status" className="sr-only">
          {announcement}
        </p>
      ) : null}

      {paged ? (
        // `ms-auto`: when a long caption pushes the controls onto a line of
        // their own, they keep to the end edge instead of drifting left.
        <div className="ms-auto flex flex-wrap items-center justify-end gap-x-4 gap-y-2">
          <Pagination className="mx-0 w-auto" {...(label ? { 'aria-label': label } : {})}>
            <PaginationContent>
              <PaginationItem>
                <StepButton
                  direction="previous"
                  unavailable={current === 1}
                  onStep={() => goTo(current - 1)}
                />
              </PaginationItem>
              {items.map((item, index) => (
                <PaginationItem key={pageItemKey(item, index, items)} className="max-sm:hidden">
                  {item === 'ellipsis' ? (
                    <PaginationEllipsis />
                  ) : (
                    <PaginationLink isActive={item === current} onClick={() => goTo(item)}>
                      {formatCount(item, locale)}
                    </PaginationLink>
                  )}
                </PaginationItem>
              ))}
              <PaginationItem>
                <StepButton
                  direction="next"
                  unavailable={current === pageCount}
                  onStep={() => goTo(current + 1)}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>

          {goToPageClass ? (
            <GoToPage
              current={current}
              pageCount={pageCount}
              onGo={goTo}
              className={goToPageClass}
            />
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

export { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink };
