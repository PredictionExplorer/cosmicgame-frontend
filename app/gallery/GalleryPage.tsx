'use client';

import Image from 'next/image';
import { useMemo, useState, useCallback, useRef } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Sparkles } from 'lucide-react';

import { PageHeader } from '@/components/layout/PageHeader';
import { PageShell } from '@/components/ui/page-shell';
import { SectionEyebrow } from '@/components/ui/section-eyebrow';
import { Surface } from '@/components/ui/surface';
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

  const initialView = (searchParams.get('view') as ViewMode) || 'grid';
  const initialPerPage = parseInt(searchParams.get('perPage') ?? '12') || 12;

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<number[] | null>(null);
  const [filter, setFilter] = useState<FilterKey>('all');
  const [sort, setSort] = useState<SortKey>('newest');
  const [viewMode, setViewMode] = useState<ViewMode>(initialView);
  const [perPage, setPerPage] = useState(initialPerPage);
  const isSearching = useRef(false);

  // Derive current page from URL — the URL is the source of truth so
  // back/forward, deeplinks, and reset-to-1 (set page=undefined) all just
  // work without a separate useState + sync useEffect.
  const currentPage = useMemo(() => parseInt(searchParams.get('page') ?? '1') || 1, [searchParams]);

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
      case 'cycle-desc':
        return list.sort((a, b) => (b.RoundNum ?? 0) - (a.RoundNum ?? 0));
      case 'cycle-asc':
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

  const handleSearchChange = useCallback(
    (query: string) => {
      setSearchQuery(query);
      setSearchResults(null);
      if (!query) {
        updateUrl({ page: '' });
      }
    },
    [updateUrl],
  );

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
      updateUrl({ page: '' });
    },
    [updateUrl],
  );

  const handleFilterChange = useCallback(
    (f: FilterKey) => {
      setFilter(f);
      updateUrl({ page: '' });
    },
    [updateUrl],
  );

  const handleSortChange = useCallback(
    (s: SortKey) => {
      setSort(s);
      updateUrl({ page: '' });
    },
    [updateUrl],
  );

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
      updateUrl({ perPage: pp === 12 ? '' : String(pp), page: '' });
    },
    [updateUrl],
  );

  return (
    <PageShell variant="data" backdrop="signature">
      <PageHeader
        align="left"
        eyebrow={
          <SectionEyebrow tone="aurora" pulse>
            Collection · {stats.total > 0 ? `${stats.total} NFTs Imprinted` : 'Live'}
          </SectionEyebrow>
        }
        title="NFT Gallery"
        gradientTitle="signature"
        subtitle="Explore the complete Cosmic Signature NFT collection imprinted across every cycle"
      />

      <Surface
        variant="nebula"
        radius="xl"
        padding="none"
        className="mb-10 grid gap-6 p-5 sm:p-6 lg:grid-cols-[1fr_360px] lg:items-center"
      >
        <div className="relative z-[1] max-w-3xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-white/70">
            <Sparkles className="h-3.5 w-3.5 text-[rgb(var(--aurora-cyan-rgb))]" />
            Generative archive
          </div>
          <p className="type-body-md text-muted-foreground">
            Each Cosmic Signature NFT is a unique piece of generative art derived from an on-chain
            seed via three-body-problem physics simulations. Up to twelve new NFTs are imprinted
            every cycle &mdash; one for the Final Gesture and eleven for Stellar Selection
            recipients.
          </p>
        </div>
        <div className="relative min-h-[220px] overflow-hidden rounded-[var(--radius-surface)] border border-white/[0.10] bg-black/30">
          <Image
            src="/images/CosmicSignatureNFT.png"
            alt=""
            fill
            className="object-cover opacity-90 saturate-125"
            sizes="(max-width: 1024px) 100vw, 360px"
          />
          <div
            aria-hidden
            className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,transparent_0%,rgb(13_5_33/0.18)_58%,rgb(13_5_33/0.64)_100%)]"
          />
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between rounded-lg border border-white/10 bg-black/45 px-3 py-2 text-xs text-white/70 backdrop-blur">
            <span className="font-mono uppercase tracking-[0.2em]">Preview</span>
            <span>Three-body imprint</span>
          </div>
        </div>
      </Surface>

      <GalleryHero stats={stats} loading={isLoading} />

      <Surface
        variant="glass-bordered"
        radius="md"
        padding="md"
        className="sticky top-20 z-10 mb-6 backdrop-blur-md"
      >
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
      </Surface>

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
    </PageShell>
  );
};

export default GalleryPage;
