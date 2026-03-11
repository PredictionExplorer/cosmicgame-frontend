import { useState, useEffect, type ChangeEvent, type KeyboardEvent } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import Link from 'next/link';

import { getAssetsUrl } from '@/utils';

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationEllipsis,
} from '@/components/ui/pagination';
import {
  SearchBox,
  SearchField,
  SearchButton,
  StyledCard,
  NFTInfoWrapper,
} from '@/components/styled';
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
      <SearchBox>
        <SearchField
          placeholder="Enter NFT ID or Name"
          value={searchKey}
          onChange={handleSearchChange}
          onKeyDown={handleSearchKeyDown}
        />
        <SearchButton type="submit" onClick={handleSearch}>
          Search
        </SearchButton>
      </SearchBox>

      {loading ? (
        <p className="text-lg font-medium text-center text-foreground">Loading...</p>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {collection.length === 0 ? (
              <div>
                <StyledCard>
                  <div className="cursor-pointer">
                    <Link href="/detail/sample" className="block">
                      <NFTImage src={getAssetsUrl('cosmicsignature/sample.png')} alt="Sample NFT" />
                    </Link>
                    <NFTInfoWrapper className="w-[calc(100%-40px)]">
                      <p className="text-base text-white text-center">Sample NFT</p>
                    </NFTInfoWrapper>
                  </div>
                </StyledCard>
              </div>
            ) : (
              visibleNFTs.map((nft) => (
                <div key={nft.TokenId}>
                  <NFT
                    nft={{
                      TokenId: String(nft.TokenId),
                      Seed: String(nft.Seed ?? ''),
                      TokenName: nft.TokenName ?? '',
                    }}
                  />
                </div>
              ))
            )}
          </div>

          {collection.length > perPage && (
            <div className="flex justify-center mt-8">
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
