'use client';

import type { ReactNode } from 'react';
import { useMemo, useState, useCallback, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { Sparkles } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { formatId, getAssetsUrl, getWebImageUrl } from '@/utils';

import { useCollectionTraits } from '@/hooks/useNftTraits';
import type { CategoricalTraitKey } from '@/lib/nftMetadata';
import { useRouter, usePathname } from '@/i18n/navigation';
import { Link } from '@/i18n/navigation';
import { PageHeader } from '@/components/layout/PageHeader';
import { NftMarketplaceButton } from '@/components/common/NftMarketplaceButton';
import { ErrorState } from '@/components/ui/error-state';
import { PageShell } from '@/components/ui/page-shell';
import { SectionEyebrow } from '@/components/ui/section-eyebrow';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Surface } from '@/components/ui/surface';
import NFTImage from '@/components/nft/NFTImage';
import { NftQuickView } from '@/components/nft/NftQuickView';
import {
  AllocationPill,
  HueStrip,
  RarityRankChip,
  SpectralClassBadge,
  TraitPill,
} from '@/components/nft/traits';
import { useCSTList } from '@/hooks/useApiQuery';
import api from '@/services/api';

import { GalleryActiveFilters } from './components/GalleryActiveFilters';
import { GalleryCollectionDna } from './components/GalleryCollectionDna';
import { GalleryHero, type GalleryStats } from './components/GalleryHero';
import { GalleryToolbar } from './components/GalleryToolbar';
import { GalleryGrid } from './components/GalleryGrid';
import { GalleryTraitFacets } from './components/GalleryTraitFacets';
import type { FilterKey } from './components/GalleryFilterChips';
import { isSortKey, TRAIT_SORT_KEYS, type SortKey } from './components/GallerySortSelect';
import type { ViewMode } from './components/GalleryViewToggle';
import type { GalleryNFTData } from './components/GalleryNFTCard';
import {
  CHAOS_PARAM,
  countActiveTraitFilters,
  matchesTraitFilters,
  parseChaosRange,
  parseTraitFilters,
  serializeChaosRange,
  serializeTraitValues,
  toggleTraitValue,
  type ChaosRange,
  type TraitFilterState,
} from './traitFilters';

function isNumeric(value: string) {
  return /^\d+$/.test(value);
}

/** Viewport at which the trait facets live in a sidebar instead of a sheet. */
const RAIL_MEDIA_QUERY = '(min-width: 1024px)';

