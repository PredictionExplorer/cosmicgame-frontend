'use client';

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationEllipsis,
  PaginationPrevious,
  PaginationNext,
} from '@/components/ui/pagination';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface GalleryPaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  perPage: number;
  onPageChange: (page: number) => void;
  onPerPageChange: (perPage: number) => void;
}

function getPaginationRange(current: number, total: number): (number | 'ellipsis')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | 'ellipsis')[] = [1];
  if (current > 3) pages.push('ellipsis');
  for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
    pages.push(i);
  }
  if (current < total - 2) pages.push('ellipsis');
  if (total > 1) pages.push(total);
  return pages;
}

const perPageOptions = [12, 24, 48];

export function GalleryPagination({
  currentPage,
  totalPages,
  totalItems,
  perPage,
  onPageChange,
  onPerPageChange,
}: GalleryPaginationProps) {
  if (totalItems === 0) return null;

  const startItem = (currentPage - 1) * perPage + 1;
  const endItem = Math.min(currentPage * perPage, totalItems);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-10">
      <p className="text-xs text-muted-foreground order-2 sm:order-1">
        Showing <span className="font-medium text-foreground">{startItem.toLocaleString()}</span>
        {' - '}
        <span className="font-medium text-foreground">{endItem.toLocaleString()}</span>
        {' of '}
        <span className="font-medium text-foreground">{totalItems.toLocaleString()}</span>
        {' NFTs'}
      </p>

      {totalPages > 1 && (
        <div className="order-1 sm:order-2">
          <Pagination>
            <PaginationContent>
              {currentPage > 1 && (
                <PaginationItem>
                  <PaginationPrevious onClick={() => onPageChange(currentPage - 1)} />
                </PaginationItem>
              )}
              {getPaginationRange(currentPage, totalPages).map((item, idx) =>
                item === 'ellipsis' ? (
                  <PaginationItem key={`ellipsis-${idx}`}>
                    <PaginationEllipsis />
                  </PaginationItem>
                ) : (
                  <PaginationItem key={item}>
                    <PaginationLink
                      isActive={item === currentPage}
                      onClick={() => onPageChange(item)}
                    >
                      {item}
                    </PaginationLink>
                  </PaginationItem>
                ),
              )}
              {currentPage < totalPages && (
                <PaginationItem>
                  <PaginationNext onClick={() => onPageChange(currentPage + 1)} />
                </PaginationItem>
              )}
            </PaginationContent>
          </Pagination>
        </div>
      )}

      <TooltipProvider delayDuration={300}>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="order-3 flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Per page</span>
              <Select value={String(perPage)} onValueChange={(v) => onPerPageChange(Number(v))}>
                <SelectTrigger
                  className="w-[70px] h-8 text-xs border-white/[0.06] bg-white/[0.03]"
                  aria-label="Items per page"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {perPageOptions.map((opt) => (
                    <SelectItem key={opt} value={String(opt)}>
                      {opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>Number of NFTs displayed per page</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
