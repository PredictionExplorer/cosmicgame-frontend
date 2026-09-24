'use client';

import { useCallback, useMemo, useRef, useState, type ReactNode } from 'react';
import { ChevronDown, Dna } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

import { useCollectionTraits, type CollectionTraits } from '@/hooks/useNftTraits';
import { useCSTList } from '@/hooks/useApiQuery';
import { useStickyClearance } from '@/hooks/useStickyClearance';
import type { CategoricalTraitKey } from '@/lib/nftMetadata';
import { cn } from '@/lib/utils';
import { usePathname, useRouter } from '@/i18n/navigation';
import { ErrorState } from '@/components/ui/error-state';
import { NftQuickView } from '@/components/nft/NftQuickView';

import { GalleryActiveFilters } from './components/GalleryActiveFilters';
import { GalleryCollectionDna } from './components/GalleryCollectionDna';
import { GalleryFilterSheet } from './components/GalleryFilterSheet';
import { GalleryFloatingFilters } from './components/GalleryFloatingFilters';
import { GalleryGrid } from './components/GalleryGrid';
import { GalleryPagination } from './components/GalleryPagination';
import { GALLERY_RESULT_COUNT_ID, GalleryResultsBar } from './components/GalleryResultsBar';
import { GallerySortSelect } from './components/GallerySortSelect';
import { GalleryStatusFilter } from './components/GalleryStatusFilter';
import { GalleryToolbar } from './components/GalleryToolbar';
import { GalleryTraitFacets } from './components/GalleryTraitFacets';
import { GalleryViewToggle } from './components/GalleryViewToggle';
import type { GalleryNFTData } from './components/galleryTypes';
import {
  GALLERY_PARAMS,
  TRAIT_SORT_KEYS,
  hasActiveFilters,
  pageParam,
  parseGalleryQuery,
  patchSearch,
  perPageParam,
  searchedTokenId,
  sortParam,
  statusParam,
  viewParam,
  type GalleryQuery,
  type PerPage,
  type SortKey,
  type StatusFilter,
  type ViewMode,
} from './galleryQuery';
import {
  countActiveTraitFilters,
  matchesTraitFilters,
  serializeChaosRange,
  serializeTraitValues,
  toggleTraitValue,
  type ChaosRange,
} from './traitFilters';

/** Viewport at which the filters live in a rail beside the grid instead of a sheet. */
const RAIL_MEDIA_QUERY = '(min-width: 1024px)';

/** Whether a media query matches (false where the browser cannot tell). */
function matchesMedia(query: string): boolean {
  return typeof window.matchMedia === 'function' && window.matchMedia(query).matches;
}

/** Id of the results region, the anchor a page change scrolls back to. */
export const GALLERY_RESULTS_ID = 'gallery-results';

function sortNfts(
  nfts: readonly GalleryNFTData[],
  sort: SortKey,
  traits: CollectionTraits | null | undefined,
): GalleryNFTData[] {
  const list = [...nfts];
  const byId = traits?.byId;
  const rarity = traits?.rarity.byId;
  const newestFirst = (a: GalleryNFTData, b: GalleryNFTData) => b.TokenId - a.TokenId;
  const descendingBy =
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
      return list.sort((a, b) => a.TokenId - b.TokenId);
    case 'cycle-desc':
      return list.sort((a, b) => (b.RoundNum ?? 0) - (a.RoundNum ?? 0) || newestFirst(a, b));
    case 'cycle-asc':
      return list.sort((a, b) => (a.RoundNum ?? 0) - (b.RoundNum ?? 0) || a.TokenId - b.TokenId);
    case 'rarity':
      // Rank 1 is the rarest, so invert it into a "higher is rarer" score.
      return list.sort(
        descendingBy((id) => {
          const rank = rarity?.get(id)?.rank;
          return rank === undefined ? undefined : -rank;
        }),
      );
    case 'chaos-desc':
      return list.sort(descendingBy((id) => byId?.get(id)?.chaos));
    case 'chaos-asc':
      return list.sort(
        descendingBy((id) => {
          const chaos = byId?.get(id)?.chaos;
          return chaos === undefined ? undefined : -chaos;
        }),
      );
    case 'syzygies-desc':
      return list.sort(descendingBy((id) => byId?.get(id)?.syzygies));
  }
}

/** Whether a record matches the search: its number, or a name containing the text. */
function matchesSearch(nft: GalleryNFTData, search: string, locale: string): boolean {
  if (!search) return true;
  const id = searchedTokenId(search);
  if (id !== null) return nft.TokenId === id;
  const name = nft.TokenName?.toLocaleLowerCase(locale);
  return Boolean(name && name.includes(search.toLocaleLowerCase(locale)));
}

