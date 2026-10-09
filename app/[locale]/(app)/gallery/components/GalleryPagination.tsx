'use client';

import { useId } from 'react';
import { useLocale, useTranslations } from 'next-intl';

import { formatCount } from '@/utils/format';
import { TablePagination } from '@/components/ui/pagination';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { PER_PAGE_OPTIONS, type PerPage } from '../galleryQuery';

interface GalleryPaginationProps {
  page: number;
  perPage: PerPage;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPerPageChange: (perPage: PerPage) => void;
}

function toPerPage(value: string): PerPage | null {
  const numeric = Number(value);
  return (PER_PAGE_OPTIONS as readonly number[]).includes(numeric) ? (numeric as PerPage) : null;
}

/**
 * The foot of the grid: the range ("1–24 of 48"), Previous and Next with the
 * page numbers (the ledger pagination), and how many Signatures a page holds.
 */
export function GalleryPagination({
  page,
  perPage,
  totalItems,
  onPageChange,
  onPerPageChange,
}: GalleryPaginationProps) {
  const t = useTranslations('gallery');
  const locale = useLocale();
  const labelId = useId();

  const paged = totalItems > perPage;
  const showPerPage = totalItems > PER_PAGE_OPTIONS[0];
  if (!paged && !showPerPage) return null;

  return (
    <div
      className="mt-12 flex flex-wrap items-center justify-between gap-x-6 gap-y-4 border-t border-rule-faint pt-5"
      data-testid="gallery-pagination"
    >
      <TablePagination
        page={page}
        pageSize={perPage}
        total={totalItems}
        onPageChange={onPageChange}
        className="mt-0 min-w-0 flex-1 sm:pl-0"
      />
      {showPerPage ? (
        <div className="ms-auto flex items-center gap-2">
          <span id={labelId} className="type-label text-subtle">
            {t('pagination.perPage')}
          </span>
          <Select
            value={String(perPage)}
            onValueChange={(value) => {
              const next = toPerPage(value);
              if (next !== null) onPerPageChange(next);
            }}
          >
            <SelectTrigger aria-labelledby={labelId} className="w-auto min-w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent align="end">
              {PER_PAGE_OPTIONS.map((option) => (
                <SelectItem key={option} value={String(option)}>
                  {formatCount(option, locale)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ) : null}
    </div>
  );
}
