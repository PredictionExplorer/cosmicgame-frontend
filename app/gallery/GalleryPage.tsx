'use client';

import { useMemo, useState, useCallback, useEffect, useRef } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

import { MainWrapper } from '@/components/styled';
import { PageHeader } from '@/components/layout/PageHeader';
import { useCSTList } from '@/hooks/useApiQuery';
import api from '@/services/api';

import { GalleryHero, type GalleryStats } from './components/GalleryHero';
import { GalleryToolbar } from './components/GalleryToolbar';
import { GalleryGrid } from './components/GalleryGrid';
import type { FilterKey } from './components/GalleryFilterChips';
import type { SortKey } from './components/GallerySortSelect';
import type { ViewMode } from './components/GalleryViewToggle';
import type { GalleryNFTData } from './components/GalleryNFTCard';

function isNumeric(value: string) {
  return /^\d+$/.test(value);
}

const GalleryPage = () => {
  const { data: nfts, isLoading } = useCSTList();

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const initialPage = parseInt(searchParams.get('page') ?? '1') || 1;
  const initialView = (searchParams.get('view') as ViewMode) || 'grid';
  const initialPerPage = parseInt(searchParams.get('perPage') ?? '12') || 12;

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<number[] | null>(null);
  const [filter, setFilter] = useState<FilterKey>('all');
  const [sort, setSort] = useState<SortKey>('newest');
  const [viewMode, setViewMode] = useState<ViewMode>(initialView);
  const [perPage, setPerPage] = useState(initialPerPage);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const isSearching = useRef(false);

  useEffect(() => {
    const page = parseInt(searchParams.get('page') ?? '1') || 1;
    setCurrentPage(page);
  }, [searchParams]);

  const updateUrl = useCallback(
    (params: Record<string, string>) => {
      const sp = new URLSearchParams(searchParams.toString());
      for (const [key, val] of Object.entries(params)) {
        if (val === '' || val === undefined) sp.delete(key);
        else sp.set(key, val);
      }
      const qs = sp.toString();
      router.push(pathname + (qs ? `?${qs}` : ''));
    },
    [router, pathname, searchParams],
  );

  const stats: GalleryStats = useMemo(() => {
    const list = nfts ?? [];
    return {
      total: list.length,
      staked: list.filter((n) => n.Staked).length,
      named: list.filter((n) => n.TokenName && n.TokenName !== '').length,
      rounds: new Set(list.map((n) => n.RoundNum).filter(Boolean)).size,
    };
  }, [nfts]);

  const sorted = useMemo(() => {
    const list = [...(nfts ?? [])];
    switch (sort) {
      case 'newest':
        return list.sort((a, b) => Number(b.TokenId) - Number(a.TokenId));
      case 'oldest':
        return list.sort((a, b) => Number(a.TokenId) - Number(b.TokenId));
      case 'round-desc':
        return list.sort((a, b) => (b.RoundNum ?? 0) - (a.RoundNum ?? 0));
      case 'round-asc':
        return list.sort((a, b) => (a.RoundNum ?? 0) - (b.RoundNum ?? 0));
      default:
        return list;
    }
  }, [nfts, sort]);

  const filtered = useMemo(() => {
    let list = sorted;
    if (filter === 'staked') list = list.filter((n) => n.Staked);
    if (filter === 'named') list = list.filter((n) => n.TokenName && n.TokenName !== '');
    return list;
  }, [sorted, filter]);

  const searched = useMemo(() => {
    if (!searchQuery) return filtered;
    if (isNumeric(searchQuery)) {
      return filtered.filter((n) => n.TokenId === Number(searchQuery));
    }
    if (searchResults) {
      return filtered.filter((n) => searchResults.includes(n.TokenId));
    }
    return filtered;
  }, [filtered, searchQuery, searchResults]);

  const startIndex = (currentPage - 1) * perPage;
  const visibleItems: GalleryNFTData[] = searched.slice(startIndex, startIndex + perPage);

  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
    setSearchResults(null);
    if (!query) {
      setCurrentPage(1);
    }
  }, []);

  const handleSearchSubmit = useCallback(
    async (query: string) => {
      if (!query) return;
      setSearchQuery(query);

      if (isNumeric(query)) {
        setSearchResults(null);
      } else {
        if (isSearching.current) return;
        isSearching.current = true;
        try {
          const res = await api.get_token_by_name(query);
          setSearchResults(res.map((o: { TokenId: number }) => o.TokenId));
        } finally {
          isSearching.current = false;
        }
      }
      setCurrentPage(1);
      updateUrl({ page: '' });
    },
    [updateUrl],
  );

  const handleFilterChange = useCallback((f: FilterKey) => {
    setFilter(f);
    setCurrentPage(1);
  }, []);

  const handleSortChange = useCallback((s: SortKey) => {
    setSort(s);
    setCurrentPage(1);
  }, []);

  const handleViewModeChange = useCallback(
    (mode: ViewMode) => {
      setViewMode(mode);
      updateUrl({ view: mode === 'grid' ? '' : mode });
    },
    [updateUrl],
  );

  const handlePageChange = useCallback(
    (page: number) => {
      updateUrl({ page: page === 1 ? '' : String(page) });
    },
    [updateUrl],
  );

  const handlePerPageChange = useCallback(
    (pp: number) => {
      setPerPage(pp);
      setCurrentPage(1);
      updateUrl({ perPage: pp === 12 ? '' : String(pp), page: '' });
    },
    [updateUrl],
  );

  return (
    <MainWrapper>
      <PageHeader
        title="NFT Gallery"
        subtitle="Explore the complete COSMIC NFT collection minted across every round"
      />

      <p className="text-sm text-muted-foreground leading-relaxed mb-8 max-w-3xl">
        Each COSMIC NFT is a unique piece of generative art created from an on-chain
        random seed using three-body problem physics simulations. Twelve new NFTs are minted every
        round — one for the main prize winner and eleven for raffle winners. Browse, search, and
        filter the entire collection below.
      </p>

      <GalleryHero stats={stats} loading={isLoading} />

      <GalleryToolbar
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        onSearchSubmit={handleSearchSubmit}
        filter={filter}
        onFilterChange={handleFilterChange}
        sort={sort}
        onSortChange={handleSortChange}
        viewMode={viewMode}
        onViewModeChange={handleViewModeChange}
        resultCount={searchQuery ? searched.length : undefined}
        totalCount={searchQuery ? filtered.length : undefined}
      />

      <GalleryGrid
        items={visibleItems}
        totalItems={searched.length}
        loading={isLoading}
        viewMode={viewMode}
        currentPage={currentPage}
        perPage={perPage}
        onPageChange={handlePageChange}
        onPerPageChange={handlePerPageChange}
      />
    </MainWrapper>
  );
};

export default GalleryPage;
