/**
 * The gallery's view state, kept entirely in the URL.
 *
 * Every choice a reader makes (the status filter, the search, the sort, the
 * view, the page, the page size and every trait filter) is a query parameter,
 * so a filtered view is a shareable link and Back returns to exactly the view
 * that was left. Defaults are omitted from the URL, so the plain `/gallery`
 * is the default view.
 */
import {
  CHAOS_PARAM,
  parseChaosRange,
  parseTraitFilters,
  type ChaosRange,
  type TraitFilterState,
} from './traitFilters';

/** Which Signatures the grid shows before trait filters apply. */
export type StatusFilter = 'all' | 'anchored' | 'named';

/** Every status filter, in toolbar order. */
export const STATUS_FILTERS: readonly StatusFilter[] = ['all', 'anchored', 'named'];

export type SortKey =
  | 'newest'
  | 'oldest'
  | 'cycle-desc'
  | 'cycle-asc'
  | 'rarity'
  | 'chaos-desc'
  | 'chaos-asc'
  | 'syzygies-desc';

/** Sort orders that need the collection trait index to be meaningful. */
export const TRAIT_SORT_KEYS: readonly SortKey[] = [
  'rarity',
  'chaos-desc',
  'chaos-asc',
  'syzygies-desc',
];

/** Every sort key, in menu order. */
export const SORT_KEYS: readonly SortKey[] = [
  'newest',
  'oldest',
  'cycle-desc',
  'cycle-asc',
  ...TRAIT_SORT_KEYS,
];

export type ViewMode = 'grid' | 'list';

/** Page sizes on offer; each fills whole rows of the two- and three-column grids. */
export const PER_PAGE_OPTIONS = [12, 24, 48] as const;
export type PerPage = (typeof PER_PAGE_OPTIONS)[number];
export const DEFAULT_PER_PAGE: PerPage = 24;

/** Query parameter names. Trait filters use their trait key (`structure`, `palette`, …). */
export const GALLERY_PARAMS = {
  status: 'show',
  search: 'q',
  sort: 'sort',
  view: 'view',
  page: 'page',
  perPage: 'perPage',
  chaos: CHAOS_PARAM,
} as const;

/** The gallery view a URL describes. */
export interface GalleryQuery {
  status: StatusFilter;
  /** The search text, trimmed ('' when there is none). */
  search: string;
  sort: SortKey;
  view: ViewMode;
  /** 1-based. The view clamps it to the pages the results fill. */
  page: number;
  perPage: PerPage;
  traits: TraitFilterState;
  chaos: ChaosRange | null;
}

export function isSortKey(value: string | null | undefined): value is SortKey {
  return typeof value === 'string' && (SORT_KEYS as readonly string[]).includes(value);
}

function isStatusFilter(value: string | null): value is StatusFilter {
  return value !== null && (STATUS_FILTERS as readonly string[]).includes(value);
}

function isPerPage(value: number): value is PerPage {
  return (PER_PAGE_OPTIONS as readonly number[]).includes(value);
}

/** A positive whole number from a query parameter, or null. */
function positiveInteger(raw: string | null): number | null {
  if (raw === null || !/^\d+$/.test(raw.trim())) return null;
  const value = Number(raw);
  return Number.isSafeInteger(value) && value > 0 ? value : null;
}

/** Reads the gallery view from query parameters; anything unknown falls back to its default. */
export function parseGalleryQuery(params: URLSearchParams): GalleryQuery {
  const status = params.get(GALLERY_PARAMS.status);
  const sort = params.get(GALLERY_PARAMS.sort);
  const perPage = positiveInteger(params.get(GALLERY_PARAMS.perPage));
  return {
    status: isStatusFilter(status) ? status : 'all',
    search: (params.get(GALLERY_PARAMS.search) ?? '').trim(),
    sort: isSortKey(sort) ? sort : 'newest',
    view: params.get(GALLERY_PARAMS.view) === 'list' ? 'list' : 'grid',
    page: positiveInteger(params.get(GALLERY_PARAMS.page)) ?? 1,
    perPage: perPage !== null && isPerPage(perPage) ? perPage : DEFAULT_PER_PAGE,
    traits: parseTraitFilters(params),
    chaos: parseChaosRange(params),
  };
}

/**
 * Applies a patch to a query string. An empty value removes the parameter,
 * so defaults never linger in the URL. Returns `?…`, or '' when nothing is left.
 */
export function patchSearch(current: string, patch: Readonly<Record<string, string>>): string {
  const params = new URLSearchParams(current);
  for (const [key, value] of Object.entries(patch)) {
    if (value === '') params.delete(key);
    else params.set(key, value);
  }
  const query = params.toString();
  return query ? `?${query}` : '';
}

/** The URL value of a status filter ('' for the default). */
export function statusParam(status: StatusFilter): string {
  return status === 'all' ? '' : status;
}

/** The URL value of a sort order ('' for the default). */
export function sortParam(sort: SortKey): string {
  return sort === 'newest' ? '' : sort;
}

/** The URL value of a view ('' for the default grid). */
export function viewParam(view: ViewMode): string {
  return view === 'grid' ? '' : view;
}

/** The URL value of a page size ('' for the default). */
export function perPageParam(perPage: PerPage): string {
  return perPage === DEFAULT_PER_PAGE ? '' : String(perPage);
}

/** The URL value of a page ('' for the first). */
export function pageParam(page: number): string {
  return page <= 1 ? '' : String(page);
}

/** A token id typed into the search (`47`, `#47`, `#000047`), or null for a name search. */
export function searchedTokenId(search: string): number | null {
  const match = /^#?\s*(\d{1,9})$/.exec(search.trim());
  return match ? Number(match[1]) : null;
}

/** Whether the view narrows the collection, so an empty result has a filter to clear. */
export function hasActiveFilters(query: GalleryQuery): boolean {
  return (
    query.status !== 'all' ||
    query.search !== '' ||
    query.chaos !== null ||
    Object.values(query.traits).some((values) => (values?.length ?? 0) > 0)
  );
}
