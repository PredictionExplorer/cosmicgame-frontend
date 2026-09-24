import { useState, useEffect, type FC, type ChangeEvent } from 'react';
import { ArrowRight, Search } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { formatId } from '@/utils';

import { Link } from '@/i18n/navigation';
import { Input } from '@/components/ui/input';
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
  const [filteredData, setFilteredData] = useState<number[]>([]);
  const [itemsPerPage] = useState<number>(6);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [searchId, setSearchId] = useState<string>('');

  const handleCardClick = (tokenId: number) => {
    if (setSelectedToken) {
      const isAlreadySelected = tokenId === selectedToken;
      setSelectedToken(isAlreadySelected ? -1 : tokenId);
    }
  };

  useEffect(() => {
    const filtered = data.filter((id) => searchId === '' || id === Number(searchId));
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFilteredData(filtered);
    setCurrentPage(1);
  }, [data, searchId]);

  const paginatedItems = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

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
          onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchId(e.target.value)}
        />
        <Search
          aria-hidden
          className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-subtle"
        />
      </div>

      {/* Loading Spinner */}
      {loading && (
        <div className="flex justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-secondary border-t-transparent" />
        </div>
      )}

      {/* Grid + Pagination */}
      {!loading && filteredData.length > 0 && (
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

      {/* The wallet has no unused Random Walk NFT: say so, and where to get one. */}
      {!loading && data.length === 0 && (
        <div data-testid="rwlk-grid-empty" className="py-4 text-center">
          <p className="type-body-sm text-muted-foreground">{t('rwlkGrid.empty')}</p>
          <Link
            href="/imprint"
            className="link mt-2 inline-flex min-h-6 items-center gap-1 type-body-sm"
          >
            {t('rwlkGrid.imprint')}
            <ArrowRight aria-hidden className="size-3.5" />
          </Link>
        </div>
      )}
    </div>
  );
};

export default PaginationRWLKGrid;
