import { useState, useEffect, type ChangeEvent, type KeyboardEvent } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Search } from 'lucide-react';

import { getAssetsUrl } from '@/utils';


import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationEllipsis,
} from '@/components/ui/pagination';
import { Spinner } from '@/components/ui/spinner';
import { EmptyState } from '@/components/ui/empty-state';
import { StyledCard, NFTInfoWrapper } from '@/components/styled';
import api from '@/services/api';
import type { CSTTokenInfo } from '@/services/api';

import NFTImage from './NFTImage';
import NFT from './NFT';

interface PaginationGridProps {
  data: CSTTokenInfo[];
  loading: boolean;
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

const PaginationGrid = ({ data, loading }: PaginationGridProps) => {
  const [searchKey, setSearchKey] = useState('');
  const [collection, setCollection] = useState<CSTTokenInfo[]>([]);
  const [perPage] = useState(12);
  const [curPage, setCurPage] = useState(1);

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleNextPage = (page: number) => {
    router.push(pathname + '?page=' + page);
  };

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setSearchKey(value);
    if (!value) {
      setCollection(data);
    }
  };

  const handleSearchKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const isNumeric = (value: string) => {
    return /^\d+$/.test(value);
  };

  const handleSearch = async () => {
    if (searchKey === '') return;

    let filtered = [];

    if (isNumeric(searchKey)) {
      filtered = data.filter((nft) => nft.TokenId === Number(searchKey));
    } else {
      const res = await api.get_token_by_name(searchKey);
      const filteredIds = res.map((o: { TokenId: number }) => o.TokenId);
      filtered = data.filter((nft) => filteredIds.includes(nft.TokenId));
    }

    setCollection(filtered);
    router.push(pathname);
  };

  useEffect(() => {
    const page = parseInt(searchParams.get('page') ?? '1') || 1;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCurPage(page);
  }, [searchParams]);

  useEffect(() => {
    if (data && data.length > 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCollection(data);
    }
  }, [data]);

  const startIndex = (curPage - 1) * perPage;
  const endIndex = curPage * perPage;
  const visibleNFTs = collection.slice(startIndex, endIndex);
  const totalPages = Math.ceil(collection.length / perPage);

  return (
    <div className="mt-8">
      {/* Search */}
      <div className="flex items-center gap-2 mb-8 max-w-lg mx-auto">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
          <input
            placeholder="Search by token ID or name..."
            value={searchKey}
            onChange={handleSearchChange}
            onKeyDown={handleSearchKeyDown}
            className="w-full h-10 rounded-lg border border-white/[0.06] bg-white/[0.03] pl-9 pr-3 text-sm ring-offset-background placeholder:text-muted-foreground/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-colors"
          />
        </div>
        <button
          type="button"
          onClick={handleSearch}
          className="h-10 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
        >
          Search
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {collection.length === 0 ? (
              <div className="col-span-full">
                <EmptyState
                  title="No NFTs found"
                  description="Try a different search or check out the sample NFT."
                  action={
                    <Link href="/detail/sample" className="text-sm text-primary hover:underline">
                      View Sample NFT
                    </Link>
                  }
                />
              </div>
            ) : (
              visibleNFTs.map((nft) => (
                <NFT
                  key={nft.TokenId}
                  nft={{
                    TokenId: String(nft.TokenId),
                    Seed: String(nft.Seed ?? ''),
                    TokenName: nft.TokenName ?? '',
                  }}
                />
              ))
            )}
          </div>

          {collection.length > perPage && (
            <div className="flex justify-center mt-10">
              <Pagination>
                <PaginationContent>
                  {getPaginationRange(curPage, totalPages).map((item, idx) =>
                    item === 'ellipsis' ? (
                      <PaginationItem key={`ellipsis-${idx}`}>
                        <PaginationEllipsis />
                      </PaginationItem>
                    ) : (
                      <PaginationItem key={item}>
                        <PaginationLink
                          isActive={item === curPage}
                          onClick={() => handleNextPage(item)}
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
    </div>
  );
};

export default PaginationGrid;