const GalleryPage = ({ seoSummary }: { seoSummary?: ReactNode }) => {
  const t = useTranslations('gallery');
  const tTraits = useTranslations('traits');
  const { data: nfts, isLoading, isError, refetch } = useCSTList();
  const {
    traits: collectionTraits,
    isLoading: traitsLoading,
    isError: traitsError,
    refetch: refetchTraits,
  } = useCollectionTraits();

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const initialView = (searchParams.get('view') as ViewMode) || 'grid';
  const initialPerPage = parseInt(searchParams.get('perPage') ?? '12') || 12;

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<number[] | null>(null);
  const [filter, setFilter] = useState<FilterKey>('all');
  const [viewMode, setViewMode] = useState<ViewMode>(initialView);
  const [perPage, setPerPage] = useState(initialPerPage);
  const [railOpen, setRailOpen] = useState(true);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [quickViewId, setQuickViewId] = useState<number | null>(null);
  const isSearching = useRef(false);

  // Derive page, sort, and trait filters from the URL — the URL is the source
  // of truth so back/forward, deeplinks, shareable filtered views, and
  // reset-to-1 (set page=undefined) all just work without extra state.
  const currentPage = useMemo(() => parseInt(searchParams.get('page') ?? '1') || 1, [searchParams]);
  const sort: SortKey = useMemo(() => {
    const requested = searchParams.get('sort');
    return isSortKey(requested) ? requested : 'newest';
  }, [searchParams]);
  const traitFilters: TraitFilterState = useMemo(
    () => parseTraitFilters(new URLSearchParams(searchParams.toString())),
    [searchParams],
  );
  const chaosRange: ChaosRange | null = useMemo(
    () => parseChaosRange(new URLSearchParams(searchParams.toString())),
    [searchParams],
  );
  const activeTraitFilterCount = countActiveTraitFilters(traitFilters, chaosRange);

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

  // Trait-index state for the UI: undefined while loading, null when it failed.
  const traitsForUi = traitsError ? null : traitsLoading ? undefined : (collectionTraits ?? null);
  const traitSortsAvailable = traitsForUi !== null;

  const stats: GalleryStats = useMemo(() => {
    const list = nfts ?? [];
    return {
      total: list.length,
      staked: list.filter((n) => n.Staked).length,
      named: list.filter((n) => n.TokenName && n.TokenName !== '').length,
      // Cycle 0 is a real cycle: filter on presence, not truthiness.
      rounds: new Set(list.map((n) => n.RoundNum).filter((round) => round != null)).size,
    };
  }, [nfts]);

  const sorted = useMemo(() => {
    const list = [...(nfts ?? [])];
    const byId = collectionTraits?.byId;
    const rarity = collectionTraits?.rarity.byId;
    const newestFirst = (a: GalleryNFTData, b: GalleryNFTData) =>
      Number(b.TokenId) - Number(a.TokenId);
    const numericDesc =
      (pick: (id: number) => number | undefined) => (a: GalleryNFTData, b: GalleryNFTData) => {
        const av = pick(a.TokenId);
        const bv = pick(b.TokenId);
        if (av === undefined && bv === undefined) return newestFirst(a, b);
        if (av === undefined) return 1;
        if (bv === undefined) return -1;
        return bv - av || newestFirst(a, b);
      };
    switch (sort) {
      case 'newest':
        return list.sort(newestFirst);
      case 'oldest':
        return list.sort((a, b) => Number(a.TokenId) - Number(b.TokenId));
      case 'cycle-desc':
        return list.sort((a, b) => (b.RoundNum ?? 0) - (a.RoundNum ?? 0));
      case 'cycle-asc':
        return list.sort((a, b) => (a.RoundNum ?? 0) - (b.RoundNum ?? 0));
      case 'rarity':
        // Rank 1 is rarest, so invert it into a "higher is better" score.
        return list.sort(
          numericDesc((id) => {
            const rank = rarity?.get(id)?.rank;
            return rank === undefined ? undefined : -rank;
          }),
        );
      case 'chaos-desc':
        return list.sort(numericDesc((id) => byId?.get(id)?.chaos));
      case 'chaos-asc':
        return list.sort(
          numericDesc((id) => {
            const chaos = byId?.get(id)?.chaos;
            return chaos === undefined ? undefined : -chaos;
          }),
        );
      case 'syzygies-desc':
        return list.sort(numericDesc((id) => byId?.get(id)?.syzygies));
      default:
        return list;
    }
  }, [nfts, sort, collectionTraits]);

  const filtered = useMemo(() => {
    let list = sorted;
    if (filter === 'staked') list = list.filter((n) => n.Staked);
    if (filter === 'named') list = list.filter((n) => n.TokenName && n.TokenName !== '');
    if (activeTraitFilterCount > 0) {
      list = list.filter((n) =>
        matchesTraitFilters(collectionTraits?.byId.get(n.TokenId), traitFilters, chaosRange),
      );
    }
    return list;
  }, [sorted, filter, activeTraitFilterCount, collectionTraits, traitFilters, chaosRange]);

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
  const featuredNft = useMemo(
    () => sorted.find((n) => n.Seed != null && String(n.Seed) !== ''),
    [sorted],
  );
  const featuredImage = featuredNft ? getWebImageUrl(featuredNft.Seed!) : null;
  const featuredEntry = featuredNft ? collectionTraits?.byId.get(featuredNft.TokenId) : undefined;
  const featuredRarity = featuredNft
    ? collectionTraits?.rarity.byId.get(featuredNft.TokenId)
    : undefined;

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
      updateUrl({ sort: s === 'newest' ? '' : s, page: '' });
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

  const handleToggleTrait = useCallback(
    (key: CategoricalTraitKey, value: string) => {
      const next = toggleTraitValue(traitFilters, key, value);
      updateUrl({ [key]: serializeTraitValues(next[key]), page: '' });
    },
    [traitFilters, updateUrl],
  );

  const handleSelectTrait = useCallback(
    (key: CategoricalTraitKey, value: string) => {
      // Selecting from a card or the DNA strip replaces that trait's selection
      // (rather than adding to it): "show me the others like this one".
      const alreadyOnly = traitFilters[key]?.length === 1 && traitFilters[key]?.[0] === value;
      updateUrl({ [key]: alreadyOnly ? '' : value, page: '' });
    },
    [traitFilters, updateUrl],
  );

  const handleClearTraitKey = useCallback(
    (key: CategoricalTraitKey) => updateUrl({ [key]: '', page: '' }),
    [updateUrl],
  );

  const handleChaosChange = useCallback(
    (range: ChaosRange | null) =>
      updateUrl({ [CHAOS_PARAM]: serializeChaosRange(range), page: '' }),
    [updateUrl],
  );

  const handleClearAllTraits = useCallback(() => {
    const cleared: Record<string, string> = { [CHAOS_PARAM]: '', page: '' };
    for (const key of Object.keys(traitFilters)) cleared[key] = '';
    // Trait-based sort orders stay valid without filters; nothing else to reset.
    updateUrl(cleared);
  }, [traitFilters, updateUrl]);

  const handleToggleFacets = useCallback(() => {
    if (typeof window !== 'undefined' && window.matchMedia(RAIL_MEDIA_QUERY).matches) {
      setRailOpen((open) => !open);
    } else {
      setSheetOpen(true);
    }
  }, []);

  const pageHeader = seoSummary ? (
    <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
      <SectionEyebrow tone="aurora" pulse>
        {stats.total > 0
          ? t('page.eyebrowImprinted', { count: stats.total })
          : t('page.eyebrowLive')}
      </SectionEyebrow>
      <NftMarketplaceButton variant="secondary" />
    </div>
  ) : (
    <PageHeader
      align="left"
      eyebrow={
        <SectionEyebrow tone="aurora" pulse>
          {stats.total > 0
            ? t('page.eyebrowImprinted', { count: stats.total })
            : t('page.eyebrowLive')}
        </SectionEyebrow>
      }
      title={t('page.title')}
      titleLevel={2}
      subtitle={t('page.subtitle')}
      actions={<NftMarketplaceButton variant="secondary" />}
    />
  );

  // An empty grid would read as "no Signatures exist yet", which is a very
  // different statement from "the archive could not be read".
  if (isError) {
    return (
      <PageShell variant="data" backdrop="signature">
        {seoSummary}
        {pageHeader}
        <ErrorState
          title={t('error.title')}
          message={t('error.message')}
          headingLevel={3}
          onRetry={() => void refetch()}
          surface
        />
      </PageShell>
    );
  }

  const facets = (
    <GalleryTraitFacets
      collectionTraits={traitsForUi}
      selected={traitFilters}
      chaosRange={chaosRange}
      onToggleValue={handleToggleTrait}
      onClearKey={handleClearTraitKey}
      onChaosChange={handleChaosChange}
      onClearAll={handleClearAllTraits}
      onRetry={() => void refetchTraits()}
      matchCount={searched.length}
    />
  );

  return (
    <PageShell variant="data" backdrop="signature">
      {seoSummary}
      {pageHeader}

      <Surface
        variant="nebula"
        radius="xl"
        padding="none"
        className="mb-10 grid gap-6 p-5 sm:p-6 lg:grid-cols-[1fr_360px] lg:items-center"
      >
        <div className="relative z-[1] max-w-3xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-white/70">
            <Sparkles className="h-3.5 w-3.5 text-[rgb(var(--aurora-cyan-rgb))]" />
            {t('intro.badge')}
          </div>
          <p className="type-body-md text-muted-foreground">{t('intro.description')}</p>
          {featuredEntry?.hasArtTraits ? (
            <div className="mt-5 flex flex-wrap items-center gap-2" data-testid="featured-traits">
              <SpectralClassBadge value={featuredEntry.spectralClass} size="md" withLabel />
              <RarityRankChip
                rarity={featuredRarity}
                total={collectionTraits?.rarity.total ?? 0}
                size="md"
                verbose
              />
              {featuredEntry.structure ? (
                <TraitPill
                  traitKey="structure"
                  value={featuredEntry.structure}
                  interactive
                  onClick={() => handleSelectTrait('structure', featuredEntry.structure!)}
                />
              ) : null}
              {featuredEntry.palette ? (
                <TraitPill
                  traitKey="palette"
                  value={featuredEntry.palette}
                  interactive
                  onClick={() => handleSelectTrait('palette', featuredEntry.palette!)}
                />
              ) : null}
              <AllocationPill value={featuredEntry.allocation} size="md" />
            </div>
          ) : null}
        </div>
        <div className="relative min-h-[220px] overflow-hidden rounded-[var(--radius-surface)] border border-white/[0.10] bg-black/30">
          {featuredNft && featuredImage ? (
            <Link
              href={`/detail/${featuredNft.TokenId}`}
              className="group block h-full min-h-[220px]"
              aria-label={t('featured.viewAria', { id: formatId(featuredNft.TokenId) })}
            >
              <NFTImage
                src={featuredImage}
                fallbackSrc={getAssetsUrl(`cosmicsignature/0x${featuredNft.Seed}.png`)}
                alt={t('featured.alt', { id: formatId(featuredNft.TokenId) })}
                terminalFallbackSrc={null}
                sizes="(max-width: 1024px) 100vw, 360px"
                priority
                className="h-full min-h-[220px] object-cover opacity-90 saturate-125 transition-transform duration-700 group-hover:scale-[1.025]"
              />
            </Link>
          ) : (
            <div className="relative flex min-h-[220px] items-center justify-center">
              <div className="absolute h-40 w-40 rounded-full border border-primary/20" />
              <div className="absolute h-px w-56 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
              <div className="relative z-[1] max-w-[14rem] px-4 text-center text-xs leading-relaxed text-muted-foreground">
                {t('featured.emptyHint')}
              </div>
            </div>
          )}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,transparent_0%,rgb(13_5_33/0.18)_58%,rgb(13_5_33/0.64)_100%)]"
          />
          <HueStrip
            hues={featuredEntry?.hues}
            size="sm"
            className="absolute inset-x-0 top-0 rounded-none opacity-90"
          />
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between rounded-lg border border-white/10 bg-black/45 px-3 py-2 text-xs text-white/70 backdrop-blur">
            <span className="font-mono uppercase tracking-[0.2em]">
              {featuredNft ? t('featured.badgeImprint') : t('featured.badgeArchive')}
            </span>
            <span>
              {featuredNft ? formatId(featuredNft.TokenId) : t('featured.awaitingMetadata')}
            </span>
          </div>
        </div>
      </Surface>

      <GalleryHero stats={stats} loading={isLoading} />

      <GalleryCollectionDna
        collectionTraits={traitsForUi}
        selected={traitFilters}
        onSelect={handleSelectTrait}
        className="mb-8"
      />

      <div
        className={
          railOpen
            ? 'lg:grid lg:grid-cols-[264px_minmax(0,1fr)] lg:items-start lg:gap-8'
            : undefined
        }
      >
        {railOpen ? (
          <aside
            className="hidden lg:block lg:sticky lg:top-[calc(var(--sticky-offset)+0.5rem)] lg:max-h-[calc(100vh-var(--sticky-offset)-1.5rem)] lg:overflow-y-auto"
            aria-label={tTraits('facets.title')}
            data-testid="facets-rail"
          >
            <Surface variant="glass" radius="lg" padding="sm">
              {facets}
            </Surface>
          </aside>
        ) : null}

        <div className="min-w-0">
          <Surface
            variant="glass-bordered"
            radius="md"
            padding="md"
            className="sticky top-[var(--sticky-offset)] z-30 mb-4 backdrop-blur-md"
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
              onToggleFacets={handleToggleFacets}
              facetsOpen={railOpen}
              activeTraitFilterCount={activeTraitFilterCount}
              traitSortsAvailable={traitSortsAvailable || TRAIT_SORT_KEYS.includes(sort)}
            />
          </Surface>

          <GalleryActiveFilters
            selected={traitFilters}
            chaosRange={chaosRange}
            onRemoveValue={handleToggleTrait}
            onClearChaos={() => handleChaosChange(null)}
            onClearAll={handleClearAllTraits}
            className="mb-4"
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
            collectionTraits={traitsForUi}
            onQuickView={setQuickViewId}
          />
        </div>
      </div>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent
          side="left"
          className="w-[88vw] max-w-sm overflow-y-auto border-white/[0.10] bg-[rgb(var(--cosmic-indigo-deep-rgb))] p-4 sm:max-w-sm"
        >
          <SheetHeader className="mb-4 text-left">
            <SheetTitle>{tTraits('facets.sheetTitle')}</SheetTitle>
            <SheetDescription>{tTraits('facets.sheetDescription')}</SheetDescription>
          </SheetHeader>
          {facets}
        </SheetContent>
      </Sheet>

      <NftQuickView
        tokenId={quickViewId}
        items={visibleItems}
        onOpenChange={(open) => {
          if (!open) setQuickViewId(null);
        }}
        onNavigate={setQuickViewId}
        collectionTraits={traitsForUi}
        onSelectTrait={handleSelectTrait}
      />
    </PageShell>
  );
};

export default GalleryPage;
