import { useMemo, useState, type FC, type ChangeEvent } from 'react';
import { Search } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { formatId } from '@/utils';

import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationEllipsis,
} from '@/components/ui/pagination';

import RandomWalkNFT from './RandomWalkNFT';

interface PaginationRWLKGridProps {
  loading: boolean;
  /** Dense, container-aware artwork choices inside the wide gesture workspace. */
  compact?: boolean;
  data: number[];
  selectedToken?: number;
  setSelectedToken?: (tokenId: number) => void;
  /**
   * Id of the visible heading that names the picker. Without it the group is
   * labelled "Your Random Walk NFTs".
   */
  labelledBy?: string;
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

/**
 * The RandomWalk NFT picker of the ETH + RandomWalk gesture: a searchable,
 * paginated grid where each token is a toggle button (`aria-pressed`), so the
 * reduced-cost method can be completed with a keyboard or screen reader.
 */
const PaginationRWLKGrid: FC<PaginationRWLKGridProps> = ({
  loading,
  compact = false,
  data,
  selectedToken = -1,
  setSelectedToken = null,
  labelledBy,
}) => {
  const t = useTranslations('home');
  const [itemsPerPage] = useState<number>(6);
  const [requestedPage, setCurrentPage] = useState<number>(1);
  const [searchId, setSearchId] = useState<string>('');
  const filteredData = useMemo(
    () => data.filter((id) => searchId === '' || id === Number(searchId)),
    [data, searchId],
  );

  const handleCardClick = (tokenId: number) => {
    if (setSelectedToken) {
      const isAlreadySelected = tokenId === selectedToken;
      setSelectedToken(isAlreadySelected ? -1 : tokenId);
    }
  };

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  // A shorter list (a search, a used NFT) never leaves the page past its end.
  const currentPage = Math.min(requestedPage, Math.max(1, totalPages));
  const paginatedItems = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  // Nothing to search until the wallet's NFTs are read, and nothing to
  // search when it holds none: then one sentence says so.
  if (loading) {
    return (
      <div
        role="status"
        className={cn('flex items-center gap-2', compact ? 'mt-3' : 'mt-8')}
        data-testid="rwlk-loading"
      >
        <Spinner className="size-4" aria-hidden />
        <span className="type-caption text-subtle">{t('rwlkGrid.loading')}</span>
      </div>
    );
  }
  if (data.length === 0) {
    return (
      <p
        data-testid="rwlk-none"
        className={cn('type-caption text-subtle', compact ? 'mt-1' : 'mt-8')}
      >
        {t('rwlkGrid.none')}
      </p>
    );
  }

  return (
    <div className={cn('@container/rwlk', compact ? 'mt-3' : 'mt-8')}>
      {/* Search */}
      <div className="relative mb-4">
        <Input
          type="search"
          inputMode="numeric"
          aria-label={t('rwlkGrid.searchAria')}
          placeholder={t('rwlkGrid.searchPlaceholder')}
          className="pr-10"
          onChange={(e: ChangeEvent<HTMLInputElement>) => {
            setSearchId(e.target.value);
            setCurrentPage(1);
          }}
        />
        <Search
          aria-hidden
          className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-subtle"
        />
      </div>

      {/* Grid + Pagination */}
      {filteredData.length > 0 && (
        <>
          <div
            role="group"
            aria-labelledby={labelledBy}
            aria-label={labelledBy ? undefined : t('form.rwlk.title')}
            className={cn(
              'grid grid-cols-2',
              compact
                ? 'gap-3 @min-[30rem]/rwlk:grid-cols-3 @min-[48rem]/rwlk:grid-cols-4 @min-[64rem]/rwlk:grid-cols-6'
                : 'gap-8 md:grid-cols-3',
            )}
          >
            {paginatedItems.map((tokenId) => {
              const selected = tokenId === selectedToken;
              const card = <RandomWalkNFT tokenId={tokenId} selected={selected} decorative />;
              return setSelectedToken ? (
                <button
                  key={tokenId}
                  type="button"
                  aria-pressed={selected}
                  aria-label={t('rwlkGrid.tokenAria', { id: formatId(tokenId) })}
                  onClick={() => handleCardClick(tokenId)}
                  className="block w-full cursor-pointer rounded-lg text-left"
                  data-testid="rwlk-option"
                >
                  {card}
                </button>
              ) : (
                <div key={tokenId}>{card}</div>
              );
            })}
          </div>

          {totalPages > 1 && (
            <div className="mt-6">
              <Pagination>
                <PaginationContent>
                  {getPaginationRange(currentPage, totalPages).map((item, idx) =>
                    item === 'ellipsis' ? (
                      <PaginationItem key={`ellipsis-${idx}`}>
                        <PaginationEllipsis />
                      </PaginationItem>
                    ) : (
                      <PaginationItem key={item}>
                        <PaginationLink
                          isActive={item === currentPage}
                          onClick={() => setCurrentPage(item)}
                        >
                          {item}
                        </PaginationLink>
                      </PaginationItem>
                    ),
                  )}
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </>
      )}

      {/* No NFT matches the search. */}
      {filteredData.length === 0 && (
        <p role="status" className="type-body-sm text-center text-muted-foreground">
          {t('rwlkGrid.empty')}
        </p>
      )}
    </div>
  );
};

export default PaginationRWLKGrid;
