import { useMemo, type ChangeEvent } from 'react';

import { Input } from '@/components/ui/input';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
} from '@/components/ui/pagination';

interface CustomPaginationProps {
  page: number;
  setPage: (page: number) => void;
  totalLength: number;
  perPage: number;
}

function getVisiblePages(current: number, total: number): (number | 'ellipsis')[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages: (number | 'ellipsis')[] = [1];

  if (current > 3) {
    pages.push('ellipsis');
  }

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  if (current < total - 2) {
    pages.push('ellipsis');
  }

  pages.push(total);

  return pages;
}

export const CustomPagination = ({
  page,
  setPage,
  totalLength,
  perPage,
}: CustomPaginationProps) => {
  const pageCount = useMemo(
    () => Math.max(1, Math.ceil(totalLength / perPage)),
    [totalLength, perPage],
  );

  const showGoToInput = pageCount >= 30;

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    if (Number.isNaN(value)) return;

    const nextPage = Math.min(Math.max(value, 1), pageCount);
    setPage(nextPage);
  };

  const visiblePages = getVisiblePages(page, pageCount);

  return (
    <div
      className={`mt-4 flex flex-wrap items-center ${showGoToInput ? 'justify-end' : 'justify-center'}`}
    >
      <Pagination>
        <PaginationContent>
          {visiblePages.map((item, i) => (
            <PaginationItem key={i}>
              {item === 'ellipsis' ? (
                <PaginationEllipsis />
              ) : (
                <PaginationLink isActive={item === page} onClick={() => setPage(item)}>
                  {item}
                </PaginationLink>
              )}
            </PaginationItem>
          ))}
        </PaginationContent>
      </Pagination>

      {showGoToInput && (
        <div className="my-1 ml-8 flex items-center">
          <span className="mr-2 text-sm">Go to page:</span>
          <Input
            type="number"
            className="max-w-[100px]"
            value={page}
            onChange={handleInputChange}
            min={1}
            max={pageCount}
            aria-label="go to page"
          />
        </div>
      )}
    </div>
  );
};
