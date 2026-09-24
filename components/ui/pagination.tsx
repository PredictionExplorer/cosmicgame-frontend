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

const PaginationPrevious = ({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) => {
  const t = useTranslations('tables');

  return (
    <PaginationLink
      aria-label={t('pagination.previousAria')}
      size="default"
      className={cn('gap-1 pl-2.5', className)}
      {...props}
    >
      <ChevronLeft className="h-4 w-4" aria-hidden />
      <span>{t('pagination.previous')}</span>
    </PaginationLink>
  );
};
PaginationPrevious.displayName = 'PaginationPrevious';

const PaginationNext = ({ className, ...props }: React.ComponentProps<typeof PaginationLink>) => {
  const t = useTranslations('tables');

  return (
    <PaginationLink
      aria-label={t('pagination.nextAria')}
      size="default"
      className={cn('gap-1 pr-2.5', className)}
      {...props}
    >
      <span>{t('pagination.next')}</span>
      <ChevronRight className="h-4 w-4" aria-hidden />
    </PaginationLink>
  );
};
PaginationNext.displayName = 'PaginationNext';

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

/** From this many pages, a "Go to page" field joins the buttons (from `sm` up). */
const GO_TO_PAGE_THRESHOLD = 30;

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
}: {
  current: number;
  pageCount: number;
  onGo: (page: number) => void;
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
    <label className="hidden items-center gap-2 whitespace-nowrap type-caption text-subtle sm:flex">
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
  className?: string;
}

/**
 * Pagination for a ledger: the row range ("1–20 of 1,140"), Previous and
 * Next, and the page numbers from `sm` up. It renders nothing when every row
 * fits on one page, so a short table carries no dead "1" button.
 */
export function TablePagination({
  page,
  pageSize,
  total,
  onPageChange,
  caption,
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
        <div className="flex items-center gap-x-4">
          <Pagination className="mx-0 w-auto">
            <PaginationContent>
              <PaginationItem>
                <PaginationLink
                  aria-label={t('pagination.previousAria')}
                  size="default"
                  disabled={current === 1}
                  onClick={() => goTo(current - 1)}
                  className="gap-1 px-2.5 max-sm:size-11 max-sm:px-0 disabled:pointer-events-none disabled:opacity-40"
                >
                  <ChevronLeft className="h-4 w-4" aria-hidden />
                  <span className="max-sm:sr-only">{t('pagination.previous')}</span>
                </PaginationLink>
              </PaginationItem>
              {visiblePages(current, pageCount).map((item, index) => (
                <PaginationItem key={`${item}-${index}`} className="max-sm:hidden">
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
                <PaginationLink
                  aria-label={t('pagination.nextAria')}
                  size="default"
                  disabled={current === pageCount}
                  onClick={() => goTo(current + 1)}
                  className="gap-1 px-2.5 max-sm:size-11 max-sm:px-0 disabled:pointer-events-none disabled:opacity-40"
                >
                  <span className="max-sm:sr-only">{t('pagination.next')}</span>
                  <ChevronRight className="h-4 w-4" aria-hidden />
                </PaginationLink>
              </PaginationItem>
            </PaginationContent>
          </Pagination>

          {pageCount >= GO_TO_PAGE_THRESHOLD ? (
            <GoToPage current={current} pageCount={pageCount} onGo={goTo} />
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

export {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
};
