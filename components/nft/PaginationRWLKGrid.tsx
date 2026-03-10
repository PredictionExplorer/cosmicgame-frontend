import { useState, useEffect, type FC, type ChangeEvent } from 'react';
import Image from 'next/image';

import { Input } from '@/components/ui/input';
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
  data: number[];
  selectedToken?: number;
  setSelectedToken?: (tokenId: number) => void;
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

const PaginationRWLKGrid: FC<PaginationRWLKGridProps> = ({
  loading,
  data,
  selectedToken = -1,
  setSelectedToken = null,
}) => {
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
    <div className="mt-8">
      {/* Search Input */}
      <div className="relative mb-4">
        <Input
          placeholder="Enter NFT ID"
          className="pr-10"
          onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchId(e.target.value)}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <Image src="/images/search.svg" width={19} height={19} alt="search icon" />
        </div>
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
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
            {paginatedItems.map((tokenId) => (
              <div
                key={tokenId}
                onClick={() => handleCardClick(tokenId)}
                className="cursor-pointer"
              >
                <RandomWalkNFT tokenId={tokenId} selected={tokenId === selectedToken} />
              </div>
            ))}
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

      {/* Empty State */}
      {!loading && data.length === 0 && (
        <p className="text-base text-center text-foreground">Nothing Found!</p>
      )}
    </div>
  );
};

export default PaginationRWLKGrid;