export interface GalleryViewProps {
  /** The page's query string (without `?`); '' renders the default view. */
  search: string;
  /**
   * How many Signatures the header's server snapshot counted (`null` when it
   * could not read them). An empty list under a non-zero snapshot is a read
   * that failed, never "No Signatures yet".
   */
  snapshotCount?: number | null;
}

/** Moves focus to the result count, where the reader lands when the last filter goes. */
function focusResultCount() {
  document.getElementById(GALLERY_RESULT_COUNT_ID)?.focus();
}

/**
 * The gallery body under the server header: the toolbar, the filters (a
 * rail from `lg`, a sheet below it), the wall of Signatures or the ledger, and
 * pagination. Every choice lives in the URL (see galleryQuery), so the same
 * component renders the default view on the server and the reader's view once
 * the URL is known.
 */
export function GalleryView({ search, snapshotCount = null }: GalleryViewProps) {
  const t = useTranslations('gallery');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const query: GalleryQuery = useMemo(
    () => parseGalleryQuery(new URLSearchParams(search)),
    [search],
  );

  const { data: nfts, isLoading, isError, refetch } = useCSTList();
  const {
    traits: collectionTraits,
    isLoading: traitsLoading,
    isError: traitsError,
    refetch: refetchTraits,
  } = useCollectionTraits();
  // Trait index for the UI: undefined while loading, null when it failed.
  const traitsForUi = traitsError ? null : traitsLoading ? undefined : (collectionTraits ?? null);

  const [railOpen, setRailOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [dnaOpen, setDnaOpen] = useState(false);
  const [quickViewId, setQuickViewId] = useState<number | null>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const resultsRef = useRef<HTMLElement>(null);
  // From `lg` the toolbar sticks under the header: focus scrolled into view
  // stops below it rather than under it.
  useStickyClearance(toolbarRef);

  /** Replaces the URL: a filter, sort or view change is not a new history entry. */
  const update = useCallback(
    (patch: Record<string, string>) => {
      router.replace(`${pathname}${patchSearch(search, patch)}`, { scroll: false });
    },
    [router, pathname, search],
  );

  const sorted = useMemo(
    () => sortNfts((nfts ?? []) as GalleryNFTData[], query.sort, collectionTraits),
    [nfts, query.sort, collectionTraits],
  );
  const traitFilterCount = countActiveTraitFilters(query.traits, query.chaos);
  const results = useMemo(
    () =>
      sorted.filter(
        (nft) =>
          (query.status !== 'anchored' || Boolean(nft.Staked)) &&
          (query.status !== 'named' || Boolean(nft.TokenName?.trim())) &&
          (traitFilterCount === 0 ||
            matchesTraitFilters(
              collectionTraits?.byId.get(nft.TokenId),
              query.traits,
              query.chaos,
            )) &&
          matchesSearch(nft, query.search, locale),
      ),
    [sorted, query, traitFilterCount, collectionTraits, locale],
  );

  const pageCount = Math.max(1, Math.ceil(results.length / query.perPage));
  const page = Math.min(query.page, pageCount);
  const visibleItems = results.slice((page - 1) * query.perPage, page * query.perPage);
  const filtered = hasActiveFilters(query);
  const activeFilterCount = traitFilterCount + (query.status === 'all' ? 0 : 1);
  const collectionSize = nfts?.length ?? 0;
  const resultCount = isLoading ? null : results.length;

  const onStatusChange = useCallback(
    (status: StatusFilter) => update({ [GALLERY_PARAMS.status]: statusParam(status), page: '' }),
    [update],
  );
  const onSearchCommit = useCallback(
    (text: string) => update({ [GALLERY_PARAMS.search]: text, page: '' }),
    [update],
  );
  const onSortChange = useCallback(
    (sort: SortKey) => update({ [GALLERY_PARAMS.sort]: sortParam(sort), page: '' }),
    [update],
  );
  const onViewChange = useCallback(
    (view: ViewMode) => update({ [GALLERY_PARAMS.view]: viewParam(view) }),
    [update],
  );
  const onPerPageChange = useCallback(
    (perPage: PerPage) => update({ [GALLERY_PARAMS.perPage]: perPageParam(perPage), page: '' }),
    [update],
  );

  /** A page is a place: it gets a history entry, and the grid's top comes back into view. */
  const onPageChange = useCallback(
    (next: number) => {
      router.push(`${pathname}${patchSearch(search, { [GALLERY_PARAMS.page]: pageParam(next) })}`, {
        scroll: false,
      });
      const reduce = matchesMedia('(prefers-reduced-motion: reduce)');
      resultsRef.current?.scrollIntoView?.({
        block: 'start',
        behavior: reduce ? 'auto' : 'smooth',
      });
    },
    [router, pathname, search],
  );

  const onToggleTrait = useCallback(
    (key: CategoricalTraitKey, value: string) => {
      const next = toggleTraitValue(query.traits, key, value);
      update({ [key]: serializeTraitValues(next[key]), page: '' });
    },
    [query.traits, update],
  );
  // Selecting from the DNA legend narrows that trait to one value ("show me
  // these"); selecting it again clears it.
  const onSelectTrait = useCallback(
    (key: CategoricalTraitKey, value: string) => {
      const only = query.traits[key]?.length === 1 && query.traits[key]?.[0] === value;
      update({ [key]: only ? '' : value, page: '' });
    },
    [query.traits, update],
  );
  const onClearTraitKey = useCallback(
    (key: CategoricalTraitKey) => update({ [key]: '', page: '' }),
    [update],
  );
  const onChaosChange = useCallback(
    (range: ChaosRange | null) =>
      update({ [GALLERY_PARAMS.chaos]: serializeChaosRange(range), page: '' }),
    [update],
  );
  const onClearTraits = useCallback(() => {
    const cleared: Record<string, string> = { [GALLERY_PARAMS.chaos]: '', page: '' };
    for (const key of Object.keys(query.traits)) cleared[key] = '';
    update(cleared);
  }, [query.traits, update]);
  const onClearAll = useCallback(() => {
    const cleared: Record<string, string> = {
      [GALLERY_PARAMS.status]: '',
      [GALLERY_PARAMS.search]: '',
      [GALLERY_PARAMS.chaos]: '',
      page: '',
    };
    for (const key of Object.keys(query.traits)) cleared[key] = '';
    update(cleared);
  }, [query.traits, update]);

  const onToggleFilters = useCallback(() => {
    if (matchesMedia(RAIL_MEDIA_QUERY)) setRailOpen((open) => !open);
    else setSheetOpen(true);
  }, []);

  // An empty grid would read as "no Signatures exist yet", which is a very
  // different statement from "the archive could not be read". A failed
  // refetch keeps the collection already on screen, and an empty refresh
  // under a header that counted Signatures is a failed read too.
  const refreshFailed = !isLoading && collectionSize === 0 && (snapshotCount ?? 0) > 0;
  if ((isError && !nfts) || refreshFailed) {
    return (
      <ErrorState
        title={t('error.title')}
        message={t('error.message')}
        headingLevel={2}
        onRetry={() => void refetch()}
        surface
      />
    );
  }

  const traitSortsAvailable = traitsForUi !== null || TRAIT_SORT_KEYS.includes(query.sort);
  const dna = (
    <GalleryCollectionDna
      collectionTraits={traitsForUi}
      selected={query.traits}
      onSelect={onSelectTrait}
    />
  );
  const facets = (
    <GalleryTraitFacets
      collectionTraits={traitsForUi}
      selected={query.traits}
      chaosRange={query.chaos}
      onToggleValue={onToggleTrait}
      onClearKey={onClearTraitKey}
      onChaosChange={onChaosChange}
      onClearAll={onClearTraits}
      onRetry={() => void refetchTraits()}
      className="-mx-2"
    />
  );

  return (
    <>
      <div
        className={cn(
          railOpen && 'lg:grid lg:grid-cols-[17rem_minmax(0,1fr)] lg:items-start lg:gap-10',
        )}
      >
        {railOpen ? (
          <aside
            className="hidden space-y-8 border-e border-rule-faint pe-6 lg:sticky lg:top-[var(--sticky-offset)] lg:block lg:max-h-[calc(100dvh-var(--sticky-offset)-1rem)] lg:overflow-y-auto lg:overscroll-contain"
            aria-label={t('toolbar.filters')}
            data-testid="facets-rail"
          >
            {dna}
            {facets}
          </aside>
        ) : null}

        <div className="min-w-0">
          <GalleryToolbar
            ref={toolbarRef}
            search={query.search}
            onSearchCommit={onSearchCommit}
            status={query.status}
            onStatusChange={onStatusChange}
            sort={query.sort}
            onSortChange={onSortChange}
            view={query.view}
            onViewChange={onViewChange}
            onToggleFilters={onToggleFilters}
            filtersOpen={railOpen}
            activeFilterCount={activeFilterCount}
            traitSortsAvailable={traitSortsAvailable}
          />

          <GalleryResultsBar
            count={resultCount}
            total={collectionSize}
            filtered={filtered}
            onClearAll={onClearAll}
            className="mt-4"
            chips={
              <GalleryActiveFilters
                status={query.status}
                search={query.search}
                traits={query.traits}
                chaosRange={query.chaos}
                onClearStatus={() => onStatusChange('all')}
                onClearSearch={() => onSearchCommit('')}
                onRemoveTrait={onToggleTrait}
                onClearChaos={() => onChaosChange(null)}
                onEmptied={focusResultCount}
              />
            }
            end={
              railOpen || traitsForUi === null ? null : (
                <DnaDisclosureButton open={dnaOpen} onToggle={() => setDnaOpen((o) => !o)} />
              )
            }
          />

          {/* Mounted while closed, so the disclosure's aria-controls always resolves. */}
          <div
            id="gallery-dna-panel"
            hidden={!dnaOpen || railOpen}
            className="mt-4 border-y border-rule-faint py-6 max-lg:hidden"
          >
            {dnaOpen && !railOpen ? dna : null}
          </div>

          <section
            ref={resultsRef}
            id={GALLERY_RESULTS_ID}
            aria-label={t('results.regionLabel')}
            className="mt-6 scroll-mt-[calc(var(--sticky-offset)+4.5rem)] max-lg:scroll-mt-[var(--sticky-offset)]"
          >
            <GalleryGrid
              items={visibleItems}
              loading={isLoading}
              viewMode={query.view}
              skeletonCount={query.perPage}
              railOpen={railOpen}
              collectionTraits={traitsForUi}
              filtered={filtered}
              onClearFilters={onClearAll}
              onQuickView={setQuickViewId}
            />
            {!isLoading ? (
              <GalleryPagination
                page={page}
                perPage={query.perPage}
                totalItems={results.length}
                onPageChange={onPageChange}
                onPerPageChange={onPerPageChange}
              />
            ) : null}
          </section>
        </div>
      </div>

      <GalleryFloatingFilters
        toolbarRef={toolbarRef}
        resultsRef={resultsRef}
        activeCount={activeFilterCount}
        onOpen={() => setSheetOpen(true)}
      />

      <GalleryFilterSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        resultCount={resultCount}
        filtered={filtered}
        onClearAll={onClearAll}
      >
        <div className="space-y-8">
          <div className="space-y-5">
            <SheetField label={t('toolbar.show')}>
              <GalleryStatusFilter value={query.status} onChange={onStatusChange} block />
            </SheetField>
            <SheetField label={t('sort.ariaLabel')}>
              <GallerySortSelect
                value={query.sort}
                onChange={onSortChange}
                traitSortsAvailable={traitSortsAvailable}
                block
              />
            </SheetField>
            <SheetField label={t('view.ariaLabel')}>
              <GalleryViewToggle value={query.view} onChange={onViewChange} block />
            </SheetField>
          </div>
          <div className="border-t border-rule-faint pt-6">{dna}</div>
          <div className="border-t border-rule-faint pt-4">{facets}</div>
        </div>
      </GalleryFilterSheet>

      <NftQuickView
        tokenId={quickViewId}
        items={visibleItems}
        onOpenChange={(open) => {
          if (!open) setQuickViewId(null);
        }}
        onNavigate={setQuickViewId}
        collectionTraits={traitsForUi}
        onSelectTrait={onSelectTrait}
      />
    </>
  );
}

/** A labelled control in the filter sheet. */
function SheetField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-2">
      <p className="type-label text-muted-foreground">{label}</p>
      {children}
    </div>
  );
}

/** Opens the Collection DNA band above the grid while the rail is closed (desktop). */
function DnaDisclosureButton({ open, onToggle }: { open: boolean; onToggle: () => void }) {
  const t = useTranslations('traits');
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={open}
      aria-controls="gallery-dna-panel"
      className="hidden min-h-8 items-center gap-1.5 rounded-control px-2 type-label text-muted-foreground transition-colors duration-[var(--duration-fast)] hover:bg-surface-raised hover:text-foreground lg:inline-flex"
      data-testid="dna-toggle"
    >
      <Dna aria-hidden className="size-4 text-subtle" />
      {t('dna.title')}
      <ChevronDown
        aria-hidden
        className={cn(
          'size-3.5 transition-transform duration-[var(--duration-fast)]',
          open && 'rotate-180',
        )}
      />
    </button>
  );
}
